import * as React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "ghost";
  size?: "default" | "sm" | "lg";
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {
    const base = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50";
    const variants: Record<string, string> = {
      default: "bg-kairos-soft-black text-kairos-chalk hover:bg-kairos-charcoal",
      ghost: "hover:bg-kairos-deutzia-flower text-kairos-charcoal",
    };
    const sizes: Record<string, string> = {
      default: "h-10 px-4 py-2",
      sm: "h-9 px-3",
      lg: "h-11 px-8",
    };

    return (
      <button ref={ref} className={[base, variants[variant], sizes[size], className].join(" ")} {...props} />
    );
  }
);
Button.displayName = "Button";


