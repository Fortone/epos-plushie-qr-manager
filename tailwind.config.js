/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#FFC9E3',
          DEFAULT: '#FFB6D9',
          dark: '#FF8EC2',
        },
        secondary: {
          light: '#FDEAF7',
          DEFAULT: '#FCD7EF',
          dark: '#FAC1E8',
        },
      },
    },
  },
  plugins: [],
};