import { create } from 'zustand';
import type { GeneralResultCard, Message, ToneScores } from '../types';
import { createSession } from '../api/session';
import { getPreview } from '../api/preview';
import {
  getWorkingCopy,
  patchWorkingCopy,
  resetWorkingCopy,
} from '../api/workingCopy';
import { applyTone, evaluateTone, undoTone } from '../api/tone';
import { streamChat } from '../api/chat';
import { highlightModifiedValues } from '../utils/preview';

const initialSessionState = {
  templateName: null as string | null,
  langLocal: 'EN' as string | null,
  paramCustBrand: 'SKRILL' as string | null,
  sessionId: null as string | null,
  messages: [] as Message[],
  streamingText: '',
  activeTool: null as string | null,
  isStreaming: false,
  workingCopy: {} as Record<string, string>,
  modifiedKeys: new Set<string>(),
  editCount: 0,
  toneScores: null as ToneScores | null,
  toneStoredScores: null as ToneScores | null,
  toneStale: false,
  activeTab: 'template' as 'template' | 'general',
  previewVisible: true,
  resolvedHtml: '',
  generalResultCards: [] as GeneralResultCard[],
};

let previewDebounceTimer: ReturnType<typeof setTimeout> | null = null;

function createMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export interface SessionStore {
  templateName: string | null;
  langLocal: string | null;
  paramCustBrand: string | null;
  sessionId: string | null;
  messages: Message[];
  streamingText: string;
  activeTool: string | null;
  isStreaming: boolean;
  workingCopy: Record<string, string>;
  modifiedKeys: Set<string>;
  editCount: number;
  toneScores: ToneScores | null;
  toneStoredScores: ToneScores | null;
  toneStale: boolean;
  activeTab: 'template' | 'general';
  previewVisible: boolean;
  resolvedHtml: string;
  generalResultCards: GeneralResultCard[];
  openTemplate: (templateName: string) => Promise<void>;
  resetSession: () => void;
  sendMessage: (content: string) => Promise<void>;
  patchWorkingCopy: (updates: Record<string, string>) => Promise<void>;
  resetWorkingCopy: () => Promise<void>;
  evaluateTone: () => Promise<void>;
  undoTone: () => Promise<void>;
  refreshPreview: () => Promise<void>;
  applyDiff: (keys?: string[]) => Promise<void>;
  setActiveTab: (tab: 'template' | 'general') => void;
  setLangLocal: (lang: string) => void;
  setParamCustBrand: (brand: string) => void;
  removeDiffFromMessage: (messageId: string) => void;
  clearGeneralResults: () => void;
}

async function fetchAndSetPreview(
  sessionId: string,
  workingCopy: Record<string, string>,
  modifiedKeys: Set<string>,
): Promise<string> {
  const preview = await getPreview(sessionId);
  return highlightModifiedValues(preview.html, workingCopy, modifiedKeys);
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  ...initialSessionState,

  openTemplate: async (templateName: string) => {
    const { langLocal, paramCustBrand } = get();
    if (!langLocal || !paramCustBrand) return;

    const sessionResponse = await createSession({
      template_name: templateName,
      lang_local: langLocal,
      param_cust_brand: paramCustBrand,
    });

    const { workingCopy, modifiedKeys: modifiedKeyList } = await getWorkingCopy(
      sessionResponse.session_id,
    );
    const modifiedKeys = new Set(modifiedKeyList);
    const resolvedHtml = await fetchAndSetPreview(
      sessionResponse.session_id,
      workingCopy,
      modifiedKeys,
    );

    const welcomeMessage: Message = {
      id: createMessageId(),
      role: 'assistant',
      content: `Session opened for template "${templateName}". How can I help you edit it?`,
    };

    set({
      sessionId: sessionResponse.session_id,
      templateName,
      workingCopy,
      modifiedKeys,
      resolvedHtml,
      messages: [welcomeMessage],
      streamingText: '',
      activeTool: null,
      isStreaming: false,
      toneScores: null,
      toneStoredScores: null,
      toneStale: false,
      editCount: 0,
      activeTab: 'template',
    });
  },

  resetSession: () => {
    if (previewDebounceTimer) {
      clearTimeout(previewDebounceTimer);
      previewDebounceTimer = null;
    }
    set({ ...initialSessionState, langLocal: get().langLocal, paramCustBrand: get().paramCustBrand });
  },

  sendMessage: async (content: string) => {
    const { sessionId, messages } = get();
    if (!sessionId || !content.trim()) return;

    const userMessage: Message = {
      id: createMessageId(),
      role: 'user',
      content: content.trim(),
      agent: 'template',
    };

    set({
      messages: [...messages, userMessage],
      isStreaming: true,
      streamingText: '',
      activeTool: null,
    });

    await streamChat({
      sessionId,
      agent: 'template',
      message: content.trim(),
      onToken: (text) => {
        set((state) => ({ streamingText: state.streamingText + text }));
      },
      onTool: (name) => {
        set({ activeTool: name });
      },
      onFinal: (event) => {
        const assistantMessage: Message = {
          id: createMessageId(),
          role: 'assistant',
          content: event.text,
          diff: event.diff,
          snapshotOverwritten: event.snapshotOverwritten,
          agent: 'template',
        };
        set((state) => ({
          messages: [...state.messages, assistantMessage],
          streamingText: '',
          activeTool: null,
          isStreaming: false,
        }));
      },
      onError: (message) => {
        const errorMessage: Message = {
          id: createMessageId(),
          role: 'assistant',
          content: message,
        };
        set((state) => ({
          messages: [...state.messages, errorMessage],
          streamingText: '',
          activeTool: null,
          isStreaming: false,
        }));
      },
    });
  },

  patchWorkingCopy: async (updates: Record<string, string>) => {
    const { sessionId, workingCopy, modifiedKeys } = get();
    if (!sessionId) return;

    await patchWorkingCopy(sessionId, updates);

    const nextWorkingCopy = { ...workingCopy, ...updates };
    const nextModifiedKeys = new Set([...modifiedKeys, ...Object.keys(updates)]);

    set({
      workingCopy: nextWorkingCopy,
      modifiedKeys: nextModifiedKeys,
      toneStale: true,
      editCount: get().editCount + Object.keys(updates).length,
    });

    await get().refreshPreview();
  },

  resetWorkingCopy: async () => {
    const { sessionId } = get();
    if (!sessionId) return;

    await resetWorkingCopy(sessionId);
    const { workingCopy, modifiedKeys: modifiedKeyList } = await getWorkingCopy(sessionId);
    const modifiedKeys = new Set(modifiedKeyList);
    const resolvedHtml = await fetchAndSetPreview(sessionId, workingCopy, modifiedKeys);

    set({
      workingCopy,
      modifiedKeys,
      resolvedHtml,
      toneStale: true,
      editCount: 0,
    });
  },

  evaluateTone: async () => {
    const { sessionId } = get();
    if (!sessionId) return;

    const response = await evaluateTone(sessionId);
    set({
      toneScores: response.scores,
      toneStoredScores: response.baselineScores,
      toneStale: false,
    });
  },

  undoTone: async () => {
    const { sessionId } = get();
    if (!sessionId) return;

    await undoTone(sessionId);
    const { workingCopy, modifiedKeys: modifiedKeyList } = await getWorkingCopy(sessionId);
    const modifiedKeys = new Set(modifiedKeyList);

    set({
      workingCopy,
      modifiedKeys,
      toneStale: true,
    });

    await get().refreshPreview();
  },

  refreshPreview: async () => {
    const { sessionId, workingCopy, modifiedKeys } = get();
    if (!sessionId) return;

    if (previewDebounceTimer) {
      clearTimeout(previewDebounceTimer);
    }

    previewDebounceTimer = setTimeout(async () => {
      const resolvedHtml = await fetchAndSetPreview(
        sessionId,
        workingCopy,
        modifiedKeys,
      );
      set({ resolvedHtml });
    }, 300);
  },

  applyDiff: async (keys?: string[]) => {
    const { sessionId } = get();
    if (!sessionId) return;

    await applyTone(sessionId, keys);
    const { workingCopy, modifiedKeys: modifiedKeyList } = await getWorkingCopy(sessionId);
    const modifiedKeys = new Set(modifiedKeyList);
    const resolvedHtml = await fetchAndSetPreview(sessionId, workingCopy, modifiedKeys);

    set({
      workingCopy,
      modifiedKeys,
      resolvedHtml,
      toneStale: true,
    });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  setLangLocal: (lang) => set({ langLocal: lang }),

  setParamCustBrand: (brand) => set({ paramCustBrand: brand }),

  removeDiffFromMessage: (messageId: string) => {
    set((state) => ({
      messages: state.messages.map((message) =>
        message.id === messageId
          ? { ...message, diff: undefined, snapshotOverwritten: undefined }
          : message,
      ),
    }));
  },

  clearGeneralResults: () => set({ generalResultCards: [] }),
}));
