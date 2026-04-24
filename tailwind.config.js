/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        page: "var(--color-bg-page)",
        canvas: "var(--color-bg-canvas)",
        card: "var(--color-bg-card)",
        sidebar: "var(--color-bg-sidebar)",
        panel: "var(--color-bg-panel)",
        input: "var(--color-bg-input)",
        charcoal: "var(--color-bg-dark)",
        "charcoal-soft": "var(--color-bg-dark-soft)",
        primary: "var(--color-text-primary)",
        ink: "var(--color-text-primary)",
        secondary: "var(--color-text-secondary)",
        muted: "var(--color-text-muted)",
        accent: "var(--color-text-accent)",
        ivory: "var(--color-text-ivory)",
        soft: "var(--color-border-soft)",
        line: "var(--color-border-soft)",
        "line-strong": "var(--color-border-strong)",
        strong: "var(--color-border-strong)",
        "btn-primary": "var(--color-btn-primary)",
        "btn-hover": "var(--color-btn-hover)",
        "btn-secondary": "var(--color-btn-secondary)",
        gold: "var(--color-text-accent)",
        burgundy: "var(--color-btn-primary)",
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
