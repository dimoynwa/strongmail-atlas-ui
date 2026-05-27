import { useState } from 'react';
import { useSessionStore } from '../store/sessionStore';
import { useAppStore } from '../store/appStore';
import { ContextSelectors } from './ContextSelectors';
import { TemplateList } from './TemplateList';
import { SessionBadge } from './SessionBadge';
import { SidebarFooter } from './SidebarFooter';

export function Sidebar() {
  const activeTab = useSessionStore((state) => state.activeTab);
  const setActiveTab = useSessionStore((state) => state.setActiveTab);
  const sessionId = useSessionStore((state) => state.sessionId);
  const templateName = useSessionStore((state) => state.templateName);
  const langLocal = useSessionStore((state) => state.langLocal);
  const paramCustBrand = useSessionStore((state) => state.paramCustBrand);
  const setLangLocal = useSessionStore((state) => state.setLangLocal);
  const setParamCustBrand = useSessionStore((state) => state.setParamCustBrand);
  const resetSession = useSessionStore((state) => state.resetSession);
  const openTemplate = useSessionStore((state) => state.openTemplate);
  const templates = useAppStore((state) => state.templates);

  const [filter, setFilter] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{
    type: 'lang' | 'brand';
    value: string;
    previous: string;
  } | null>(null);

  const handleLangChange = (nextLang: string) => {
    if (!sessionId) {
      setLangLocal(nextLang);
      return;
    }
    setConfirmDialog({
      type: 'lang',
      value: nextLang,
      previous: langLocal ?? 'en-US',
    });
  };

  const handleBrandChange = (nextBrand: string) => {
    if (!sessionId) {
      setParamCustBrand(nextBrand);
      return;
    }
    setConfirmDialog({
      type: 'brand',
      value: nextBrand,
      previous: paramCustBrand ?? 'default',
    });
  };

  const handleConfirmChange = async () => {
    if (!confirmDialog) return;

    const currentTemplate = templateName;
    resetSession();

    if (confirmDialog.type === 'lang') {
      setLangLocal(confirmDialog.value);
    } else {
      setParamCustBrand(confirmDialog.value);
    }

    if (currentTemplate) {
      await openTemplate(currentTemplate);
    }

    setConfirmDialog(null);
  };

  const handleCancelChange = () => {
    if (!confirmDialog) return;

    if (confirmDialog.type === 'lang') {
      setLangLocal(confirmDialog.previous);
    } else {
      setParamCustBrand(confirmDialog.previous);
    }

    setConfirmDialog(null);
  };

  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <aside className="flex w-72 flex-col border-r border-slate-200 bg-white">
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          className={`flex-1 px-3 py-2 text-sm ${activeTab === 'template' ? 'border-b-2 border-slate-900 font-semibold' : 'text-slate-500'}`}
          onClick={() => setActiveTab('template')}
        >
          Template
        </button>
        <button
          type="button"
          className={`flex-1 px-3 py-2 text-sm ${activeTab === 'general' ? 'border-b-2 border-slate-900 font-semibold' : 'text-slate-500'}`}
          onClick={() => setActiveTab('general')}
        >
          General
        </button>
      </div>

      {activeTab === 'template' && (
        <>
          <ContextSelectors
            langLocal={langLocal ?? 'en-US'}
            paramCustBrand={paramCustBrand ?? 'default'}
            onLangChange={handleLangChange}
            onBrandChange={handleBrandChange}
          />
          <SessionBadge />
          <input
            type="search"
            placeholder="Filter templates..."
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="mx-3 my-2 rounded border border-slate-200 px-2 py-1 text-sm"
          />
          <TemplateList templates={filteredTemplates} />
          <SidebarFooter />
        </>
      )}

      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-80 rounded bg-white p-4 shadow-lg">
            <p className="mb-4 text-sm">
              Changing {confirmDialog.type === 'lang' ? 'language' : 'brand'} will
              reset your current session. Continue?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="rounded border px-3 py-1 text-sm"
                onClick={handleCancelChange}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded bg-slate-900 px-3 py-1 text-sm text-white"
                onClick={() => void handleConfirmChange()}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
