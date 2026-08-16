export type ReadinessLevel = "Not Ready" | "Developing" | "Interview Ready" | "Strong Candidate";

export type FinalReportResult = {
  overallScore: number;
  readinessLevel: ReadinessLevel;
  categoryScores: {
    communication: number;
    technicalKnowledge: number;
    confidence: number;
    answerStructure: number;
    relevance: number;
  };
  strongestAnswer: {
    question: string;
    answerSummary: string;
    whyStrong: string;
  };
  weakestAnswer: {
    question: string;
    answerSummary: string;
    issues: string[];
    betterApproach: string;
  };
  keyImprovements: string[];
  practicePlan: string[];
  finalFeedback: string;
};
