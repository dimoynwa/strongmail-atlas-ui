# Spec: Component Restyle — Design System Alignment

**Feature Branch**: `004-component-restyle`
**Created**: 2026-05-28
**Status**: Ready to apply

## Summary

The components were generated with minimal Tailwind classes that do not match
the design mockup. This spec replaces the className/style values on every
component to match the exact sizing, colours, borders, typography, and layout
defined in `ui_react_specification.md`.

No logic changes. No new files. Pure className/style replacements only.

---

## 1. `frontend/src/sidebar/Sidebar.tsx`

**Changes:**
- Sidebar `<aside>`: change `w-72` to fixed `w-[210px]`, add `flex-shrink-0`, change bg to `bg-bg-secondary`
- Tab buttons: replace active/inactive styles with pill design — active: `bg-bg-primary border border-border-sec text-text-pri font-medium`, inactive: `text-text-sec`
- Tab row container: `flex gap-1 p-2 border-b border-border-ter`
- Confirmation dialog overlay: keep `fixed inset-0 z-50 flex items-center justify-center bg-black/40`
- Confirmation dialog card: `w-80 rounded-lg bg-bg-primary p-4 shadow-lg border border-border-ter`

```tsx
// Sidebar <aside>
<aside className="flex w-[210px] flex-shrink-0 flex-col border-r border-border-ter bg-bg-secondary">

// Tab row
<div className="flex gap-1 p-2 border-b border-border-ter">

// Active tab button
className="flex-1 rounded-full px-3 py-1.5 text-[10px] font-medium bg-bg-primary border border-border-sec text-text-pri"

// Inactive tab button
className="flex-1 rounded-full px-3 py-1.5 text-[10px] text-text-sec"
```

---

## 2. `frontend/src/sidebar/ContextSelectors.tsx`

**Changes:**
- Section container: `p-2 border-b border-border-ter space-y-1`
- Each row: `flex items-center gap-2`
- Label `<span>` (not `<label>`): `text-[10px] uppercase tracking-[0.04em] text-text-ter w-[38px] flex-shrink-0`
- Select: `flex-1 text-[11px] bg-bg-primary border border-border-sec rounded px-1.5 py-1`

```tsx
<div className="border-b border-border-ter p-2 space-y-1">
  <div className="flex items-center gap-2">
    <span className="text-[10px] uppercase tracking-[0.04em] text-text-ter w-[38px] flex-shrink-0">
      Lang
    </span>
    <select className="flex-1 text-[11px] bg-bg-primary border border-border-sec rounded px-1.5 py-1">
```

---

## 3. `frontend/src/sidebar/TemplateList.tsx`

**Changes:**
- Container: `flex-1 overflow-y-auto py-1`
- Add section label above list: `<div className="px-2 py-1 text-[10px] uppercase tracking-[0.04em] text-text-ter">Templates</div>`
- Each button: `w-full text-left px-2 py-1.5 rounded mx-1`
- Active item: `bg-bg-info`
- Inactive hover: `hover:bg-bg-secondary`
- Template name: `text-[12px] font-medium text-text-pri truncate` — active: `text-text-info`
- Meta line (key_count + last_modified): `text-[10px] text-text-ter` — replace description with `{template.key_count} keys · {template.last_modified}`
- Remove description paragraph entirely

```tsx
<li key={template.name}>
  <button
    type="button"
    onClick={() => void openTemplate(template.name)}
    className={`mx-1 w-full rounded px-2 py-1.5 text-left hover:bg-bg-secondary ${
      activeTemplate === template.name ? 'bg-bg-info' : ''
    }`}
  >
    <span className={`block truncate text-[12px] font-medium ${
      activeTemplate === template.name ? 'text-text-info' : 'text-text-pri'
    }`}>
      {template.name}
    </span>
    <span className="block text-[10px] text-text-ter">
      {template.key_count} keys · {template.last_modified}
    </span>
  </button>
</li>
```

---

## 4. `frontend/src/sidebar/SessionBadge.tsx`

**Changes:**
- No-session state: keep as-is but change to `px-2 py-1.5 text-[10px] text-text-ter`
- Active session container: `mx-2 my-1.5 rounded-md border border-border-success bg-bg-success px-2 py-1.5`
- "ACTIVE SESSION" label: `text-[10px] uppercase tracking-[0.04em] text-text-success`
- Template name: `mt-0.5 text-[11px] font-medium text-text-pri`
- Context row (lang · brand · edits): `mt-0.5 text-[10px] text-text-ter`

```tsx
if (!sessionId) {
  return <div className="px-2 py-1.5 text-[10px] text-text-ter">No active session</div>;
}

return (
  <div className="mx-2 my-1.5 rounded-md border border-border-success bg-bg-success px-2 py-1.5">
    <div className="text-[10px] uppercase tracking-[0.04em] text-text-success">Active session</div>
    <div className="mt-0.5 text-[11px] font-medium text-text-pri">{templateName}</div>
    <div className="mt-0.5 text-[10px] text-text-ter">
      {langLocal} · {paramCustBrand} · {editCount} edits
    </div>
  </div>
);
```

Also add `langLocal` and `paramCustBrand` from the store:
```tsx
const langLocal = useSessionStore((state) => state.langLocal);
const paramCustBrand = useSessionStore((state) => state.paramCustBrand);
```

---

## 5. `frontend/src/sidebar/SidebarFooter.tsx`

**Changes:**
- Replace the "Close session" button with the user avatar + name + role block from the spec
- Add hardcoded user: `JD` initials, `Jane D.`, `Template author`
- Status dots moved to StatusBar — remove from here if present

```tsx
export function SidebarFooter() {
  const resetSession = useSessionStore((state) => state.resetSession);
  const sessionId = useSessionStore((state) => state.sessionId);

  return (
    <div className="border-t border-border-ter p-2 mt-auto">
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-bg-info text-[10px] font-medium text-text-info">
          JD
        </div>
        <div>
          <div className="text-[11px] font-medium text-text-pri">Jane D.</div>
          <div className="text-[10px] text-text-ter">Template author</div>
        </div>
      </div>
      {sessionId && (
        <button
          type="button"
          onClick={() => resetSession()}
          className="mt-2 w-full rounded border border-border-sec px-2 py-1 text-[10px] text-text-sec hover:bg-bg-secondary"
        >
          Close session
        </button>
      )}
    </div>
  );
}
```

---

## 6. `frontend/src/shell/Topbar.tsx`

**Changes:**
- `<header>`: `flex h-[42px] flex-shrink-0 items-center justify-between border-b border-border-ter bg-bg-primary px-3`
- Left side: breadcrumb with icon + template name + chevron + agent name
- Right side: Tone assist button (warning), Export button (icon only)
- Remove the `<h1>` and `<p>` layout — replace with breadcrumb

```tsx
return (
  <header className="flex h-[42px] flex-shrink-0 items-center justify-between border-b border-border-ter bg-bg-primary px-3">
    <div className="flex items-center gap-1.5">
      <i className="ti ti-template text-[14px] text-text-sec" />
      {templateName && (
        <>
          <span className="text-[12px] text-text-sec">{templateName}</span>
          <i className="ti ti-chevron-right text-[12px] text-text-ter opacity-50" />
        </>
      )}
      <span className="text-[12px] font-medium text-text-pri">Template Assistant</span>
    </div>
    <div className="flex items-center gap-1.5">
      {sessionId && (
        <button
          type="button"
          className="flex items-center gap-1 rounded border border-border-warning bg-bg-warning px-2 py-1 text-[11px] text-text-warning"
        >
          <i className="ti ti-mood-smile text-[13px]" />
          Tone assist ↗
        </button>
      )}
      {sessionId && (
        <button
          type="button"
          onClick={() => void handleExport()}
          className="flex items-center gap-1 rounded border border-border-ter px-2 py-1 text-[11px] text-text-sec hover:bg-bg-secondary"
          title="Export working copy"
        >
          <i className="ti ti-download text-[13px]" />
        </button>
      )}
    </div>
  </header>
);
```

---

## 7. `frontend/src/chat/ChatColumn.tsx`

**Changes:**
- `<section>`: keep `flex min-w-0 flex-1 flex-col` but add explicit `bg-bg-primary border-r border-border-ter overflow-hidden`

Add label bar before `<MessageList />`:
```tsx
<div className="flex h-[34px] flex-shrink-0 items-center gap-1.5 border-b border-border-ter px-2.5">
  <i className="ti ti-messages text-[14px] text-text-sec" />
  <span className="text-[11px] font-medium text-text-sec">Chat</span>
  <span className="ml-auto rounded-full bg-bg-warning px-2 py-0.5 text-[10px] font-medium text-text-warning">
    Template Assistant
  </span>
</div>
```

---

## 8. `frontend/src/chat/MessageList.tsx`

**Changes:**
- Container: `flex-1 overflow-y-auto px-3 py-3 space-y-3`
- Tool chip: replace plain text div with pill:
  ```tsx
  <div className="flex items-center gap-1 w-fit rounded-full border border-border-ter bg-bg-primary px-2 py-0.5 text-[10px] text-text-ter mb-1">
    <i className="ti ti-cpu text-[11px]" />
    {activeTool}
  </div>
  ```

---

## 9. `frontend/src/chat/ChatInput.tsx`

**Changes:**
- Container: `flex-shrink-0 border-t border-border-ter bg-bg-primary px-3 py-2`
- Replace `<textarea>` with `<input type="text">` (single line, pill shape per spec)
- Input: `flex-1 rounded-full border border-border-ter bg-bg-secondary px-3 py-1.5 text-[12px] outline-none disabled:opacity-50`
- Send button: `h-[30px] w-[30px] flex-shrink-0 rounded-full bg-bg-info flex items-center justify-center disabled:opacity-50`
- Send button icon: `<i className="ti ti-arrow-up text-[14px] text-text-info" />`

```tsx
<div className="flex-shrink-0 border-t border-border-ter bg-bg-primary px-3 py-2">
  <div className="flex items-center gap-2">
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void handleSubmit(); } }}
      placeholder={sessionId ? 'Ask about this template…' : 'Open a template first'}
      disabled={!sessionId || isStreaming}
      className="flex-1 rounded-full border border-border-ter bg-bg-secondary px-3 py-1.5 text-[12px] outline-none disabled:opacity-50"
    />
    <button
      type="button"
      onClick={() => void handleSubmit()}
      disabled={!sessionId || isStreaming || !value.trim()}
      className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full bg-bg-info disabled:opacity-50"
    >
      <i className="ti ti-arrow-up text-[14px] text-text-info" />
    </button>
  </div>
</div>
```

---

## 10. `frontend/src/chat/QuickActionChips.tsx`

**Changes:**
- Container: `flex-shrink-0 flex gap-1.5 overflow-x-auto px-3 pb-2 [scrollbar-width:none]`
- Each chip: `flex-shrink-0 rounded-full border border-border-sec bg-bg-secondary px-2.5 py-1 text-[11px] text-text-sec hover:bg-bg-tertiary`
- Replace the 3 placeholder actions with the 5 spec-defined actions:

```tsx
const QUICK_ACTIONS = [
  { label: 'Show placeholders', message: 'What placeholders are in this template?' },
  { label: 'Full preview',      message: 'Show me the full resolved preview of this template.' },
  { label: 'Compare tone',      message: 'Compare the current tone to the last stored evaluation.' },
  { label: 'Reset all changes', message: 'Reset all my changes back to the original values.' },
  { label: 'What changed?',     message: 'What changes have I made to this template so far?' },
];
```

---

## 11. `frontend/src/preview/PreviewColumn.tsx`

**Changes:**
- `<section>`: `flex w-[310px] flex-shrink-0 flex-col border-r border-border-ter bg-bg-secondary overflow-hidden`

Add label bar:
```tsx
<div className="flex h-[34px] flex-shrink-0 items-center gap-1.5 border-b border-border-ter px-2.5">
  <i className="ti ti-eye text-[14px] text-text-ter" />
  <span className="text-[11px] font-medium text-text-sec">Live preview</span>
  <div className="ml-auto h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#22c55e]" />
</div>
```

---

## 12. `frontend/src/preview/PreviewFrame.tsx`

**Changes:**
- Placeholder state: add icon above text
  ```tsx
  <div className="flex flex-1 flex-col items-center justify-center gap-2 text-text-ter">
    <i className="ti ti-template text-[32px] opacity-40" />
    <span className="text-[12px]">Select a template to preview it here</span>
  </div>
  ```
- iframe: `flex-1 w-full border-0` (no explicit bg needed — iframe renders its own content)

---

## 13. `frontend/src/rightpanel/RightPanel.tsx`

**Changes:**
- `<aside>`: `flex w-[256px] flex-shrink-0 flex-col overflow-hidden bg-bg-primary border-l border-border-ter`

---

## 14. `frontend/src/rightpanel/WorkingCopySection.tsx`

**Changes:**
- Section header button: `flex w-full items-center gap-1.5 px-2.5 py-2 border-b border-border-ter`
- Header icon: `<i className="ti ti-table text-[14px] text-text-sec" />`
- Header label: `text-[11px] font-medium text-text-sec flex-1`
- Chevron: `<i className={`ti ${expanded ? 'ti-chevron-up' : 'ti-chevron-down'} text-[13px] text-text-ter`} />`
- Sub-label: `text-[10px] text-text-ter px-2.5 pb-1`
- Reset button: `rounded border border-border-danger px-2 py-0.5 text-[10px] text-text-danger hover:bg-bg-danger`

```tsx
<button
  type="button"
  className="flex w-full items-center gap-1.5 border-b border-border-ter px-2.5 py-2"
  onClick={() => setExpanded((v) => !v)}
>
  <i className="ti ti-table text-[14px] text-text-sec" />
  <span className="flex-1 text-left text-[11px] font-medium text-text-sec">Working copy</span>
  <i className={`ti ${expanded ? 'ti-chevron-up' : 'ti-chevron-down'} text-[13px] text-text-ter`} />
</button>
```

---

## 15. `frontend/src/rightpanel/ToneSection.tsx`

**Changes:**
- Section header: `flex items-center gap-1.5 px-2.5 py-2 border-b border-border-ter`
- Header icon: `<i className="ti ti-mood-check text-[14px] text-text-sec" />`
- Header label: `text-[11px] font-medium text-text-sec flex-1`
- Fresh badge: `rounded-full bg-bg-success px-2 py-0.5 text-[10px] text-text-success`
- Stale badge: `rounded-full bg-bg-warning px-2 py-0.5 text-[10px] text-text-warning`
- Stale warning paragraph: `mx-2.5 mb-2 rounded bg-bg-warning px-2 py-1 text-[10px] text-text-warning`
- Bars container: `space-y-2 px-2.5 py-2`
- No-session text: `px-2.5 py-2 text-[10px] text-text-ter`

```tsx
<section className="flex flex-col">
  <div className="flex items-center gap-1.5 border-b border-border-ter px-2.5 py-2">
    <i className="ti ti-mood-check text-[14px] text-text-sec" />
    <span className="flex-1 text-[11px] font-medium text-text-sec">Tone</span>
    {toneScores && !toneStale && (
      <span className="rounded-full bg-bg-success px-2 py-0.5 text-[10px] text-text-success">fresh</span>
    )}
    {toneStale && (
      <span className="rounded-full bg-bg-warning px-2 py-0.5 text-[10px] text-text-warning">stale</span>
    )}
  </div>
  ...
</section>
```

---

## 16. `frontend/src/shell/StatusBar.tsx`

**Changes:**
- Fix the broken `bg-bg-warning0` typo → use inline style `background: 'var(--color-background-warning)'` or just `bg-yellow-400`
- `<footer>`: `flex h-[24px] flex-shrink-0 items-center justify-between border-t border-border-ter bg-bg-secondary px-3`
- Status text: `text-[10px] text-text-ter`
- Each health item: `flex items-center gap-1 text-[10px] text-text-ter`
- Dot size: `h-[5px] w-[5px]` (not `h-2 w-2`)
- Fix `HealthDot` degraded colour: `bg-yellow-400` (the `bg-bg-warning0` token does not exist)

```tsx
function HealthDot({ status }: { status: 'ok' | 'degraded' | 'unavailable' | undefined }) {
  const color =
    status === 'ok' ? 'bg-green-500' :
    status === 'degraded' ? 'bg-yellow-400' :
    'bg-red-500';
  return <span className={`inline-block h-[5px] w-[5px] rounded-full ${color}`} aria-hidden />;
}

return (
  <footer className="flex h-[24px] flex-shrink-0 items-center justify-between border-t border-border-ter bg-bg-secondary px-3">
    <span className={`text-[10px] ${isStreaming ? 'text-text-warning' : 'text-[#22c55e]'}`}>
      {isStreaming ? 'Agent busy…' : 'Agent ready'}
    </span>
    <div className="flex items-center gap-3">
      {Object.entries(health).map(([component, status]) => (
        <span key={component} className="flex items-center gap-1 text-[10px] text-text-ter capitalize">
          <HealthDot status={status} />
          {component}
        </span>
      ))}
    </div>
  </footer>
);
```

---

## No Logic Changes

All store actions, API calls, hooks, and types remain unchanged.
Only `className` attributes and element structure for visual presentation
are modified in this spec.