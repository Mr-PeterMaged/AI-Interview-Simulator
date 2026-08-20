# InterviewAI — AI Interview Coach & Simulator

**Live demo:** [ai-interview-simulator-ten-navy.vercel.app](https://ai-interview-simulator-ten-navy.vercel.app/)

InterviewAI is a premium AI interview simulator for realistic job-interview practice. It supports role setup, resume and job-description context, adaptive AI questions, microphone transcription, answer evaluation, and detailed professional reports.

## Features

- Adaptive HR, technical, behavioral, and mixed interviews
- English and Arabic-ready interview flows
- PDF, DOCX, and plain-text resume upload with automatic on-server text extraction; questions and follow-ups are generated from the candidate's actual experience
- Live browser transcription with speech metric estimates, with a one-click switch to typed answers if the microphone isn't available
- On-device camera analysis (face-api.js, runs entirely in the browser) for eye contact, posture, head stability, and facial-expression estimates — no camera frames are ever uploaded
- AI-generated answer evaluations and final reports
- Authenticated dashboard, interview history, reports, practice mode, question bank, resume analyzer, and settings

## How to Use

### 1. Sign in

Open the [live site](https://ai-interview-simulator-ten-navy.vercel.app/) and click **Open App**. You'll be sent to a hosted sign-in page (email, or any configured social provider) and returned to the dashboard afterward.

### 2. Dashboard

Your home base after signing in. It shows:

- Total interviews, average score, total practice time, and your strongest skill.
- An **Overall readiness** ring and a **Weekly practice activity** chart built from your real interview history (score and duration per session, most recent last).
- A **Continue draft interview** banner if you have an interview that was started but not finished.
- Your recent interviews, each linking to its report (if finished) or back into the room (if still in progress).

Click **Start New Interview** to begin.

### 3. Create an interview (3-step wizard)

**Step 1 — Role details:** job title, industry, experience level (Junior/Mid/Senior), interview type (HR, Technical, Behavioral, or Mixed), and language (English or Arabic).

**Step 2 — Resume and job context (optional):**
- Upload a resume as **PDF, DOCX, or plain text** — the text is extracted automatically and shown in the box below so you can review or edit it before continuing. (Legacy binary `.doc` isn't supported — convert to `.docx` first.)
- Paste a job description to match against.
- Click **Analyze with AI** to see the skills and suggested topics the AI pulled out — this is exactly what shapes your interview questions, so you can see *why* a question was asked.
- Both fields are optional — skip this step for a generic interview, or fill it in for questions grounded in your real background (the room will literally reference details from your resume).

**Step 3 — Preferences and privacy:** interviewer personality (Friendly Recruiter, Professional HR, Senior Engineer, Strict Interviewer, or Neutral Interviewer), session duration, and toggles for microphone/camera/body-analysis. Recording consent must be checked to proceed — no camera/mic data is ever stored by default regardless of this setting.

Click **Start Interview** to enter the room.

### 4. The interview room

- The AI asks one question at a time and reads it aloud (browser text-to-speech, if available).
- **Answering by voice:** click **Start**, speak your answer — a live transcript appears as you talk. Click **Finish Answer** when done.
- **Answering by typing:** if your microphone isn't available (or you'd rather not use it), use the **Voice / Type** switch above the transcript box to type your answer instead — this works even if speech recognition was never supported in your browser. You can always edit the transcript text by hand before submitting, which also fixes any speech-to-text mistakes.
- **Camera and body language:** if the camera is on, the *Body language* card shows live, on-device estimates for eye contact, posture, and movement, computed locally in your browser (face-api.js) — no video frame ever leaves your device.
- **Repeat** replays the current question's audio. **End** finishes the interview early and jumps straight to the report.
- After each answer, the AI evaluates it and asks an adaptive follow-up (or the next planned question) based on what you actually said.
- Once you reach the target number of questions for your chosen duration, the app automatically generates your final report.

### 5. Your report

- Overall score, readiness level, and a skill radar chart (communication, technical knowledge, confidence, structure, relevance).
- Strongest and weakest answers with a concrete "why" and a better-approach suggestion.
- **Body language insights** — your real averaged eye-contact/posture/movement numbers for the session (or a note that the camera wasn't used).
- **Answer-by-answer breakdown** — every question you answered, your transcript, and the AI's strengths / weaknesses / suggestions for that specific answer, plus a STAR check (Situation/Task/Action/Result) when the question calls for it.
- Key improvements and a personalized practice plan.
- **Download Report PDF** uses your browser's print-to-PDF (the action buttons are hidden automatically in the printed/exported version).

### 6. Interview history

A searchable table of every interview you've run, with its score and status, linking back to the report or the room.

### 7. Practice mode

A fast, single-question drill — pick a skill (Communication, Behavioral, HR, Technical, Confidence, STAR Method), type or paste an answer, and click **Get AI feedback** for the same Gemini-backed scoring used in full interviews, without creating a saved interview record.

### 8. Question bank

Browse and search a library of interview prompts by category and difficulty; jump straight into Practice mode with one you like.

### 9. Resume analyzer

Upload or paste a resume on its own (outside the interview wizard) to get extracted skills, projects, strengths, and suggested interview topics — useful for prepping before you commit to a full session.

### 10. Settings

Voice/camera preference toggles, interview defaults, and a **Delete interview history** action that permanently removes every interview, question, answer, evaluation, and report tied to your account.

## Stack

- Next.js 15 App Router, React, TypeScript
- Tailwind CSS with shadcn/ui-style primitives
- Clerk authentication (hosted sign-in, session-protected dashboard routes)
- **Database:** PostgreSQL, hosted on [Neon](https://neon.tech), accessed through Prisma ORM (`DATABASE_URL`, pooled/serverless-safe connection)
- **AI:** [Google Gemini API](https://ai.google.dev/) (`gemini-3.6-flash` by default) — used server-side to generate adaptive interview questions, evaluate answers, and produce final performance reports. Configured via `GEMINI_API_KEY` / `GEMINI_MODEL`
- **Resume parsing:** [unpdf](https://github.com/unjs/unpdf) (PDF) and [mammoth](https://github.com/mwilliamson/mammoth.js) (DOCX), run server-side in `/api/upload`
- **Computer vision:** [@vladmandic/face-api](https://github.com/vladmandic/face-api) (TensorFlow.js), loaded and run entirely client-side for body-language analysis
- Zod, React Hook Form, Zustand
- Framer Motion-ready UI architecture, Lucide React icons, Recharts
- Deployed on Vercel

## Local Installation

```bash
npm install
cp .env.example .env
```

Fill in `.env` with your own values. For local demo mode, the app falls back to a demo user when Clerk keys are absent, but production should use Clerk.

## Environment Variables

```bash
DATABASE_URL=
GEMINI_API_KEY=
GEMINI_MODEL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_ENABLE_SPEECH_RECOGNITION=
```

`GEMINI_API_KEY` is only read on the server (get one at [Google AI Studio](https://aistudio.google.com/apikey)). `GEMINI_MODEL` defaults to `gemini-3.6-flash`. If the key is missing, API routes return realistic demo/fallback responses.

## Prisma Setup

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

Use Vercel Postgres, Neon, Supabase Postgres, or any Vercel-compatible PostgreSQL provider. Set `DATABASE_URL` to the pooled/serverless-safe connection string when available.

## Run Locally

```bash
npm run dev
```

Open `http://localhost:3000`.

## Deploy to Vercel

1. Push the repository to GitHub.
2. Create a Vercel project from the repository.
3. Add all environment variables in Vercel Project Settings.
4. Provision PostgreSQL and run Prisma migrations.
5. Deploy with the default Next.js build command.

No custom Express server is used. All backend work runs through App Router route handlers and server components.

## Privacy and Security Notes

- API keys are never exposed to frontend JavaScript.
- Authenticated API routes verify the current user and interview ownership.
- Camera/video recording is not stored by default.
- The UI asks for explicit recording consent during setup.
- Camera analysis is designed to be local/browser-based where supported.
- AI route handlers include a rate-limit abstraction placeholder.

## Known Limitations

- Web Speech API support varies by browser.
- Browser speech transcription accuracy is estimated and can contain errors.
- Camera and body-language metrics are experimental.
- AI feedback is coaching guidance, not a hiring decision.
- Legacy `.doc` (pre-2007 Word binary format) is not supported; convert to `.docx` or paste the text manually. PDF and `.docx` are extracted automatically.

## Developer

InterviewAI is built and maintained by **Peter Maged** — [petermaged.com](https://petermaged.com).

Peter designed and implemented the full product end to end: the adaptive interview engine, the Gemini-powered question/evaluation/report pipeline, the Clerk-authenticated dashboard, the Prisma/PostgreSQL data layer, and the production deployment on Vercel.

## License

Copyright © 2026 Peter Maged. All rights reserved.

This source code is provided for viewing and evaluation purposes only. No part of this repository may be copied, modified, distributed, or used to create derivative works without prior written permission from the copyright holder. See [LICENSE](./LICENSE) for full terms.
