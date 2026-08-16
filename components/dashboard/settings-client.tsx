"use client";

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
  return (
    <div className="space-y-8">
      <PageHeader title="Settings" description="Manage interview defaults, voice/camera preferences, and data controls." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass">
          <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input defaultValue="Demo Candidate" /></div>
            <div className="space-y-2"><Label>Email</Label><Input defaultValue="demo@interviewai.local" /></div>
            <Button>Save profile</Button>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader><CardTitle>Interview defaults</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Preferred language</Label><Select options={[{ label: "English", value: "English" }, { label: "Arabic", value: "Arabic" }]} defaultValue="English" /></div>
            <div className="space-y-2"><Label>Default duration</Label><Select options={[5, 10, 20, 30].map((value) => ({ label: `${value} minutes`, value: String(value) }))} defaultValue="10" /></div>
            <div className="space-y-2"><Label>Default personality</Label><Select options={["Friendly Recruiter", "Professional HR", "Senior Engineer", "Strict Interviewer", "Neutral Interviewer"].map((value) => ({ label: value, value }))} defaultValue="Senior Engineer" /></div>
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
            <p>Interview records are scoped to your authenticated user account. Do not store camera/video recordings unless you explicitly consent.</p>
            <ConfirmDialog
              title="Delete interview history?"
              description="This action should be wired to a destructive API in production. The MVP keeps the confirmation pattern ready."
              confirmLabel="Delete history"
              onConfirm={() => undefined}
              trigger={<Button variant="destructive"><Trash2 className="h-4 w-4" /> Delete interview history</Button>}
            />
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
