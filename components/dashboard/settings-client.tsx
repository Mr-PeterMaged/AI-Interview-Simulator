"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/shared/page-header";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

export function SettingsClient() {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);

  async function deleteHistory() {
    setDeleting(true);
    setDeleteMessage(null);
    try {
      const response = await fetch("/api/interviews", { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to delete interview history");
      setDeleteMessage(`Deleted ${data.deletedCount} interview${data.deletedCount === 1 ? "" : "s"}.`);
      router.refresh();
    } catch (err) {
      setDeleteMessage(err instanceof Error ? err.message : "Unable to delete interview history");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Settings" description="Manage interview defaults, voice/camera preferences, and data controls." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass">
          <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input defaultValue="Demo Candidate" disabled /></div>
            <div className="space-y-2"><Label>Email</Label><Input defaultValue="demo@interviewai.local" disabled /></div>
            <p className="text-xs text-muted-foreground">Profile fields are managed by your sign-in provider (Clerk) and aren&apos;t editable here yet.</p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader><CardTitle>Interview defaults</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Preferred language</Label><Select options={[{ label: "English", value: "English" }, { label: "Arabic", value: "Arabic" }]} defaultValue="English" /></div>
            <div className="space-y-2"><Label>Default duration</Label><Select options={[5, 10, 20, 30].map((value) => ({ label: `${value} minutes`, value: String(value) }))} defaultValue="10" /></div>
            <div className="space-y-2"><Label>Default personality</Label><Select options={["Friendly Recruiter", "Professional HR", "Senior Engineer", "Strict Interviewer", "Neutral Interviewer"].map((value) => ({ label: value, value }))} defaultValue="Senior Engineer" /></div>
            <p className="text-xs text-muted-foreground">These defaults pre-fill the new-interview wizard in a future update; every session can still be customized when you create it.</p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader><CardTitle>Voice and camera</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Preference label="Enable speech recognition" description="Uses browser Web Speech API when available." />
            <Preference label="Enable camera preview" description="Camera is optional for the interview room." />
            <Preference label="Enable body-analysis experiments" description="Local/browser-based where supported; not uploaded by default." />
          </CardContent>
        </Card>
        <Card className="glass border-rose-400/30">
          <CardHeader><CardTitle>Data and privacy</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>Interview records are scoped to your authenticated user account. Camera/video recordings are not stored by default.</p>
            <ConfirmDialog
              title="Delete interview history?"
              description="This permanently deletes every interview, question, answer, evaluation, and report tied to your account. This cannot be undone."
              confirmLabel={deleting ? "Deleting..." : "Delete history"}
              onConfirm={deleteHistory}
              trigger={<Button variant="destructive" disabled={deleting}><Trash2 className="h-4 w-4" /> Delete interview history</Button>}
            />
            {deleteMessage ? <p className="text-xs text-slate-200">{deleteMessage}</p> : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Preference({ label, description }: { label: string; description: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border bg-slate-950/50 p-4">
      <div>
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch defaultChecked />
    </div>
  );
}
