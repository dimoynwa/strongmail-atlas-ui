# UI Change Spec — Three Incremental Fixes

> **Scope**: React frontend only. No backend changes. No SpecKit needed.
> **Files affected**: `PreviewColumn`, `WorkingCopySection`, `sessionStore`, `openTemplate` flow
> **Status**: Ready to implement

---

## Change 1 — Unresolvable Keys Panel in Preview Column

### What changed on the API

`GET /preview/{session_id}` now returns an extended response. The previously unused
`unresolvable_keys` array is now fully populated with structured detail:

```typescript
interface UnresolvableKey {
  key: string;
  reason: 'MISSING_KEY' | 'BROKEN_RULE_CHAIN' | 'CYCLE';
  detail: string;
}
```

The response also includes `resolved_count`, `unresolvable_count`, and `total_placeholders`.

### What to build

Add an **Unresolvable Keys** collapsible section at the bottom of the Preview column,
below the iframe. It is only rendered when `unresolvableKeys.length > 0`.

#### Section header

```
[alert-triangle icon]  10 unresolvable keys   [▼]
```

- Icon: `ti-alert-triangle` 13px, warning colour
- Label: 11px, weight 500, warning text colour
- Count badge: pill, 10px, background warning, text warning
- Chevron: `ti-chevron-down/up`, tertiary, collapsed by default

#### Key list (expanded)

Render each entry as a compact row:

```
[dot]  AMOUNT           MISSING_KEY
       Missing key in graph and working copy
```

- Dot: 5×5px circle, colour by reason:
  - `MISSING_KEY` → warning (`#F2A623`)
  - `BROKEN_RULE_CHAIN` → danger (`#E24B4A`)
  - `CYCLE` → info (`#378ADD`)
- Key: `font-family: monospace`, 11px, primary weight 500
- Reason badge: 9px, uppercase, letter-spacing 0.04em, tertiary
- Detail: 10px, tertiary, italic, margin-left 12px

Max height: `160px`, `overflow-y: auto`. Internal scroll — do not grow the column.

#### Store changes

Extend `SessionStore` and the preview API response shape:

```typescript
// In store
unresolvableKeys: UnresolvableKey[];
resolvedCount: number;
totalPlaceholders: number;

// Set in refreshPreview() after GET /preview/{session_id}
```

#### Preview label bar

Extend the existing label bar to show a summary when keys are unresolvable:

```
[eye icon]  Live preview    27/37 resolved   [● green dot]
```

- Format: `{resolved_count}/{total_placeholders} resolved`
- Text: 10px, tertiary
- Only shown when `totalPlaceholders > 0`

---

## Change 2 — Working Copy Init on Template Open

### What changed on the API

A new endpoint `POST /working-copy/{session_id}/init` must be called immediately after
`POST /session` when opening a template. It pre-populates the Redis working copy with
all tone-affecting keys resolved to their current graph values, and returns the working
copy state.

Response shape:

```typescript
interface WorkingCopyInitResponse {
  session_id: string;
  overrides: WorkingCopyOverride[];   // same shape as GET /working-copy
  total_overrides: number;
  session_has_changes: boolean;
  initialized: boolean;
  source: 'created' | 'existing';
  tone_key_count: number;
}
```

### What to build

#### New API function — `src/api/workingCopy.ts`

Add `initWorkingCopy(sessionId: string): Promise<WorkingCopyInitResponse>`:

```typescript
export async function initWorkingCopy(sessionId: string): Promise<WorkingCopyInitResponse> {
  return apiFetch<WorkingCopyInitResponse>(
    `/working-copy/${sessionId}/init`,
    { method: 'POST' }
  );
}
```

#### Updated `openTemplate` flow — `src/store/sessionStore.ts`

Replace the existing `GET /working-copy/{session_id}` call in `openTemplate()` with
`POST /working-copy/{session_id}/init`. The response populates the working copy table
before the first user interaction.

New sequence inside `openTemplate(name)`:

```
1. POST /session                         → receive session_id
2. POST /working-copy/{session_id}/init  → populate workingCopy, modifiedKeys, editCount, toneKeyCount
3. GET  /preview/{session_id}            → populate resolvedHtml, unresolvableKeys, resolvedCount, totalPlaceholders
4. Commit sessionId, templateName to store
5. Push welcome message to messages[]
```

Store fields updated from the init response:

```typescript
workingCopy:    Record<string, string>   // keyed by override.key
modifiedKeys:   Set<string>             // keys where set_at !== null (user-modified)
editCount:      number                  // total_overrides
toneKeyCount:   number                  // tone_key_count (show in section header)
```

The existing `GET /working-copy/{session_id}` endpoint is still used by the
working copy section's "refresh" path (e.g. after undo), but NOT on session open.

---

## Change 3 — Loading State on Template Open

### Problem

Clicking a template in the sidebar triggers `openTemplate()`, which makes three
sequential async calls (`POST /session` + `POST /init` + `GET /preview`). During
this time the UI appears frozen — no feedback is given to the user.

### What to build

#### New store field

```typescript
isOpeningTemplate: boolean;   // true while openTemplate() is in flight
```

Set to `true` at the start of `openTemplate()`, `false` in the `finally` block.

#### Sidebar — `TemplateList.tsx`

While `isOpeningTemplate === true`, the clicked template item shows an inline spinner
replacing its meta row:

```
password_reset_en
[spinner 10px]  Opening…
```

- Spinner: CSS `@keyframes spin`, 10×10px circle border, border-top info colour, 0.7s linear infinite
- Text: "Opening…", 10px, tertiary
- Other template items remain clickable and visually normal (do not disable the whole list)

#### Main area — loading overlay

While `isOpeningTemplate === true`, render a centered overlay inside the `content-area`
div (position absolute, covers chat + preview + right panel, does NOT cover the sidebar):

```
┌─────────────────────────────────────┐
│                                     │
│     [mail icon, 24px, info]         │
│     Loading template…               │
│     [progress bar, indeterminate]   │
│                                     │
└─────────────────────────────────────┘
```

- Overlay: `position: absolute`, `inset: 0`, `z-index: 20`, background `rgba(surface-primary, 0.85)`, backdrop-filter blur 4px
- Container: centered via flex, gap 10px, flex-direction column, align-items center
- Icon: `ti-mail` 24px, info colour
- Text: 13px, weight 500, secondary colour
- Progress bar: width 160px, height 3px, background surface secondary, animated fill sweeping left-to-right (CSS animation), info colour fill

#### Error handling

If `openTemplate()` throws (network error, 404, 500), set `isOpeningTemplate = false`
and push an error message to `messages[]`:

```
Could not open template "{name}". {error.message}
```

Rendered as an assistant message with `role: 'assistant'` and danger text colour.

---

## Affected files summary

| File | Change |
|---|---|
| `src/store/sessionStore.ts` | Add `isOpeningTemplate`, `unresolvableKeys`, `resolvedCount`, `totalPlaceholders`, `toneKeyCount`; update `openTemplate()` to use init endpoint + set loading state |
| `src/api/workingCopy.ts` | Add `initWorkingCopy()` |
| `src/api/preview.ts` | Update response type to include `unresolvable_keys`, `resolved_count`, `total_placeholders` |
| `src/preview/PreviewColumn.tsx` | Add unresolvable keys collapsible section; extend label bar with resolved count |
| `src/preview/PreviewLabelBar.tsx` | Show `{resolved}/{total} resolved` |
| `src/preview/UnresolvableKeysPanel.tsx` | New component — collapsible list |
| `src/rightpanel/WorkingCopySection.tsx` | Show `tone_key_count` in section sub-header |
| `src/sidebar/TemplateList.tsx` | Show inline spinner on active-loading item |
| `src/shell/AppShell.tsx` | Render loading overlay inside `content-area` when `isOpeningTemplate` |
| `src/types/index.ts` | Add `UnresolvableKey`, `WorkingCopyInitResponse` types |

---

## Out of scope

- No changes to the chat flow or tone evaluation
- No changes to `POST /working-copy/{session_id}/init` — consumed as-is