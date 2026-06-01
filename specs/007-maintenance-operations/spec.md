# Feature Specification: Maintenance Operations UI

**Feature Branch**: `007-maintenance-operations`

**Created**: 2026-05-30

**Status**: Draft

**Input**: User description: "Spec 008 adds a Maintenance Operations surface to the StrongMail Agent Studio UI. It exposes three background job operations — single-template refresh, full database refresh, and batch tone re-evaluation — plus a tone export download, all accessible to every user. Operations are launched from two entry points: a ⟳ button in the PreviewLabelBar (single-template refresh only) and a ⚙ Maintenance drawer anchored to the SidebarFooter (all operations)..."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Refresh Single Template (Priority: P1)

As a user, I want to refresh a single template from StrongMail directly from the template preview, so I can see the latest content without leaving my workflow.

**Why this priority**: It is the most common maintenance action needed during an active template editing session.

**Independent Test**: Can be fully tested by opening a template, clicking the refresh button, observing the running state, and verifying the stale session banner appears upon completion.

**Acceptance Scenarios**:

1. **Given** an active template session, **When** I view the template preview header, **Then** I see a "Refresh" button.
2. **Given** I click the "Refresh" button, **When** the job starts, **Then** the button changes to a non-interactive "Refreshing..." status indicator.
3. **Given** a refresh job completes successfully for my active template, **When** the job finishes, **Then** a persistent banner appears prompting me to re-open the template to load fresh data or dismiss it.
4. **Given** the persistent banner is shown, **When** I click "Dismiss", **Then** the banner disappears, my session is not reset, and I continue working with the stale session data.
5. **Given** a refresh job fails, **When** the job finishes, **Then** the indicator changes to a clickable "Refresh failed" warning that opens the Maintenance Panel.

---

### User Story 2 - Perform Global Maintenance Operations (Priority: P2)

As a user, I want a centralized panel to run global operations (Full Refresh, Batch Tone Re-evaluate, and Tone Export) so I can manage system-wide data without terminal access.

**Why this priority**: Essential for synchronizing the full database and batch-processing tone evaluations without developer assistance.

**Independent Test**: Can be fully tested by opening the Maintenance Panel, initiating a global job, and downloading an export file.

**Acceptance Scenarios**:

1. **Given** the main navigation footer, **When** I click the Maintenance button, **Then** a side panel slides in containing actions for Full Refresh, Batch Re-evaluate, and Export (CSV/XLSX).
2. **Given** the Maintenance Panel, **When** I click "Full Refresh" or "Batch Re-evaluate", **Then** the corresponding job starts and appears in the history log.
3. **Given** the Maintenance Panel, **When** I click an export option, **Then** a file download is triggered directly.
4. **Given** another maintenance job is currently running in the system, **When** I attempt to start any new job, **Then** I am prevented from doing so and notified that a job is already running via a toast.

---

### User Story 3 - Monitor Maintenance Job History (Priority: P2)

As a user, I want to see a real-time, scrollable history of all maintenance jobs I've run during my session so I can track their progress and outcomes.

**Why this priority**: Visibility into long-running background tasks is necessary to ensure users know the status of their requests.

**Independent Test**: Can be fully tested by triggering multiple jobs, observing the real-time log streaming in the expanded job cards, and clearing the history.

**Acceptance Scenarios**:

1. **Given** a newly started job, **When** it appears in the panel, **Then** its history card starts expanded and auto-scrolls as real-time updates arrive.
2. **Given** a running job completes or fails, **When** the status updates, **Then** the job card automatically collapses.
3. **Given** multiple completed or failed jobs in the history, **When** I click the "Clear" button, **Then** all inactive job cards are removed from the list, while any running jobs remain. This is a snapshot operation — jobs that transition from running to done *after* the click are not retroactively cleared.
4. **Given** I close and re-open the Maintenance Panel while a job is running, **When** the panel re-opens, **Then** the job's progress log resumes displaying accurately without losing history.

### Edge Cases

- What happens when a user attempts to run a job while another user's job is running on the backend? (Backend prevents concurrent jobs and UI shows a conflict notification).
- How does the system handle a user closing the Maintenance Panel mid-job? (The progress log safely pauses consuming the stream, but the job continues in the background; when re-opened, the UI replays the buffered history).
- What happens if the browser is refreshed or closed during a job? (The UI job history for that session is lost, though the backend job continues).
- What happens if the export API fails? (A toast error is shown and no file download is attempted).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a "Refresh" action on the active template preview header.
- **FR-002**: System MUST replace the "Refresh" action with an inline status indicator while the job is running. The ⟳ button and the chip are mutually exclusive — the button is unmounted (not just hidden) when the chip is rendered, and re-mounts on job_done or when the active job's target no longer matches the current templateName. The ⚠ "Refresh failed" chip MUST be dismissed when the user opens the Maintenance drawer (`maintenanceDrawerOpen` becomes `true`) or when a new refresh job is started for the same template.
- **FR-003**: System MUST provide a "Maintenance" toggle in the global navigation that opens a MaintenanceDrawer side panel. The drawer MUST render above the sidebar and right panel but MUST NOT cover the topbar. It MUST be dismissible by clicking outside it or pressing Escape.
- **FR-004**: System MUST allow triggering Full Refresh, Batch Tone Re-evaluation, and Tone Exports from the Maintenance Panel.
- **FR-005**: System MUST stream real-time progress updates for running jobs into an expandable history card within the panel.
- **FR-006**: System MUST enforce that only one job runs at a time and display a non-disruptive notification if a conflict occurs (409). If a job-start request returns a 503 (e.g. `STRONGMAIL_PASSWORD` missing), the System MUST display a toast error indicating the service is unavailable, and the job is not added to the history since it never started.
- **FR-007**: System MUST display a persistent "Stale Session" banner over the active template when its corresponding refresh job completes. The banner MUST ONLY mount for job type "template", MUST check `job.target === sessionStore.templateName` (exact string match), and MUST NOT mount if `sessionStore.sessionId` is null (no active session). The dismissed state is not persisted — the banner reappears if another matching refresh completes in the same browser session. When the user clicks "[Re-open]", `onReopen` MUST explicitly call `dismissBanner()` before `openTemplate()` clears the session, to avoid a flash of the banner during session teardown.
- **FR-008**: System MUST retain the job history (completed, failed, running) for the duration of the user's current session.
- **FR-009**: System MUST allow users to clear jobs with status "done" or "failed" from the history view. Jobs with status "pending" or "running" MUST remain in the list and be unaffected.
- **FR-010**: Each `streamRefreshJob()` and `streamBatchTone()` call MUST return an AbortController. The caller MUST abort on component unmount. Aborting mid-job does NOT mark the job as failed in the appStore — the buffered log is kept. A network error on the SSE stream MUST cause a synthetic `job_failed` event to be appended to `log[]` and the job's status to be set to `"failed"` in the appStore.
- **FR-011**: If `GET /tone/export` returns a non-200 response, the System MUST display a toast error and NO file download is attempted.
- **FR-012**: All toast notifications MUST use the existing toast/notification mechanism in the app; a new lightweight toast component MUST NOT be introduced by this feature.

### Key Entities

- **Maintenance Job**: A discriminated union representing an ongoing or completed background operation:
  - `template`: Contains `job_id`, `type`, `target` (template name), `status`, and `log[]`
  - `full`: Contains `job_id`, `type`, `target` (undefined), `status`, and `log[]`
  - `tone_batch`: Contains `job_id`, `type`, `target` (undefined), `status`, and `log[]`
- **Progress Event**: Represents a single real-time update from a running job (timestamp, message type, details).
- **AppStore State Additions**:
  - `maintenanceDrawerOpen`: boolean tracking if the drawer is open.
  - `maintenanceJobs`: list of Maintenance Job entities.
  - `activeRefreshTarget`: string | null representing the target of the currently running single-template refresh job, used by PreviewLabelBar.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can trigger template refreshes and global maintenance tasks directly from the UI without relying on CLI tools.
- **SC-002**: Users receive real-time feedback on job progress without needing to manually refresh the page.
- **SC-003**: The UI correctly identifies and communicates job conflicts (e.g., when a job is already running) 100% of the time based on backend responses.
- **SC-004**: The system correctly prompts the user to reload the template content immediately after a targeted template refresh completes successfully.

## Assumptions

- Target users are familiar with the concepts of refreshing data from StrongMail and evaluating tones.
- The backend API fully supports SSE streaming for job progress, and provides deterministic conflict handling (HTTP 409).
- Job history does not need to persist across browser reloads or between different users.
- Tone exports do not run as tracked background jobs with progress streams, but simply trigger standard browser file downloads.
- An existing toast/notification mechanism is present in the codebase. If the plan's research.md determines none exists, FR-012 is amended to permit introducing a minimal ToastContainer.
