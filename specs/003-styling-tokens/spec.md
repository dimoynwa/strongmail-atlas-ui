# Spec: PostCSS Configuration & Design System Tokens

**Feature Branch**: `003-styling-tokens`
**Created**: 2026-05-27
**Status**: Applied

## Summary

After the initial styling infrastructure fix (spec `002-styling-infrastructure`),
the app still rendered unstyled. Two additional problems were identified:

1. `postcss.config.js` was never created — Vite cannot run the Tailwind PostCSS
   plugin without it, so `@tailwind` directives in `index.css` were emitted as
   literal text rather than compiled utility classes.

2. `AppShell.tsx` used hardcoded Tailwind colour classes (`bg-slate-50`,
   `text-slate-900`) instead of the project's CSS custom property design system.
   The design system variables (`var(--color-*)`) were defined in `index.css`
   but were never registered as Tailwind theme tokens, causing inconsistent
   styling across the component tree.

---

## Changes Applied

### 1. `frontend/postcss.config.js` — created (did not exist)

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

**Why**: Tailwind 3 requires an explicit PostCSS config. Without it, Vite's
PostCSS pipeline never invokes the Tailwind plugin and the `@tailwind base`,
`@tailwind components`, and `@tailwind utilities` directives in `index.css`
are passed through as unrecognised at-rules, generating no utility classes.
Both `tailwindcss` and `autoprefixer` were already present in `package.json`
devDependencies — no new installs required.

---

### 2. `frontend/tailwind.config.js` — extended with design system tokens

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-primary':     'var(--color-background-primary)',
        'bg-secondary':   'var(--color-background-secondary)',
        'bg-tertiary':    'var(--color-background-tertiary)',
        'bg-info':        'var(--color-background-info)',
        'bg-success':     'var(--color-background-success)',
        'bg-warning':     'var(--color-background-warning)',
        'bg-danger':      'var(--color-background-danger)',
        'text-pri':       'var(--color-text-primary)',
        'text-sec':       'var(--color-text-secondary)',
        'text-ter':       'var(--color-text-tertiary)',
        'text-info':      'var(--color-text-info)',
        'text-success':   'var(--color-text-success)',
        'text-warning':   'var(--color-text-warning)',
        'text-danger':    'var(--color-text-danger)',
        'border-ter':     'var(--color-border-tertiary)',
        'border-sec':     'var(--color-border-secondary)',
        'border-info':    'var(--color-border-info)',
        'border-success': 'var(--color-border-success)',
        'border-warning': 'var(--color-border-warning)',
        'border-danger':  'var(--color-border-danger)',
      },
      fontFamily: {
        sans: 'var(--font-sans)',
        mono: 'var(--font-mono)',
      },
      borderRadius: {
        md: 'var(--border-radius-md)',
        lg: 'var(--border-radius-lg)',
        xl: 'var(--border-radius-xl)',
      },
    },
  },
  plugins: [],
};
```

**Why**: The CSS custom properties defined in `index.css` were only accessible
via raw `var(--color-*)` syntax. Registering them as Tailwind theme tokens
allows components to use them as utility classes (e.g. `bg-bg-primary`,
`text-text-info`, `border-border-ter`) and ensures Tailwind's purge scan
retains them in the production build.

---

### 3. `frontend/src/shell/AppShell.tsx` — replaced hardcoded colours

Replaced `className="flex h-screen flex-col bg-slate-50 text-slate-900"` with
inline styles using the design system CSS variables:

```tsx
<div style={{
  display: 'flex',
  height: '100vh',
  flexDirection: 'column',
  background: 'var(--color-background-tertiary)',
  color: 'var(--color-text-primary)',
}}>
```

**Why**: `bg-slate-50` and `text-slate-900` are hardcoded Tailwind palette
values that do not match the project's design system. Using `var(--color-*)`
directly ensures AppShell uses the same token values as every other component
in the tree.

---

## No Other Files Modified

No other component files were changed in this spec. `vite.config.ts`,
`index.html`, `main.tsx`, and `index.css` were unchanged.

## Follow-up Note

The generated component tree may contain additional hardcoded Tailwind colour
classes (`slate-*`, `gray-*`, `zinc-*`) that do not reference the design system
tokens. A follow-up sweep of all component files under `frontend/src/` should
replace these with the registered token classes or inline `var(--color-*)`
references to achieve full visual consistency with the original mockup.