import { StatusBar } from './StatusBar';
import { Topbar } from './Topbar';
import { TemplateLoadingOverlay } from './TemplateLoadingOverlay';
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
  const isOpeningTemplate = useSessionStore((state) => state.isOpeningTemplate);
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
          <div className="content-area relative flex min-h-0 min-w-0 flex-1">
            <ChatColumn />
            <PreviewColumn />
            <RightPanel />
            {isOpeningTemplate && <TemplateLoadingOverlay />}
          </div>
        ) : (
          <GeneralLayout />
        )}
      </div>
      <StatusBar />
    </div>
  );
}
