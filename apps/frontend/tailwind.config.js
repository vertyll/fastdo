/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'selector',
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        // Primary brand colors
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },

        // Secondary accent color
        secondary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },

        // Neutral colors
        neutral: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },

        // Status colors with full palettes
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        info: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },

        // Semantic colors
        text: {
          primary: '#111827',
          secondary: '#6b7280',
          muted: '#9ca3af',
        },

        // Background colors
        background: {
          primary: '#ffffff',
          secondary: '#f9fafb',
          tertiary: '#f3f4f6',
        },

        // Surface colors (for cards, panels, etc.)
        surface: {
          primary: '#ffffff', // White surface
          secondary: '#f9fafb', // Light gray surface
          elevated: '#ffffff', // Elevated surface (modals, dropdowns)
        },

        // Border colors
        border: {
          primary: '#e5e7eb', // Light border
          secondary: '#d1d5db', // Medium border
          focus: '#f97316', // Focus border
        },

        // Link colors
        link: {
          primary: '#0ea5e9', // Sky blue for primary links
          hover: '#0284c7', // Darker sky blue for hover
          visited: '#7c3aed', // Purple for visited links
        },

        // Dark mode specific colors
        dark: {
          text: {
            primary: '#f9fafb', // Light text for dark mode
            secondary: '#d1d5db', // Light gray text for dark mode
            muted: '#9ca3af', // Muted text for dark mode
          },
          background: {
            primary: '#1f2937', // Dark gray background
            secondary: '#374151', // Medium dark gray
            tertiary: '#4b5563', // Lighter dark gray
          },
          surface: {
            primary: '#374151', // Dark surface
            secondary: '#4b5563', // Lighter dark surface
            elevated: '#374151', // Elevated dark surface
          },
          border: {
            primary: '#4b5563', // Dark border
            secondary: '#6b7280', // Lighter dark border
          },
          link: {
            primary: '#38bdf8', // Lighter sky blue for dark mode
            hover: '#0ea5e9', // Medium sky blue for dark mode hover
            visited: '#a855f7', // Lighter purple for visited in dark mode
          },
        },
      },

      // Custom spacing values
      spacing: {
        'spacing-1': '0.25rem', // 4px
        'spacing-2': '0.5rem', // 8px
        'spacing-3': '0.75rem', // 12px
        'spacing-4': '1rem', // 16px
        'spacing-5': '1.25rem', // 20px
        'spacing-6': '1.5rem', // 24px
        'spacing-8': '2rem', // 32px
        'spacing-10': '2.5rem', // 40px
        'spacing-12': '3rem', // 48px
        'spacing-16': '4rem', // 64px
        'spacing-20': '5rem', // 80px
        'spacing-24': '6rem', // 96px
        18: '4.5rem', // 72px
        88: '22rem', // 352px
      },

      // Custom border radius values
      borderRadius: {
        'borderRadius-sm': '0.125rem', // 2px
        'borderRadius-base': '0.25rem', // 4px
        'borderRadius-md': '0.375rem', // 6px
        'borderRadius-lg': '0.5rem', // 8px
        'borderRadius-xl': '0.75rem', // 12px
        'borderRadius-2xl': '1rem', // 16px
        'borderRadius-3xl': '1.5rem', // 24px
        'borderRadius-full': '9999px', // Full rounded
      },

      // Custom box shadows
      boxShadow: {
        'boxShadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'boxShadow-base': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'boxShadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'boxShadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'boxShadow-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        soft: '0 2px 8px 0 rgba(0, 0, 0, 0.12)',
        medium: '0 4px 12px 0 rgba(0, 0, 0, 0.15)',
        strong: '0 8px 24px 0 rgba(0, 0, 0, 0.2)',
      },

      // Custom transitions
      transitionDuration: {
        'transitionDuration-75': '75ms',
        'transitionDuration-100': '100ms',
        'transitionDuration-150': '150ms',
        'transitionDuration-200': '200ms',
        'transitionDuration-300': '300ms',
        'transitionDuration-500': '500ms',
        'transitionDuration-700': '700ms',
        'transitionDuration-1000': '1000ms',
        400: '400ms',
      },

      // Animation keyframes
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },

      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
