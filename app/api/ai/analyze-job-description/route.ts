import { NextResponse } from "next/server";
import { z } from "zod";
import { jobDescriptionAnalysisPrompt } from "@/lib/ai/prompts";
import { jobDescriptionAnalysisSchema } from "@/lib/ai/schemas";
import { structuredAi } from "@/lib/ai/client";
import { checkRateLimit } from "@/lib/rate-limit";
import { requireUserId } from "@/lib/auth";

const inputSchema = z.object({ jobDescription: z.string().min(20) });

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const limit = await checkRateLimit(`jd:${userId}`);
    if (!limit.allowed) return NextResponse.json({ error: "Too many AI requests" }, { status: 429 });
    const { jobDescription } = inputSchema.parse(await request.json());
    const fallback = jobDescriptionAnalysisSchema.parse({
      keySkills: ["Communication", "Ownership", "Technical judgment"],
      responsibilities: ["Deliver projects", "Collaborate cross-functionally", "Improve systems"],
      roleLevel: "Mid to Senior",
      keywords: ["impact", "scale", "stakeholders", "quality"],
      suggestedQuestions: ["Tell me about a project with measurable impact.", "How do you handle technical tradeoffs?"]
    });
    const analysis = await structuredAi(jobDescriptionAnalysisPrompt(jobDescription), jobDescriptionAnalysisSchema, fallback);
    return NextResponse.json({ analysis });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to analyze job description" }, { status: 400 });
  }
}
