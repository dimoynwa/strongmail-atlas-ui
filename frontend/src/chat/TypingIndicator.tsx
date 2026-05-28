export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1 text-xs text-text-sec">
      <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-text-ter" />
      Assistant is typing…
    </div>
  );
}
