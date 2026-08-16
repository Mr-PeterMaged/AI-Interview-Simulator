export type ExperienceLevel = "Junior" | "Mid" | "Senior";
export type InterviewType = "HR" | "Technical" | "Behavioral" | "Mixed";
export type InterviewLanguage = "English" | "Arabic";
export type InterviewerPersonality =
  | "Friendly Recruiter"
  | "Professional HR"
  | "Senior Engineer"
  | "Strict Interviewer"
  | "Neutral Interviewer";

export type InterviewStatus = "DRAFT" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type BodyLanguageSnapshot = {
  faceDetectedPercentage: number;
  lookingAwayPercentage: number;
  postureScore: number;
  headStabilityScore: number;
  gestureScore: number;
  movementScore: number;
  notes: string;
};

export type SpeechMetrics = {
  durationSeconds: number;
  wordCount: number;
  wordsPerMinute: number;
  fillerWordCount: number;
  fillerWordRatio: number;
  longPauseCount: number;
  recommendations: string[];
};
