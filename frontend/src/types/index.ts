export interface GeneralResultCard {
  template_name: string;
  description?: string;
  score?: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolName?: string;
  diff?: Record<string, { old: string; new: string }>;
  snapshotOverwritten?: boolean;
  agent?: 'template' | 'general';
  results?: GeneralResultCard[];
}

export interface DiffPayload {
  [key: string]: { old: string; new: string };
}

export interface ToneScores {
  urgency: number;
  anger: number;
  fear: number;
  admiration: number;
  approval: number;
  gratitude: number;
  joy: number;
  amusement: number;
  excitement: number;
  neutral: number;
  [key: string]: number;
}

export interface TemplateListItem {
  name: string;
  id?: string;
  key_count?: number;
  last_modified?: string;
  summary?: string;
  description?: string;
  locales?: string[];
  brands?: string[];
}

export interface WorkingCopyOverride {
  key: string;
  value: string;
}

export type HealthStatus = 'ok' | 'degraded' | 'unavailable';

export interface SessionState {
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
}

export interface ApiErrorBody {
  detail?: string;
  message?: string;
}

export type SSEEvent =
  | { type: 'tool'; name: string }
  | { type: 'token'; text: string }
  | {
      type: 'final';
      text: string;
      diff?: DiffPayload;
      snapshotOverwritten?: boolean;
      results?: GeneralResultCard[];
    }
  | { type: 'error'; message: string };
