/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6B35',
          light: '#FF8A5C',
          dark: '#E55A2B'
        },
        accent: {
          DEFAULT: '#FFD93D',
          light: '#FFE680',
          dark: '#E6C21A'
        },
        secondary: {
          DEFAULT: '#4ECDC4',
          light: '#6EDDD4',
          dark: '#3BB5AD'
        },
        background: '#F8F9FD'
      },
      borderRadius: {
        'sm': '6px',
        'md': '10px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '28px'
      }
    },
  },
  plugins: [],
}
