interface RefreshChipProps {
  status: 'refreshing' | 'failed';
  onFailedClick: () => void;
}

export function RefreshChip({ status, onFailedClick }: RefreshChipProps) {
  if (status === 'refreshing') {
    return (
      <span className="inline-flex items-center gap-1 rounded border border-border-sec bg-bg-secondary px-2 py-0.5 text-[10px] text-text-sec">
        <i className="ti ti-loader-2 animate-spin text-[11px]" />
        Refreshing…
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onFailedClick}
      className="inline-flex items-center gap-1 rounded border border-amber-500/40 bg-amber-50 px-2 py-0.5 text-[10px] text-amber-800 hover:bg-amber-100"
    >
      <i className="ti ti-alert-triangle text-[11px]" />
      Refresh failed
    </button>
  );
}
