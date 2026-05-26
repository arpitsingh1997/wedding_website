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
        ivory: "#F4EFE6",
        "blush-ivory": "#F3E9E6",
        blush: {
          50: "#FBF4F2",
          100: "#F5E6E3",
          200: "#E8D4D0",
          300: "#D4B5AE",
        },
        gold: {
          muted: "#C4A574",
          light: "#D9C4A0",
        },
        ink: {
          soft: "#5C4A42",
          deep: "#3D322C",
        },
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "Georgia", "serif"],
        body: ["var(--font-cormorant)", "Georgia", "serif"],
        script: ["var(--font-pinyon)", "cursive"],
      },
      animation: {
        shimmer: "shimmer 8s ease-in-out infinite",
        float: "float 12s ease-in-out infinite",
      },
      keyframes: {
        shimmer: {
          "0%, 100%": { opacity: "0.03" },
          "50%": { opacity: "0.08" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-8px) scale(1.01)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
