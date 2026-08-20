import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const limit = await checkRateLimit(`upload:${userId}`);
    if (!limit.allowed) return NextResponse.json({ error: "Too many uploads" }, { status: 429 });
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const text = file.type.includes("text") || file.name.endsWith(".txt") ? await file.text() : "";
    return NextResponse.json({
      fileName: file.name,
      size: file.size,
      resumeText: text,
      message: text
        ? "Text extracted from uploaded file."
        : "File received. For PDF/DOCX production extraction, connect UploadThing, Vercel Blob, or Supabase Storage with a parser."
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed" }, { status: 400 });
  }
}
