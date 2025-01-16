import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/sections/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
       padding: {
        DEFAULT: "20px",
        sm: "40px", // Mobile
        md: "56px", // Tablet
        lg: "100px", // Slightly larger padding for desktop
      },
      screens: {
        sm: "500px", // Mobile
        md: "850px", // Tablet
        lg: "1300px", // Slightly larger width for desktop
      },
    },
    screens: {
      sm: "500px",
      md: "850px",
      lg: "1300px", // Matches container change
    },
    extend: {
      colors: {
        glowStart: "#190d2e", // Matches your `from` gradient color
        glowEnd: "#4a208a",   // Matches your `to` gradient color
      },
      boxShadow: {
        glow: "0px 0px 12px #8c45ff",
        insetGlow: "inset 0 0 10px rgba(140, 69, 255, 0.7)",
      },
      maskImage: {
        topFade: "linear-gradient(to top, black, transparent)",
        bottomFade: "linear-gradient(to bottom, black, transparent)",
      },
    },
  },
  plugins: [],
};
export default config;
