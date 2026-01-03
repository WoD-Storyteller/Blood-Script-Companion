/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        blood: "#8b0000",
        ash: "#1c1c1c",
        parchment: "#f5f0e6"
      }
    }
  },
  plugins: [],
}
