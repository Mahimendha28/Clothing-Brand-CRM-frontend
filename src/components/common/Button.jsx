import React from "react";

const Button = ({ children, variant = "primary", className = "", ...props }) => {
  const baseStyle =
    "inline-flex items-center justify-center rounded-full px-6 py-3.5 text-sm font-semibold tracking-[0.18em] uppercase transition-all focus:outline-none";

  const variants = {
    primary: "bg-btn-primary text-white shadow-soft hover:bg-btn-hover",
    secondary: "border border-line bg-btn-secondary text-ink hover:border-line-strong hover:bg-white",
    accent: "bg-accent text-white hover:opacity-90",
    outline: "border border-line bg-transparent text-ink hover:bg-input"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
