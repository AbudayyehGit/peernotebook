/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: "#F8FAFC",
        card: "#FFFFFF",
        navy: "#1E3A8A",
        teal: {
          DEFAULT: "#0F766E",
          light: "#0D9488",
        },
        amber: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
        },
        accent: {
          DEFAULT: "#D97706",
          tint: "#FEF3C7",
          dark: "#B45309",
        },
        forest: {
          DEFAULT: "#16A34A",
          light: "#10B981",
        },
      },
    },
  },
  plugins: [],
};
