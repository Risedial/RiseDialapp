import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Background & Surface
        "color-bg": "var(--color-bg)",
        "color-surface": "var(--color-surface)",
        "color-surface-raised": "var(--color-surface-raised)",
        "color-border": "var(--color-border)",
        // Text
        "color-text-primary": "var(--color-text-primary)",
        "color-text-secondary": "var(--color-text-secondary)",
        "color-text-muted": "var(--color-text-muted)",
        // Accent
        "color-accent-start": "var(--color-accent-start)",
        "color-accent-end": "var(--color-accent-end)",
        // Message Bubbles
        "color-user-bubble-start": "var(--color-user-bubble-start)",
        "color-user-bubble-end": "var(--color-user-bubble-end)",
        "color-rise-bubble": "var(--color-rise-bubble)",
        // Status & Feedback
        "color-error": "var(--color-error)",
        "color-success": "var(--color-success)",
        "color-online": "var(--color-online)",
        "color-disabled": "var(--color-disabled)",
      },
      spacing: {
        "spacing-xs": "var(--spacing-xs)",
        "spacing-sm": "var(--spacing-sm)",
        "spacing-md": "var(--spacing-md)",
        "spacing-lg": "var(--spacing-lg)",
        "spacing-xl": "var(--spacing-xl)",
        "spacing-2xl": "var(--spacing-2xl)",
        "tap-target-min": "var(--tap-target-min)",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "system-ui",
          "sans-serif",
        ],
      },
      fontSize: {
        "token-xs": "var(--font-size-xs)",
        "token-sm": "var(--font-size-sm)",
        "token-md": "var(--font-size-md)",
        "token-lg": "var(--font-size-lg)",
        "token-xl": "var(--font-size-xl)",
      },
      fontWeight: {
        "token-normal": "var(--font-weight-normal)",
        "token-medium": "var(--font-weight-medium)",
        "token-semibold": "var(--font-weight-semibold)",
      },
      borderRadius: {
        "radius-sm": "var(--radius-sm)",
        "radius-md": "var(--radius-md)",
        "radius-lg": "var(--radius-lg)",
        "radius-bubble": "var(--radius-bubble)",
      },
      transitionDuration: {
        "transition-fast": "150ms",
        "transition-standard": "250ms",
        "transition-slow": "350ms",
      },
      transitionTimingFunction: {
        "ease-out-token": "ease-out",
      },
      zIndex: {
        "z-base": "0",
        "z-sidebar": "100",
        "z-overlay": "200",
        "z-modal": "300",
        "z-banner": "400",
        "z-toast": "500",
      },
      keyframes: {
        "typing-dots": {
          "0%, 60%, 100%": { transform: "scale(0.6)", opacity: "0.4" },
          "30%": { transform: "scale(1)", opacity: "1" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-in-left": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
      animation: {
        "typing-dots": "typing-dots 1.2s ease-in-out infinite",
        "fade-in": "fade-in 250ms ease-out forwards",
        "slide-in-left": "slide-in-left 350ms ease-out forwards",
        pulse: "pulse 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
