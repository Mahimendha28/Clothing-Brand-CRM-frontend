function PageHeader({ eyebrow, title, description, actions, className = "" }) {
  return (
    <div className={`flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between ${className}`.trim()}>
      <div className="max-w-3xl">
        {eyebrow ? <p className="ui-eyebrow">{eyebrow}</p> : null}
        <h1 className="ui-page-title mt-3">{title}</h1>
        {description ? <p className="ui-page-copy mt-3 text-muted">{description}</p> : null}
      </div>

      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2 self-start lg:justify-end">
          {actions}
        </div>
      ) : null}
    </div>
  );
}

export default PageHeader;
