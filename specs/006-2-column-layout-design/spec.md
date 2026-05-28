# UI Spec — 2-Column Layout Redesign

> **Scope**: React frontend layout only. No backend changes. No API changes.
> **Replaces**: The 3-column layout defined in `ui_react_specification.md` (chat | preview | right-panel)
> **Files affected**: `AppShell`, `ChatColumn`, `PreviewColumn`, `RightPanel`, layout CSS

---

## 1. New Layout

### 1.1 Top-level structure

```
┌────────────────────────────────────────────────────────────────────────┐
│  Sidebar (210px fixed)  │  col-left (flex:1.4)  │  col-right (360px)  │
│                         │                        │                      │
│                         │  [Preview — flex:1]    │  Working copy        │
│                         │  ─────────────────     │  ──────────────      │
│                         │  [Chat — 320px fixed]  │  Tone eval           │
│                         │                        │                      │
└────────────────────────────────────────────────────────────────────────┘
```

The `content-area` div changes from `display: flex; flex-direction: row` (3 equal columns)
to `display: flex; flex-direction: row` with exactly **two columns**:

```tsx
<div className="content-area">       // flex row, flex:1, overflow:hidden
  <LeftColumn />                     // flex:1.4, display:flex, flex-direction:column
  <RightColumn />                    // width:360px, flex-shrink:0
</div>
```

### 1.2 Left column — `LeftColumn.tsx` (new wrapper component)

```
┌──────────────────────────────────────┐
│  PreviewSection   (flex: 1)          │  ← scrollable iframe, grows to fill space
│  ──────────────────────────────────  │
│  ChatSection      (height: 320px)    │  ← fixed height, does not shrink
└──────────────────────────────────────┘
```

```tsx
<div className="left-column">        // flex:1.4, display:flex, flex-direction:column, overflow:hidden
  <PreviewSection />                 // flex:1, min-height:0, overflow:hidden
  <ChatSection />                    // height:320px, flex-shrink:0
</div>
```

The border between preview and chat is a 0.5px top border on `ChatSection`, tertiary colour.

### 1.3 Right column — `RightColumn.tsx` (new wrapper component)

```
┌──────────────────────────────────────┐
│  WorkingCopySection  (flex:1)        │  ← grows, internal scroll on the table
│  ──────────────────────────────────  │
│  ToneSection         (auto height)   │  ← collapses when not evaluated
└──────────────────────────────────────┘
```

```tsx
<div className="right-column">       // width:360px, flex-shrink:0, display:flex, flex-direction:column
                                     // border-left:0.5px, overflow:hidden
  <WorkingCopySection />             // flex:1, min-height:0
  <ToneSection />                    // flex-shrink:0
</div>
```

---

## 2. Left Column — Preview Section

### 2.1 Label bar

Unchanged from existing spec, but now spans the full left column width:

```
[eye icon]  Live preview    17/24 resolved   [● live dot]
```

Height 36px, padding 0 12px, border-bottom 0.5px tertiary.

### 2.2 Unresolvable keys panel

Sits **between the label bar and the iframe**, not below it. Collapsed by default.
When expanded, the iframe shrinks to accommodate — the panel uses `flex-shrink: 0`
and the iframe container is `flex: 1, min-height: 0`.

```
┌──────────────────────────────────────────────────────┐
│  [⚠]  7 unresolvable keys   [7 badge]           [▼]  │
├──────────────────────────────────────────────────────┤  ← expanded state only
│  ● EXPIRATION_DATE    MISSING_KEY                     │
│    Missing key in graph and working copy              │
│  ● IGNCLICKTAG        MISSING_KEY                     │
│    Missing key in graph and working copy              │
│  ● SDR_DETAILS        MISSING_KEY                     │
│  …                                                    │
└──────────────────────────────────────────────────────┘
```

Panel layout inside `PreviewSection` (flex column):

```tsx
<div className="preview-section">    // flex:1, min-height:0, display:flex, flex-direction:column
  <PreviewLabelBar />                // flex-shrink:0, height:36px
  <UnresolvableKeysPanel />          // flex-shrink:0, max-height:180px when expanded, overflow-y:auto
  <PreviewFrame />                   // flex:1, min-height:0
</div>
```

Key list rows — same as previous spec:
- Dot: 5×5px, `MISSING_KEY` → amber, `BROKEN_RULE_CHAIN` → danger, `CYCLE` → info
- Key: monospace 11px, weight 500
- Reason: 9px uppercase, tertiary
- Detail: 10px italic, tertiary, margin-left 12px

### 2.3 Preview iframe

```tsx
<iframe
  srcDoc={resolvedHtml}
  sandbox="allow-same-origin"
  style={{ flex: 1, minHeight: 0, border: 'none', width: '100%', display: 'block' }}
  title="Template preview"
/>
```

Because the left column is now much wider than the old 310px preview column, the iframe
renders the template at full readable width. No height override needed — it fills
all remaining vertical space above the chat section.

---

## 3. Left Column — Chat Section

### 3.1 Structure

```
┌──────────────────────────────────────────────────────┐  ← height: 320px, flex-shrink:0
│  [label bar]  Chat       [Template Assistant badge]  │  height: 32px
│  ──────────────────────────────────────────────────  │
│  [message list — flex:1, overflow-y:auto]            │
│  ──────────────────────────────────────────────────  │
│  [quick-action chips — flex-shrink:0]                │  height: 32px, shown when session active
│  [chat input — flex-shrink:0]                        │  height: 48px
└──────────────────────────────────────────────────────┘
```

```tsx
<div className="chat-section">       // height:320px, flex-shrink:0, display:flex, flex-direction:column
                                     // border-top:0.5px tertiary
  <ChatLabelBar />
  <MessageList />                    // flex:1, min-height:0, overflow-y:auto
  <QuickActionChips />               // flex-shrink:0, shown only when sessionActive
  <ChatInput />                      // flex-shrink:0
</div>
```

No changes to the internal logic of any chat component — only the outer container
dimensions change. `MessageList` previously lived in a `st.container(height=580)` —
it now inherits height from the flex parent.

### 3.2 Chat input

Unchanged. `st.chat_input` / `<input>` pinned to the bottom of `ChatSection`.
No longer pinned to the page bottom — it is pinned to the bottom of its 320px container.

---

## 4. Right Column — Working Copy Section

### 4.1 Section header

```
[table icon]  Working copy     [3 edits badge]     [▼]
8 tone-affecting keys
```

No change to content or logic. The section now has `flex: 1` and `min-height: 0`
so it grows to fill available right column space above the tone section.

### 4.2 Working copy table

The table now has more vertical room (full right column height minus tone section).
Update `max-height` on the scrollable table container:

```
max-height: calc(100% - 64px)   // 64px = header + subheader + footer buttons
overflow-y: auto
```

Previously capped at `168px` — remove that fixed cap. The table uses all available
space in the right column.

### 4.3 Footer buttons

Unchanged: `[↺ Reset all]  [↩ Undo tone]` at the bottom of the working copy section.

---

## 5. Right Column — Tone Section

No changes to content, logic, or internal layout. The section sits at the bottom of
the right column with `flex-shrink: 0`. It collapses when the chevron is closed.

The tone bars, stale badge, and Re-evaluate button are unchanged.

---

## 6. Preview toggle behaviour change

The old Preview toggle button in the Topbar hid/showed the preview column. With the
new layout, preview is always visible as the top half of the left column.

**Remove** the preview toggle button from the Topbar.
**Remove** the `previewVisible` store field.

The left column is always split preview + chat. There is no single-column mode.

---

## 7. Topbar changes

Remove the `[Preview ▣]` toggle button (see section 6).

Everything else in the Topbar is unchanged: breadcrumb, Tone assist button, Export button.

---

## 8. Affected files summary

| File | Change |
|---|---|
| `src/shell/AppShell.tsx` | Replace 3-column `content-area` with 2-column; mount `LeftColumn` + `RightColumn` |
| `src/shell/LeftColumn.tsx` | **New file** — flex column wrapper: `PreviewSection` on top, `ChatSection` below |
| `src/shell/RightColumn.tsx` | **New file** — flex column wrapper: `WorkingCopySection` on top, `ToneSection` below |
| `src/shell/Topbar.tsx` | Remove Preview toggle button |
| `src/preview/PreviewSection.tsx` | **New file** — flex column: label bar + unresolvable panel + iframe |
| `src/preview/PreviewColumn.tsx` | **Delete or repurpose** — logic moves into `PreviewSection` |
| `src/chat/ChatSection.tsx` | Rename/wrap `ChatColumn` — add `height: 320px` outer container |
| `src/rightpanel/RightPanel.tsx` | Split into `RightColumn.tsx` (new wrapper) + keep `WorkingCopySection` and `ToneSection` as children |
| `src/store/sessionStore.ts` | Remove `previewVisible` field and toggle action |
| `src/types/index.ts` | No new types needed beyond those in `spec_ui_changes.md` |

---

## 9. CSS changes (`AppShell` or global)

```css
.content-area {
  display: flex;
  flex-direction: row;
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

.left-column {
  flex: 1.4;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.right-column {
  width: 360px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-left: 0.5px solid var(--border-tertiary);
}

.preview-section {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-section {
  height: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border-top: 0.5px solid var(--border-tertiary);
}
```

Remove all CSS previously scoped to `.col-preview`, `.col-chat`, `.col-right`
from the old 3-column layout.

---

## 10. Out of scope

- No changes to backend / FastAPI
- No changes to ADK agents or tools
- No changes to General Agent tab (remains 2-column chat + result cards)
- No changes to sidebar or status bar
- All changes from `spec_ui_changes.md` (unresolvable keys, init endpoint, loading state)
  are still valid and should be implemented alongside this layout change