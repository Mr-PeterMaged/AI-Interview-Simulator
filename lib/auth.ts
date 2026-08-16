import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

const DEMO_USER_ID = "demo-user";

export async function getCurrentUserId() {
  try {
    const { userId } = await auth();
    if (userId) return userId;
  } catch {
    // Local demo mode keeps the app usable before Clerk credentials are configured.
  }

  if (process.env.NODE_ENV !== "production") return DEMO_USER_ID;
  return null;
}

export async function requireUserId() {
  const userId = await getCurrentUserId();
  if (!userId) {
    const error = new Error("Unauthenticated");
    error.name = "Unauthenticated";
    throw error;
  }
  return userId;
}

export async function ensureUser() {
  const userId = await requireUserId();

  let profile = {
    name: "Demo Candidate",
    email: "demo@interviewai.local",
    image: null as string | null
  };

  try {
    const clerkUser = await currentUser();
    if (clerkUser) {
      profile = {
        name: clerkUser.fullName || clerkUser.username || "Candidate",
        email: clerkUser.emailAddresses[0]?.emailAddress || `${userId}@interviewai.local`,
        image: clerkUser.imageUrl
      };
    }
  } catch {
    // Ignore Clerk lookup failures in local demo mode.
  }

  return prisma.user.upsert({
    where: { id: userId },
    create: { id: userId, ...profile },
    update: profile
  });
}

export async function assertInterviewOwner(interviewId: string, userId: string) {
  const interview = await prisma.interview.findFirst({
    where: { id: interviewId, userId }
  });
  if (!interview) {
    const error = new Error("Interview not found");
    error.name = "NotFound";
    throw error;
  }
  return interview;
}
