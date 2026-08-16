import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { assertInterviewOwner, requireUserId } from "@/lib/auth";

const updateSchema = z.object({
  status: z.enum(["DRAFT", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
  completedAt: z.coerce.date().optional(),
  jobDescription: z.string().optional(),
  resumeText: z.string().optional()
});

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const userId = await requireUserId();
    await assertInterviewOwner(id, userId);
    const interview = await prisma.interview.findUnique({
      where: { id },
      include: {
        questions: { orderBy: { order: "asc" } },
        answers: { include: { evaluation: true, bodyMetric: true }, orderBy: { createdAt: "asc" } },
        report: true,
        resumeAnalysis: true
      }
    });
    if (!interview) return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    return NextResponse.json({ interview });
  } catch (error) {
    const status = error instanceof Error && error.name === "Unauthenticated" ? 401 : error instanceof Error && error.name === "NotFound" ? 404 : 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to load interview" }, { status });
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const userId = await requireUserId();
    await assertInterviewOwner(id, userId);
    const body = updateSchema.parse(await request.json());
    const interview = await prisma.interview.update({
      where: { id },
      data: body
    });
    return NextResponse.json({ interview });
  } catch (error) {
    const status = error instanceof Error && error.name === "Unauthenticated" ? 401 : error instanceof Error && error.name === "NotFound" ? 404 : 400;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update interview" }, { status });
  }
}
