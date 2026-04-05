import React from "react";

const Input = React.forwardRef(({ label, icon: Icon, className = "", ...props }, ref) => {
  return (
    <div className="space-y-2 w-full flex flex-col items-start">
      {label && (
        <div className="flex justify-between w-full">
           <label className="ui-label">
             {label}
           </label>
        </div>
      )}
      <div className="relative w-full">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        )}
        <input
          ref={ref}
          className={`ui-input block sm:text-sm ${
            Icon ? "pl-10" : "px-4"
          } ${className}`}
          {...props}
        />
      </div>
    </div>
  );
});

Input.displayName = "Input";

export default Input;
