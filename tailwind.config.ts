import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Core Palette based on SquadRidge Brand Story
        navy: {
          DEFAULT: '#0A0F1E', // Deep Navy - Primary background
          light: '#1A202C',  // Dark Gray - Secondary background
          dark: '#05080F',
        },
        teal: {
          DEFAULT: '#0E9AA7', // Teal - Primary accent/interactive
          light: '#2CB8C5',
          dark: '#0A7A85',
        },
        amber: {
          DEFAULT: '#F5A623', // Amber - Warnings/Interventions
          light: '#F7C15C',
          dark: '#C2821A',
        },
        gray: {
          light: '#E2E8F0', // Secondary text/borders
        }
      },
      fontFamily: {
        // Typography based on SquadRidge Brand Story
        sans: ['DM Sans', 'sans-serif'], // Body text
        heading: ['Space Grotesk', 'sans-serif'], // Headings
      },
      fontSize: {
        // Fluid typography using clamp() for modern scaling
        'fluid-h1': 'clamp(2rem, 5vw, 3rem)',
        'fluid-h2': 'clamp(1.5rem, 4vw, 2.5rem)',
        'fluid-h3': 'clamp(1.25rem, 3vw, 2rem)',
        'fluid-body': 'clamp(1rem, 1.5vw, 1.125rem)',
        'fluid-small': 'clamp(0.875rem, 1vw, 1rem)',
      },
      spacing: {
        // Consistent spacing system
        'xs': '0.25rem',
        'sm': '0.5rem',
        'md': '1rem',
        'lg': '1.5rem',
        'xl': '2rem',
        '2xl': '3rem',
      },
      boxShadow: {
        // Neo-skeuomorphism shadows for buttons and interactive elements
        'neo-button': '4px 4px 10px rgba(0, 0, 0, 0.5), -4px -4px 10px rgba(255, 255, 255, 0.05)',
        'neo-button-active': 'inset 4px 4px 10px rgba(0, 0, 0, 0.5), inset -4px -4px 10px rgba(255, 255, 255, 0.05)',
      },
      animation: {
        // Subtle animations for de-escalation interventions
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
} satisfies Config;
