# Quickstart: Maintenance Operations UI

This guide outlines how to build and test the new Maintenance Operations UI feature.

## 1. Directory Structure Setup

Create the following files (if they do not already exist):

```bash
# Store
touch frontend/src/store/appStore.ts

# Shell
touch frontend/src/shell/ToastContainer.tsx

# API
touch frontend/src/api/refresh.ts
touch frontend/src/api/tone.ts

# Sidebar
touch frontend/src/sidebar/MaintenanceDrawer.tsx
touch frontend/src/sidebar/MaintenanceJobCard.tsx
touch frontend/src/sidebar/SidebarFooter.tsx

# Preview
touch frontend/src/preview/PreviewLabelBar.tsx
touch frontend/src/preview/RefreshChip.tsx

# Right Panel
touch frontend/src/rightpanel/StaleSessionBanner.tsx
```

## 2. API Mocking (MSW)

Before writing component tests, implement MSW handlers for the following endpoints:

- `POST /refresh/template/:name`
- `POST /refresh/full`
- `GET /refresh/stream/:job_id` (simulate SSE streaming)
- `POST /tone/batch-reevaluate`
- `GET /tone/batch-stream/:job_id` (simulate SSE streaming)
- `GET /tone/export`

## 3. Implementation Sequence

1. **State & API**: Implement `appStore` additions and the API contracts in `api/refresh.ts` and `api/tone.ts`.
2. **Toast System**: Implement `ToastContainer` and ensure toasts can be added via the store.
3. **Sidebar & Drawer**: Build the `MaintenanceDrawer` and `MaintenanceJobCard` components, and update `SidebarFooter` to open the drawer.
4. **Template Refresh**: Update `PreviewLabelBar` to include the refresh button/chip logic and create `RefreshChip`.
5. **Stale Session**: Create and integrate `StaleSessionBanner`.

## 4. Testing

Write tests using Vitest and React Testing Library:

- **RefreshChip**:
  - Renders when a job is running for the active template.
  - Absent when no session is active.
- **Conflicts (409)**:
  - 409 response triggers a toast, and the button returns to an idle state.
- **StaleSessionBanner**:
  - Appears on `job_done` when the target matches the current template name.
  - Does NOT appear when the target does not match.
- **Drawer History**:
  - `[Clear]` button successfully removes done/failed jobs but leaves running jobs intact.
- **Stream Lifecycle**:
  - The `AbortController` cancels the stream on drawer unmount without emitting a `job_failed` event.
- **Exporting**:
  - Ensure `exportTone` triggers an anchor download on 200, and displays a toast on non-200.