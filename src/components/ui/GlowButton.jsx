"use client";
import styles from "./GlowButton.module.css";

/**
 * GlowButton — styled button with green-glow hover.
 *
 * Props:
 *   variant {"primary" | "secondary"} — default "primary"
 *   className {string}                — merged after module class
 *   ...rest                           — forwarded to <button>
 */
export default function GlowButton({ variant = "primary", className = "", children, ...props }) {
  const cls = [
    styles.btn,
    variant === "secondary" ? styles.secondary : styles.primary,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={cls} {...props}>
      {children}
    </button>
  );
}
