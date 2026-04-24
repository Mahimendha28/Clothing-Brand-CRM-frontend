import Button from "./Button";

function IconActionButton({
  icon: Icon,
  label,
  variant = "outline",
  className = "",
  ...props
}) {
  return (
    <Button
      type="button"
      variant={variant}
      aria-label={label}
      title={label}
      className={`ui-compact-button !min-w-0 !rounded-[10px] !px-2.5 !py-2 ${className}`.trim()}
      {...props}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}

export default IconActionButton;
