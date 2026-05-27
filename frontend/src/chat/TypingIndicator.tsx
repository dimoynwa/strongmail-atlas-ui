export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1 text-xs text-slate-500">
      <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-slate-400" />
      Assistant is typing…
    </div>
  );
}
