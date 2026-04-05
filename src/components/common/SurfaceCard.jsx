function SurfaceCard({ children, className = "" }) {
  return <section className={`ui-surface ${className}`.trim()}>{children}</section>;
}

export default SurfaceCard;
