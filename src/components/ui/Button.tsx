import { forwardRef, type ButtonHTMLAttributes } from "react";

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "danger";
  }
>(function Button(
  { className = "", variant = "primary", ...props },
  ref
) {
  const base =
    "inline-flex min-h-[52px] w-full items-center justify-center rounded-[14px] px-4 text-base font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 active:scale-[0.99]";
  const styles = {
    primary:
      "bg-brand-blue text-white hover:brightness-110 focus-visible:ring-brand-blue",
    secondary:
      "border border-border-subtle bg-paper text-text-strong hover:bg-brand-blue-soft focus-visible:ring-brand-blue",
    danger:
      "bg-danger text-white hover:brightness-110 focus-visible:ring-danger",
  };
  return (
    <button
      ref={ref}
      className={`${base} ${styles[variant]} ${className}`}
      {...props}
    />
  );
});

Button.displayName = "Button";
