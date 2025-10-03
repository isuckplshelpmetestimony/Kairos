/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Kairos custom colors
        'kairos-chalk': '#FFFFFC',
        'kairos-white-porcelain': '#F8FBF8',
        'kairos-deutzia-flower': '#F7FCFE',
        'kairos-base-color': '#EAE5E3',
        'kairos-white-grey': '#DCDDDD',
        'kairos-charcoal': '#2C2C2C',
        'kairos-soft-black': '#1A1A1A',
      },
      fontFamily: {
        'futura': ['Futura', 'Avenir', 'system-ui', 'sans-serif'],
        'avenir': ['Avenir', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
