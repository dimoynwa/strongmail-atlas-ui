import { useSessionStore } from '../store/sessionStore';
import { useAppStore } from '../store/appStore';
import { RefreshChip } from './RefreshChip';
import { runTemplateRefresh } from '../utils/maintenanceJobRunner';

interface PreviewLabelBarProps {
  resolvedCount: number;
  totalPlaceholders: number;
}

export function PreviewLabelBar({
  resolvedCount,
  totalPlaceholders,
}: PreviewLabelBarProps) {
  const sessionId = useSessionStore((state) => state.sessionId);
  const templateName = useSessionStore((state) => state.templateName);
  const activeRefreshTarget = useAppStore((state) => state.activeRefreshTarget);
  const activeRefreshStatus = useAppStore((state) => state.activeRefreshStatus);
  const openMaintenanceDrawer = useAppStore((state) => state.openMaintenanceDrawer);

  const showResolvedSummary = totalPlaceholders > 0;
  const showRefreshChip =
    sessionId !== null &&
    templateName !== null &&
    activeRefreshStatus !== null &&
    activeRefreshStatus !== 'idle' &&
    activeRefreshTarget === templateName;

  const showRefreshButton =
    sessionId !== null &&
    templateName !== null &&
    !showRefreshChip;

  const handleRefresh = () => {
    if (!templateName) return;
    void runTemplateRefresh(templateName);
  };

  return (
    <div className="flex h-9 flex-shrink-0 items-center gap-1.5 border-b border-border-ter px-3">
      <i className="ti ti-eye text-[14px] text-text-ter" />
      <span className="text-[11px] font-medium text-text-sec">Live preview</span>
      {showResolvedSummary && (
        <span className="text-[10px] text-text-ter">
          {resolvedCount}/{totalPlaceholders} resolved
        </span>
      )}
      <div className="ml-auto flex items-center gap-2">
        {showRefreshChip && activeRefreshStatus && (
          <RefreshChip
            status={activeRefreshStatus === 'failed' ? 'failed' : 'refreshing'}
            onFailedClick={openMaintenanceDrawer}
          />
        )}
        {showRefreshButton && (
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-1 rounded border border-border-sec bg-bg-primary px-2 py-0.5 text-[10px] text-text-sec hover:bg-bg-secondary"
            aria-label="Refresh template from StrongMail"
          >
            <i className="ti ti-refresh text-[11px]" />
            Refresh
          </button>
        )}
        <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#22c55e]" />
      </div>
    </div>
  );
}
