# Quickstart: Agent Studio UI

**Date**: 2026-05-27

This document outlines the core architecture and immediate development tasks for the Agent Studio UI feature.

## Component Build Order

To ensure a smooth integration, follow this strict bottom-up build order:

1. **Phase 1: Foundation**: Create `types/index.ts`, the API client layer (`apiFetch`, `streamChat` with ReadableStream), and the Zustand stores (`sessionStore`, `appStore`).
2. **Phase 2: Shell**: Build `AppShell` and the static `Sidebar` (no session logic yet).
3. **Phase 3: Chat**: Build `ChatColumn`, handling messages, input, and SSE streaming integration.
4. **Phase 4: Preview**: Build `PreviewColumn`, implementing the `iframe`, debounced refresh, and the `highlightModifiedValues` pure function.
5. **Phase 5: Working Copy & Tone**: Build `RightPanel`, including the `WorkingCopyTable`, inline `EditPopover`, and `ToneSection` (mapping emotion families to specific colors).
6. **Phase 6: DiffCard**: Build the `DiffCard` component with complex "apply all", "apply selected", and "discard" flows.
7. **Phase 7: General Agent**: Build the `GeneralLayout` and `ResultCards` for cross-template discovery.
8. **Phase 8: Session Lifecycle**: Wire up `openTemplate`, `resetSession`, and the language/brand change guard dialog.
9. **Phase 9: Health**: Implement the 30-second health polling and status bar indicators.

## Critical Technical Rules

- **Strict API Boundaries**: The React UI never talks to Redis/PostgreSQL or the ADK agents directly. All interactions go through `src/api/` wrappers to the FastAPI endpoints.
- **Streaming**: Do not use `EventSource`. Use `fetch` + `ReadableStream` to properly handle `POST` requests and parse the custom JSON chunks (`\n\n` delimited).
- **Zustand Discipline**: Never write `sessionId` to the store until the complete 3-step initialization sequence resolves (`POST /session`, `GET /working-copy`, `GET /preview`).

## Testing Mandate

- Every component must have a `.test.tsx` file asserting it renders without throwing.
- Vitest + React Testing Library + MSW must be used. No Playwright/Cypress.