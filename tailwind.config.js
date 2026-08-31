/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#090d16',
          panel: '#0e1726',
          border: '#1b2a4a',
          hover: '#172642',
          cyan: '#00f0ff',
          emerald: '#00ff9d',
          red: '#ff0055',
          amber: '#ffb700',
          purple: '#b026ff',
          blue: '#1d89ff',
          text: '#e2e8f0',
          muted: '#64748b'
        }
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 240, 255, 0.25)',
        'glow-red': '0 0 20px rgba(255, 0, 85, 0.3)',
        'glow-emerald': '0 0 20px rgba(0, 255, 157, 0.25)',
        'glow-amber': '0 0 20px rgba(255, 183, 0, 0.25)',
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-scan': 'scan 4s linear infinite',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        }
      }
    },
  },
  plugins: [],
}
