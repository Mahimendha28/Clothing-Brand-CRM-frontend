import { forwardRef } from "react";

const SurfaceCard = forwardRef(function SurfaceCard({ children, className = "" }, ref) {
  return (
    <section ref={ref} className={`ui-surface ${className}`.trim()}>
      {children}
    </section>
  );
});

export default SurfaceCard;
