export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="grid min-h-56 place-items-center rounded-lg border bg-card/50">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-cyan-300 border-t-transparent" />
        <p className="mt-3 text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
