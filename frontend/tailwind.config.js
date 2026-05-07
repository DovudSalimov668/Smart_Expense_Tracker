/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 18px 48px -32px rgba(15, 23, 42, 0.28)",
        premium: "0 24px 70px -44px rgba(15, 23, 42, 0.5)",
      },
    },
  },
  plugins: [],
};
