export type GeneratedQuestion = {
  question: string;
  questionType: string;
  reason: string;
  expectedFocus: string[];
};

export type AnswerEvaluationResult = {
  scores: {
    relevance: number;
    clarity: number;
    technicalAccuracy: number;
    confidence: number;
    communication: number;
    answerStructure: number;
    examplesEvidence: number;
    conciseness: number;
    overall: number;
  };
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  improvedAnswer: string;
  starAnalysis: {
    applicable: boolean;
    situation: { detected: boolean; feedback: string };
    task: { detected: boolean; feedback: string };
    action: { detected: boolean; feedback: string };
    result: { detected: boolean; feedback: string };
  };
  summary: string;
};
