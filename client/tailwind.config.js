/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#1A1A1A',
          light: '#4A4A4A',
          muted: '#8A8A8A',
        },
        cream: {
          DEFAULT: '#FAF7F2',
          warm: '#F5F0E8',
          deep: '#EDE8DD',
        },
        paper: '#FFFFFF',
        accent: {
          DEFAULT: '#2D2D2D',
          hover: '#404040',
        },
        success: {
          DEFAULT: '#2D6A4F',
          bg: '#E8F5E9',
        },
        warning: {
          DEFAULT: '#B8860B',
          bg: '#FFF8E1',
        },
        danger: {
          DEFAULT: '#8B2500',
          bg: '#FFEBEE',
        },
        info: {
          DEFAULT: '#37474F',
        },
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
