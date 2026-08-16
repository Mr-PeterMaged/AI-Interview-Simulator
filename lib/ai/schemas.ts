import { z } from "zod";

export const generatedQuestionSchema = z.object({
  question: z.string().min(8),
  questionType: z.enum(["hr", "behavioral", "technical", "mixed", "follow_up"]).or(z.string().min(2)),
  reason: z.string().min(2),
  expectedFocus: z.array(z.string()).default([])
});

export const followUpQuestionSchema = generatedQuestionSchema.extend({
  isFollowUp: z.boolean().default(true)
});

const scoreSchema = z.number().min(0).max(100);

export const answerEvaluationSchema = z.object({
  scores: z.object({
    relevance: scoreSchema,
    clarity: scoreSchema,
    technicalAccuracy: scoreSchema,
    confidence: scoreSchema,
    communication: scoreSchema,
    answerStructure: scoreSchema,
    examplesEvidence: scoreSchema,
    conciseness: scoreSchema,
    overall: scoreSchema
  }),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  suggestions: z.array(z.string()).default([]),
  improvedAnswer: z.string().default(""),
  starAnalysis: z.object({
    applicable: z.boolean(),
    situation: z.object({ detected: z.boolean(), feedback: z.string() }),
    task: z.object({ detected: z.boolean(), feedback: z.string() }),
    action: z.object({ detected: z.boolean(), feedback: z.string() }),
    result: z.object({ detected: z.boolean(), feedback: z.string() })
  }),
  summary: z.string().default("")
});

export const finalReportSchema = z.object({
  overallScore: scoreSchema,
  readinessLevel: z.enum(["Not Ready", "Developing", "Interview Ready", "Strong Candidate"]),
  categoryScores: z.object({
    communication: scoreSchema,
    technicalKnowledge: scoreSchema,
    confidence: scoreSchema,
    answerStructure: scoreSchema,
    relevance: scoreSchema
  }),
  strongestAnswer: z.object({
    question: z.string(),
    answerSummary: z.string(),
    whyStrong: z.string()
  }),
  weakestAnswer: z.object({
    question: z.string(),
    answerSummary: z.string(),
    issues: z.array(z.string()),
    betterApproach: z.string()
  }),
  keyImprovements: z.array(z.string()),
  practicePlan: z.array(z.string()),
  finalFeedback: z.string()
});

export const resumeAnalysisSchema = z.object({
  extractedSkills: z.array(z.string()),
  projects: z.array(z.string()),
  experienceSummary: z.string(),
  strengths: z.array(z.string()),
  suggestedTopics: z.array(z.string())
});

export const jobDescriptionAnalysisSchema = z.object({
  keySkills: z.array(z.string()),
  responsibilities: z.array(z.string()),
  roleLevel: z.string(),
  keywords: z.array(z.string()),
  suggestedQuestions: z.array(z.string())
});

export const createInterviewSchema = z.object({
  jobTitle: z.string().min(2),
  industry: z.string().min(2),
  experienceLevel: z.enum(["Junior", "Mid", "Senior"]),
  interviewType: z.enum(["HR", "Technical", "Behavioral", "Mixed"]),
  interviewLanguage: z.enum(["English", "Arabic"]),
  interviewerPersonality: z.enum([
    "Friendly Recruiter",
    "Professional HR",
    "Senior Engineer",
    "Strict Interviewer",
    "Neutral Interviewer"
  ]),
  durationMinutes: z.coerce.number().refine((value) => [5, 10, 20, 30].includes(value)),
  jobDescription: z.string().optional(),
  resumeText: z.string().optional(),
  title: z.string().optional()
});

export const saveAnswerSchema = z.object({
  questionId: z.string().min(1),
  transcript: z.string().min(1),
  durationSeconds: z.coerce.number().int().nonnegative(),
  wordCount: z.coerce.number().int().nonnegative(),
  wordsPerMinute: z.coerce.number().int().nonnegative(),
  fillerWordCount: z.coerce.number().int().nonnegative(),
  longPauseCount: z.coerce.number().int().nonnegative(),
  bodyLanguage: z
    .object({
      faceDetectedPercentage: z.number().min(0).max(100),
      lookingAwayPercentage: z.number().min(0).max(100),
      postureScore: z.number().min(0).max(100),
      headStabilityScore: z.number().min(0).max(100),
      gestureScore: z.number().min(0).max(100),
      movementScore: z.number().min(0).max(100),
      notes: z.string()
    })
    .optional()
});

export const generateQuestionInputSchema = z.object({
  interviewId: z.string().optional(),
  jobTitle: z.string(),
  industry: z.string(),
  experienceLevel: z.string(),
  interviewType: z.string(),
  interviewLanguage: z.string(),
  interviewerPersonality: z.string(),
  resumeText: z.string().optional(),
  jobDescription: z.string().optional()
});

export const evaluateAnswerInputSchema = z.object({
  answerId: z.string().optional(),
  interviewId: z.string().optional(),
  question: z.string(),
  transcript: z.string(),
  jobTitle: z.string().optional(),
  interviewType: z.string().optional(),
  interviewLanguage: z.string().optional()
});

export const followUpInputSchema = z.object({
  interviewId: z.string(),
  currentQuestion: z.string(),
  transcript: z.string(),
  history: z.array(z.object({ question: z.string(), answer: z.string() })).default([]),
  evaluationSummary: z.string().optional()
});
