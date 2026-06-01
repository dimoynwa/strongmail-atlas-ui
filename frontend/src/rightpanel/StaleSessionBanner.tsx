interface StaleSessionBannerProps {
  templateName: string;
  onReopen: () => void;
  onDismiss: () => void;
}

export function StaleSessionBanner({
  templateName,
  onReopen,
  onDismiss,
}: StaleSessionBannerProps) {
  return (
    <div className="border-b border-amber-500/30 bg-bg-warning px-3 py-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-medium text-text-pri">
            Template data may be stale
          </p>
          <p className="mt-0.5 text-[10px] text-text-sec">
            <span className="font-mono">{templateName}</span> was refreshed in StrongMail.
            Re-open to load the latest content.
          </p>
        </div>
        <div className="flex flex-shrink-0 gap-1">
          <button
            type="button"
            onClick={onReopen}
            className="rounded border border-border-sec bg-bg-primary px-2 py-0.5 text-[10px] font-medium text-text-pri hover:bg-bg-secondary"
          >
            Re-open
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="rounded px-2 py-0.5 text-[10px] text-text-ter hover:text-text-sec"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
