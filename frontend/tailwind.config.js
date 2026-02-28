/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        google: {
          blue: '#4285f4',
          green: '#34a853',
          yellow: '#f9ab00',
          red: '#ea4335',
          'blue-pastel': '#c3ecf6',
          'green-pastel': '#ccf6c5',
          'yellow-pastel': '#ffe7a5',
          'red-pastel': '#f8d8d8',
          'off-white': '#f0f0f0',
          black: '#1e1e1e',
        },
      },
      fontFamily: {
        google: ['GoogleSans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'google-text': ['GoogleSansText', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'google-mono': ['GoogleSansMono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
        modal: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        card: '20px',
        'card-lg': '24px',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.4 },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        fadeUp: 'fadeUp 0.5s ease forwards',
        bounce: 'bounce 1s ease infinite',
      },
    },
  },
  plugins: [],
}
