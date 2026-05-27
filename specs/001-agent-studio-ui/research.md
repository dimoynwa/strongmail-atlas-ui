# Research Findings: Agent Studio UI

**Date**: 2026-05-27

## Unresolved Context & Clarifications

*All technical details were clearly specified in the feature description and constitution. No unresolved technical clarifications.*

## Technology Choices & Best Practices

1. **State Management (Zustand)**
   - **Decision**: Two separate stores: `sessionStore` (volatile per-session state) and `appStore` (global app state).
   - **Rationale**: Clean separation of concerns. `sessionStore` handles complex chat, working copy, and streaming state which must reset cleanly on template switch. `appStore` manages cached metadata (templates, brands) and global health.
   - **Best Practices**: Use atomic updates. `sessionId` only written after openTemplate sequence (POST + 2x GET) completes successfully.

2. **API Interaction & Streaming**
   - **Decision**: Thin `apiFetch<T>` wrapper and `fetch` + `ReadableStream` for SSE.
   - **Rationale**: `EventSource` cannot send POST requests (required for `POST /chat/stream`).
   - **Best Practices**: Buffer accumulation with `\n\n` splitting to correctly parse SSE chunks. Handle partial chunks carefully.

3. **Live HTML Preview**
   - **Decision**: `srcDoc` iframe with `sandbox="allow-same-origin"`.
   - **Rationale**: Prevents arbitrary script execution while allowing the HTML to render correctly. `allow-same-origin` might be needed for assets loaded from the same host, but no other permissions (`allow-scripts`, etc.) are granted.
   - **Best Practices**: Implement highlighting via a standalone pure function `highlightModifiedValues` to decouple logic from the React component lifecycle.

4. **Component Architecture**
   - **Decision**: Custom-built components using TailwindCSS utility classes, strictly adhering to a single-file component + test structure.
   - **Rationale**: Full control over layout and styling, no dependency bloat from external component libraries (as required by the constitution).
   - **Best Practices**: Prop drilling limited to one level. Components subscribe directly to Zustand stores.

5. **Testing**
   - **Decision**: Vitest + React Testing Library + MSW.
   - **Rationale**: Fast, reliable component and integration testing without the overhead of browser-based E2E tests for v1.
   - **Best Practices**: MSW handles all API mocking, ensuring components are tested against realistic network boundaries.