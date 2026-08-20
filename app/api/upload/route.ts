import { NextResponse } from "next/server";
import { extractText, getDocumentProxy } from "unpdf";
import mammoth from "mammoth";
import { requireUserId } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

const MAX_FILE_SIZE = 8 * 1024 * 1024;

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
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File is too large (max 8MB)" }, { status: 400 });
    }

    const name = file.name.toLowerCase();
    const isPdf = file.type === "application/pdf" || name.endsWith(".pdf");
    const isDocx = name.endsWith(".docx") || file.type.includes("wordprocessingml");
    const isText = file.type.includes("text") || name.endsWith(".txt");

    let text = "";
    let message = "File received, but this format can't be extracted automatically. Paste the resume text into the box below.";

    if (isPdf) {
      const buffer = new Uint8Array(await file.arrayBuffer());
      const pdf = await getDocumentProxy(buffer);
      const extracted = await extractText(pdf, { mergePages: true });
      text = extracted.text.trim();
      message = text
        ? "Text extracted from the PDF."
        : "Couldn't read text from this PDF (it may be a scanned image) — paste the resume text into the box below.";
    } else if (isDocx) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const { value } = await mammoth.extractRawText({ buffer });
      text = value.trim();
      message = text
        ? "Text extracted from the DOCX file."
        : "Couldn't read text from this file — paste the resume text into the box below.";
    } else if (isText) {
      text = (await file.text()).trim();
      message = text ? "Text extracted from uploaded file." : "The file appears empty — paste the resume text into the box below.";
    }

    return NextResponse.json({
      fileName: file.name,
      size: file.size,
      resumeText: text,
      message
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed" }, { status: 400 });
  }
}
