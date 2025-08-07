/** @type {import('tailwindcss').Config} */
export default {
  // Configure files to scan for Tailwind classes
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  theme: {
    extend: {},
  },

  // This is the crucial part: add DaisyUI as a plugin
  plugins: [
    require("daisyui")
  ],

  // Optional: You can customize which DaisyUI themes are available
  daisyui: {
    themes: ["light", "dark", "cupcake"],
  },
}