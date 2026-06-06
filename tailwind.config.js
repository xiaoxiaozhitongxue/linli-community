/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./pages/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF8C42',
          light: '#FFB380',
          dark: '#E67730'
        },
        accent: {
          DEFAULT: '#4CAF50',
          light: '#81C784',
          dark: '#388E3C'
        },
        background: '#F5F5F0'
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px'
      }
    },
  },
  plugins: [],
}
