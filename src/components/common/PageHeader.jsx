function PageHeader({ eyebrow, title, description, actions, className = "" }) {
  return (
    <div className={`flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between ${className}`.trim()}>
      <div className="max-w-3xl">
        {eyebrow ? <p className="ui-eyebrow">{eyebrow}</p> : null}
        <h1 className="mt-3 font-display text-4xl text-ink md:text-5xl">{title}</h1>
        {description ? <p className="mt-4 text-sm leading-7 text-muted">{description}</p> : null}
      </div>

      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}

export default PageHeader;
