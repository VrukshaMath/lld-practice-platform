/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        canvas: {
          DEFAULT: '#faf9f5',
          subtle: '#f4f2eb',
          muted: '#ebe8df',
        },
        surface: {
          DEFAULT: '#ffffff',
          subtle: '#f9f8f4',
          raised: '#ffffff',
        },
        edge: {
          DEFAULT: '#e7e5df',
          subtle: '#efeee9',
          strong: '#cfccc3',
        },
        ink: {
          DEFAULT: '#1c1917',
          secondary: '#57534e',
          tertiary: '#8c857b',
          faint: '#b8b3a8',
        },
        accent: {
          DEFAULT: '#1c1917',
          hover: '#292524',
          subtle: '#f5f4ef',
        },
        tag: {
          greenBg: '#eef6ef',
          greenText: '#1b4d24',
          greenBorder: '#d4ebd6',
          amberBg: '#fbf5ea',
          amberText: '#78350f',
          amberBorder: '#f3e3c6',
          roseBg: '#fcf0ef',
          roseText: '#881337',
          roseBorder: '#f8d5d4',
          stoneBg: '#f4f2eb',
          stoneText: '#44403c',
          stoneBorder: '#e5e1d5',
        }
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}