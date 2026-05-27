<!--
Sync Impact Report:
- Version change: 1.1.0 → 1.2.0
- Added sections: Core Principles for Architectural Constraints, State Management Rules, Write Boundary, Component Rules, Testing & File Naming, What Not To Do.
- Removed sections: Generic Library-First, CLI Interface, Test-First, Integration Testing from the default template.
- Templates requiring updates: 
  ✅ .specify/templates/tasks-template.md (updated Python examples to React/Vitest conventions)
  ⚠ .specify/templates/plan-template.md (pending removal of non-React structure options)
- Follow-up TODOs: RATIFICATION_DATE set to today's date but could be earlier.
-->
# StrongMail Agent Studio — React Frontend Constitution

## Core Principles

### I. Architectural Constraints
- **Pure UI Layer**: The React app MUST be a pure UI layer. It MUST NOT import from `template_assistant/`, `general_agent/`, or `shared/`. All backend calls MUST go through `src/api/` to FastAPI.
- **Preview Iframe**: The preview iframe MUST use `srcDoc={resolvedHtml}` with `sandbox="allow-same-origin"` and no other sandbox permissions. The `src` attribute MUST NOT be used for preview rendering.
- **Strict API Boundaries**: All mutations MUST go through FastAPI endpoints. The app MUST NEVER call ADK agents or touch PostgreSQL or Redis directly.
- **Streaming Restrictions**: SSE streaming MUST use `fetch` + `ReadableStream`. The `EventSource` API MUST NEVER be used because it does not support POST requests.
- **Styling**: TailwindCSS utility classes MUST be used throughout. The ONLY exception is the green highlight span injected by `highlightModifiedValues()` which runs inside an iframe srcDoc string where Tailwind classes are unavailable. Do NOT create a separate CSS file per component.
- **Routing**: Do NOT add a router (React Router, TanStack Router, etc.). Tab switching MUST be managed via the Zustand store.
- **Component Libraries**: Do NOT use a UI component library (MUI, Shadcn, Radix, etc.). All components MUST be custom-built.

### II. State Management Rules
- **Store Limitation**: The app MUST only use two Zustand stores: `sessionStore` (per-session state) and `appStore` (global app state).
- **Session Handling**: `sessionId` MUST be held only in `sessionStore` and NEVER in `localStorage` or `sessionStorage`. Page refresh loses the session — the user must re-open a template.
- **Prop Drilling Constraint**: Prop drilling MUST NOT go beyond one level. Components MUST read from the store directly.
- **Streaming State**: `streamingText` in `sessionStore` holds the partial assistant bubble during SSE streaming. It MUST be rendered separately from `messages[]` and cleared on the "final" SSE event.

### III. Write Boundary
- **Working Copy Writes**: MUST use `PATCH /working-copy/{session_id}` only.
- **Working Copy Resets**: MUST use `DELETE /working-copy/{session_id}` only.
- **Tone Apply**: MUST use `POST /tone/apply/{session_id}` only — NEVER write on suggest. Do NOT call `POST /tone/apply` inside the SSE stream handler.
- **Tone Undo**: MUST use `POST /tone/undo/{session_id}` only.
- **Strict Adherence**: NO other mutations are permitted.

### IV. Component Rules
- **Data Fetching**: Components MUST NEVER fetch data directly — they MUST call store actions.
- **Initialization Sequence**: The `openTemplate()` action MUST execute in this exact sequence: `POST /session` → `GET /working-copy/{session_id}` → `GET /preview/{session_id}` → write all three results to `sessionStore` atomically → push welcome message to `messages[]`. No UI renders partial state mid-sequence.
- **Health Polling**: The health poll MUST use a `setInterval` of exactly 30000ms started in `appStore.pollHealth()`. The interval MUST be cleared (`clearInterval`) when the component that starts polling unmounts, to prevent memory leaks across sessions.
- **DiffCard Confirm Flow**: Strictly follow: render diff → user clicks Apply → call `POST /tone/apply` → update store. NEVER apply on suggestion arrival.
- **Inline Edit Popover**: MUST save on Ctrl+Enter and cancel on Escape.
- **Working Copy Table**: MUST be populated immediately on `openTemplate()`, before the user sends any message.

### V. Testing & File Naming
- **Testing Stack**: Testing MUST use Vitest + React Testing Library only (no Playwright or Cypress for v1).
- **Mocking**: MSW (Mock Service Worker) handlers MUST exist for all endpoints before component tests are written.
- **Test Coverage**: Every component file MUST have a matching test file in the `__tests__/` subdirectory. Every component MUST have at least one test: renders without throwing.
- **Integration Tests**: Integration tests are REQUIRED for the `openTemplate()` flow, diff card apply flow, and lang/brand change guard.
- **File Naming Conventions**: 
  - Components: `PascalCase.tsx`
  - Hooks: `camelCase` starting with "use" (e.g., `useChat.ts`)
  - Store files: `camelCase` ending in "Store" (e.g., `sessionStore.ts`)
  - API files: `camelCase` matching the resource (e.g., `workingCopy.ts`)
  - Test files: `ComponentName.test.tsx` co-located in `__tests__/` subdirectory

## Technology Stack

- React 18, TypeScript 5, Zustand 4, TailwindCSS 3
- Tabler Icons via @tabler/icons-webfont CDN
- Vitest + React Testing Library for tests
- MSW (Mock Service Worker) for API mocking in tests

## What Not To Do (Strict Exclusions)

- Do NOT use EventSource for chat streaming.
- Do NOT store sessionId in localStorage or sessionStorage.
- Do NOT import from `template_assistant/`, `general_agent/`, or `shared/`.
- Do NOT add a router (React Router, TanStack Router, etc.).
- Do NOT use a UI component library (MUI, Shadcn, Radix, etc.).
- Do NOT call `POST /tone/apply` inside the SSE stream handler.
- Do NOT create a separate CSS file per component — use Tailwind classes.

## Governance

This constitution supersedes all other practices for the StrongMail Agent Studio React Frontend.
Amendments require documentation and approval. All PRs/reviews must verify compliance with these architectural constraints and boundaries.

**Version**: 1.2.0 | **Ratified**: 2026-05-27 | **Last Amended**: 2026-05-27