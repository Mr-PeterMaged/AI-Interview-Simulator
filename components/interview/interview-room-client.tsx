"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Keyboard, Mic, MicOff, RefreshCw, Square, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CameraPreview } from "@/components/interview/camera-preview";
import { InterviewerAvatar } from "@/components/interview/interviewer-avatar";
import { InterviewProgress } from "@/components/interview/interview-progress";
import { InterviewTimer } from "@/components/interview/interview-timer";
import { LiveTranscript } from "@/components/interview/live-transcript";
import { SpeechMetricPanel } from "@/components/interview/speech-metric-panel";
import { AnswerFeedbackCard } from "@/components/interview/answer-feedback-card";
import { ErrorState } from "@/components/shared/error-state";
import { useInterviewSession } from "@/hooks/use-interview-session";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { useCamera } from "@/hooks/use-camera";
import { useBodyLanguage } from "@/hooks/use-body-language";
import { analyzeSpeech } from "@/lib/speech-utils";

type InterviewRoomProps = {
  interview: {
    id: string;
    jobTitle: string;
    industry: string;
    experienceLevel: string;
    interviewType: string;
    interviewLanguage: string;
    interviewerPersonality: string;
    durationMinutes: number;
    resumeText?: string | null;
    jobDescription?: string | null;
    questions: { id: string; questionText: string; questionType: string; order: number }[];
  };
};

export function InterviewRoomClient({ interview }: InterviewRoomProps) {
  const session = useInterviewSession(interview);
  const language = interview.interviewLanguage === "ARABIC" ? "Arabic" : "English";
  const speech = useSpeechRecognition(language);
  const camera = useCamera(true);
  const body = useBodyLanguage(camera.videoRef, camera.status === "ready");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [duration, setDuration] = useState(0);
  const [manualTranscript, setManualTranscript] = useState("");
  const [inputMode, setInputMode] = useState<"voice" | "text">("voice");
  const effectiveMode = speech.supported ? inputMode : "text";
  const transcript = effectiveMode === "text" ? manualTranscript : speech.transcript || manualTranscript;
  const metrics = useMemo(() => analyzeSpeech({ transcript, durationSeconds: duration, language }), [duration, language, transcript]);
  const spokenQuestionRef = useRef<string>("");

  useEffect(() => {
    void session.generateFirstQuestion();
  }, [session]);

  useEffect(() => {
    if (!startedAt) return;
    const interval = window.setInterval(() => setDuration((Date.now() - startedAt) / 1000), 1000);
    return () => window.clearInterval(interval);
  }, [startedAt]);

  useEffect(() => {
    const question = session.currentQuestion?.questionText;
    if (!question || spokenQuestionRef.current === question) return;
    spokenQuestionRef.current = question;
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(question);
      utterance.lang = language === "Arabic" ? "ar-EG" : "en-US";
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  }, [language, session.currentQuestion?.questionText]);

  function switchInputMode(mode: "voice" | "text") {
    if (mode === "text") speech.stop();
    setInputMode(mode);
  }

  function startAnswer() {
    setStartedAt(Date.now());
    setDuration(0);
    setManualTranscript("");
    if (effectiveMode === "voice" && speech.supported) speech.start();
  }

  async function finishAnswer() {
    speech.stop();
    await session.finishAnswer({
      transcript: transcript || "No transcript captured.",
      durationSeconds: Math.max(1, duration),
      bodyLanguage: body.metrics
    });
    setStartedAt(null);
    setDuration(0);
    setManualTranscript("");
    speech.setTranscript("");
  }

  function repeatQuestion() {
    const question = session.currentQuestion?.questionText;
    if (!question || !("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(question);
    utterance.lang = language === "Arabic" ? "ar-EG" : "en-US";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">{interview.jobTitle} Interview</h1>
          <p className="mt-1 text-sm text-muted-foreground">{interview.industry} · {interview.experienceLevel.toLowerCase()} · {interview.interviewType.toLowerCase()}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={startedAt ? "danger" : "outline"}>{startedAt ? "● Recording" : "Ready"}</Badge>
          <InterviewTimer minutes={interview.durationMinutes} />
        </div>
      </div>

      {session.error ? <ErrorState title="Something went wrong" message={session.error} /> : null}

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.25fr_0.95fr]">
        <aside className="space-y-4">
          <CameraPreview videoRef={camera.videoRef} status={camera.status} />
          <Card className="glass">
            <CardHeader><CardTitle className="text-base">Body language</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {body.status === "idle" || body.status === "unavailable" ? (
                <p className="text-muted-foreground">
                  {camera.status === "ready" ? "Body-language analysis is unavailable on this device." : "Enable the camera to see live eye contact, posture, and expression estimates."}
                </p>
              ) : body.status === "loading-models" ? (
                <p className="text-muted-foreground">Loading on-device face analysis…</p>
              ) : (
                <>
                  <MetricLine label="Eye contact" value={body.metrics?.faceDetectedPercentage || 0} />
                  <MetricLine label="Posture" value={body.metrics?.postureScore || 0} />
                  <MetricLine label="Movement" value={body.metrics?.movementScore || 0} />
                  {body.metrics?.notes ? <p className="text-xs text-muted-foreground">{body.metrics.notes}</p> : null}
                </>
              )}
            </CardContent>
          </Card>
        </aside>

        <section className="space-y-4">
          <Card className="glass min-h-[520px]">
            <CardContent className="flex min-h-[520px] flex-col items-center justify-center p-8 text-center">
              <InterviewerAvatar personality={interview.interviewerPersonality} />
              <p className="mt-5 text-sm uppercase tracking-[0.2em] text-cyan-200">{interview.interviewerPersonality.toLowerCase().replaceAll("_", " ")}</p>
              <h2 className="mt-6 max-w-3xl text-2xl font-semibold leading-relaxed text-white">
                {session.currentQuestion?.questionText || "Preparing your first question..."}
              </h2>
              <div className="mt-8 flex h-10 items-end gap-1">
                {[18, 28, 20, 36, 24, 32, 18].map((height, index) => (
                  <span key={index} className="w-2 animate-pulse rounded bg-cyan-300" style={{ height }} />
                ))}
              </div>
              <div className="mt-10 w-full max-w-xl">
                <InterviewProgress current={session.questionCount || 1} total={session.maxQuestions} />
              </div>
            </CardContent>
          </Card>
        </section>

        <aside className="space-y-4">
          {!speech.supported ? (
            <div className="rounded-lg border border-amber-300/30 bg-amber-400/10 p-4 text-sm text-amber-100">
              Web Speech API is not supported in this browser. Type your answer below instead.
            </div>
          ) : null}
          {speech.error ? <div className="rounded-lg border border-rose-300/30 bg-rose-400/10 p-4 text-sm text-rose-100">{speech.error}</div> : null}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Answer input</h3>
            {speech.supported ? (
              <div className="flex overflow-hidden rounded-md border text-xs">
                <button
                  type="button"
                  onClick={() => switchInputMode("voice")}
                  disabled={Boolean(startedAt)}
                  className={`flex items-center gap-1 px-3 py-1.5 ${effectiveMode === "voice" ? "bg-cyan-400/20 text-cyan-200" : "text-muted-foreground"}`}
                >
                  <Mic className="h-3 w-3" /> Voice
                </button>
                <button
                  type="button"
                  onClick={() => switchInputMode("text")}
                  disabled={Boolean(startedAt)}
                  className={`flex items-center gap-1 border-l px-3 py-1.5 ${effectiveMode === "text" ? "bg-cyan-400/20 text-cyan-200" : "text-muted-foreground"}`}
                >
                  <Keyboard className="h-3 w-3" /> Type
                </button>
              </div>
            ) : null}
          </div>
          <LiveTranscript transcript={transcript} onChange={setManualTranscript} />
          <SpeechMetricPanel metrics={metrics} />
          <AnswerFeedbackCard tips={metrics.recommendations} />
          <div className="grid grid-cols-2 gap-3">
            <Button type="button" onClick={startAnswer} disabled={Boolean(startedAt) || session.busy}>
              <Mic className="h-4 w-4" /> Start
            </Button>
            <Button type="button" variant="secondary" onClick={finishAnswer} disabled={!startedAt || session.busy}>
              <Square className="h-4 w-4" /> Finish Answer
            </Button>
            <Button type="button" variant="outline" onClick={repeatQuestion}>
              <RefreshCw className="h-4 w-4" /> Repeat
            </Button>
            <Button type="button" variant="destructive" onClick={session.endInterview} disabled={session.busy}>
              <XCircle className="h-4 w-4" /> End
            </Button>
          </div>
          {effectiveMode === "voice" && speech.listening ? (
            <p className="flex items-center gap-2 text-xs text-cyan-200"><MicOff className="h-3 w-3" /> Listening through browser speech recognition</p>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function MetricLine({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-muted-foreground"><span>{label}</span><span>{value}%</span></div>
      <div className="h-2 rounded-full bg-slate-800"><div className="h-full rounded-full bg-cyan-300" style={{ width: `${value}%` }} /></div>
    </div>
  );
}
