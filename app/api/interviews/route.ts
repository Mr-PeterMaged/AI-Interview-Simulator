import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureUser, requireUserId } from "@/lib/auth";
import { createInterviewSchema } from "@/lib/ai/schemas";
import { toPrismaExperience, toPrismaLanguage, toPrismaPersonality, toPrismaType } from "@/lib/interview-utils";

export async function GET() {
  try {
    const userId = await requireUserId();
    const interviews = await prisma.interview.findMany({
      where: { userId },
      include: { report: true, questions: true, answers: true },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json({ interviews });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to load interviews" }, { status: 401 });
  }
}

export async function DELETE() {
  try {
    const userId = await requireUserId();
    const result = await prisma.interview.deleteMany({ where: { userId } });
    return NextResponse.json({ deletedCount: result.count });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete interview history" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await ensureUser();
    const body = createInterviewSchema.parse(await request.json());
    const interview = await prisma.interview.create({
      data: {
        userId: user.id,
        title: body.title || `${body.jobTitle} ${body.interviewType} Interview`,
        jobTitle: body.jobTitle,
        industry: body.industry,
        experienceLevel: toPrismaExperience(body.experienceLevel),
        interviewType: toPrismaType(body.interviewType),
        interviewLanguage: toPrismaLanguage(body.interviewLanguage),
        interviewerPersonality: toPrismaPersonality(body.interviewerPersonality),
        durationMinutes: body.durationMinutes,
        status: "IN_PROGRESS",
        jobDescription: body.jobDescription,
        resumeText: body.resumeText,
        startedAt: new Date()
      }
    });
    return NextResponse.json({ interview }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create interview" },
      { status: error instanceof Error && error.name === "Unauthenticated" ? 401 : 400 }
    );
  }
}
