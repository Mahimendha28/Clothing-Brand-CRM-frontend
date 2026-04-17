import React from "react";

const Button = ({ children, variant = "primary", className = "", ...props }) => {
  const baseStyle =
    "inline-flex items-center justify-center rounded-[var(--radius-sm)] px-6 py-3 text-sm font-semibold tracking-wide transition-all focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2";

  const variants = {
    primary: "bg-primary text-canvas shadow-soft hover:-translate-y-0.5 hover:shadow-float active:translate-y-0",
    secondary: "bg-canvas text-primary shadow-sm border border-strong hover:bg-input hover:-translate-y-0.5",
    accent: "bg-gradient-to-r from-accent to-indigo-500 text-white shadow-soft hover:shadow-float hover:opacity-90 hover:-translate-y-0.5",
    outline: "border border-strong bg-transparent text-primary hover:bg-input",
    danger: "bg-danger text-white hover:bg-opacity-90 transition-opacity"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
