/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        scanLine: {
          "0%, 100%": { transform: "translateY(-96px)" },
          "50%": { transform: "translateY(96px)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "scan-line": "scanLine 2s ease-in-out infinite",
        "fade-in": "fadeIn 0.15s ease-out",
      },
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
