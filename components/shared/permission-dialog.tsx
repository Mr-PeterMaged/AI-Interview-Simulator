"use client";

import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function PermissionDialog({ trigger }: { trigger: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-cyan-300" /> Permissions and privacy</DialogTitle>
          <DialogDescription>
            Microphone access powers browser transcription. Camera access is optional and processed locally where supported. Video is not stored by default.
          </DialogDescription>
        </DialogHeader>
        <Button className="mt-4">Understood</Button>
      </DialogContent>
    </Dialog>
  );
}
