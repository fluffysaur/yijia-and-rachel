import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router";
import { clsx } from "clsx";

const variants = {
  primary: "bg-ink text-white shadow-sm hover:bg-taupe",
  secondary: "border border-taupe/20 bg-white/85 text-ink hover:bg-cream",
  ghost: "text-ink hover:bg-cream"
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
        "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md px-5 py-2 text-control font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export function LinkButton({ className, variant = "primary", to, href, children, ...props }: LinkButtonProps) {
  const classes = clsx(
    "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md px-5 py-2 text-control font-medium transition",
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
