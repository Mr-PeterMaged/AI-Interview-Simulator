"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { InterviewLanguage } from "@/types/interview";

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

export function useSpeechRecognition(language: InterviewLanguage = "English") {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSupported(Boolean(SpeechRecognition));
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language === "Arabic" ? "ar-EG" : "en-US";
    recognition.onresult = (event) => {
      let text = "";
      for (let index = 0; index < event.results.length; index += 1) {
        text += event.results[index][0].transcript;
      }
      setTranscript(text.trim());
    };
    recognition.onerror = () => {
      setError("Speech recognition stopped. You can continue by typing your answer.");
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;

    return () => recognition.stop();
  }, [language]);

  const start = useCallback(() => {
    if (!recognitionRef.current) return;
    setError(null);
    setListening(true);
    recognitionRef.current.start();
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  return { supported, listening, transcript, setTranscript, start, stop, error };
}
