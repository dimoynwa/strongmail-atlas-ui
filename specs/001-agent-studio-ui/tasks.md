# Tasks: Agent Studio UI

**Input**: Design documents from `/specs/001-agent-studio-ui/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are included as explicitly requested in the feature specification (`__tests__/*.test.tsx` per component and integration tests).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

## Path Conventions

- **Frontend**: `frontend/src/`
- **Tests**: `frontend/src/__tests__/`
- **Mocks**: `frontend/src/mocks/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, types, API client, and state stores.

- [ ] T001 [P] Create `frontend/src/types/index.ts` defining `Message`, `DiffPayload`, `ToneScores`, `TemplateListItem`, `WorkingCopyOverride`, `HealthStatus`, `SessionState`, and `ApiError`
- [ ] T002 Add proxy configuration `"proxy": "http://localhost:8000"` to `frontend/package.json`
- [ ] T003 Implement `frontend/src/api/client.ts` with `apiFetch<T>()` and `ApiError` class
- [ ] T004 Implement `frontend/src/api/chat.ts` explicitly using `fetch` + `ReadableStream` (NOT EventSource) with callbacks: `onToken`, `onTool`, `onFinal`, `onError`
- [ ] T005 Implement `frontend/src/api/session.ts`, `templates.ts`, `workingCopy.ts`, `preview.ts`, `tone.ts`, and `health.ts` (depends on T003)
- [ ] T006 Implement MSW mock handlers for all API endpoints in `frontend/src/mocks/handlers.ts` (depends on T001, T003)
- [ ] T007 [P] Implement `frontend/src/store/appStore.ts` with `AppStore` interface and state (depends on T001)
- [ ] T008 [P] Implement `frontend/src/store/sessionStore.ts` with full `SessionStore` interface (depends on T001)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core application shell and static sidebar needed before template sessions can be opened.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T009 [P] Write unit tests for AppShell in `frontend/src/__tests__/AppShell.test.tsx`
- [ ] T010 Create `frontend/src/shell/AppShell.tsx` laying out the 4 fixed UI regions
- [ ] T011 [P] Write unit tests for Sidebar components in `frontend/src/__tests__/Sidebar.test.tsx`
- [ ] T012 Create `frontend/src/sidebar/Sidebar.tsx`, `ContextSelectors.tsx`, `TemplateList.tsx`, `SessionBadge.tsx`, and `SidebarFooter.tsx`

**Checkpoint**: Foundation ready - App shell renders and templates load into the sidebar.

---

## Phase 3: User Story 1 - Template Editing & Preview (Priority: P1) 🎯 MVP

**Goal**: Users can select a template, chat to request edits, see live HTML previews, and review/apply diffs.

**Independent Test**: Send a chat message, see the streaming response with tool chips, and verify the live preview updates upon applying a diff card.

### Tests for User Story 1

- [ ] T013 [P] [US1] Unit tests for Chat components in `frontend/src/__tests__/ChatColumn.test.tsx`
- [ ] T014 [P] [US1] Unit tests for Preview components in `frontend/src/__tests__/PreviewColumn.test.tsx`
- [ ] T015 [P] [US1] Unit tests for DiffCard in `frontend/src/__tests__/DiffCard.test.tsx`
- [ ] T016 [P] [US1] Integration test for full `openTemplate()` flow in `frontend/src/__tests__/openTemplateFlow.test.tsx`: POST /session → GET /working-copy → GET /preview → store populated → welcome message in chat. Note: Depends on T024 (openTemplate implementation), write as a failing test first.
- [ ] T017 [P] [US1] Integration test for diff card apply flow in `frontend/src/__tests__/diffCardFlow.test.tsx`
- [ ] T018 [P] [US1] Integration test for lang/brand guard in `frontend/src/__tests__/langBrandGuard.test.tsx` testing both branches: no session (silent change) and active session (confirmation)

### Implementation for User Story 1

- [ ] T019 [P] [US1] Create `frontend/src/utils/preview.ts` with standalone `highlightModifiedValues()` pure function before `PreviewFrame`
- [ ] T020 [P] [US1] Create `frontend/src/hooks/usePreviewRefresh.ts` with 300ms debounce
- [ ] T020b [US1] Create `frontend/src/hooks/useChat.ts` — calls `streamChat()` from `src/api/chat.ts`, manages `isStreaming`, `streamingText`, `activeTool` in `sessionStore`, appends final message to `messages[]` on the "final" event.
- [ ] T021 [US1] Create `frontend/src/chat/ChatColumn.tsx`, `ChatLabelBar.tsx`, `MessageList.tsx`, `MessageBubble.tsx`, `ToolChip.tsx`, `QuickActionChips.tsx`, `ChatInput.tsx`, `TypingIndicator.tsx`
- [ ] T022 [US1] Create `frontend/src/preview/PreviewColumn.tsx`, `PreviewLabelBar.tsx`, `PreviewFrame.tsx` using `srcDoc` iframe
- [ ] T023 [US1] Create `frontend/src/chat/DiffCard.tsx` referencing: POST /tone/apply with no keys filter (Apply all), POST /tone/apply with keys array (Apply selected), no API call on Discard, and snapshot_overwritten warning banner
- [ ] T024 [US1] Wire up `openTemplate` (atomic write after 3 step resolution) and lang/brand guard dialog in `sessionStore.ts` and Sidebar

**Checkpoint**: At this point, the primary chat, diff, and preview loops are fully functional.

---

## Phase 4: User Story 2 - Working Copy Management (Priority: P2)

**Goal**: Template authors can view the working copy table and inline-edit specific keys directly.

**Independent Test**: Expand the working copy panel, inline-edit a key, save with Ctrl+Enter, and verify the preview refreshes.

### Tests for User Story 2

- [ ] T025 [P] [US2] Unit tests for Working Copy components in `frontend/src/__tests__/WorkingCopy.test.tsx`

### Implementation for User Story 2

- [ ] T026 [P] [US2] Create `frontend/src/rightpanel/EditPopover.tsx` with textarea and explicitly specify keyboard shortcuts: Ctrl+Enter = save, Escape = cancel
- [ ] T027 [US2] Create `frontend/src/rightpanel/WorkingCopyTable.tsx` and `WorkingCopySection.tsx`
- [ ] T028 [US2] Wire up Working Copy patching via `PATCH /working-copy/{session_id}` in UI and `sessionStore.ts`

**Checkpoint**: Users can manually override any placeholder value without using chat.

---

## Phase 5: User Story 3 - Tone Evaluation (Priority: P2)

**Goal**: Template authors can evaluate emotional tone bars compared to a baseline.

**Independent Test**: Modify the template, observe the "stale" warning, click Re-evaluate, and verify deltas.

### Tests for User Story 3

- [ ] T029 [P] [US3] Unit tests for Tone components in `frontend/src/__tests__/ToneSection.test.tsx`

### Implementation for User Story 3

- [ ] T030 [P] [US3] Create `frontend/src/hooks/useToneDeltas.ts` returning sorted array of `{emotion, current, stored, delta, direction}`
- [ ] T031 [US3] Create `frontend/src/rightpanel/ToneBar.tsx` mapping emotion families to exact red/purple/amber/gray/blue colors
- [ ] T032 [US3] Create `frontend/src/rightpanel/ToneSection.tsx` and `ReEvaluateButton.tsx`
- [ ] T033 [US3] Create `frontend/src/rightpanel/RightPanel.tsx` combining Working Copy and Tone sections

**Checkpoint**: The right panel is complete and fully functional.

---

## Phase 6: User Story 4 - General Agent Discovery (Priority: P3)

**Goal**: Users can chat with a stateless agent to discover and open templates across the catalog.

**Independent Test**: Switch to General Agent tab, ask a question, and click "Open →" on a result card to initialize a session.

### Tests for User Story 4

- [ ] T034 [P] [US4] Unit tests for General Agent components in `frontend/src/__tests__/GeneralLayout.test.tsx`

### Implementation for User Story 4

- [ ] T035 [P] [US4] Create `frontend/src/general/ResultCards.tsx` and `GeneralChat.tsx`
- [ ] T036 [US4] Create `frontend/src/general/GeneralLayout.tsx` supporting accumulation of cards and "Clear results"

**Checkpoint**: Cross-template discovery via chat is fully functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Health polling and status indicators.

- [ ] T037 [P] Unit tests for Status bar and Health polling in `frontend/src/__tests__/HealthPolling.test.tsx` verifying the 30s interval is cleaned up on component unmount (no memory leak)
- [ ] T038 Create `frontend/src/shell/StatusBar.tsx` (agent busy/ready text) and `Topbar.tsx` (breadcrumb, export button calls `GET /working-copy/{session_id}/export` triggering browser download via temporary anchor element)
- [ ] T039 Implement 30s health polling in `frontend/src/store/appStore.ts`: implement `pollHealth()` action storing `setInterval` ID, and `stopPolling()` action that calls `clearInterval` with it
- [ ] T040 Integrate health polling `useEffect` into `AppShell.tsx` mounting to start and clean up the interval

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 (Phase 3) is the MVP and must be completed first to establish the chat and preview architecture.
  - US2 (Phase 4) and US3 (Phase 5) depend on US1's session infrastructure. They can run in parallel.
  - US4 (Phase 6) operates independently of sessions and can be built anytime after Phase 1.
- **Polish (Phase 7)**: Depends on completion of the main shell infrastructure.

### Parallel Opportunities

- All API endpoints and types in Phase 1 can be scaffolded concurrently.
- UI Mock handlers in Phase 1 can be written alongside API definitions.
- Within US1, the chat column, preview column, and pure functions (`utils/preview.ts`, `hooks/usePreviewRefresh.ts`) can be built in parallel.
- All unit tests marked `[P]` can be authored in parallel before their corresponding components are implemented.

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL)
3. Complete Phase 3: User Story 1 (Chat, Preview, DiffCard)
4. **STOP and VALIDATE**: Verify that template selection, streaming, and preview diff applications function smoothly.

### Incremental Delivery

1. Deliver MVP (US1) first.
2. Add US2 (Working Copy Management) to give authors granular data override capabilities.
3. Add US3 (Tone Evaluation) to give authors brand voice feedback on their edits.
4. Add US4 (General Agent Discovery) to enhance the global template navigation experience.
5. Add Phase 7 (Health Polling & Polish) to ensure system reliability and UX completeness.