# API Module Contracts

## refresh.ts

- `startTemplateRefresh(templateName: string) → Promise<{job_id: string, status: string, type: "template", target: string}>`
  - Throws `MaintenanceApiError` on 409 (with `locked_by` in message) and on non-202/200.

- `startFullRefresh() → Promise<{job_id: string, status: string, type: "full"}>`
  - Throws `MaintenanceApiError` on 409 and on non-202/200.

- `streamRefreshJob(job_id: string, onEvent: (e: ProgressEvent) => void) → AbortController`
  - Opens SSE to `GET /refresh/stream/{job_id}` via `fetch` + `ReadableStream`.
  - Calls `onEvent` for each parsed event.
  - Stream closes automatically on `job_done` or `job_failed` event.
  - Never throws — network/stream errors are emitted as synthetic `job_failed` ProgressEvents.

## tone.ts

- `startBatchReevaluate() → Promise<{job_id: string, status: string}>`
  - Throws `MaintenanceApiError` on 409 and on non-202/200.

- `streamBatchTone(job_id: string, onEvent: (e: ProgressEvent) => void) → AbortController`
  - Opens SSE to `GET /tone/batch-stream/{job_id}` via `fetch` + `ReadableStream`.
  - Calls `onEvent` for each parsed event.
  - Stream closes automatically on `job_done` or `job_failed` event.
  - Never throws — network/stream errors are emitted as synthetic `job_failed` ProgressEvents.

- `exportTone(format: "csv" | "xlsx") → void`
  - Triggers browser file download via a hidden `<a>` element.
  - On non-200 response, reads the body and shows a toast via `appStore.addToast()`.