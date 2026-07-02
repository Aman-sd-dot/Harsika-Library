/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7ff',
          100: '#ebf0ff',
          200: '#d6e0ff',
          300: '#b3c5ff',
          400: '#85a0ff',
          500: '#4d6eff',
          600: '#2b47fc',
          700: '#1e30e6',
          800: '#1c28bc',
          900: '#1b2796',
          950: '#11175c',
        },
      },
    },
  },
  plugins: [],
}
