interface PreviewLabelBarProps {
  resolvedCount: number;
  totalPlaceholders: number;
}

export function PreviewLabelBar({
  resolvedCount,
  totalPlaceholders,
}: PreviewLabelBarProps) {
  const showResolvedSummary = totalPlaceholders > 0;

  return (
    <div className="flex h-[34px] flex-shrink-0 items-center gap-1.5 border-b border-border-ter px-2.5">
      <i className="ti ti-eye text-[14px] text-text-ter" />
      <span className="text-[11px] font-medium text-text-sec">Live preview</span>
      {showResolvedSummary && (
        <span className="text-[10px] text-text-ter">
          {resolvedCount}/{totalPlaceholders} resolved
        </span>
      )}
      <div className="ml-auto h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#22c55e]" />
    </div>
  );
}
