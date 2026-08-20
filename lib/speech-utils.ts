import type { InterviewLanguage, SpeechMetrics } from "@/types/interview";

export const englishFillers = ["um", "uh", "like", "you know", "basically", "actually", "literally", "kind of", "sort of"];
export const arabicFillers = ["يعني", "امم", "آه", "بص", "يلا", "طيب", "خليني أقول", "تقريبًا"];

export function countWords(transcript: string) {
  const matches = transcript.trim().match(/[\p{L}\p{N}]+/gu);
  return matches?.length || 0;
}

export function countFillerWords(transcript: string, language: InterviewLanguage = "English") {
  const fillers = language === "Arabic" ? arabicFillers : englishFillers;
  const normalized = transcript.toLowerCase();
  return fillers.reduce((count, filler) => {
    const escaped = filler.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").toLowerCase();
    const matches = normalized.match(new RegExp(`(^|\\s)${escaped}(?=\\s|$|[,.!?])`, "g"));
    return count + (matches?.length || 0);
  }, 0);
}

export function analyzeSpeech({
  transcript,
  durationSeconds,
  longPauseCount = 0,
  language = "English"
}: {
  transcript: string;
  durationSeconds: number;
  longPauseCount?: number;
  language?: InterviewLanguage;
}): SpeechMetrics {
  const wordCount = countWords(transcript);
  const minutes = Math.max(durationSeconds / 60, 0.1);
  const wordsPerMinute = Math.round(wordCount / minutes);
  const fillerWordCount = countFillerWords(transcript, language);
  const fillerWordRatio = wordCount ? Number((fillerWordCount / wordCount).toFixed(2)) : 0;
  const recommendations: string[] = [];

  if (wordsPerMinute > 175) recommendations.push("Your estimated pace is fast. Slow down slightly for clarity.");
  if (wordsPerMinute > 0 && wordsPerMinute < 95) recommendations.push("Your estimated pace is slow. Add energy while staying composed.");
  if (fillerWordRatio > 0.05 || fillerWordCount > 4) recommendations.push("Reduce filler words by pausing briefly before key points.");
  if (durationSeconds < 35) recommendations.push("Answer may be too short. Add context, action, and result.");
  if (durationSeconds > 180) recommendations.push("Answer may be too long. Prioritize the most relevant evidence.");
  if (!recommendations.length) recommendations.push("Estimated speech pace and filler usage look healthy.");

  return {
    durationSeconds: Math.round(durationSeconds),
    wordCount,
    wordsPerMinute,
    fillerWordCount,
    fillerWordRatio,
    longPauseCount,
    recommendations
  };
}
