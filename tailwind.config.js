/** @type {import('@tailwindcss/postcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/styles/**/*.{css}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          orange: "#FE9860",
          purple: "#7064B9",
          mint: "#64C7B7",
          blue: "#4F68A2",
        },
        text: {
          light: "#E7DED9",
          medium: "#D3D3D2",
          dark: "#BDBDBB",
        },
        stroke: {
          orange: "#D7A666",
          purple: "#7B6AC5",
          mint: "#6FCCC5",
          blue: "#576EB3",
        },
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
