"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export interface ThemeLoaderProps {
  /**
   * Layout presentation variant:
   * - "page": Perfectly centered in viewport / full page container
   * - "card": Perfectly centered inside a card container (with min-height & responsive padding)
   * - "tab": Perfectly centered inside a tab panel (e.g., Authenticators or History tab)
   * - "inline": Minimal inline centered loader
   */
  variant?: "page" | "card" | "tab" | "inline";
  /** Primary loading message */
  message?: string;
  /** Secondary subtitle / hint */
  submessage?: string;
  /** Whether dark mode styling is applied (defaults to true) */
  isDark?: boolean;
  /** Custom size of the loader icon in pixels (default: 44.8) */
  size?: number;
  /** Custom color override (defaults to theme indigo #6366f1 / #818cf8) */
  color?: string;
  /** Custom minHeight override for the container */
  minHeight?: number | string;
}

/**
 * Uiverse.io geometric loader by bociKond, tailored for Instant design system.
 * Features expanding, rotating radial petals and glowing multi-layer aura.
 */
export default function ThemeLoader({
  variant = "card",
  message,
  submessage,
  isDark = true,
  size = 44.8,
  color,
  minHeight,
}: ThemeLoaderProps) {
  // Theme brand colors
  const primaryColor = color || (isDark ? "#818cf8" : "#6366f1");
  const scale = size / 44.8;

  // The core Uiverse animated element
  const loaderGlyph = (
    <Box
      sx={{
        position: "relative",
        width: 44.8 * scale,
        height: 44.8 * scale,
        display: "grid",
        placeItems: "center",
      }}
    >
      {/* Ambient background glow aura */}
      <Box
        sx={{
          position: "absolute",
          width: 56 * scale,
          height: 56 * scale,
          borderRadius: "50%",
          background: isDark
            ? "radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, rgba(56, 189, 248, 0.15) 50%, transparent 70%)"
            : "radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)",
          filter: "blur(6px)",
          animation: "themeLoaderAura 2s ease-in-out infinite alternate",
          pointerEvents: "none",
          "@keyframes themeLoaderAura": {
            "0%": { transform: "scale(0.85)", opacity: 0.6 },
            "100%": { transform: "scale(1.2)", opacity: 1 },
          },
        }}
      />

      {/* Uiverse loader element */}
      <Box
        component="div"
        sx={{
          width: "44.8px",
          height: "44.8px",
          color: primaryColor,
          position: "relative",
          background: "radial-gradient(11.2px, currentColor 94%, #0000)",
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: "center center",
          filter: isDark
            ? "drop-shadow(0 0 10px rgba(99, 102, 241, 0.6)) drop-shadow(0 0 18px rgba(56, 189, 248, 0.3))"
            : "drop-shadow(0 0 8px rgba(99, 102, 241, 0.4))",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: `
              radial-gradient(10.08px at bottom right, #0000 94%, currentColor) top left,
              radial-gradient(10.08px at bottom left, #0000 94%, currentColor) top right,
              radial-gradient(10.08px at top right, #0000 94%, currentColor) bottom left,
              radial-gradient(10.08px at top left, #0000 94%, currentColor) bottom right
            `,
            backgroundSize: "22.4px 22.4px",
            backgroundRepeat: "no-repeat",
            animation: "uiverseLoader 1.5s infinite cubic-bezier(0.3, 1, 0, 1)",
          },
          "@keyframes uiverseLoader": {
            "33%": {
              inset: "-11.2px",
              transform: "rotate(0deg)",
            },
            "66%": {
              inset: "-11.2px",
              transform: "rotate(90deg)",
            },
            "100%": {
              inset: "0",
              transform: "rotate(90deg)",
            },
          },
        }}
      />
    </Box>
  );

  // Text label block
  const textContent = (message || submessage) && (
    <Box sx={{ textAlign: "center", mt: 2, maxWidth: 360 }}>
      {message && (
        <Typography
          sx={{
            fontSize: variant === "page" ? "1.05rem" : "0.88rem",
            fontWeight: 700,
            color: isDark ? "#f1f5f9" : "#0f172a",
            letterSpacing: "-0.01em",
            animation: "themeLoaderTextPulse 2s ease-in-out infinite",
            "@keyframes themeLoaderTextPulse": {
              "0%, 100%": { opacity: 0.8 },
              "50%": { opacity: 1 },
            },
          }}
        >
          {message}
        </Typography>
      )}
      {submessage && (
        <Typography
          sx={{
            fontSize: "0.76rem",
            color: isDark ? "#94a3b8" : "#64748b",
            mt: 0.5,
            fontWeight: 500,
          }}
        >
          {submessage}
        </Typography>
      )}
    </Box>
  );

  // 1. PAGE VARIANT: Center on the whole page / viewport
  if (variant === "page") {
    return (
      <Box
        sx={{
          minHeight: minHeight || "75vh",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            p: { xs: 4, sm: 5 },
            borderRadius: "24px",
            backgroundColor: isDark ? "rgba(15, 23, 42, 0.65)" : "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(16px)",
            border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.06)",
            boxShadow: isDark
              ? "0 20px 50px rgba(0, 0, 0, 0.5), 0 0 40px rgba(99, 102, 241, 0.15)"
              : "0 20px 40px rgba(99, 102, 241, 0.12)",
          }}
        >
          {loaderGlyph}
          {textContent}
        </Box>
      </Box>
    );
  }

  // 2. TAB VARIANT: Center inside a tab panel container
  if (variant === "tab") {
    return (
      <Box
        sx={{
          minHeight: minHeight || { xs: 260, md: 340 },
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 3, md: 5 },
          borderRadius: { xs: "20px", md: "26px" },
          backgroundColor: isDark ? "rgba(255, 255, 255, 0.02)" : "#ffffff",
          border: isDark ? "1px solid rgba(255, 255, 255, 0.06)" : "1px solid #e2e8f0",
        }}
      >
        {loaderGlyph}
        {textContent}
      </Box>
    );
  }

  // 3. INLINE VARIANT: Minimal horizontal or compact center
  if (variant === "inline") {
    return (
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1.5,
          py: 0.5,
        }}
      >
        {loaderGlyph}
        {message && (
          <Typography
            sx={{
              fontSize: "0.82rem",
              fontWeight: 650,
              color: isDark ? "#f1f5f9" : "#0f172a",
            }}
          >
            {message}
          </Typography>
        )}
      </Box>
    );
  }

  // 4. CARD VARIANT (Default): Center inside a card
  return (
    <Box
      sx={{
        minHeight: minHeight || 170,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 3,
        px: 2,
        borderRadius: "16px",
      }}
    >
      {loaderGlyph}
      {textContent}
    </Box>
  );
}
