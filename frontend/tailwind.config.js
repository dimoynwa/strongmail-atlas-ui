/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  safelist: [{ pattern: /.*/ }],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        'bg-primary':     'var(--color-background-primary)',
        'bg-secondary':   'var(--color-background-secondary)',
        'bg-tertiary':    'var(--color-background-tertiary)',
        'bg-info':        'var(--color-background-info)',
        'bg-success':     'var(--color-background-success)',
        'bg-warning':     'var(--color-background-warning)',
        'bg-danger':      'var(--color-background-danger)',
 
        // Text
        'text-pri':       'var(--color-text-primary)',
        'text-sec':       'var(--color-text-secondary)',
        'text-ter':       'var(--color-text-tertiary)',
        'text-info':      'var(--color-text-info)',
        'text-success':   'var(--color-text-success)',
        'text-warning':   'var(--color-text-warning)',
        'text-danger':    'var(--color-text-danger)',
 
        // Borders
        'border-ter':     'var(--color-border-tertiary)',
        'border-sec':     'var(--color-border-secondary)',
        'border-pri':     'var(--color-border-primary)',
        'border-info':    'var(--color-border-info)',
        'border-success': 'var(--color-border-success)',
        'border-warning': 'var(--color-border-warning)',
        'border-danger':  'var(--color-border-danger)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
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