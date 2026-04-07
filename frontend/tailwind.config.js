/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        jar: {
          bg: '#1a1714',
          dark: '#0f0d0a',
          orange: '#ff9843',
          text: '#f0ece4',
          muted: 'rgba(240,236,228,0.55)',
        }
      },
      fontFamily: {
        sans: ['SF Pro Text', 'PingFang SC', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
