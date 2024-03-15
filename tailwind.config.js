/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      height: {
        '128': '32rem',
        '144': '36rem',
      },
      screens: {
        desktop: { raw: "(min-width: 601px)" },
        // => @media (min-height: 800px) { ... }
        mobile: { 'max': '600px' }
        // => @media (max-width: 600px) { ... }
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
