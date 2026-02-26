"use client";
import { forwardRef } from "react";
import styles from "./GlowCard.module.css";

/**
 * GlowCard — a drop-in <div> replacement that adds inset green glow on
 * hover and an accessible focus ring via CSS tokens.
 *
 * It is NOT an additional wrapper — it IS the div. Pass all props
 * (style, onClick, onMouseEnter, className, etc.) as you would to a <div>.
 *
 * Props:
 *   selected {boolean} — apply the stronger selected glow state
 *   className {string}  — merged after the module class
 */
const GlowCard = forwardRef(function GlowCard(
  { selected = false, className = "", children, ...props },
  ref
) {
  const cls = [
    styles.card,
    selected ? styles.selected : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={ref} className={cls} {...props}>
      {children}
    </div>
  );
});

export default GlowCard;
