import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { assertInterviewOwner, requireUserId } from "@/lib/auth";
import { InterviewRoomClient } from "@/components/interview/interview-room-client";

export const dynamic = "force-dynamic";

export default async function InterviewRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await requireUserId();
  await assertInterviewOwner(id, userId);
  const interview = await prisma.interview.findUnique({
    where: { id },
    include: { questions: { orderBy: { order: "asc" } } }
  });
  if (!interview) notFound();

  return (
    <InterviewRoomClient
      interview={{
        id: interview.id,
        jobTitle: interview.jobTitle,
        industry: interview.industry,
        experienceLevel: interview.experienceLevel,
        interviewType: interview.interviewType,
        interviewLanguage: interview.interviewLanguage,
        interviewerPersonality: interview.interviewerPersonality,
        durationMinutes: interview.durationMinutes,
        resumeText: interview.resumeText,
        jobDescription: interview.jobDescription,
        questions: interview.questions.map((question) => ({
          id: question.id,
          questionText: question.questionText,
          questionType: question.questionType,
          order: question.order
        }))
      }}
    />
  );
}
