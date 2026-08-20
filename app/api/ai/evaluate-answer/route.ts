import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { assertInterviewOwner, requireUserId } from "@/lib/auth";
import { fallbackEvaluation, structuredAi } from "@/lib/ai/client";
import { answerEvaluationPrompt } from "@/lib/ai/prompts";
import { answerEvaluationSchema, evaluateAnswerInputSchema } from "@/lib/ai/schemas";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const limit = await checkRateLimit(`evaluate:${userId}`);
    if (!limit.allowed) return NextResponse.json({ error: "Too many AI requests" }, { status: 429 });
    const body = evaluateAnswerInputSchema.parse(await request.json());

    if (body.answerId) {
      const answer = await prisma.interviewAnswer.findUnique({
        where: { id: body.answerId },
        select: { interviewId: true }
      });
      if (!answer) {
        const error = new Error("Answer not found");
        error.name = "NotFound";
        throw error;
      }
      await assertInterviewOwner(answer.interviewId, userId);
    } else if (body.interviewId) {
      await assertInterviewOwner(body.interviewId, userId);
    }

    const result = await structuredAi(
      answerEvaluationPrompt(body),
      answerEvaluationSchema,
      fallbackEvaluation(body.transcript)
    );

    let savedEvaluation = null;
    if (body.answerId) {
      savedEvaluation = await prisma.answerEvaluation.upsert({
        where: { answerId: body.answerId },
        create: {
          answerId: body.answerId,
          relevanceScore: result.scores.relevance,
          clarityScore: result.scores.clarity,
          technicalAccuracyScore: result.scores.technicalAccuracy,
          confidenceScore: result.scores.confidence,
          communicationScore: result.scores.communication,
          structureScore: result.scores.answerStructure,
          evidenceScore: result.scores.examplesEvidence,
          concisenessScore: result.scores.conciseness,
          overallScore: result.scores.overall,
          strengths: result.strengths,
          weaknesses: result.weaknesses,
          suggestions: result.suggestions,
          improvedAnswer: result.improvedAnswer,
          starAnalysis: result.starAnalysis
        },
        update: {
          relevanceScore: result.scores.relevance,
          clarityScore: result.scores.clarity,
          technicalAccuracyScore: result.scores.technicalAccuracy,
          confidenceScore: result.scores.confidence,
          communicationScore: result.scores.communication,
          structureScore: result.scores.answerStructure,
          evidenceScore: result.scores.examplesEvidence,
          concisenessScore: result.scores.conciseness,
          overallScore: result.scores.overall,
          strengths: result.strengths,
          weaknesses: result.weaknesses,
          suggestions: result.suggestions,
          improvedAnswer: result.improvedAnswer,
          starAnalysis: result.starAnalysis
        }
      });
    }

    return NextResponse.json({ evaluation: result, savedEvaluation });
  } catch (error) {
    const status = error instanceof Error && error.name === "Unauthenticated" ? 401 : error instanceof Error && error.name === "NotFound" ? 404 : 400;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to evaluate answer" }, { status });
  }
}
