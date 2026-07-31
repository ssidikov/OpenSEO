import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        apple: {
          bg: "#FBFBFD",
          card: "rgba(255, 255, 255, 0.75)",
          border: "rgba(226, 232, 240, 0.8)",
          text: "#1D1D1F",
          muted: "#86868B",
          blue: "#0071E3",
          "blue-hover": "#0058B3",
          green: "#34C759",
          orange: "#FF9500",
          red: "#FF3B30",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)",
        "glass-hover": "0 12px 40px 0 rgba(0, 0, 0, 0.08), 0 2px 4px 0 rgba(0, 0, 0, 0.03)",
        glow: "0 0 25px -5px rgba(0, 113, 227, 0.25)",
      },
      backdropBlur: {
        glass: "20px",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "pulse-glow": "pulseGlow 3s infinite ease-in-out",
      },
    },
  },
  plugins: [],
};

export default config;
