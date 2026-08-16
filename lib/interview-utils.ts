import type { ExperienceLevel, InterviewLanguage, InterviewerPersonality, InterviewType } from "@/types/interview";

export function toPrismaExperience(level: ExperienceLevel) {
  return level.toUpperCase() as "JUNIOR" | "MID" | "SENIOR";
}

export function fromPrismaExperience(level: string): ExperienceLevel {
  return level === "JUNIOR" ? "Junior" : level === "SENIOR" ? "Senior" : "Mid";
}

export function toPrismaType(type: InterviewType) {
  return type.toUpperCase() as "HR" | "TECHNICAL" | "BEHAVIORAL" | "MIXED";
}

export function fromPrismaType(type: string): InterviewType {
  return type === "TECHNICAL" ? "Technical" : type === "BEHAVIORAL" ? "Behavioral" : type === "MIXED" ? "Mixed" : "HR";
}

export function toPrismaLanguage(language: InterviewLanguage) {
  return language.toUpperCase() as "ENGLISH" | "ARABIC";
}

export function fromPrismaLanguage(language: string): InterviewLanguage {
  return language === "ARABIC" ? "Arabic" : "English";
}

export function toPrismaPersonality(personality: InterviewerPersonality) {
  return personality.toUpperCase().replaceAll(" ", "_") as
    | "FRIENDLY_RECRUITER"
    | "PROFESSIONAL_HR"
    | "SENIOR_ENGINEER"
    | "STRICT_INTERVIEWER"
    | "NEUTRAL_INTERVIEWER";
}

export function fromPrismaPersonality(personality: string): InterviewerPersonality {
  return personality
    .toLowerCase()
    .split("_")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ") as InterviewerPersonality;
}

export function targetQuestionsForDuration(durationMinutes: number) {
  if (durationMinutes <= 5) return 3;
  if (durationMinutes <= 10) return 5;
  if (durationMinutes <= 20) return 8;
  return 12;
}
