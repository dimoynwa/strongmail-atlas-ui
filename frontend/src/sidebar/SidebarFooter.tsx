import { useSessionStore } from '../store/sessionStore';
import { useAppStore } from '../store/appStore';

export function SidebarFooter() {
  const resetSession = useSessionStore((state) => state.resetSession);
  const sessionId = useSessionStore((state) => state.sessionId);
  const openMaintenanceDrawer = useAppStore((state) => state.openMaintenanceDrawer);

  return (
    <div className="mt-auto border-t border-border-ter p-2">
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-bg-info text-[10px] font-medium text-text-info">
          PS
        </div>
        <div>
          <div className="text-[11px] font-medium text-text-pri">Paysafe</div>
          <div className="text-[10px] text-text-ter">Agent</div>
        </div>
      </div>
      <button
        type="button"
        onClick={openMaintenanceDrawer}
        className="mt-2 flex w-full items-center justify-center gap-1 rounded border border-border-sec px-2 py-1 text-[10px] text-text-sec hover:bg-bg-secondary"
      >
        <i className="ti ti-settings text-[11px]" />
        Maintenance
      </button>
      {sessionId && (
        <button
          type="button"
          onClick={() => resetSession()}
          className="mt-2 w-full rounded border border-border-sec px-2 py-1 text-[10px] text-text-sec hover:bg-bg-secondary"
        >
          Close session
        </button>
      )}
    </div>
  );
}
