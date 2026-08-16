import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { id: "demo-user" },
    create: {
      id: "demo-user",
      name: "Demo Candidate",
      email: "demo@interviewai.local"
    },
    update: {}
  });

  const interview = await prisma.interview.create({
    data: {
      userId: user.id,
      title: "Frontend Engineer Mixed Interview",
      jobTitle: "Frontend Engineer",
      industry: "Technology",
      experienceLevel: "MID",
      interviewType: "MIXED",
      interviewLanguage: "ENGLISH",
      interviewerPersonality: "SENIOR_ENGINEER",
      durationMinutes: 10,
      status: "COMPLETED",
      jobDescription: "Build accessible, high-performance React interfaces and collaborate with product and design.",
      resumeText: "Frontend engineer with React, TypeScript, performance optimization, and design systems experience.",
      startedAt: new Date(Date.now() - 1000 * 60 * 60),
      completedAt: new Date()
    }
  });

  const question = await prisma.interviewQuestion.create({
    data: {
      interviewId: interview.id,
      questionText: "Tell me about a frontend project where you improved performance or user experience.",
      questionType: "technical",
      order: 1,
      generatedReason: "Performance is important for this role."
    }
  });

  const answer = await prisma.interviewAnswer.create({
    data: {
      interviewId: interview.id,
      questionId: question.id,
      transcript: "I led a React performance effort where we reduced initial bundle size, introduced route-based loading, and improved the dashboard interaction latency for users.",
      durationSeconds: 82,
      wordCount: 24,
      wordsPerMinute: 18,
      fillerWordCount: 1,
      longPauseCount: 1
    }
  });

  await prisma.answerEvaluation.create({
    data: {
      answerId: answer.id,
      relevanceScore: 86,
      clarityScore: 84,
      technicalAccuracyScore: 82,
      confidenceScore: 80,
      communicationScore: 86,
      structureScore: 78,
      evidenceScore: 76,
      concisenessScore: 88,
      overallScore: 82,
      strengths: ["Relevant technical example", "Clear ownership"],
      weaknesses: ["Needs stronger metrics", "Could explain tradeoffs more clearly"],
      suggestions: ["Add before-and-after numbers", "Name the constraints and alternatives"],
      improvedAnswer: "I led a React performance effort that reduced the initial bundle, added route-based loading, and improved perceived responsiveness. I measured the impact with web vitals and paired with design to protect the user experience.",
      starAnalysis: {
        applicable: true,
        situation: { detected: true, feedback: "Context is present." },
        task: { detected: true, feedback: "Ownership is clear." },
        action: { detected: true, feedback: "Actions are described." },
        result: { detected: false, feedback: "Add measurable outcome." }
      }
    }
  });

  await prisma.interviewReport.create({
    data: {
      interviewId: interview.id,
      overallScore: 82,
      communicationScore: 86,
      technicalKnowledgeScore: 82,
      confidenceScore: 80,
      answerStructureScore: 78,
      relevanceScore: 86,
      readinessLevel: "Interview Ready",
      strongestAnswer: {
        question: question.questionText,
        answerSummary: "The candidate gave a directly relevant technical example.",
        whyStrong: "It demonstrated ownership and connected to frontend performance."
      },
      weakestAnswer: {
        question: question.questionText,
        answerSummary: "The answer needed more measurable impact.",
        issues: ["Missing metrics", "Tradeoffs could be clearer"],
        betterApproach: "Use STAR and include measured before-and-after performance outcomes."
      },
      keyImprovements: ["Use measurable outcomes", "Explain tradeoffs", "Keep examples concise"],
      practicePlan: ["Prepare three STAR stories", "Practice performance deep dives", "Record one role-fit answer"],
      finalFeedback: "Strong foundation. Add clearer evidence and more specific technical tradeoffs."
    }
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
