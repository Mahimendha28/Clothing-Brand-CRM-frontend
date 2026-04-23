/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        page: "var(--color-page)",
        canvas: "var(--color-canvas)",
        input: "var(--color-input)",
        primary: "var(--color-primary)",
        accent: "var(--color-accent)",
        "text-primary": "var(--color-text-primary)",
        secondary: "var(--color-text-secondary)",
        muted: "var(--color-text-muted)",
        soft: "var(--color-soft)",
        strong: "var(--color-strong)",
        success: "var(--color-success)",
        danger: "var(--color-danger)"
      },
      fontFamily: {
        display: ['"Poppins"', "sans-serif"],
        serif: ['"Inter"', "sans-serif"],
        poppins: ['"Poppins"', "sans-serif"],
        sans: ['"Inter"', "sans-serif"]
      },
      borderRadius: {
        pill: "9999px",
        sm: "var(--radius-sm)",
        card: "var(--radius-md)",
        luxe: "var(--radius-lg)",
        input: "20px"
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        float: "var(--shadow-float)",
        glow: "0 0 15px rgba(79, 70, 229, 0.15)"
      }
    }
  },
  plugins: []
};
