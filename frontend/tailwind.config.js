/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        soc: {
          bg: '#0B0F17',
          surface: '#111827',
          card: '#1F2937',
          border: '#374151',
          hover: '#2D3748',
          accent: '#3B82F6',
          cyan: '#06B6D4',
          critical: '#EF4444',
          high: '#F97316',
          medium: '#EAB308',
          low: '#3B82F6',
          success: '#10B981',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
