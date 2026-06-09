/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FBF6EC",
        sand: "#F3E9D7",
        maroon: {
          DEFAULT: "#7B2D26",
          dark: "#5E211C",
        },
        gold: {
          DEFAULT: "#C39A4B",
          light: "#E8C77E",
        },
        ink: "#2B231E",
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', "serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(91, 33, 28, 0.25)",
      },
    },
  },
  plugins: [],
};
