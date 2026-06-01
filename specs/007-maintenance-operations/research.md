# Research: Maintenance Operations UI

## Toast Notification System

**Decision**: Introduce a minimal `ToastContainer` component in `frontend/src/shell/` and manage toasts via `appStore`.

**Rationale**: No existing toast mechanism was found in the codebase. FR-012 is amended per its own escape hatch: a minimal ToastContainer is permitted. Since the StrongMail Agent Studio constitution prohibits adding new UI component libraries like MUI, Shadcn, or Radix, we must build a custom solution. The new mechanism will maintain an array of toasts (`appStore.toasts`) and provide actions `addToast(message, variant)` and `dismissToast(id)`.

**Alternatives considered**: 
- Re-using an existing toast mechanism (rejected because none exists in the codebase).
- Importing `react-hot-toast` or similar (rejected because it violates the constitution rule against adding new UI component libraries).