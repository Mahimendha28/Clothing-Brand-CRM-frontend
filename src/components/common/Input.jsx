import React from "react";

const Input = React.forwardRef(({ label, icon: Icon, className = "", ...props }, ref) => {
  return (
    <div className="space-y-1.5 w-full flex flex-col items-start">
      {label && (
         <label className="ui-label">
           {label}
         </label>
      )}
      <div className="relative w-full group">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted transition-colors group-focus-within:text-accent">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        )}
        <input
          ref={ref}
          className={`ui-input ${
            Icon ? "pl-11" : "px-4"
          } ${className}`}
          {...props}
        />
      </div>
    </div>
  );
});

Input.displayName = "Input";

export default Input;
