import type { CSSProperties } from "react";

/* Remap the shadcn theme tokens to brand colors for portalled overlays
   (calendar popover, alert dialog) without forking the ui components. */
export const brandOverlayTheme = {
  "--popover": "var(--color-navy-800)",
  "--popover-foreground": "var(--color-ink-050)",
  "--background": "var(--color-navy-700)",
  "--foreground": "var(--color-ink-050)",
  "--muted": "var(--color-navy-900)",
  "--muted-foreground": "var(--color-ink-400)",
  "--accent": "var(--color-navy-700)",
  "--accent-foreground": "var(--color-ink-050)",
  "--primary": "var(--color-gold-400)",
  "--primary-foreground": "var(--color-navy-950)",
  "--border": "var(--color-line)",
  "--input": "var(--color-line)",
  "--ring": "var(--color-gold-400)",
  "--destructive": "var(--color-coral-400)",
} as CSSProperties;
