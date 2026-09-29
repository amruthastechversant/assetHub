"use client";

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";

interface InstantFlashLoaderProps {
  variant?: "card" | "recent-card" | "tokens" | "inline";
  isDark?: boolean;
  message?: string;
}

export default function InstantFlashLoader({
  variant = "card",
  isDark = true,
  message = "Loading asset data...",
}: InstantFlashLoaderProps) {
  // Flash SVG Glyph matching favicon
  const FlashIconSvg = ({ size = 28 }: { size?: number }) => (
    <Box
      sx={{
        width: size,
        height: size,
        position: "relative",
        display: "grid",
        placeItems: "center",
      }}
    >
      {/* Ambient Pulsing Aura */}
      <Box
        sx={{
          position: "absolute",
          inset: -6,
          borderRadius: "50%",
          background: isDark
            ? "radial-gradient(circle, rgba(99, 102, 241, 0.45) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)",
          animation: "instantAuraPulse 1.8s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          animation: "instantFlashPulse 1.8s ease-in-out infinite",
          filter: isDark
            ? "drop-shadow(0 0 8px rgba(56, 189, 248, 0.7)) drop-shadow(0 0 16px rgba(99, 102, 241, 0.5))"
            : "drop-shadow(0 0 6px rgba(99, 102, 241, 0.4))",
        }}
      >
        <defs>
          <linearGradient id="flashLoaderBolt" x1="14" y1="10" x2="50" y2="54" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="45%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        <path
          d="M36 10L16 34H31L26 54L48 28H32L36 10Z"
          fill="url(#flashLoaderBolt)"
        />
      </svg>
    </Box>
  );

  // Variant 1: Card Loader (e.g. Top Right "LAST SCANNED" card)
  if (variant === "card") {
    return (
      <Box
        sx={{
          py: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1.8,
          "@keyframes instantFlashPulse": {
            "0%, 100%": { transform: "scale(0.92)", opacity: 0.8 },
            "50%": { transform: "scale(1.08)", opacity: 1 },
          },
          "@keyframes instantAuraPulse": {
            "0%, 100%": { transform: "scale(0.85)", opacity: 0.25 },
            "50%": { transform: "scale(1.25)", opacity: 0.65 },
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Flash emblem badge */}
          <Box
            sx={{
              width: 54,
              height: 54,
              borderRadius: "16px",
              backgroundColor: isDark ? "rgba(15, 23, 42, 0.8)" : "rgba(241, 245, 249, 0.9)",
              border: isDark ? "1px solid rgba(99, 102, 241, 0.3)" : "1px solid #e2e8f0",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <FlashIconSvg size={28} />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.8 }}>
              <Typography
                sx={{
                  fontSize: "0.86rem",
                  fontWeight: 700,
                  color: isDark ? "#c7d2fe" : "#4338ca",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.8,
                }}
              >
                {message}
              </Typography>
            </Box>
            <Skeleton
              variant="text"
              width="65%"
              height={20}
              sx={{ bgcolor: isDark ? "rgba(255,255,255,0.06)" : undefined }}
            />
          </Box>
        </Box>

        <Skeleton
          variant="rectangular"
          height={42}
          sx={{
            borderRadius: "14px",
            bgcolor: isDark ? "rgba(99, 102, 241, 0.12)" : undefined,
          }}
        />
      </Box>
    );
  }

  // Variant 2: Recent Scans Card Loader
  if (variant === "recent-card") {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1.2,
          py: 0.5,
          "@keyframes instantFlashPulse": {
            "0%, 100%": { transform: "scale(0.92)", opacity: 0.8 },
            "50%": { transform: "scale(1.08)", opacity: 1 },
          },
          "@keyframes instantAuraPulse": {
            "0%, 100%": { transform: "scale(0.85)", opacity: 0.25 },
            "50%": { transform: "scale(1.25)", opacity: 0.65 },
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1.2, py: 1.2 }}>
          <FlashIconSvg size={20} />
          <Typography
            sx={{
              fontSize: "0.82rem",
              fontWeight: 650,
              color: isDark ? "#94a3b8" : "#64748b",
            }}
          >
            {message}
          </Typography>
        </Box>

        {[0, 1, 2].map((idx) => (
          <Box
            key={idx}
            sx={{
              p: "10px 14px",
              borderRadius: "14px",
              border: isDark ? "1px solid rgba(255,255,255,0.04)" : "1px solid #f1f5f9",
              backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "#f8fafc",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Skeleton
              variant="rectangular"
              width={34}
              height={34}
              sx={{ borderRadius: "10px", bgcolor: isDark ? "rgba(255,255,255,0.06)" : undefined }}
            />
            <Box sx={{ flex: 1 }}>
              <Skeleton
                variant="text"
                width="50%"
                height={18}
                sx={{ bgcolor: isDark ? "rgba(255,255,255,0.06)" : undefined }}
              />
              <Skeleton
                variant="text"
                width="30%"
                height={14}
                sx={{ bgcolor: isDark ? "rgba(255,255,255,0.04)" : undefined }}
              />
            </Box>
            <Skeleton
              variant="rectangular"
              width={54}
              height={26}
              sx={{ borderRadius: "8px", bgcolor: isDark ? "rgba(99,102,241,0.12)" : undefined }}
            />
          </Box>
        ))}
      </Box>
    );
  }

  // Variant 3: Tokens / Authenticator Loader
  if (variant === "tokens") {
    return (
      <Box
        sx={{
          py: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 1.5,
          "@keyframes instantFlashPulse": {
            "0%, 100%": { transform: "scale(0.92)", opacity: 0.8 },
            "50%": { transform: "scale(1.08)", opacity: 1 },
          },
          "@keyframes instantAuraPulse": {
            "0%, 100%": { transform: "scale(0.85)", opacity: 0.25 },
            "50%": { transform: "scale(1.25)", opacity: 0.65 },
          },
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: "18px",
            backgroundColor: isDark ? "#0f172a" : "#f1f5f9",
            border: isDark ? "1px solid rgba(99, 102, 241, 0.3)" : "1px solid #e2e8f0",
            display: "grid",
            placeItems: "center",
          }}
        >
          <FlashIconSvg size={30} />
        </Box>
        <Typography sx={{ fontSize: "0.88rem", fontWeight: 700, color: isDark ? "#c7d2fe" : "#4338ca" }}>
          {message}
        </Typography>
        <Typography sx={{ fontSize: "0.78rem", color: isDark ? "#64748b" : "#94a3b8" }}>
          Synchronizing secure credentials with vault...
        </Typography>
      </Box>
    );
  }

  // Default Inline Loader
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
      <FlashIconSvg size={18} />
      <Typography sx={{ fontSize: "0.8rem", color: isDark ? "#94a3b8" : "#64748b" }}>
        {message}
      </Typography>
    </Box>
  );
}
