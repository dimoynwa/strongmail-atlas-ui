# Spec: Styling Infrastructure Fix

**Feature Branch**: `002-styling-infrastructure`
**Created**: 2026-05-27
**Status**: Applied

## Summary

The React app rendered as an unstyled white/black page after initial SpecKit
scaffolding because three wiring steps were never completed:

1. The Tabler Icons webfont CDN link was missing from `index.html`
2. `src/index.css` did not exist — no Tailwind directives, no CSS custom properties
3. `src/main.tsx` did not import `index.css`

This spec records the three-file fix that was applied manually.

---

## Changes Applied

### 1. `frontend/index.html` — add Tabler Icons CDN link

Added inside `<head>`, after the existing `<meta>` tags:

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css"
/>
```

**Why**: Every component uses `<i class="ti ti-*">` icons. Without the webfont,
all icons render as blank/invisible text.

---

### 2. `frontend/src/index.css` — created (did not exist)

Full file content:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Backgrounds */
  --color-background-primary: #ffffff;
  --color-background-secondary: #f8f7f5;
  --color-background-tertiary: #f1efe8;
  --color-background-info: #e6f1fb;
  --color-background-success: #eaf3de;
  --color-background-warning: #faeeda;
  --color-background-danger: #fcebeb;

  /* Text */
  --color-text-primary: #2c2c2a;
  --color-text-secondary: #5f5e5a;
  --color-text-tertiary: #888780;
  --color-text-info: #185fa5;
  --color-text-success: #3b6d11;
  --color-text-warning: #854f0b;
  --color-text-danger: #a32d2d;

  /* Borders */
  --color-border-tertiary: rgba(44, 44, 42, 0.15);
  --color-border-secondary: rgba(44, 44, 42, 0.3);
  --color-border-primary: rgba(44, 44, 42, 0.4);
  --color-border-info: #b5d4f4;
  --color-border-success: #c0dd97;
  --color-border-warning: #fac775;
  --color-border-danger: #f7c1c1;

  /* Typography */
  --font-sans: ui-sans-serif, system-ui, -apple-system, sans-serif;
  --font-mono: ui-monospace, 'Cascadia Code', 'Source Code Pro', monospace;

  /* Radius */
  --border-radius-md: 8px;
  --border-radius-lg: 12px;
  --border-radius-xl: 16px;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: var(--font-sans);
  background: var(--color-background-tertiary);
  color: var(--color-text-primary);
  -webkit-font-smoothing: antialiased;
}
```

**Why**: Without `@tailwind` directives, PostCSS never generates utility classes
and the stylesheet is empty. Without the `:root` block, every `var(--color-*)`
reference in components resolves to an empty value, falling back to browser
defaults (black text, white background).

---

### 3. `frontend/src/main.tsx` — add CSS import

Added one line:

```tsx
import './index.css';
```

Full file after change:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Why**: Vite does not auto-import any CSS. Without this import, `index.css`
is never processed by PostCSS/Tailwind and never injected into the page.

---

## No Other Files Modified

No component files were changed. No new npm dependencies were added.
`tailwind.config.js` content paths (`./index.html`, `./src/**/*.{js,ts,jsx,tsx}`)
were already correct and did not require changes.