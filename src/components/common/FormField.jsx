function FormField({
  label,
  as = "input",
  options = [],
  hint,
  error,
  className = "",
  wrapperClassName = "",
  ...props
}) {
  const Component = as;
  const baseClassName = `ui-input ${error ? "!border-danger focus:!shadow-[0_0_0_4px_rgba(220,38,38,0.08)]" : ""} ${className}`.trim();

  return (
    <div className={`space-y-2 ${wrapperClassName}`.trim()}>
      {label ? <label className="ui-label">{label}</label> : null}
      {as === "select" ? (
        <select className={baseClassName} {...props}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <Component className={baseClassName} {...props} />
      )}
      {error ? <p className="text-xs font-medium text-danger">{error}</p> : null}
      {hint ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export default FormField;
