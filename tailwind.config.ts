import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@tremor/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    transparent: 'transparent',
    current: 'currentColor',
    extend: {
      colors: {
        background: 'rgb(var(--background-rgb))',
        foreground: 'rgb(var(--foreground-rgb))',
        tremor: {
          brand: {
            faint: '#eff6ff',
            muted: '#bfdbfe',
            subtle: '#60a5fa',
            DEFAULT: '#3b82f6',
            emphasis: '#1d4ed8',
            inverted: '#ffffff',
          },
          background: {
            muted: '#131A2B',
            subtle: '#1f2937',
            DEFAULT: '#111827',
            emphasis: '#0a0a0a',
          },
          border: {
            DEFAULT: 'rgba(255, 255, 255, 0.1)',
          },
          ring: {
            DEFAULT: 'rgba(255, 255, 255, 0.1)',
          },
          content: {
            subtle: '#4b5563',
            DEFAULT: '#6b7280',
            emphasis: '#e5e7eb',
            strong: '#f9fafb',
            inverted: '#000000',
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tremor/react/plugin'),
  ],
  darkMode: 'class',
}

export default config 