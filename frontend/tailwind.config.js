/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        foreground: "#ffffff",
        primary: {
          DEFAULT: "#22c55e",
          foreground: "#000000",
        },
        muted: {
          DEFAULT: "#171717",
          foreground: "#a3a3a3",
        },
        border: "#262626",
        destructive: "#ef4444",
        warning: "#eab308",
      },
    },
  },
  plugins: [],
};
