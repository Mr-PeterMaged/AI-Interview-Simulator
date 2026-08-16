import type { InterviewerPersonality, InterviewType } from "@/types/interview";

export const industries = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Retail",
  "Consulting",
  "Manufacturing",
  "Marketing",
  "AI and Data"
];

export const experienceLevels = ["Junior", "Mid", "Senior"] as const;
export const interviewTypes = ["HR", "Technical", "Behavioral", "Mixed"] as const;
export const languages = ["English", "Arabic"] as const;

export const interviewerPersonalities: { value: InterviewerPersonality; label: string; description: string }[] = [
  { value: "Friendly Recruiter", label: "Friendly Recruiter", description: "Warm, encouraging, and conversational." },
  { value: "Professional HR", label: "Professional HR", description: "Structured, polished, and policy-aware." },
  { value: "Senior Engineer", label: "Senior Engineer", description: "Deep technical probing with practical tradeoffs." },
  { value: "Strict Interviewer", label: "Strict Interviewer", description: "Direct, rigorous, and focused on evidence." },
  { value: "Neutral Interviewer", label: "Neutral Interviewer", description: "Balanced and calm with concise prompts." }
];

export const targetQuestionCount: Record<number, number> = {
  5: 3,
  10: 5,
  20: 8,
  30: 12
};

export const questionBank = [
  { category: "HR", difficulty: "Easy", question: "Tell me about yourself and what attracted you to this role." },
  { category: "Behavioral", difficulty: "Medium", question: "Describe a time you handled conflict with a teammate." },
  { category: "Technical", difficulty: "Medium", question: "How do you approach debugging a production issue?" },
  { category: "Software Engineering", difficulty: "Hard", question: "Explain a technical decision you made and the tradeoffs behind it." },
  { category: "Frontend", difficulty: "Medium", question: "How would you improve the performance of a React application?" },
  { category: "Backend", difficulty: "Medium", question: "How do you design an API that remains maintainable over time?" },
  { category: "Python", difficulty: "Easy", question: "What Python features help you write clean, maintainable code?" },
  { category: "JavaScript", difficulty: "Medium", question: "Explain the event loop and why it matters for user experience." },
  { category: "AI/ML", difficulty: "Hard", question: "How would you evaluate whether an ML model is ready for production?" }
];

export function normalizeInterviewType(type: InterviewType) {
  return type.toLowerCase().replace(" ", "_");
}
