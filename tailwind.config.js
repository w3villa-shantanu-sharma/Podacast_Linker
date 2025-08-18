/** @type {import('tailwindcss').Config} */
export default {
  // Configure files to scan for Tailwind classes
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  theme: {
    extend: {
      // Add custom color values here if needed
      colors: {
        // Custom colors can be added here if needed
      },
    },
  },

  // This is the crucial part: add DaisyUI as a plugin
  plugins: [
    require("daisyui")
  ],

  // Optional: You can customize which DaisyUI themes are available
  daisyui: {
    themes: [
      {
        light: {
          "primary": "#6366f1",
          "secondary": "#8b5cf6",
          "accent": "#ec4899",
          "neutral": "#2a2e37",
          "base-100": "#ffffff",
          "base-200": "#f8fafc",
          "base-300": "#f1f5f9",
          "base-content": "#1e293b",
          "info": "#3abff8",
          "success": "#36d399",
          "warning": "#fbbd23",
          "error": "#f87272",
        },
        dark: {
          "primary": "#818cf8",
          "secondary": "#a78bfa",
          "accent": "#f472b6",
          "neutral": "#1f2937",
          "base-100": "#1e293b",
          "base-200": "#0f172a",
          "base-300": "#020617",
          "base-content": "#f8fafc",
          "info": "#0ea5e9",
          "success": "#22c55e",
          "warning": "#f59e0b",
          "error": "#ef4444",
        },
        cupcake: {
          "primary": "#65c3c8",
          "secondary": "#ef9fbc",
          "accent": "#eeaf3a",
          "neutral": "#291334",
          "base-100": "#faf7f5",
          "base-200": "#efeae6",
          "base-300": "#e7e2df",
          "base-content": "#291334",
          "info": "#3abff8",
          "success": "#36d399",
          "warning": "#fbbd23",
          "error": "#f87272",
        }
      }
    ],
  },
}