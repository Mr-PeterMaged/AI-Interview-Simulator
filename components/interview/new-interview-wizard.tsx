"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, FileText, Mic, Video } from "lucide-react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { experienceLevels, industries, interviewerPersonalities, interviewTypes, languages } from "@/lib/constants";
import { createInterviewSchema } from "@/lib/ai/schemas";
import { cn } from "@/lib/utils";

const formSchema = createInterviewSchema.extend({
  cameraEnabled: z.boolean().default(false),
  microphoneEnabled: z.boolean().default(true),
  bodyAnalysisEnabled: z.boolean().default(false),
  recordingConsent: z.boolean().default(false)
});

type FormValues = z.infer<typeof formSchema>;

export function NewInterviewWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [analysis, setAnalysis] = useState<{ extractedSkills?: string[]; suggestedTopics?: string[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ message: string; ok: boolean } | null>(null);
  const [uploading, setUploading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as unknown as Resolver<FormValues>,
    defaultValues: {
      jobTitle: "Frontend Engineer",
      industry: "Technology",
      experienceLevel: "Mid",
      interviewType: "Mixed",
      interviewLanguage: "English",
      interviewerPersonality: "Senior Engineer",
      durationMinutes: 10,
      jobDescription: "",
      resumeText: "",
      cameraEnabled: false,
      microphoneEnabled: true,
      bodyAnalysisEnabled: false,
      recordingConsent: false
    }
  });

  async function handleResumeUpload(file?: File) {
    if (!file) return;
    setUploading(true);
    setUploadStatus(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) {
        setUploadStatus({ message: data.error || "Upload failed.", ok: false });
        return;
      }
      if (data.resumeText) form.setValue("resumeText", data.resumeText);
      setUploadStatus({ message: data.message, ok: Boolean(data.resumeText) });
    } catch {
      setUploadStatus({ message: "Upload failed. Paste the resume text manually below.", ok: false });
    } finally {
      setUploading(false);
    }
  }

  async function analyzeContext() {
    setLoading(true);
    const resumeText = form.getValues("resumeText");
    const jobDescription = form.getValues("jobDescription");
    const [resumeResponse, jdResponse] = await Promise.all([
      resumeText ? fetch("/api/ai/analyze-resume", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resumeText }) }) : null,
      jobDescription ? fetch("/api/ai/analyze-job-description", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jobDescription }) }) : null
    ]);
    const resume = resumeResponse ? await resumeResponse.json() : {};
    const jd = jdResponse ? await jdResponse.json() : {};
    setAnalysis({
      extractedSkills: resume.analysis?.extractedSkills || jd.analysis?.keySkills || [],
      suggestedTopics: resume.analysis?.suggestedTopics || jd.analysis?.suggestedQuestions || []
    });
    setLoading(false);
  }

  async function onSubmit(values: FormValues) {
    setLoading(true);
    const response = await fetch("/api/interviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    const data = await response.json();
    setLoading(false);
    if (data.interview?.id) router.push(`/interviews/room/${data.interview.id}`);
  }

  const cardButton = "rounded-lg border bg-slate-950/60 p-4 text-left transition hover:border-cyan-300/50";

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <PageHeader title="New interview setup" description="Configure a realistic interview using your role target, resume context, job description, and privacy preferences." />

      <div className="flex gap-2">
        {[1, 2, 3].map((item) => (
          <div key={item} className={cn("h-2 flex-1 rounded-full bg-slate-800", step >= item && "bg-gradient-to-r from-indigo-500 to-cyan-400")} />
        ))}
      </div>

      {step === 1 ? (
        <Card className="glass">
          <CardHeader><CardTitle>Step 1: Role details</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Job title</Label>
                <Input {...form.register("jobTitle")} />
              </div>
              <div className="space-y-2">
                <Label>Industry</Label>
                <Select options={industries.map((industry) => ({ label: industry, value: industry }))} {...form.register("industry")} />
              </div>
            </div>
            <ChoiceGrid label="Experience level" options={experienceLevels} value={form.watch("experienceLevel")} onChange={(value) => form.setValue("experienceLevel", value)} />
            <ChoiceGrid label="Interview type" options={interviewTypes} value={form.watch("interviewType")} onChange={(value) => form.setValue("interviewType", value)} />
            <ChoiceGrid label="Language" options={languages} value={form.watch("interviewLanguage")} onChange={(value) => form.setValue("interviewLanguage", value)} />
          </CardContent>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card className="glass">
          <CardHeader><CardTitle>Step 2: Resume and job context</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-3">
                <Label>Upload CV/resume</Label>
                <Input type="file" accept=".txt,.pdf,.docx" disabled={uploading} onChange={(event) => handleResumeUpload(event.target.files?.[0])} />
                {uploading ? <p className="text-xs text-muted-foreground">Extracting text…</p> : null}
                {uploadStatus ? (
                  <p className={`text-xs ${uploadStatus.ok ? "text-emerald-300" : "text-amber-300"}`}>{uploadStatus.message}</p>
                ) : null}
                <Textarea value={form.watch("resumeText") || ""} onChange={(event) => form.setValue("resumeText", event.target.value)} placeholder="Extracted resume text or pasted CV content." />
              </div>
              <div className="space-y-3">
                <Label>Job description</Label>
                <Textarea value={form.watch("jobDescription") || ""} onChange={(event) => form.setValue("jobDescription", event.target.value)} className="min-h-[230px]" placeholder="Paste the complete job description here." />
              </div>
            </div>
            <Button type="button" variant="secondary" onClick={analyzeContext} disabled={loading}>
              <FileText className="h-4 w-4" /> {loading ? "Analyzing..." : "Analyze with AI"}
            </Button>
            {analysis ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border bg-slate-950/50 p-4">
                  <p className="text-sm font-semibold text-white">Detected skills</p>
                  <div className="mt-3 flex flex-wrap gap-2">{analysis.extractedSkills?.map((skill) => <Badge key={skill}>{skill}</Badge>)}</div>
                </div>
                <div className="rounded-lg border bg-slate-950/50 p-4">
                  <p className="text-sm font-semibold text-white">Suggested topics</p>
                  <div className="mt-3 flex flex-wrap gap-2">{analysis.suggestedTopics?.map((topic) => <Badge key={topic} variant="outline">{topic}</Badge>)}</div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {step === 3 ? (
        <Card className="glass">
          <CardHeader><CardTitle>Step 3: Preferences and privacy</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <ChoiceGrid label="Duration" options={["5", "10", "20", "30"]} value={String(form.watch("durationMinutes"))} onChange={(value) => form.setValue("durationMinutes", Number(value))} suffix="minutes" />
            <div>
              <Label>Interviewer personality</Label>
              <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                {interviewerPersonalities.map((personality) => (
                  <button
                    type="button"
                    key={personality.value}
                    onClick={() => form.setValue("interviewerPersonality", personality.value)}
                    className={cn(cardButton, form.watch("interviewerPersonality") === personality.value && "border-cyan-300 bg-cyan-400/10")}
                  >
                    <p className="font-semibold text-white">{personality.label}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{personality.description}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <ToggleRow icon={<Mic className="h-4 w-4" />} label="Microphone" checked={form.watch("microphoneEnabled")} onCheckedChange={(value) => form.setValue("microphoneEnabled", value)} />
              <ToggleRow icon={<Video className="h-4 w-4" />} label="Camera preview" checked={form.watch("cameraEnabled")} onCheckedChange={(value) => form.setValue("cameraEnabled", value)} />
              <ToggleRow icon={<Video className="h-4 w-4" />} label="Body analysis" checked={form.watch("bodyAnalysisEnabled")} onCheckedChange={(value) => form.setValue("bodyAnalysisEnabled", value)} />
            </div>
            <label className="flex gap-3 rounded-lg border bg-slate-950/50 p-4 text-sm text-muted-foreground">
              <input type="checkbox" checked={form.watch("recordingConsent")} onChange={(event) => form.setValue("recordingConsent", event.target.checked)} className="mt-1" />
              I consent to optional audio/video recording for this session. Video is not stored by default, and camera processing is local where supported.
            </label>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={() => setStep((value) => Math.max(1, value - 1))} disabled={step === 1}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        {step < 3 ? (
          <Button type="button" onClick={() => setStep((value) => Math.min(3, value + 1))}>
            Continue <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button type="submit" disabled={loading}>{loading ? "Starting..." : "Start Interview"}</Button>
        )}
      </div>
    </form>
  );
}

function ChoiceGrid<T extends string>({
  label,
  options,
  value,
  onChange,
  suffix
}: {
  label: string;
  options: readonly T[];
  value: string;
  onChange: (value: T) => void;
  suffix?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn("rounded-lg border bg-slate-950/60 p-4 text-left text-sm font-semibold text-white transition hover:border-cyan-300/50", value === option && "border-cyan-300 bg-cyan-400/10")}
          >
            {option} {suffix}
          </button>
        ))}
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onCheckedChange,
  icon
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-slate-950/50 p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-white">{icon}{label}</div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
