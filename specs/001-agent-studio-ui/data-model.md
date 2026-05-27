# Data Model: Agent Studio UI

**Date**: 2026-05-27

## State Models (Zustand)

### AppStore
Manages global, cross-session application state.

```typescript
interface AppStore {
  // State
  templates: Template[];
  locales: string[];
  brands: string[];
  health: Record<string, 'ok' | 'degraded' | 'unavailable'>;
  
  // Actions
  loadTemplates: () => Promise<void>;
  loadLocalesAndBrands: () => Promise<void>;
  pollHealth: () => void;
}
```

### SessionStore
Manages volatile state for the active template session.

```typescript
interface SessionStore {
  // State
  templateName: string | null;
  langLocal: string | null;
  paramCustBrand: string | null;
  sessionId: string | null;
  messages: ChatMessage[];
  streamingText: string;
  activeTool: string | null;
  isStreaming: boolean;
  workingCopy: Record<string, string>;
  modifiedKeys: Set<string>;
  editCount: number;
  toneScores: ToneScores | null;
  toneStoredScores: ToneScores | null; // Baseline
  toneStale: boolean;
  activeTab: 'template' | 'general';
  previewVisible: boolean;
  resolvedHtml: string;
  
  // Actions
  openTemplate: (templateName: string) => Promise<void>;
  resetSession: () => void;
  sendMessage: (content: string) => Promise<void>;
  patchWorkingCopy: (updates: Record<string, string>) => Promise<void>;
  resetWorkingCopy: () => Promise<void>;
  evaluateTone: () => Promise<void>;
  undoTone: () => Promise<void>;
  refreshPreview: () => Promise<void>; // Debounced internally
  applyDiff: (keys?: string[]) => Promise<void>;
}
```

## Core Entities

### ChatMessage
```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolName?: string;
  diff?: Record<string, { old: string, new: string }>;
  snapshotOverwritten?: boolean;
}
```

### Template
```typescript
interface Template {
  name: string;
  description?: string;
  locales?: string[];
  brands?: string[];
}
```

### ToneScores
```typescript
interface ToneScores {
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
  [key: string]: number; // other emotions mapped to blue
}
```

### SSE Event Types (Internal)
```typescript
type SSEEvent = 
  | { type: 'tool', name: string }
  | { type: 'token', text: string }
  | { type: 'final', text: string, diff?: Record<string, { old: string, new: string }>, snapshotOverwritten?: boolean }
  | { type: 'error', message: string };
```