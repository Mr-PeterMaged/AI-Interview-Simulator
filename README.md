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
