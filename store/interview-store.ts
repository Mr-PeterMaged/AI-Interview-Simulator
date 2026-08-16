"use client";

import { create } from "zustand";
import type { BodyLanguageSnapshot, SpeechMetrics } from "@/types/interview";

type SessionQuestion = {
  id: string;
  questionText: string;
  questionType: string;
  generatedReason?: string | null;
  order: number;
};

type InterviewStore = {
  questions: SessionQuestion[];
  currentQuestion?: SessionQuestion;
  transcript: string;
  metrics?: SpeechMetrics;
  bodyLanguage?: BodyLanguageSnapshot;
  isRecording: boolean;
  setQuestions: (questions: SessionQuestion[]) => void;
  setCurrentQuestion: (question: SessionQuestion) => void;
  setTranscript: (transcript: string) => void;
  setMetrics: (metrics: SpeechMetrics) => void;
  setBodyLanguage: (metrics?: BodyLanguageSnapshot) => void;
  setRecording: (isRecording: boolean) => void;
  resetAnswer: () => void;
};

export const useInterviewStore = create<InterviewStore>((set) => ({
  questions: [],
  transcript: "",
  isRecording: false,
  setQuestions: (questions) => set({ questions, currentQuestion: questions[0] }),
  setCurrentQuestion: (question) => set({ currentQuestion: question }),
  setTranscript: (transcript) => set({ transcript }),
  setMetrics: (metrics) => set({ metrics }),
  setBodyLanguage: (bodyLanguage) => set({ bodyLanguage }),
  setRecording: (isRecording) => set({ isRecording }),
  resetAnswer: () => set({ transcript: "", metrics: undefined, isRecording: false })
}));
