import { AlertTriangle } from "lucide-react";

export function ErrorState({ title = "Something went wrong", message }: { title?: string; message?: string }) {
  return (
    <div className="rounded-lg border border-rose-400/30 bg-rose-500/10 p-5 text-rose-100">
      <div className="flex items-center gap-2 font-semibold">
        <AlertTriangle className="h-4 w-4" />
        {title}
      </div>
      {message ? <p className="mt-2 text-sm text-rose-100/80">{message}</p> : null}
    </div>
  );
}
