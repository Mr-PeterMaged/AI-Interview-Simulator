import Link from "next/link";
import { ArrowRight, BarChart3, BrainCircuit, CheckCircle2, FileText, Mic2, Sparkles, Video, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedPanel } from "@/components/landing/animated-panel";

const features: [string, string, LucideIcon][] = [
  ["AI-Powered Interviews", "Role-specific questions for your target job, seniority, and industry.", BrainCircuit],
  ["Adaptive Follow-Up Questions", "The interviewer reacts to your answers, not a static script.", Sparkles],
  ["Instant Answer Feedback", "Get scoring for clarity, relevance, structure, evidence, and confidence.", CheckCircle2],
  ["Resume-Based Interview Questions", "Upload a CV and rehearse questions grounded in your actual background.", FileText],
  ["Job Description Matching", "Practice against the requirements and keywords that matter most.", BarChart3],
  ["Optional Camera Preview", "See yourself while you answer, with recording off by default.", Video],
  ["Detailed Performance Reports", "Radar charts, speech insights, strongest answers, and practice plans.", BarChart3],
  ["Track Your Progress", "Review historical sessions and watch readiness improve over time.", CheckCircle2]
];

const roadmapFeatures: [string, string][] = [
  ["Real-Time Body Language Scoring", "Camera preview is live today; automated eye-contact and posture scoring from real computer-vision analysis is in development."],
  ["PDF/DOCX Resume Parsing", "Plain-text resume upload works now; direct PDF and DOCX extraction is planned for a future release."]
];

const personalities = ["Friendly Recruiter", "Professional HR", "Senior Engineer", "Strict Interviewer", "Neutral Interviewer"];

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-indigo-500 font-bold text-white">AI</div>
          <span className="font-semibold text-white">InterviewAI</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="hover:text-white">Features</a>
          <a href="#personalities" className="hover:text-white">Personalities</a>
          <a href="#faq" className="hover:text-white">FAQ</a>
        </nav>
        <Button asChild size="sm">
          <Link href="/dashboard">Open App</Link>
        </Button>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-88px)] max-w-7xl items-center gap-12 px-6 pb-20 pt-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative z-10">
          <div className="mb-5 inline-flex items-center gap-2 rounded-md border bg-slate-950/50 px-3 py-2 text-xs text-cyan-100">
            <Mic2 className="h-4 w-4" />
            Realistic AI interviews with live transcripts
          </div>
          <h1 className="max-w-3xl text-5xl font-semibold tracking-normal text-white sm:text-6xl lg:text-7xl">
            MASTER YOUR NEXT INTERVIEW
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Practice realistic interviews with AI, get instant feedback, and walk into your next opportunity with confidence.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/interviews/new">
                Start Mock Interview <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/interviews/report/demo">View Demo Report</Link>
            </Button>
          </div>
        </div>

        <div className="relative">
          <AnimatedPanel>
          <div className="glass rounded-lg p-4 shadow-glow">
            <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-lg border bg-slate-950 p-4">
                <div className="aspect-video rounded-md bg-gradient-to-br from-slate-800 to-slate-950" />
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                  {["Pace (WPM)", "Fillers", "Clarity"].map((label, index) => (
                    <div key={label} className="rounded-md bg-slate-900 p-3">
                      <p className="text-muted-foreground">{label}</p>
                      <p className="mt-1 font-semibold text-cyan-200">{[142, 3, 88][index]}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border bg-slate-950 p-5">
                <p className="text-xs uppercase text-cyan-200">Senior Engineer</p>
                <h2 className="mt-3 text-xl font-semibold text-white">Tell me about a technical decision where the tradeoff was not obvious.</h2>
                <div className="mt-6 space-y-3">
                  {[72, 86, 64].map((width, index) => (
                    <div key={width} className="h-3 rounded-full bg-slate-800">
                      <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400" style={{ width: `${width}%` }} />
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-md bg-slate-900 p-4 text-sm text-slate-300">
                  Live transcript, filler detection, follow-up generation, and answer scoring work together in one focused room.
                </div>
              </div>
            </div>
          </div>
          </AnimatedPanel>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-16">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold text-white">A complete interview simulator</h2>
          <p className="mt-3 text-muted-foreground">Built for serious candidates who need more than generic practice questions.</p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map(([title, description, Icon]) => (
            <Card key={title} className="glass">
              <CardContent className="p-5">
                <Icon className="h-6 w-6 text-cyan-300" />
                <h3 className="mt-5 font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10">
          <h3 className="text-lg font-semibold text-white">Coming next</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {roadmapFeatures.map(([title, description]) => (
              <Card key={title} className="glass border-dashed">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Roadmap</Badge>
                    <h4 className="font-semibold text-white">{title}</h4>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="personalities" className="mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-lg border bg-slate-950/70 p-8">
          <h2 className="text-3xl font-semibold text-white">Interviewer personalities</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {personalities.map((personality) => (
              <div key={personality} className="rounded-md border bg-slate-900/60 p-4 text-sm text-slate-200">{personality}</div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto grid max-w-7xl gap-4 px-6 py-16 md:grid-cols-3">
        {[
          ["Does it store video?", "No video is stored by default. Recording requires explicit consent."],
          ["Can I use Arabic?", "Yes. Interview questions and evaluation support English and Arabic-ready flows."],
          ["Is feedback a hiring decision?", "No. AI feedback is guidance to help you prepare professionally."]
        ].map(([question, answer]) => (
          <div key={question} className="rounded-lg border bg-card p-5">
            <h3 className="font-semibold text-white">{question}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{answer}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-lg border bg-gradient-to-r from-indigo-500/20 to-cyan-400/10 p-8 text-center">
          <h2 className="text-3xl font-semibold text-white">Walk in prepared, not rehearsed.</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">Simulate the pressure, improve the signal, and learn what your answers actually communicate.</p>
          <Button asChild size="lg" className="mt-7">
            <Link href="/interviews/new">Start Mock Interview</Link>
          </Button>
        </div>
      </section>

      <footer className="border-t px-6 py-8 text-center text-sm text-muted-foreground">
        <p>InterviewAI — privacy-aware AI interview practice for modern candidates.</p>
        <p className="mt-2">
          Developed by{" "}
          <a
            href="https://petermaged.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-cyan-300 hover:text-cyan-200"
          >
            Peter Maged
          </a>
        </p>
        <p className="mt-2 text-xs text-muted-foreground/70">Copyright © 2026 Peter Maged. All rights reserved.</p>
      </footer>
    </div>
  );
}
