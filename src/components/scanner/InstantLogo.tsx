"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface InstantLogoProps {
  themeMode?: "dark" | "light";
  size?: "small" | "medium" | "large";
  withText?: boolean;
}

export default function InstantLogo({
  themeMode = "dark",
  size = "medium",
  withText = true,
}: InstantLogoProps) {
  const isDark = themeMode === "dark";

  const iconSizes = {
    small: { box: 28, svg: 16, fontSize: "0.95rem", badgeSize: "0.55rem" },
    medium: { box: 34, svg: 20, fontSize: "1.15rem", badgeSize: "0.6rem" },
    large: { box: 44, svg: 26, fontSize: "1.45rem", badgeSize: "0.68rem" },
  };

  const { box, svg, fontSize, badgeSize } = iconSizes[size];

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, userSelect: "none" }}>
      {/* Iconic Emblem Mark */}
      <Box
        sx={{
          width: box,
          height: box,
          borderRadius: size === "small" ? "8px" : "11px",
          background: isDark
            ? "linear-gradient(145deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)"
            : "linear-gradient(145deg, #ffffff 0%, #f1f5f9 100%)",
          border: isDark
            ? "1px solid rgba(99, 102, 241, 0.4)"
            : "1px solid rgba(99, 102, 241, 0.25)",
          boxShadow: isDark
            ? "0 4px 16px -2px rgba(99, 102, 241, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.15)"
            : "0 4px 14px -2px rgba(99, 102, 241, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.8)",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
          position: "relative",
          overflow: "hidden",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          "&:hover": {
            transform: "scale(1.05) rotate(-2deg)",
            boxShadow: isDark
              ? "0 6px 22px rgba(56, 189, 248, 0.45)"
              : "0 6px 20px rgba(99, 102, 241, 0.3)",
          },
        }}
      >
        {/* Subtle Ambient Light Sheen */}
        <Box
          sx={{
            position: "absolute",
            top: "-30%",
            left: "-30%",
            width: "80%",
            height: "80%",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(56, 189, 248, 0.35) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* High-Precision Angular Lightning Vector Glyph */}
        <svg
          width={svg}
          height={svg}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: "relative", zIndex: 1 }}
        >
          <defs>
            <linearGradient id="instantBoltGrad" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="48%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
            <filter id="boltGlow" x="-2" y="-2" width="28" height="28" filterUnits="userSpaceOnUse">
              <feGaussianBlur stdDeviation="1.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d="M13.5 2L4 13H11.5L9.5 22L20 9.5H12.5L13.5 2Z"
            fill="url(#instantBoltGrad)"
            stroke="url(#instantBoltGrad)"
            strokeWidth="0.5"
            strokeLinejoin="round"
            filter="url(#boltGlow)"
          />
        </svg>
      </Box>

      {/* Iconic Wordmark */}
      {withText && (
        <Box sx={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.6 }}>
            <Typography
              component="span"
              sx={{
                fontSize: fontSize,
                fontWeight: 850,
                letterSpacing: "0.12em",
                fontFamily: 'var(--font-exo), "Exo", sans-serif',
                fontOpticalSizing: "auto",
                lineHeight: 1,
                background: isDark
                  ? "linear-gradient(135deg, #ffffff 40%, #c7d2fe 75%, #38bdf8 100%)"
                  : "linear-gradient(135deg, #0f172a 40%, #4338ca 75%, #0284c7 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: isDark
                  ? "0 0 24px rgba(99, 102, 241, 0.3)"
                  : "none",
              }}
            >
              INSTANT
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}
