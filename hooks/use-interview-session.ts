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
  const [error, setError] = useState<string | null>(null);
  const maxQuestions = useMemo(() => targetQuestionsForDuration(interview.durationMinutes), [interview.durationMinutes]);

  async function parseJsonOrThrow(response: Response, fallbackMessage: string) {
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error((data && data.error) || fallbackMessage);
    return data;
  }

  const generateFirstQuestion = useCallback(async () => {
    if (currentQuestion) return currentQuestion;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/ai/generate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...interview, interviewId: interview.id })
      });
      const data = await parseJsonOrThrow(response, "Unable to generate the first question");
      if (data.savedQuestion) {
        setCurrentQuestion(data.savedQuestion);
        setQuestionCount(1);
        return data.savedQuestion as Question;
      }
      return undefined;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to generate the first question");
      return undefined;
    } finally {
      setBusy(false);
    }
  }, [currentQuestion, interview]);

  const finishAnswer = useCallback(
    async ({ transcript, durationSeconds }: { transcript: string; durationSeconds: number }) => {
      if (!currentQuestion || busy) return;
      setBusy(true);
      setError(null);
      try {
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
        const { answer } = await parseJsonOrThrow(savedAnswerResponse, "Unable to save your answer");

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
        const { evaluation } = await parseJsonOrThrow(evaluationResponse, "Unable to evaluate your answer");

        if (questionCount + 1 >= maxQuestions) {
          const finalReportResponse = await fetch("/api/ai/final-report", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ interviewId: interview.id })
          });
          await parseJsonOrThrow(finalReportResponse, "Unable to generate the final report");
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
        const followUpData = await parseJsonOrThrow(followUpResponse, "Unable to generate the next question");
        setCurrentQuestion(followUpData.savedQuestion);
        setQuestionCount((count) => count + 1);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong while processing your answer");
      } finally {
        setBusy(false);
      }
    },
    [busy, currentQuestion, interview, maxQuestions, questionCount, router]
  );

  const endInterview = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/ai/final-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interviewId: interview.id })
      });
      await parseJsonOrThrow(response, "Unable to generate the final report");
      router.push(`/interviews/report/${interview.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to generate the final report");
      setBusy(false);
    }
  }, [interview.id, router]);

  return { currentQuestion, questionCount, maxQuestions, busy, error, generateFirstQuestion, finishAnswer, endInterview };
}
