import * as React from "react";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className = "", ...props }, ref) => (
  <div ref={ref} className={"rounded-3xl border bg-white text-gray-900 shadow-sm " + className} {...props} />
));
Card.displayName = "Card";

export { Card };


