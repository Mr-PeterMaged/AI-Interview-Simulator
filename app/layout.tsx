import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "InterviewAI — AI Interview Coach & Simulator",
  description: "Practice realistic adaptive interviews with AI feedback, speech metrics, and professional reports."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const document = (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );

  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) return document;
  return <ClerkProvider>{document}</ClerkProvider>;
}
