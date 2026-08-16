import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { assertInterviewOwner, requireUserId } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { fallbackQuestion, structuredAi } from "@/lib/ai/client";
import { firstQuestionPrompt } from "@/lib/ai/prompts";
import { generateQuestionInputSchema, generatedQuestionSchema } from "@/lib/ai/schemas";

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const limit = await checkRateLimit(`question:${userId}`);
    if (!limit.allowed) return NextResponse.json({ error: "Too many AI requests" }, { status: 429 });
    const body = generateQuestionInputSchema.parse(await request.json());

    if (body.interviewId) await assertInterviewOwner(body.interviewId, userId);
    const result = await structuredAi(
      firstQuestionPrompt(body),
      generatedQuestionSchema,
      fallbackQuestion(body.interviewLanguage, body.jobTitle, body.interviewType)
    );

    let savedQuestion = null;
    if (body.interviewId) {
      const count = await prisma.interviewQuestion.count({ where: { interviewId: body.interviewId } });
      savedQuestion = await prisma.interviewQuestion.create({
        data: {
          interviewId: body.interviewId,
          questionText: result.question,
          questionType: result.questionType,
          order: count + 1,
          generatedReason: result.reason
        }
      });
    }

    return NextResponse.json({ question: result, savedQuestion });
  } catch (error) {
    const status = error instanceof Error && error.name === "Unauthenticated" ? 401 : error instanceof Error && error.name === "NotFound" ? 404 : 400;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to generate question" }, { status });
  }
}
