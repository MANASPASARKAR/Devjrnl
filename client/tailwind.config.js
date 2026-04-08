export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Brand colors
        primary:   "#A8FF3E",
        secondary: "#4AF0FF",
        tertiary:  "#FFB300",
        neutral:   "#0A0A0A",

        // Surfaces (dark backgrounds)
        surface: {
          DEFAULT: "#131313",
          low:     "#1C1B1B",
          high:    "#2A2A2A",
          highest: "#353534",
        },

        // Text
        "on-surface":         "#E5E2E1",
        "on-surface-variant": "#C0CAAF",

        // Borders
        outline:         "#8B947C",
        "outline-variant": "#414A35",

        // On-color (text on top of primary green)
        "on-primary": "#0F2000",
      },

      fontFamily: {
        headline: ["Inter", "sans-serif"],
        body:     ["Inter", "sans-serif"],
        label:    ["Space Grotesk", "sans-serif"],
        mono:     ["JetBrains Mono", "monospace"],
      },

      borderRadius: {
        none: "0",
        DEFAULT: "0",
        lg: "0",
        xl: "0",
        full: "9999px",
      },
    },
  },
  plugins: [],
}