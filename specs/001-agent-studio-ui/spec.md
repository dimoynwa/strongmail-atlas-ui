# Feature Specification: Agent Studio UI

**Feature Branch**: `001-agent-studio-ui`

**Created**: 2026-05-27

**Status**: Draft

**Input**: User description: "Build a React 18 TypeScript single-page application called StrongMail Agent Studio. It provides a conversational UI over two existing Google ADK agents exposed via a FastAPI backend at localhost:8000..."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Template Editing & Preview (Priority: P1)

Template authors need to select an email template, interact with a conversational assistant to make changes, and immediately see a live HTML preview of those changes.

**Why this priority**: This is the core workflow of the application. Without the ability to chat with the assistant and preview template changes, the application provides no value to template authors.

**Independent Test**: Can be fully tested by selecting a template, sending a chat message to request a change, receiving a streamed response, and verifying the HTML preview updates to reflect the requested change.

**Acceptance Scenarios**:

1. **Given** the user is on the Template tab, **When** they click a template in the sidebar, **Then** a new session is initialized and the live preview displays the template.
2. **Given** an active session, **When** the user sends a message, **Then** they see a streaming response with tool execution chips and typing indicators.
3. **Given** the assistant suggests rewrites, **When** the diff card is rendered, **Then** the user can apply or discard the changes, which updates the live preview.

---

### User Story 2 - Working Copy Management (Priority: P2)

Template authors need visibility into the current modified state of the template data and the ability to manually override or reset specific values without going through the chat interface.

**Why this priority**: While conversational edits are primary, authors need direct control to fine-tune specific data keys or recover from incorrect agent suggestions.

**Independent Test**: Can be tested by opening a template, expanding the working copy panel, inline-editing a key, and verifying the change persists and reflects in the preview.

**Acceptance Scenarios**:

1. **Given** an active session, **When** the user opens the working copy panel, **Then** they see a table of keys and values, with modified keys visually distinct.
2. **Given** the working copy panel is open, **When** the user inline-edits a value and saves via Ctrl+Enter, **Then** the working copy is updated on the backend and the preview refreshes.
3. **Given** the template has modified values, **When** the user clicks "Reset all" and confirms, **Then** the working copy reverts to its original state.

---

### User Story 3 - Tone Evaluation (Priority: P2)

Template authors need to understand the emotional tone of the current template and compare it against a baseline to ensure their edits align with brand voice requirements.

**Why this priority**: Tone control is a key feature of the ADK, and authors need visual feedback on how their edits impact the five core emotion families.

**Independent Test**: Can be tested by viewing the tone panel, observing the emotion bars and scores, making a change to the template, and clicking the re-evaluate button to see score deltas.

**Acceptance Scenarios**:

1. **Given** an active session, **When** the user opens the Tone section, **Then** they see five emotion bars colored by family with scores and progress tracks.
2. **Given** the working copy has been modified since the last evaluation, **When** the user views the Tone section, **Then** a stale warning is displayed.
3. **Given** a stale tone evaluation, **When** the user clicks Re-evaluate, **Then** the scores update to reflect the current working copy state and show deltas against the baseline.

---

### User Story 4 - General Agent Discovery (Priority: P3)

Users need to quickly discover and find appropriate templates across the entire catalog by asking general questions to an assistant, without having to manually search the sidebar.

**Why this priority**: This enhances the template discovery experience but is secondary to the actual editing of a known template.

**Independent Test**: Can be tested by switching to the General Agent tab, asking a question like "Find me a welcome email", and clicking an "Open" button on a resulting template card.

**Acceptance Scenarios**:

1. **Given** the user is on the General Agent tab, **When** they ask for template recommendations, **Then** the agent streams a response and displays result cards for matching templates.
2. **Given** a result card is displayed, **When** the user clicks "Open →", **Then** the UI switches to the Template tab and initializes a session for that specific template.

### Edge Cases

- What happens when a user attempts to change the brand or language while a session is actively modified? (Should prompt for confirmation before resetting).
- How does system handle SSE stream disconnection or network timeouts during a long generation?
- What happens when the health poll fails continuously?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a Sidebar with a tab switcher (Template/General), language/brand selectors, and a scrollable, filterable template list.
  - *Lang/Brand Change Guard*: If `sessionId` is null: change silently, no confirmation. If `sessionId` is non-null: show confirmation dialog before proceeding. On confirm: call `resetSession()`, update store values, re-open same template. On cancel: revert the select to previous value.
- **FR-002**: System MUST instantiate an ADK session via `POST /session` when a template is clicked, then initialize working copy and preview.
  - *Initialization Sequence on `openTemplate()`*: 1) `POST /session` → session_id. 2) `GET /working-copy/{session_id}` → populate `workingCopy`. 3) `GET /preview/{session_id}` → populate `resolvedHtml`. 4) Set `sessionId`, `templateName` in store. 5) Push welcome message to `messages[]`. Table MUST be populated before the user types anything. `sessionId` MUST NOT be written to the store until steps 1–3 (`POST /session`, `GET /working-copy`, `GET /preview`) have all resolved successfully. Use a local variable to hold intermediate results and write the store atomically at step 4.
- **FR-003**: System MUST provide a Chat Column allowing users to send messages and receive SSE streamed responses containing tool markers, text tokens, and final diffs.
  - *SSE Streaming Contract*: Uses `fetch` + `ReadableStream`, NOT `EventSource` (`EventSource` does not support POST). Four event types: `tool`, `token`, `final`, `error`. `streamingText` in store is cleared on "final" event, not on "token". The partial bubble is rendered from `streamingText` separately from `messages[]`. On SSE stream error or disconnection, emit a message to the chat with role "assistant" and content "Something went wrong. Please try again." Clear `isStreaming` and `activeTool` in the store.
- **FR-004**: System MUST display a Diff card on `suggest_rewrites` with options to Apply all, Apply selected, or Discard.
  - *Diff Card Confirm Flow*: "Apply all" → `POST /tone/apply/{session_id}` with no keys filter. "Apply selected" → opens multiselect, then `POST /tone/apply` with `{ keys: [] }`. "Discard" → removes diff from message, no API call. After apply: `workingCopy` + `modifiedKeys` updated, `toneStale=true`, preview refreshes. `snapshot_overwritten=true` triggers warning banner before diff rows.
- **FR-005**: System MUST render a live HTML preview debounced by 300ms on working copy changes, highlighting modified placeholder values.
  - *Preview Debounce & Highlight*: `refreshPreview()` debounced 300ms on `workingCopy` change. Modified values wrapped in `<span style="border-left:2px solid #22c55e;padding-left:6px;color:#166534">`. The iframe uses `srcDoc={resolvedHtml}` with `sandbox="allow-same-origin"`. The highlighting MUST be implemented as a standalone pure function `highlightModifiedValues(html: string, workingCopy: Record<string, string>, modifiedKeys: Set<string>): string` in `src/utils/preview.ts`.
- **FR-006**: System MUST provide a Working Copy section in a right panel allowing inline editing of values, saving via `PATCH /working-copy/{session_id}`.
  - *Inline Edit Popover*: Anchored to the row. Contains Textarea, Cancel button, Save button. Escape = cancel, Ctrl+Enter = save. On save: calls `PATCH /working-copy/{session_id}`, updates store, marks `toneStale=true`.
- **FR-007**: System MUST provide a Tone Evaluation section showing emotion bars and deltas against a stored baseline, with the ability to re-evaluate via `POST /tone/evaluate/{session_id}`.
  - *Tone Bar Colour Mapping*: urgency/anger/fear → red (#E24B4A); admiration/approval/gratitude → purple (#7C3AED); joy/amusement/excitement → amber (#F2A623); neutral → gray (#888780); others → blue (#378ADD).
- **FR-008**: System MUST provide a General Agent tab that supports stateless chat (`POST /chat/stream`) and displays result cards with links to open specific templates.
  - *General Agent Result Card*: "Open →" sets `activeTab = 'template'` in store and calls `openTemplate(result.template_name)`. Result cards accumulate, not cleared between queries. "Clear results" button appears after first card.
- **FR-009**: System MUST poll the health endpoint every 30 seconds and display status indicators in the status bar.
  - *Health Polling*: Polled every 30 seconds from `GET /health`. Status dot per component: ok=green, degraded=amber, unavailable=red. Status bar shows "Agent busy…" while `isStreaming=true`, "Agent ready" otherwise. If `GET /health` fails (network error or non-200), set all component statuses to "unavailable" in `appStore`. Do not throw — polling must continue on the next interval.
- **FR-010**: System MUST define a Zustand store with both `SessionStore` and `AppStore` interfaces.
  - *Zustand Store Interfaces*: `SessionStore` includes state (`templateName`, `langLocal`, `paramCustBrand`, `sessionId`, `messages`, `streamingText`, `activeTool`, `isStreaming`, `workingCopy`, `modifiedKeys`, `editCount`, `toneScores`, `toneStoredScores`, `toneStale`, `activeTab`, `previewVisible`, `resolvedHtml`) and actions (`openTemplate`, `resetSession`, `sendMessage`, `patchWorkingCopy`, `resetWorkingCopy`, `evaluateTone`, `undoTone`, `refreshPreview`, `applyDiff`). `AppStore` includes state (`templates`, `locales`, `brands`, `health`) and actions (`loadTemplates`, `loadLocalesAndBrands`, `pollHealth`).

### Key Entities

- **Session**: Represents an active editing session for a specific template, including the chat history, working copy state, and current tone evaluation.
- **Working Copy**: The current key-value state of the template's placeholder variables, tracking which keys have been modified.
- **Template**: The base email template metadata, including its name, supported locales, and brand variants.
- **Tone Evaluation**: A snapshot of emotional scores (urgency, anger, admiration, approval, gratitude, joy, amusement, neutral) for a specific working copy state.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can successfully initiate a template session, request an edit, and see the live preview update within a reasonable timeframe (e.g., under 15 seconds for a simple rewrite).
- **SC-002**: The UI layout remains completely stable (four fixed regions always visible) regardless of chat length or preview content size.
- **SC-003**: Users can successfully complete a full workflow: select template -> chat to edit -> apply diff -> evaluate tone -> export.
- **SC-004**: Health status polling accurately reflects the backend state without causing memory leaks over prolonged usage.

## Assumptions

- Users have a stable connection to `localhost:8000` where the FastAPI backend runs.
- The existing FastAPI backend correctly implements all endpoints (`POST /session`, `GET /working-copy`, `GET /preview`, `PATCH /working-copy`, `POST /tone/apply`, etc.).
- The backend's SSE format strictly adheres to the assumed `{ type, name, text, diff, message }` JSON structure.
- The preview HTML returned by the backend is safe to render within a same-origin sandboxed iframe.