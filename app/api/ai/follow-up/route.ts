import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { assertInterviewOwner, requireUserId } from "@/lib/auth";
import { fallbackQuestion, structuredAi } from "@/lib/ai/client";
import { followUpPrompt } from "@/lib/ai/prompts";
import { followUpInputSchema, followUpQuestionSchema } from "@/lib/ai/schemas";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const limit = await checkRateLimit(`followup:${userId}`);
    if (!limit.allowed) return NextResponse.json({ error: "Too many AI requests" }, { status: 429 });
    const body = followUpInputSchema.parse(await request.json());
    const interview = await assertInterviewOwner(body.interviewId, userId);

    const result = await structuredAi(
      followUpPrompt({
        context: {
          jobTitle: interview.jobTitle,
          industry: interview.industry,
          experienceLevel: interview.experienceLevel,
          interviewType: interview.interviewType,
          interviewLanguage: interview.interviewLanguage,
          interviewerPersonality: interview.interviewerPersonality,
          resumeText: interview.resumeText,
          jobDescription: interview.jobDescription
        },
        currentQuestion: body.currentQuestion,
        transcript: body.transcript,
        history: body.history,
        evaluationSummary: body.evaluationSummary
      }),
      followUpQuestionSchema,
      { ...fallbackQuestion(interview.interviewLanguage, interview.jobTitle, interview.interviewType), isFollowUp: true }
    );

    const count = await prisma.interviewQuestion.count({ where: { interviewId: body.interviewId } });
    const savedQuestion = await prisma.interviewQuestion.create({
      data: {
        interviewId: body.interviewId,
        questionText: result.question,
        questionType: result.questionType,
        order: count + 1,
        generatedReason: result.reason
      }
    });

    return NextResponse.json({ question: result, savedQuestion });
  } catch (error) {
    const status = error instanceof Error && error.name === "Unauthenticated" ? 401 : error instanceof Error && error.name === "NotFound" ? 404 : 400;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to generate follow-up" }, { status });
  }
}
