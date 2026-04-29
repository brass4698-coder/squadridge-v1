import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Core Palette based on SquadRidge Brand Story
        navy: {
          DEFAULT: '#0b0f1a',
          light: '#0d1117',
          dark: '#05080f',
        },
        teal: {
          DEFAULT: '#00c2b2',
          light: '#33d4c7',
          dark: '#009e91',
        },
        amber: {
          DEFAULT: '#F5A623', // Amber - Warnings/Interventions
          light: '#F7C15C',
          dark: '#C2821A',
        },
        /** Warm amber for security / observability pulses (HUD) */
        cajun: {
          DEFAULT: '#c2410c',
          light: '#ea580c',
          glow: 'rgba(234, 88, 12, 0.45)',
        },
        gray: {
          light: '#E2E8F0', // Secondary text/borders
        },
        charcoal: {
          DEFAULT: '#121a2e',
          deep: '#0c1220',
        },
        landing: {
          body: '#a8b2c1',
          muted: '#6b7280',
          quote: '#e2e8f0',
          attribution: '#4b5563',
          step: '#1e2d3d',
          ink: '#f1f5f9',
          border: '#2d3748',
        },
        /**
         * Semantic text — four clear levels (primary → muted).
         * `faint` is the new token-backed step between `secondary` and `subtle`,
         * preferred by post-redesign primitives. Existing names stay stable.
         */
        ink: {
          DEFAULT: '#f1f5f9',
          secondary: '#a8b2c1',
          faint: 'var(--sr-ink-faint)',
          muted: '#6b7280',
          subtle: '#475569',
        },
        /** shadcn tokens (scoped under `.dark.onboarding-page-root` in onboarding.css) */
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        'input-background': 'var(--input-background)',
        onboarding: {
          bg: '#0a0f1a',
          card: '#0c1219',
          chrome: '#0a0f1a',
          accent: '#c9a66b',
        },
        /** Card / panel fill (onboarding shell, dense surfaces) */
        surface: {
          DEFAULT: 'var(--sr-bg)',
          elevated: 'var(--sr-bg-elevated)',
          secondary: 'var(--sr-bg-secondary)',
          sunken: 'var(--sr-bg-sunken)',
          /** Legacy onboarding fill — kept as a static fallback. */
          legacy: '#0c1219',
        },
        line: {
          DEFAULT: 'var(--sr-line)',
          strong: 'var(--sr-line-strong)',
          divider: 'var(--sr-divider)',
        },
        /** Restrained brand accent (slate-teal) — single primary across UI. */
        brand: {
          DEFAULT: 'var(--sr-primary)',
          hover: 'var(--sr-primary-hover)',
          pressed: 'var(--sr-primary-pressed)',
          soft: 'var(--sr-primary-soft)',
          ring: 'var(--sr-primary-ring)',
          on: 'var(--sr-on-primary)',
        },
        /** Semantic statuses — text/border/icon, not decorative fills. */
        sem: {
          success: 'var(--sr-success)',
          'success-soft': 'var(--sr-success-soft)',
          warning: 'var(--sr-warning)',
          'warning-soft': 'var(--sr-warning-soft)',
          danger: 'var(--sr-danger)',
          'danger-soft': 'var(--sr-danger-soft)',
          info: 'var(--sr-info)',
          'info-soft': 'var(--sr-info-soft)',
        },
      },
      fontFamily: {
        /** Body / UI — operational, legible at 16px+. */
        sans: ['"IBM Plex Sans"', '"Public Sans"', 'system-ui', 'sans-serif'],
        /** Reserved for marketing H1/H2 and rare product heroes. */
        display: ['"IBM Plex Serif"', '"IBM Plex Sans"', 'Georgia', 'serif'],
        /** Legacy alias — `font-heading` keeps building. New code prefers `font-sans`. */
        heading: ['"IBM Plex Sans"', '"Public Sans"', 'system-ui', 'sans-serif'],
        /** Ledger refs, timestamps, codes. */
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        // Fluid typography using clamp() for modern scaling
        'fluid-h1': 'clamp(2.75rem, 4vw, 3.75rem)',
        'fluid-h2': [
          'clamp(1.75rem, 3vw, 2.25rem)',
          { lineHeight: '1.25', letterSpacing: '-0.015em' },
        ],
        'fluid-h3': 'clamp(1.2rem, 2vw, 1.5rem)',
        'fluid-h4': 'clamp(1rem, 1.5vw, 1.125rem)',
        'fluid-body': 'clamp(1rem, 1.5vw, 1.125rem)',
        'fluid-small': 'clamp(0.875rem, 1vw, 1rem)',
        /** Landing hero display (~56–64px desktop), tight line height */
        'display-hero': [
          'clamp(2.875rem, 4.5vw + 1.25rem, 4rem)',
          { lineHeight: '1.08', letterSpacing: '-0.03em' },
        ],
        /** Section titles ~20–24px */
        'section-title': [
          'clamp(1.25rem, 1.5vw, 1.5rem)',
          { lineHeight: '1.25', letterSpacing: '-0.015em' },
        ],
        /** Early access card title ~28–30px */
        'early-access': [
          'clamp(1.75rem, 1.5vw + 0.85rem, 1.875rem)',
          { lineHeight: '1.2', letterSpacing: '-0.02em' },
        ],
        /** Secondary / dev section titles — below product sections */
        'section-muted': [
          'clamp(1.125rem, 1.2vw + 0.75rem, 1.375rem)',
          { lineHeight: '1.3', letterSpacing: '-0.01em' },
        ],
        /** Body emphasis 16–18px */
        'body-lg': ['clamp(1rem, 0.35vw + 0.92rem, 1.125rem)', { lineHeight: '1.7' }],
        /** Onboarding / dense UI body */
        'onboarding-body': ['clamp(0.9375rem, 1.05vw, 1rem)', { lineHeight: '1.7' }],
        /** Onboarding captions, footnotes, reassurance lines */
        'onboarding-meta': ['clamp(0.8125rem, 0.95vw, 0.875rem)', { lineHeight: '1.65' }],
      },
      spacing: {
        // Consistent spacing system
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
        /** ~72px between major landing sections */
        section: '4.5rem',
        /** ~48px — tight blocks (sub-sections) */
        'section-sm': '3rem',
        /** ~96px — major vertical breaks */
        'section-lg': '6rem',
        /** ~40px heading → body */
        'heading-body': '2.5rem',
        /** ~24px body → CTAs */
        'body-cta': '1.5rem',
        /** Horizontal page gutter: scales 16px → 32px by viewport */
        gutter: 'clamp(1rem, 5vw, 2rem)',
      },
      maxWidth: {
        /** ~640px reading column */
        copy: '40rem',
      },
      boxShadow: {
        // Neo-skeuomorphism shadows for buttons and interactive elements
        'neo-button': '4px 4px 10px rgba(0, 0, 0, 0.5), -4px -4px 10px rgba(255, 255, 255, 0.05)',
        'neo-button-active':
          'inset 4px 4px 10px rgba(0, 0, 0, 0.5), inset -4px -4px 10px rgba(255, 255, 255, 0.05)',
      },
      keyframes: {
        'step-in': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'step-in-body': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scan: {
          '0%': { top: '-1px' },
          '100%': { top: '100%' },
        },
        'security-pulse': {
          '0%, 100%': {
            boxShadow: '0 0 0 0 rgba(234, 88, 12, 0.35)',
            opacity: '1',
          },
          '50%': {
            boxShadow: '0 0 24px 6px rgba(234, 88, 12, 0.35)',
            opacity: '0.95',
          },
        },
        'security-breathe': {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
        'session-scan': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'step-in': 'step-in 400ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'step-in-body': 'step-in-body 420ms cubic-bezier(0.16, 1, 0.3, 1) 90ms both',
        scan: 'scan 8s linear infinite',
        'security-pulse': 'security-pulse 2.4s ease-in-out infinite',
        'security-breathe': 'security-breathe 3s ease-in-out infinite',
        'session-scan': 'session-scan 1.05s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        /** Ambient UI pulses — prefer these over ad-hoc durations */
        'pulse-ambient': 'security-pulse 2.4s ease-in-out infinite',
        'pulse-ambient-slow': 'security-pulse 3.2s ease-in-out infinite',
        'pulse-ambient-fast': 'security-pulse 1.6s ease-in-out infinite',
      },
      transitionDuration: {
        progress: '220ms',
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
