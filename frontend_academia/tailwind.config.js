/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1f6feb',
          foreground: '#ffffff',
        },
        danger: {
          DEFAULT: '#dc2626',
          foreground: '#ffffff',
        },
        muted: '#f5f5f5',
        border: '#e5e7eb',
      },
    },
  },
  plugins: [],
}