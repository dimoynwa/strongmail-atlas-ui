---

description: "Task list template for feature implementation"
---

# Tasks: Maintenance Operations UI

**Input**: Design documents from `/specs/007-maintenance-operations/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create project structure per implementation plan (touch files listed in quickstart.md)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 Create maintenance types (`MaintenanceJob`, `ProgressEvent`, `EventType`) in `frontend/src/types/maintenance.ts`.
- [X] T003 Implement `appStore` additions (`maintenanceDrawerOpen`, `maintenanceJobs`, `activeRefreshTarget`, `activeRefreshStatus`, `toasts`) and their corresponding actions in `frontend/src/store/appStore.ts`. (Depends on T002)
- [X] T004 [P] Implement `ToastContainer` in `frontend/src/shell/ToastContainer.tsx` to handle notifications.
- [X] T005 [P] Implement base API contracts `startTemplateRefresh`, `startFullRefresh`, and `streamRefreshJob` with error handling in `frontend/src/api/refresh.ts`.
- [X] T006 [P] Implement base API contracts `startBatchReevaluate`, `streamBatchTone`, and `exportTone` with error handling in `frontend/src/api/tone.ts`.
- [X] T007 [P] Create MSW SSE simulation helper in `frontend/src/__tests__/mocks/sseHelper.ts`.
- [X] T008 Add MSW handlers for `/refresh/template/:name`, `/refresh/full`, `/refresh/stream/:job_id`, `/tone/batch-reevaluate`, `/tone/batch-stream/:job_id`, and `/tone/export` in `frontend/src/__tests__/mocks/handlers.ts`. (Depends on T007)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Refresh Single Template (Priority: P1) 🎯 MVP

**Goal**: Refresh a single template from StrongMail directly from the template preview, so I can see the latest content without leaving my workflow.

**Independent Test**: Can be fully tested by opening a template, clicking the refresh button, observing the running state, and verifying the stale session banner appears upon completion.

### Implementation for User Story 1

- [X] T009 [P] [US1] Create `RefreshChip` component in `frontend/src/preview/RefreshChip.tsx`. (Depends on T003)
- [X] T010 [P] [US1] Create `StaleSessionBanner` component in `frontend/src/rightpanel/StaleSessionBanner.tsx`. (Depends on T003)
- [X] T010b [US1] Mount `StaleSessionBanner` in `frontend/src/rightpanel/RightPanel.tsx`: render when a matching template job finalises and `sessionStore.sessionId` is non-null. (Depends on T010)
- [X] T011 [US1] Modify `PreviewLabelBar` to integrate `RefreshChip`, the ⟳ button, and trigger single-template refresh in `frontend/src/preview/PreviewLabelBar.tsx`.
- [X] T011b [P] [US1] Write test for `PreviewLabelBar` conditional render: button shown when session active and no running job; chip shown when `activeRefreshStatus === 'refreshing'`; chip absent when no session, including 409 toast handling, in `frontend/src/__tests__/preview/PreviewLabelBar.test.tsx`.
- [X] T012 [P] [US1] Write test for `RefreshChip` rendering states (prop-driven rendering: idle/refreshing/failed states) in `frontend/src/__tests__/preview/RefreshChip.test.tsx`.
- [X] T013 [P] [US1] Write test for `StaleSessionBanner` mount conditions and dismiss behavior in `frontend/src/__tests__/rightpanel/StaleSessionBanner.test.tsx`.

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Perform Global Maintenance Operations (Priority: P2)

**Goal**: Centralized panel to run global operations (Full Refresh, Batch Tone Re-evaluate, and Tone Export) so I can manage system-wide data without terminal access.

**Independent Test**: Can be fully tested by opening the Maintenance Panel, initiating a global job, and downloading an export file.

### Implementation for User Story 2

- [X] T014 [P] [US2] Create `MaintenanceDrawer` shell and wire up Full Refresh, Batch Tone Re-evaluate, and Export actions to their API calls in `frontend/src/sidebar/MaintenanceDrawer.tsx`.
- [X] T015 [US2] Modify `SidebarFooter` to add the ⚙ Maintenance button that opens the drawer in `frontend/src/sidebar/SidebarFooter.tsx`.
- [X] T016 [US2] Write tests for drawer export behavior, global operation triggering, and AbortController stream cancellation on unmount in `frontend/src/__tests__/sidebar/MaintenanceDrawer.test.tsx`.

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Monitor Maintenance Job History (Priority: P2)

**Goal**: See a real-time, scrollable history of all maintenance jobs run during my session so I can track their progress and outcomes.

**Independent Test**: Can be fully tested by triggering multiple jobs, observing the real-time log streaming in the expanded job cards, and clearing the history.

### Implementation for User Story 3

- [X] T018 [P] [US3] Create `MaintenanceJobCard` to display collapsible job history and SSE log in `frontend/src/sidebar/MaintenanceJobCard.tsx`.
- [X] T019 [US3] Integrate `MaintenanceJobCard` list into `MaintenanceDrawer` for real-time history streaming. (Depends on T014 and T018)
- [X] T020 [US3] Add the `[Clear]` button logic to `MaintenanceDrawer` to filter completed/failed jobs. (Depends on T019)
- [X] T021 [US3] Write tests for `MaintenanceJobCard` collapsed vs expanded render, auto-scroll when `status === "running"`, and log line rendering in `frontend/src/__tests__/sidebar/MaintenanceJobCard.test.tsx`.

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T022 Code cleanup and refactoring across new components.
- [X] T022a Run `tsc --strict --noEmit` on the frontend and fix all type errors in new files.
- [X] T022b Review all new components for Tailwind-only styling (no inline styles, no CSS modules).
- [X] T023 Validate that drawer dismiss click-outside/Escape behavior handles focus correctly in `frontend/src/__tests__/sidebar/MaintenanceDrawer.test.tsx`.
- [X] T024 Implement E2E integration test covering the full flow: open session → click ⟳ in PreviewLabelBar → job starts → chip appears → SSE streams into drawer → job_done → chip disappears → StaleSessionBanner appears → user clicks Re-open → session resets in `frontend/src/__tests__/integration/maintenanceRefresh.test.tsx`. (Depends on all Phase 2-5 tasks being complete; do not write this test until T019 and T020 are done)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P3)**: Depends on US2 for the drawer shell, but the history card can be built in parallel.

### Implementation Strategy

#### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently (single-template refresh)

#### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo