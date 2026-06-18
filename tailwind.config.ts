import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Legacy palette (keep for backward compat with existing components) ──
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
          DEFAULT: '#F5A623',
          light: '#F7C15C',
          dark: '#C2821A',
        },
        cajun: {
          DEFAULT: '#c2410c',
          light: '#ea580c',
          glow: 'rgba(234, 88, 12, 0.45)',
        },
        gray: {
          light: '#E2E8F0',
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
        ink: {
          DEFAULT: '#f1f5f9',
          secondary: '#a8b2c1',
          faint: 'var(--sr-ink-faint)',
          muted: '#6b7280',
          subtle: '#475569',
        },
        // ── shadcn tokens (onboarding scope) ─────────────────────────────
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
        // ── Token-backed semantic aliases (prefer these in new components) ─
        /** Surfaces — map directly to --sr-bg-* tokens */
        surface: {
          DEFAULT:   'var(--sr-bg)',
          elevated:  'var(--sr-bg-elevated)',
          secondary: 'var(--sr-bg-secondary)',
          sunken:    'var(--sr-bg-sunken)',
          accent:    'var(--sr-bg-accent)',
          /** Legacy static fallback (onboarding) */
          legacy: '#0c1219',
        },
        /** Lines / borders */
        line: {
          DEFAULT: 'var(--sr-line)',
          strong:  'var(--sr-line-strong)',
          divider: 'var(--sr-divider)',
          alpha:   'var(--sr-border-alpha)',
        },
        /** Primary brand accent */
        brand: {
          DEFAULT: 'var(--sr-primary)',
          hover:   'var(--sr-primary-hover)',
          pressed: 'var(--sr-primary-pressed)',
          soft:    'var(--sr-primary-soft)',
          ring:    'var(--sr-primary-ring)',
          on:      'var(--sr-on-primary)',
        },
        /** Semantic statuses — text/border/icon only, not decorative fills */
        sem: {
          success:       'var(--sr-success)',
          'success-soft':'var(--sr-success-soft)',
          warning:       'var(--sr-warning)',
          'warning-soft':'var(--sr-warning-soft)',
          danger:        'var(--sr-danger)',
          'danger-soft': 'var(--sr-danger-soft)',
          info:          'var(--sr-info)',
          'info-soft':   'var(--sr-info-soft)',
        },
      },

      fontFamily: {
        sans:    ['"IBM Plex Sans"',  '"Public Sans"', 'system-ui', 'sans-serif'],
        display: ['"IBM Plex Serif"', '"IBM Plex Sans"', 'Georgia', 'serif'],
        heading: ['"IBM Plex Sans"',  '"Public Sans"', 'system-ui', 'sans-serif'],
        mono:    ['"IBM Plex Mono"',  'ui-monospace', 'SFMono-Regular', 'monospace'],
      },

      fontSize: {
        'fluid-h1':        'clamp(2.75rem, 4vw, 3.75rem)',
        'fluid-h2':        ['clamp(1.75rem, 3vw, 2.25rem)',    { lineHeight: '1.25', letterSpacing: '-0.015em' }],
        'fluid-h3':        'clamp(1.2rem, 2vw, 1.5rem)',
        'fluid-h4':        'clamp(1rem, 1.5vw, 1.125rem)',
        'fluid-body':      'clamp(1rem, 1.5vw, 1.125rem)',
        'fluid-small':     'clamp(0.875rem, 1vw, 1rem)',
        'display-hero':    ['clamp(2.875rem, 4.5vw + 1.25rem, 4rem)', { lineHeight: '1.08', letterSpacing: '-0.03em' }],
        'section-title':   ['clamp(1.25rem, 1.5vw, 1.5rem)',          { lineHeight: '1.25', letterSpacing: '-0.015em' }],
        'early-access':    ['clamp(1.75rem, 1.5vw + 0.85rem, 1.875rem)', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'section-muted':   ['clamp(1.125rem, 1.2vw + 0.75rem, 1.375rem)', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'body-lg':         ['clamp(1rem, 0.35vw + 0.92rem, 1.125rem)', { lineHeight: '1.7' }],
        'onboarding-body': ['clamp(0.9375rem, 1.05vw, 1rem)',          { lineHeight: '1.7' }],
        'onboarding-meta': ['clamp(0.8125rem, 0.95vw, 0.875rem)',      { lineHeight: '1.65' }],
      },

      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
        section:       '4.5rem',
        'section-sm':  '3rem',
        'section-lg':  '6rem',
        'heading-body':'2.5rem',
        'body-cta':    '1.5rem',
        gutter:        'clamp(1rem, 5vw, 2rem)',
      },

      maxWidth: {
        copy: '40rem',
      },

      borderRadius: {
        xs:   'var(--sr-radius-xs)',
        sm:   'var(--sr-radius-sm)',
        md:   'var(--sr-radius-md)',
        lg:   'var(--sr-radius-lg)',
        xl:   'var(--sr-radius-xl)',
        full: 'var(--sr-radius-full)',
      },

      boxShadow: {
        'neo-button':       '4px 4px 10px rgba(0,0,0,0.5), -4px -4px 10px rgba(255,255,255,0.05)',
        'neo-button-active':'inset 4px 4px 10px rgba(0,0,0,0.5), inset -4px -4px 10px rgba(255,255,255,0.05)',
        'sr-xs': 'var(--sr-shadow-xs)',
        'sr-sm': 'var(--sr-shadow-sm)',
        'sr-md': 'var(--sr-shadow-md)',
        'sr-lg': 'var(--sr-shadow-lg)',
        'focus': 'var(--sr-focus-ring)',
      },

      transitionTimingFunction: {
        spring:   'cubic-bezier(0.16, 1, 0.3, 1)',
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
        standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      transitionDuration: {
        fast:     'var(--sr-duration-fast)',
        normal:   'var(--sr-duration-normal)',
        slow:     'var(--sr-duration-slow)',
        xslow:    'var(--sr-duration-xslow)',
        progress: '220ms',
      },

      keyframes: {
        'step-in': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'step-in-body': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        scan: {
          '0%':   { top: '-1px' },
          '100%': { top: '100%' },
        },
        'security-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(234,88,12,0.35)',     opacity: '1' },
          '50%':      { boxShadow: '0 0 24px 6px rgba(234,88,12,0.35)', opacity: '0.95' },
        },
        'security-breathe': {
          '0%, 100%': { opacity: '0.55' },
          '50%':      { opacity: '1' },
        },
        'session-scan': {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(16px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
      },

      animation: {
        'pulse-slow':           'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'step-in':              'step-in 400ms cubic-bezier(0.16,1,0.3,1) both',
        'step-in-body':         'step-in-body 420ms cubic-bezier(0.16,1,0.3,1) 90ms both',
        scan:                   'scan 8s linear infinite',
        'security-pulse':       'security-pulse 2.4s ease-in-out infinite',
        'security-breathe':     'security-breathe 3s ease-in-out infinite',
        'session-scan':         'session-scan 1.05s cubic-bezier(0.4,0,0.2,1) forwards',
        'pulse-ambient':        'security-pulse 2.4s ease-in-out infinite',
        'pulse-ambient-slow':   'security-pulse 3.2s ease-in-out infinite',
        'pulse-ambient-fast':   'security-pulse 1.6s ease-in-out infinite',
        'fade-in':              'fade-in 300ms cubic-bezier(0.16,1,0.3,1) both',
        'slide-up':             'slide-up 400ms cubic-bezier(0.16,1,0.3,1) both',
        'slide-in-right':       'slide-in-right 350ms cubic-bezier(0.16,1,0.3,1) both',
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
