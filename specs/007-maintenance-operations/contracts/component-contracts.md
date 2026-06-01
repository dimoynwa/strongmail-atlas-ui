# Component Contracts

## MaintenanceDrawer
- **Location**: `frontend/src/sidebar/MaintenanceDrawer.tsx`
- **Props**: None.
- **Behavior**: Reads `appStore` directly (specifically `maintenanceDrawerOpen` and `maintenanceJobs`). Displays job history and action buttons. Renders above sidebar and right panel but below topbar. Dismissible via Escape or clicking outside (implemented via a `useClickOutside` hook in `frontend/src/hooks/useClickOutside.ts` or a focusTrap pattern).

## MaintenanceJobCard
- **Location**: `frontend/src/sidebar/MaintenanceJobCard.tsx`
- **Props**:
  - `job: MaintenanceJob`
  - `onToggle: () => void` (called to toggle the expanded state of the card log)
- **Behavior**: Renders a collapsible job card with SSE log if expanded.

## RefreshChip
- **Location**: `frontend/src/preview/RefreshChip.tsx`
- **Props**:
  - `status: "refreshing" | "failed"`
  - `onFailedClick: () => void` (opens the Maintenance panel)
- **Behavior**: An inline status chip that Replaces the "Refresh" button while a template refresh job is running or if it failed.

## StaleSessionBanner
- **Location**: `frontend/src/rightpanel/StaleSessionBanner.tsx`
- **Props**:
  - `templateName: string`
  - `onReopen: () => void`
  - `onDismiss: () => void`
- **Behavior**: Persistent re-open prompt displayed over the active template when its corresponding refresh job completes.

## ToastContainer
- **Location**: `frontend/src/shell/ToastContainer.tsx`
- **Props**: None.
- **Behavior**: Reads `appStore.toasts` directly and renders toast notifications. Allows dismissing toasts manually or automatically after a timeout.