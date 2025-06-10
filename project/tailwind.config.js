/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        broadcast: {
          primary: '#0f172a',
          secondary: '#1e293b',
          accent: '#3b82f6',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          muted: '#64748b'
        },
        audio: {
          safe: '#10b981',
          caution: '#f59e0b',
          danger: '#ef4444',
          peak: '#dc2626'
        }
      },
      animation: {
        'audio-pulse': 'audio-pulse 0.5s ease-in-out infinite alternate',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.2s ease-out'
      },
      keyframes: {
        'audio-pulse': {
          '0%': { opacity: '0.7' },
          '100%': { opacity: '1' }
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      }
    },
  },
  plugins: [],
}