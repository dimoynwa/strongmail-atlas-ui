# Implementation Plan: Agent Studio UI

**Branch**: `001-agent-studio-ui` | **Date**: 2026-05-27 | **Spec**: specs/001-agent-studio-ui/spec.md

**Input**: Feature specification from `/specs/001-agent-studio-ui/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Build a React 18 TypeScript single-page application called StrongMail Agent Studio. It provides a conversational UI (Chat, Preview, Working Copy, Tone analysis) over two headless Google ADK agents exposed via a FastAPI backend, enabling template authors to edit email templates safely.

## Technical Context

**Language/Version**: React 18, TypeScript 5

**Primary Dependencies**: Zustand 4, TailwindCSS 3, Tabler Icons, Vitest, React Testing Library, MSW

**Storage**: Zustand (volatile memory only; no localStorage)

**Testing**: Vitest + React Testing Library + MSW

**Target Platform**: Browser (Web)

**Project Type**: Single-Page Application (Frontend)

**Performance Goals**: Fast UI updates, 300ms debounce on preview renders, memory-leak-free 30s health polling

**Constraints**: Pure UI layer only; strict API write boundaries; fetch + ReadableStream for SSE; Tailwind utility classes only

**Scale/Scope**: 4 fixed UI regions, 2 agents (Template, General), custom-built components (no UI library)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Pure UI Layer**: Yes. No imports from backend directories.
- **Strict API Boundaries**: Yes. All mutations via defined FastAPI endpoints.
- **Streaming Restrictions**: Yes. `fetch` + `ReadableStream` specified.
- **Styling**: Yes. TailwindCSS used.
- **Routing**: Yes. Zustand store used for tab switching.
- **Component Libraries**: Yes. Custom-built components.
- **Store Limitation**: Yes. `sessionStore` and `appStore` only.
- **Session Handling**: Yes. Volatile memory only.
- **Initialization Sequence**: Yes. Atomic write after 3-step resolution.
- **DiffCard Flow**: Yes. Strict adherence defined.
- **Preview Iframe**: Yes. `srcDoc` + `sandbox="allow-same-origin"`.
- **Health Polling**: Yes. Cleared on unmount, handles non-200 gracefully.
- **SSE Stream Error**: Yes. Appends assistant message, clears state.
- **Highlight Function**: Yes. Standalone pure function.

## Project Structure

### Documentation (this feature)

```text
specs/001-agent-studio-ui/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── app.tsx
│   ├── shell/          # AppShell, Topbar, StatusBar
│   ├── sidebar/        # Sidebar, ContextSelectors, TemplateList, SessionBadge, SidebarFooter
│   ├── chat/           # ChatColumn, ChatLabelBar, MessageList, MessageBubble, ToolChip, DiffCard, QuickActionChips, ChatInput, TypingIndicator
│   ├── preview/        # PreviewColumn, PreviewLabelBar, PreviewFrame
│   ├── rightpanel/     # RightPanel, WorkingCopySection, WorkingCopyTable, EditPopover, ToneSection, ToneBar, ReEvaluateButton
│   ├── general/        # GeneralLayout, GeneralChat, ResultCards
│   ├── store/          # sessionStore.ts, appStore.ts
│   ├── api/            # client.ts, chat.ts, session.ts, templates.ts, workingCopy.ts, preview.ts, tone.ts, health.ts
│   ├── hooks/          # useChat.ts, usePreviewRefresh.ts, useToneDeltas.ts
│   └── types/          # index.ts
├── package.json        # (proxy: "http://localhost:8000")
└── tailwind.config.js
```

**Structure Decision**: The application follows a strict feature-folder architecture under `frontend/src/` to group related components, with dedicated directories for stores, APIs, and hooks. This matches the requested exact layout.

## Implementation Strategy

### Component Build Order (Bottom-up)

**Phase 1: Types, API Layer, Stores & Setup**
- **Setup Task**: Add proxy configuration `"proxy": "http://localhost:8000"` to `package.json`.
- **Types & Data Model**: `src/types/index.ts` must be written first to define `Message`, `DiffPayload`, `ToneScores`, `TemplateListItem`, `WorkingCopyOverride`, `HealthStatus`, `SessionState`, and `ApiError` before any other file is written. (`data-model.md` covers the TypeScript interfaces matching `src/types/index.ts`).
- **API Client Layer (Own Phase Before Components)**:
  - `contracts/` covers three documents: API client contract, store contract, and write boundary contract.
  - `src/api/client.ts`: Implement `apiFetch<T>()` wrapper and `ApiError` class.
  - `src/api/chat.ts`: Implement full `streamChat()` SSE implementation using `fetch` + `ReadableStream` — NOT `EventSource`. Buffer accumulates chunks, splits on `\n\n` to extract SSE events, handles partial chunks correctly, and provides `onTool`, `onToken`, `onFinal`, `onError` callbacks.
  - All other `api/*.ts` files: one function per endpoint, typed request/response.
- **Zustand Stores (Dedicated Phase Before Components)**:
  - `sessionStore.ts`: Full `SessionStore` interface with all fields and actions.
  - `appStore.ts`: `AppStore` interface with templates, locales, brands, health.

**Phase 2: Shell & Sidebar**
- `AppShell` and `Sidebar` (static, no session logic yet).

**Phase 3: Chat Column**
- `ChatColumn` (messages, input, streaming).

**Phase 4: Preview Column**
- `PreviewColumn` (iframe, debounced 300ms refresh, highlight). Explicitly call the `highlightModifiedValues(html, workingCopy, modifiedKeys)` utility before setting `resolvedHtml`.

**Phase 5: Right Panel**
- `RightPanel` (working copy table, edit popover, tone bars).
- `useToneDeltas.ts`: Hook that takes `toneScores` and `toneStoredScores` from `sessionStore`, returns a merged array of `{ emotion, current, stored, delta, direction }` objects sorted by current score descending.

**Phase 6: Diff Card**
- `DiffCard` (apply all / apply selected / discard) planned as a separate phase after the basic chat column exists but before the session lifecycle phase.
  - "Apply all" calls `POST /tone/apply` with no keys filter.
  - "Apply selected" calls `POST /tone/apply` with `{ keys: selectedKeys }` where `selectedKeys` is the array of key strings the user chose in the multiselect.

**Phase 7: General Agent**
- General Agent layout and result cards.

**Phase 8: Session Lifecycle**
- `openTemplate`, `resetSession`.
- Lang/brand change guard.

**Phase 9: Health Polling & Status**
- Health polling (30s interval, `GET /health`, `appStore`) planned as its own phase. The interval ID returned by `setInterval` MUST be stored in `appStore` state. A `stopPolling()` action MUST call `clearInterval` with it. The component that calls `pollHealth()` on mount MUST call `stopPolling()` in its `useEffect` cleanup function.
- Status bar, status dots.

### Testing Strategy
- Vitest + React Testing Library for component tests.
- MSW (Mock Service Worker) for API mocking in tests.
- MSW mock handlers MUST be implemented for at least these endpoints: `POST /session`, `GET /templates`, `POST /chat/stream`, `GET /working-copy`, `GET /preview`, `POST /tone/evaluate`.
- One test per component minimum: renders without error.
- Integration tests: openTemplate flow, diff card apply flow, lang/brand guard.
- No browser-level E2E (Playwright/Cypress) required for v1.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*No violations identified.*