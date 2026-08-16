import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { assertInterviewOwner, requireUserId } from "@/lib/auth";
import { fallbackReport, structuredAi } from "@/lib/ai/client";
import { finalReportPrompt } from "@/lib/ai/prompts";
import { finalReportSchema } from "@/lib/ai/schemas";
import { checkRateLimit } from "@/lib/rate-limit";

const inputSchema = z.object({ interviewId: z.string() });

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const limit = await checkRateLimit(`report:${userId}`, 8, 60_000);
    if (!limit.allowed) return NextResponse.json({ error: "Too many AI requests" }, { status: 429 });
    const { interviewId } = inputSchema.parse(await request.json());
    await assertInterviewOwner(interviewId, userId);

    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        questions: { orderBy: { order: "asc" } },
        answers: { include: { evaluation: true, bodyMetric: true }, orderBy: { createdAt: "asc" } }
      }
    });
    if (!interview) return NextResponse.json({ error: "Interview not found" }, { status: 404 });

    const evaluations = interview.answers.map((answer) => answer.evaluation).filter(Boolean);
    const result = await structuredAi(
      finalReportPrompt({ interview, questions: interview.questions, answers: interview.answers, evaluations }),
      finalReportSchema,
      fallbackReport({
        evaluations: evaluations as {
          overallScore?: number;
          communicationScore?: number;
          technicalAccuracyScore?: number;
          confidenceScore?: number;
          structureScore?: number;
          relevanceScore?: number;
        }[],
        questions: interview.questions,
        answers: interview.answers
      })
    );

    const report = await prisma.interviewReport.upsert({
      where: { interviewId },
      create: {
        interviewId,
        overallScore: result.overallScore,
        communicationScore: result.categoryScores.communication,
        technicalKnowledgeScore: result.categoryScores.technicalKnowledge,
        confidenceScore: result.categoryScores.confidence,
        answerStructureScore: result.categoryScores.answerStructure,
        relevanceScore: result.categoryScores.relevance,
        readinessLevel: result.readinessLevel,
        strongestAnswer: result.strongestAnswer,
        weakestAnswer: result.weakestAnswer,
        keyImprovements: result.keyImprovements,
        practicePlan: result.practicePlan,
        finalFeedback: result.finalFeedback
      },
      update: {
        overallScore: result.overallScore,
        communicationScore: result.categoryScores.communication,
        technicalKnowledgeScore: result.categoryScores.technicalKnowledge,
        confidenceScore: result.categoryScores.confidence,
        answerStructureScore: result.categoryScores.answerStructure,
        relevanceScore: result.categoryScores.relevance,
        readinessLevel: result.readinessLevel,
        strongestAnswer: result.strongestAnswer,
        weakestAnswer: result.weakestAnswer,
        keyImprovements: result.keyImprovements,
        practicePlan: result.practicePlan,
        finalFeedback: result.finalFeedback
      }
    });

    await prisma.interview.update({
      where: { id: interviewId },
      data: { status: "COMPLETED", completedAt: new Date() }
    });

    return NextResponse.json({ report, reportData: result });
  } catch (error) {
    const status = error instanceof Error && error.name === "Unauthenticated" ? 401 : error instanceof Error && error.name === "NotFound" ? 404 : 400;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to generate report" }, { status });
  }
}
