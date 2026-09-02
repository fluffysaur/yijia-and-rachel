import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router";
import { clsx } from "clsx";

const variants = {
  primary: "border border-ink bg-ink text-white shadow-xs hover:bg-taupe hover:border-taupe transition-all duration-300 btn-shimmer",
  secondary: "border border-taupe/30 bg-white/90 text-ink shadow-xs hover:border-ink hover:bg-cream/60 transition-all duration-300",
  ghost: "text-ink hover:bg-cream/60 transition-colors duration-300"
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
};

type LinkButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  to?: string;
  href?: string;
  variant?: keyof typeof variants;
  children: ReactNode;
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xs px-6 py-2 text-control font-medium uppercase tracking-[0.14em] transition disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export function LinkButton({ className, variant = "primary", to, href, children, ...props }: LinkButtonProps) {
  const classes = clsx(
    "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xs px-6 py-2 text-control font-medium uppercase tracking-[0.14em] transition",
    variants[variant],
    className
  );

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={classes} {...props}>
      {children}
    </a>
  );
}
