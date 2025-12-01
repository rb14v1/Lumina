/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // <-- This scans your React files
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'), // <-- THIS is where the plugin goes
  ],
}