import { NextResponse } from "next/server";
import { z } from "zod";
import { resumeAnalysisPrompt } from "@/lib/ai/prompts";
import { resumeAnalysisSchema } from "@/lib/ai/schemas";
import { structuredAi } from "@/lib/ai/client";
import { checkRateLimit } from "@/lib/rate-limit";
import { requireUserId } from "@/lib/auth";

const inputSchema = z.object({ resumeText: z.string().min(20), interviewId: z.string().optional() });

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const limit = await checkRateLimit(`resume:${userId}`);
    if (!limit.allowed) return NextResponse.json({ error: "Too many AI requests" }, { status: 429 });
    const { resumeText } = inputSchema.parse(await request.json());
    const fallback = resumeAnalysisSchema.parse({
      extractedSkills: ["Communication", "Problem solving", "Stakeholder management"],
      projects: ["Resume project details detected from uploaded text"],
      experienceSummary: "Candidate has relevant experience. Add clearer metrics to improve interview readiness.",
      strengths: ["Clear career history", "Relevant project exposure"],
      suggestedTopics: ["Role fit", "Project tradeoffs", "Measurable results", "Collaboration examples"]
    });
    const analysis = await structuredAi(resumeAnalysisPrompt(resumeText), resumeAnalysisSchema, fallback);
    return NextResponse.json({ analysis });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to analyze resume" }, { status: 400 });
  }
}
