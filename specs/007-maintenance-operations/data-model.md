# Data Model: Maintenance Operations UI

## Data Structures

### ProgressEvent
Represents a single real-time update from a running job.
```typescript
interface ProgressEvent {
  type: EventType;
  step?: string;
  message: string;
  count?: number;
  total?: number;
  timestamp: string;
}
```

### EventType
Union of possible progress event types.
```typescript
type EventType = "step_start" | "step_done" | "step_error" | "item_done" | "job_done" | "job_failed";
```

### MaintenanceJob
A discriminated union representing an ongoing or completed background operation.
```typescript
interface MaintenanceJobTemplate {
  job_id: string;
  type: "template";
  target: string; // only for type === "template"
  status: "pending" | "running" | "done" | "failed";
  started_at: string;
  finished_at?: string;
  log: ProgressEvent[]; // all SSE events buffered in order
  expanded: boolean; // controls card expand/collapse in drawer
}

interface MaintenanceJobGlobal {
  job_id: string;
  type: "full" | "tone_batch";
  target?: undefined;
  status: "pending" | "running" | "done" | "failed";
  started_at: string;
  finished_at?: string;
  log: ProgressEvent[]; // all SSE events buffered in order
  expanded: boolean; // controls card expand/collapse in drawer
}

type MaintenanceJob = MaintenanceJobTemplate | MaintenanceJobGlobal;
```

### Toast
```typescript
interface Toast {
  id: string;
  message: string;
  variant: "success" | "error" | "info";
}
```

## AppStore Additions

The `appStore` state is extended with the following properties:

```typescript
interface AppStoreAdditions {
  maintenanceDrawerOpen: boolean;
  maintenanceJobs: MaintenanceJob[];
  activeRefreshTarget: string | null; // templateName of any running "template" job. Must be set to templateName when a "template" type job transitions to "running", and cleared to null on job_done or job_failed. On a non-202/409 start response (e.g. 503), activeRefreshTarget is never set and the button returns to idle with a toast. PreviewLabelBar reads this to decide whether to show the chip.
  activeRefreshStatus: "idle" | "refreshing" | "failed" | null; // Encodes the state for the RefreshChip.
  toasts: Toast[];
}
```

### AppStore Actions

The following actions are added to `appStore`:

- `openMaintenanceDrawer() / closeMaintenanceDrawer()`: Controls the visibility of the maintenance drawer. When the drawer is opened, if `activeRefreshStatus` is `"failed"`, it is reset to `"idle"` (this dismisses the failure chip).
- `addJob(job: Omit<MaintenanceJob, "log" | "expanded">) → void`: Adds a new maintenance job to the history. Initializes `log` to `[]` and `expanded` to `true`. `started_at` is taken from the API response body, not from `Date.now()` on the client.
- `appendJobEvent(job_id: string, event: ProgressEvent) → void`: Appends a progress event to the specified job's log.
- `finalizeJob(job_id: string, status: "done" | "failed", finished_at: string) → void`: Updates the job's status and finished timestamp, and sets `expanded` to `false`. If the job was tracking a single-template refresh (`job.type === "template"` and `job.target === activeRefreshTarget`), it sets `activeRefreshStatus` to `"failed"` if the job failed or `"idle"` if it succeeded, and explicitly clears `activeRefreshTarget` to `null`.
- `clearCompletedJobs() → void`: Removes jobs with status `"done"` or `"failed"` from the history. Must filter `maintenanceJobs` by status at call time (snapshot operation). Jobs that transition from `running` to `done` after the action is dispatched are not retroactively removed.
- `setActiveRefreshTarget(target: string | null) → void`: Sets or clears the active target of a single-template refresh job.
- `setActiveRefreshStatus(status: "idle" | "refreshing" | "failed" | null) → void`: Sets the refresh chip status.
- `addToast(message: string, variant: "success" | "error" | "info") → void`: Adds a toast notification.
- `dismissToast(id: string) → void`: Removes a toast notification by ID.