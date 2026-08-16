"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { analyzeSpeech } from "@/lib/speech-utils";
import { targetQuestionsForDuration } from "@/lib/interview-utils";
import type { InterviewLanguage } from "@/types/interview";

type Question = {
  id: string;
  questionText: string;
  order: number;
  questionType: string;
};

export function useInterviewSession(interview: {
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
  questions: Question[];
}) {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState<Question | undefined>(interview.questions[0]);
  const [questionCount, setQuestionCount] = useState(interview.questions.length);
  const [busy, setBusy] = useState(false);
  const maxQuestions = useMemo(() => targetQuestionsForDuration(interview.durationMinutes), [interview.durationMinutes]);

  const generateFirstQuestion = useCallback(async () => {
    if (currentQuestion) return currentQuestion;
    setBusy(true);
    const response = await fetch("/api/ai/generate-question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...interview, interviewId: interview.id })
    });
    const data = await response.json();
    setBusy(false);
    if (data.savedQuestion) {
      setCurrentQuestion(data.savedQuestion);
      setQuestionCount(1);
      return data.savedQuestion as Question;
    }
    return undefined;
  }, [currentQuestion, interview]);

  const finishAnswer = useCallback(
    async ({ transcript, durationSeconds }: { transcript: string; durationSeconds: number }) => {
      if (!currentQuestion || busy) return;
      setBusy(true);
      const metrics = analyzeSpeech({
        transcript,
        durationSeconds,
        language: interview.interviewLanguage === "ARABIC" ? "Arabic" : (interview.interviewLanguage as InterviewLanguage)
      });

      const savedAnswerResponse = await fetch(`/api/interviews/${interview.id}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          transcript,
          durationSeconds: metrics.durationSeconds,
          wordCount: metrics.wordCount,
          wordsPerMinute: metrics.wordsPerMinute,
          fillerWordCount: metrics.fillerWordCount,
          longPauseCount: metrics.longPauseCount
        })
      });
      const { answer } = await savedAnswerResponse.json();

      const evaluationResponse = await fetch("/api/ai/evaluate-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answerId: answer.id,
          interviewId: interview.id,
          question: currentQuestion.questionText,
          transcript,
          jobTitle: interview.jobTitle,
          interviewType: interview.interviewType,
          interviewLanguage: interview.interviewLanguage
        })
      });
      const { evaluation } = await evaluationResponse.json();

      if (questionCount + 1 >= maxQuestions) {
        await fetch("/api/ai/final-report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ interviewId: interview.id })
        });
        router.push(`/interviews/report/${interview.id}`);
        return;
      }

      const followUpResponse = await fetch("/api/ai/follow-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewId: interview.id,
          currentQuestion: currentQuestion.questionText,
          transcript,
          history: [],
          evaluationSummary: evaluation?.summary
        })
      });
      const followUpData = await followUpResponse.json();
      setCurrentQuestion(followUpData.savedQuestion);
      setQuestionCount((count) => count + 1);
      setBusy(false);
    },
    [busy, currentQuestion, interview, maxQuestions, questionCount, router]
  );

  const endInterview = useCallback(async () => {
    setBusy(true);
    await fetch("/api/ai/final-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interviewId: interview.id })
    });
    router.push(`/interviews/report/${interview.id}`);
  }, [interview.id, router]);

  return { currentQuestion, questionCount, maxQuestions, busy, generateFirstQuestion, finishAnswer, endInterview };
}
