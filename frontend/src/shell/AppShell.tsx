import { StatusBar } from './StatusBar';
import { Topbar } from './Topbar';
import { Sidebar } from '../sidebar/Sidebar';
import { ChatColumn } from '../chat/ChatColumn';
import { PreviewColumn } from '../preview/PreviewColumn';
import { RightPanel } from '../rightpanel/RightPanel';
import { GeneralLayout } from '../general/GeneralLayout';
import { useAppStore } from '../store/appStore';
import { useSessionStore } from '../store/sessionStore';
import { useEffect } from 'react';

export function AppShell() {
  const activeTab = useSessionStore((state) => state.activeTab);
  const loadTemplates = useAppStore((state) => state.loadTemplates);
  const loadLocalesAndBrands = useAppStore((state) => state.loadLocalesAndBrands);
  const pollHealth = useAppStore((state) => state.pollHealth);
  const stopPolling = useAppStore((state) => state.stopPolling);

  useEffect(() => {
    void loadTemplates();
    void loadLocalesAndBrands();
  }, [loadTemplates, loadLocalesAndBrands]);

  useEffect(() => {
    pollHealth();
    return () => stopPolling();
  }, [pollHealth, stopPolling]);

  return (
    <div className="flex h-screen flex-col bg-bg-tertiary text-text-pri">
      <Topbar />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        {activeTab === 'template' ? (
          <>
            <ChatColumn />
            <PreviewColumn />
            <RightPanel />
          </>
        ) : (
          <GeneralLayout />
        )}
      </div>
      <StatusBar />
    </div>
  );
}
