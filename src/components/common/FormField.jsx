function FormField({
  label,
  as = "input",
  options = [],
  hint,
  className = "",
  wrapperClassName = "",
  ...props
}) {
  const Component = as;
  const baseClassName = `ui-input ${className}`.trim();

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
      {hint ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export default FormField;
