import "server-only";
import { z } from "zod";
import { answerEvaluationSchema, finalReportSchema, generatedQuestionSchema, jobDescriptionAnalysisSchema, resumeAnalysisSchema } from "@/lib/ai/schemas";
import { average, readinessFromScore } from "@/lib/scoring-utils";

function extractJson(text: string) {
  const trimmed = text.trim();
  if (trimmed.startsWith("{")) return trimmed;
  const match = trimmed.match(/\{[\s\S]*\}/);
  return match?.[0] || "{}";
}

async function callAi(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.55
        }
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini request failed with ${response.status}`);
  }

  const data = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

export async function structuredAi<T>(prompt: string, schema: z.ZodSchema<T>, fallback: T) {
  try {
    const content = await callAi(prompt);
    if (!content) return fallback;
    const json = JSON.parse(extractJson(content));
    const parsed = schema.safeParse(json);
    return parsed.success ? parsed.data : fallback;
  } catch {
    return fallback;
  }
}

export function fallbackQuestion(language = "English", jobTitle = "the role", type = "mixed") {
  const arabic = language.toLowerCase().includes("arabic");
  return generatedQuestionSchema.parse({
    question: arabic
      ? `حدثني عن خبرتك الأكثر ارتباطا بدور ${jobTitle}، وما الذي يجعلك مناسبا له؟`
      : `Tell me about the experience most relevant to ${jobTitle}, and what makes you a strong fit for this role.`,
    questionType: type.toLowerCase(),
    reason: "A strong opening question establishes role fit and communication clarity.",
    expectedFocus: ["Relevant experience", "Motivation", "Evidence of fit"]
  });
}

export function fallbackEvaluation(transcript: string) {
  const words = transcript.split(/\s+/).filter(Boolean).length;
  const base = Math.max(48, Math.min(84, 50 + Math.round(words / 5)));
  return answerEvaluationSchema.parse({
    scores: {
      relevance: base,
      clarity: base - 2,
      technicalAccuracy: base - 4,
      confidence: base - 1,
      communication: base,
      answerStructure: base - 3,
      examplesEvidence: Math.max(45, base - 7),
      conciseness: words > 160 ? base - 8 : base
    },
    strengths: ["Clear attempt to address the question", "Some relevant context was provided"],
    weaknesses: ["Add more measurable evidence", "Tighten the answer structure"],
    suggestions: ["Use a short STAR structure", "Include one concrete outcome or metric", "Close with the business impact"],
    improvedAnswer:
      "I would structure the answer with brief context, the specific action I owned, the tradeoffs I considered, and the measurable result. That makes the answer easier to evaluate and more persuasive.",
    starAnalysis: {
      applicable: true,
      situation: { detected: transcript.length > 40, feedback: "Context is partially present." },
      task: { detected: false, feedback: "Make your responsibility explicit." },
      action: { detected: transcript.length > 80, feedback: "Add more detail about your decisions." },
      result: { detected: /\d|percent|%|improved|reduced/i.test(transcript), feedback: "Use measurable outcomes where possible." }
    },
    summary: "Demo evaluation generated because AI credentials are not configured or parsing failed."
  });
}

export function fallbackReport(input: {
  evaluations: { overallScore?: number; communicationScore?: number; technicalAccuracyScore?: number; confidenceScore?: number; structureScore?: number; relevanceScore?: number }[];
  questions: { questionText?: string }[];
  answers: { transcript?: string }[];
}) {
  const overall = average(input.evaluations.map((evaluation) => evaluation.overallScore || 65)) || 68;
  return finalReportSchema.parse({
    overallScore: overall,
    readinessLevel: readinessFromScore(overall),
    categoryScores: {
      communication: average(input.evaluations.map((evaluation) => evaluation.communicationScore || overall)),
      technicalKnowledge: average(input.evaluations.map((evaluation) => evaluation.technicalAccuracyScore || overall - 4)),
      confidence: average(input.evaluations.map((evaluation) => evaluation.confidenceScore || overall - 2)),
      answerStructure: average(input.evaluations.map((evaluation) => evaluation.structureScore || overall - 3)),
      relevance: average(input.evaluations.map((evaluation) => evaluation.relevanceScore || overall))
    },
    strongestAnswer: {
      question: input.questions[0]?.questionText || "Opening question",
      answerSummary: input.answers[0]?.transcript?.slice(0, 180) || "The candidate provided a concise answer.",
      whyStrong: "It addressed the role context and gave a basis for follow-up discussion."
    },
    weakestAnswer: {
      question: input.questions[input.questions.length - 1]?.questionText || "Follow-up question",
      answerSummary: input.answers[input.answers.length - 1]?.transcript?.slice(0, 180) || "More detail would improve this answer.",
      issues: ["Needs stronger structure", "Needs more concrete evidence"],
      betterApproach: "Use a crisp STAR response with one measurable result and a clear explanation of tradeoffs."
    },
    keyImprovements: ["Reduce filler words", "Use measurable outcomes", "Explain technical choices", "Keep answers concise", "Use STAR for behavioral questions"],
    practicePlan: ["Practice two behavioral answers with STAR", "Prepare one technical tradeoff story", "Record a 90-second role-fit answer"],
    finalFeedback: "You have a useful foundation. Sharpen structure, evidence, and pacing to sound more interview-ready."
  });
}

export const aiSchemas = {
  generatedQuestionSchema,
  answerEvaluationSchema,
  finalReportSchema,
  resumeAnalysisSchema,
  jobDescriptionAnalysisSchema
};
