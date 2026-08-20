"use client";

import type { RefObject } from "react";
import { Camera, CameraOff } from "lucide-react";
import type { CameraStatus } from "@/hooks/use-camera";
import { Badge } from "@/components/ui/badge";

export function CameraPreview({ videoRef, status }: { videoRef: RefObject<HTMLVideoElement | null>; status: CameraStatus }) {
  return (
    <div className="overflow-hidden rounded-lg border bg-slate-950">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          {status === "ready" ? <Camera className="h-4 w-4 text-cyan-300" /> : <CameraOff className="h-4 w-4 text-muted-foreground" />}
          Camera
        </div>
        <Badge variant={status === "ready" ? "success" : status === "denied" ? "danger" : "outline"}>{status}</Badge>
      </div>
      <div className="aspect-video bg-slate-900">
        <video ref={videoRef} autoPlay muted playsInline className={`h-full w-full object-cover ${status === "ready" ? "" : "hidden"}`} />
        {status !== "ready" ? (
          <div className="grid h-full place-items-center px-5 text-center text-sm text-muted-foreground">
            {status === "denied"
              ? "Camera access was denied. Allow camera access in your browser settings to enable the preview and body-language analysis."
              : "Camera preview is optional. Visual analysis stays local where supported."}
          </div>
        ) : null}
      </div>
    </div>
  );
}
