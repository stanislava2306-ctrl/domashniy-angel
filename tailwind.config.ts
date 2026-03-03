import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.25rem",
      screens: {
        "2xl": "1240px"
      }
    },
    extend: {
      colors: {
        border: "hsl(213 24% 88%)",
        input: "hsl(214 28% 95%)",
        ring: "hsl(208 74% 45%)",
        background: "hsl(210 38% 98%)",
        foreground: "hsl(218 36% 13%)",
        primary: {
          DEFAULT: "hsl(208 72% 44%)",
          foreground: "hsl(0 0% 100%)"
        },
        secondary: {
          DEFAULT: "hsl(210 38% 94%)",
          foreground: "hsl(220 32% 20%)"
        },
        muted: {
          DEFAULT: "hsl(214 34% 95%)",
          foreground: "hsl(215 13% 43%)"
        },
        accent: {
          DEFAULT: "hsl(33 96% 92%)",
          foreground: "hsl(24 50% 28%)"
        },
        destructive: {
          DEFAULT: "hsl(7 72% 53%)",
          foreground: "hsl(0 0% 100%)"
        },
        warm: {
          50: "#fff8f1",
          100: "#ffedd8",
          200: "#ffd5a8",
          300: "#ffbf81",
          400: "#f9a454",
          500: "#e9862f"
        }
      },
      borderRadius: {
        lg: "0.9rem",
        md: "0.6rem",
        sm: "0.4rem"
      },
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
