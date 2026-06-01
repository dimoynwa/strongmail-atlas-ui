# Implementation Plan: Maintenance Operations UI

**Branch**: `007-maintenance-operations` | **Date**: 2026-05-30 | **Spec**: [specs/007-maintenance-operations/spec.md](spec.md)

**Input**: Feature specification from `/specs/007-maintenance-operations/spec.md`

## Summary

This feature adds a Maintenance Operations surface to the StrongMail Agent Studio UI. It provides access to single-template refreshes (via a button in the preview label bar) and global operations like full refresh, batch tone re-evaluation, and exports (via a new Maintenance drawer). Jobs stream real-time progress events using server-sent events (`fetch` + `ReadableStream`), updating the UI without polling. State management relies exclusively on Zustand (`appStore` and `sessionStore`). A custom minimal `ToastContainer` is introduced to handle conflict (409) and error notifications, ensuring adherence to the constitution's constraint against third-party UI libraries.

## Technical Context

**Language/Version**: TypeScript 5, React 18
**Primary Dependencies**: Zustand 4, TailwindCSS 3
**Storage**: N/A (Frontend only, in-memory via Zustand)
**Testing**: Vitest, React Testing Library, MSW
**Target Platform**: Web Browser
**Project Type**: React Web Application
**Performance Goals**: Fluid UI updates for streaming progress logs
**Constraints**: Pure UI Layer, strict API boundaries, no external UI component libraries, no routers, single-level prop drilling, SSE via fetch+ReadableStream. TypeScript 5 strict mode applies; all new interfaces must have no implicit any.
**Scale/Scope**: 5 new components, 2 API modules extended, additions to 1 store.

## Testing Strategy

- **Stack**: Vitest + React Testing Library + MSW (consistent with existing test setup).
- **MSW Handlers**:
  - `POST /refresh/template/:name`
  - `POST /refresh/full`
  - `GET /refresh/stream/:job_id` (SSE simulation)
  - `POST /tone/batch-reevaluate`
  - `GET /tone/batch-stream/:job_id` (SSE simulation)
  - `GET /tone/export`
- **SSE Simulation Strategy**: MSW does not natively stream SSE. Test SSE responses will be simulated using a `ReadableStream` with a `TextEncoder` to yield chunks over time, wrapping this in a helper utility for reuse.
- **Key Test Cases**:
  - **RefreshChip**: Renders when a job is running for active template; absent when no session is active.
  - **Conflicts (409)**: 409 response triggers a toast, button returns to idle.
  - **StaleSessionBanner**: `job_done` event triggers banner when target matches `templateName`; banner is absent when target does not match.
  - **Drawer History**: `[Clear]` removes done/failed jobs, leaves running jobs.
  - **Stream Lifecycle**: `AbortController` cancels stream on drawer unmount (no `job_failed` emitted).
  - **Exporting**: `exportTone` triggers anchor download for 200, toast for non-200.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Pure UI Layer**: Handled. No imports from restricted directories.
- [x] **Strict API Boundaries**: Handled. API calls abstracted in `frontend/src/api/`.
- [x] **Streaming Restrictions**: Handled. SSE uses `fetch` + `ReadableStream`.
- [x] **Styling**: Handled. Only TailwindCSS utility classes are used.
- [x] **Component Libraries**: Handled. Custom `ToastContainer` planned, no UI component libraries used.
- [x] **State Management Rules**: Handled. Only `appStore` and `sessionStore` are used. No `localStorage`.
- [x] **Testing & File Naming**: Handled. Component names use PascalCase, APIs use camelCase, and MSW handlers are specified.

## Project Structure

### Documentation (this feature)

```text
specs/007-maintenance-operations/
├── plan.md              # This file
├── research.md          # Research findings (Toast component decision)
├── data-model.md        # Types, interfaces, and store state definitions
├── quickstart.md        # Getting started guide for implementation
└── contracts/
    ├── api-contracts.md      # API function signatures and behaviors
    └── component-contracts.md # Component props and responsibilities
```

### Source Code (repository root)

```text
frontend/src/
├── sidebar/
│   ├── MaintenanceDrawer.tsx
│   ├── MaintenanceJobCard.tsx
│   └── SidebarFooter.tsx
├── preview/
│   ├── PreviewLabelBar.tsx
│   └── RefreshChip.tsx
├── rightpanel/
│   └── StaleSessionBanner.tsx
├── shell/
│   └── ToastContainer.tsx
├── store/
│   └── appStore.ts
└── api/
    ├── refresh.ts
    └── tone.ts
```

**Structure Decision**: The frontend structure incorporates the components into their respective domain directories (`sidebar`, `preview`, `rightpanel`, `shell`). The API and store logic neatly map to existing locations (`api`, `store`).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |