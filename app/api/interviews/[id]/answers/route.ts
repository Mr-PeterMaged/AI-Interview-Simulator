import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { assertInterviewOwner, requireUserId } from "@/lib/auth";
import { saveAnswerSchema } from "@/lib/ai/schemas";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const userId = await requireUserId();
    await assertInterviewOwner(id, userId);
    const body = saveAnswerSchema.parse(await request.json());

    const answer = await prisma.interviewAnswer.create({
      data: {
        interviewId: id,
        questionId: body.questionId,
        transcript: body.transcript,
        durationSeconds: body.durationSeconds,
        wordCount: body.wordCount,
        wordsPerMinute: body.wordsPerMinute,
        fillerWordCount: body.fillerWordCount,
        longPauseCount: body.longPauseCount,
        bodyMetric: body.bodyLanguage
          ? {
              create: {
                faceDetectedPercentage: body.bodyLanguage.faceDetectedPercentage,
                lookingAwayPercentage: body.bodyLanguage.lookingAwayPercentage,
                postureScore: body.bodyLanguage.postureScore,
                headStabilityScore: body.bodyLanguage.headStabilityScore,
                gestureScore: body.bodyLanguage.gestureScore,
                movementScore: body.bodyLanguage.movementScore,
                notes: body.bodyLanguage.notes
              }
            }
          : undefined
      },
      include: { bodyMetric: true }
    });

    return NextResponse.json({ answer }, { status: 201 });
  } catch (error) {
    const status = error instanceof Error && error.name === "Unauthenticated" ? 401 : error instanceof Error && error.name === "NotFound" ? 404 : 400;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save answer" }, { status });
  }
}
