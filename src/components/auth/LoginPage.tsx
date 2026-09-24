"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import { signIn } from "next-auth/react";
import InstantLogo from "@/components/scanner/InstantLogo";
import ScannerBackground from "@/components/scanner/ScannerBackground";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import VpnKeyOutlinedIcon from "@mui/icons-material/VpnKeyOutlined";

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const googleLogin = async () => {
    setIsLoading(true);
    // After successful SSO redirect to Instant root dashboard
    await signIn("google", { callbackUrl: "/" });
  };

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#070b14",
        color: "#ffffff",
        px: 2,
        py: 4,
      }}
    >
      {/* Dynamic Animated Ambient Background */}
      <ScannerBackground themeMode="dark" />

      {/* Main Glassmorphic Login Card */}
      <Paper
        component="section"
        elevation={0}
        sx={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: 440,
          borderRadius: "24px",
          p: { xs: 3, sm: 4.5 },
          backgroundColor: "rgba(15, 23, 42, 0.75)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(99, 102, 241, 0.15)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          transition: "transform 0.25s ease, box-shadow 0.25s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 30px 60px -12px rgba(0, 0, 0, 0.8), 0 0 30px -4px rgba(99, 102, 241, 0.25)",
          },
        }}
      >
        {/* Brand Logo & Emblem */}
        <Box sx={{ mb: 2.5, display: "flex", justifyContent: "center" }}>
          <InstantLogo themeMode="dark" size="large" />
        </Box>

        {/* Headline & Tagline */}
        <Typography
          variant="h5"
          component="h1"
          sx={{
            fontWeight: 800,
            fontSize: { xs: "1.35rem", sm: "1.55rem" },
            letterSpacing: "-0.02em",
            fontFamily: 'var(--font-exo), "Exo", sans-serif',
            fontOpticalSizing: "auto",
            color: "#ffffff",
            mb: 1,
          }}
        >
          Sign In to Instant
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: "#94a3b8",
            fontSize: "0.88rem",
            lineHeight: 1.5,
            maxWidth: 340,
            mb: 3.5,
          }}
        >
          Access your organization&apos;s asset intelligence and manage secure Time-based 2FA authenticators.
        </Typography>

        {/* Google SSO Login Button */}
        <Button
          fullWidth
          size="large"
          disabled={isLoading}
          onClick={googleLogin}
          startIcon={
            isLoading ? (
              <CircularProgress size={20} sx={{ color: "#ffffff" }} />
            ) : (
              <Box
                component="svg"
                viewBox="0 0 24 24"
                sx={{ width: 20, height: 20, flexShrink: 0 }}
              >
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </Box>
            )
          }
          sx={{
            py: 1.4,
            px: 2.5,
            borderRadius: "14px",
            backgroundColor: "#ffffff",
            color: "#0f172a",
            fontWeight: 750,
            fontSize: "0.95rem",
            textTransform: "none",
            letterSpacing: "-0.01em",
            boxShadow: "0 10px 25px -5px rgba(255, 255, 255, 0.15)",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              backgroundColor: "#f8fafc",
              boxShadow: "0 15px 30px -5px rgba(255, 255, 255, 0.25)",
              transform: "translateY(-1px)",
            },
            "&:active": {
              transform: "translateY(0)",
            },
            "&.Mui-disabled": {
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              color: "#334155",
            },
          }}
        >
          {isLoading ? "Signing in..." : "Continue with Google"}
        </Button>

        {/* Feature Highlights Pills */}
        <Box
          sx={{
            mt: 4,
            pt: 3,
            width: "100%",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.2,
              p: "8px 12px",
              borderRadius: "10px",
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              textAlign: "left",
            }}
          >
            <QrCodeScannerIcon sx={{ fontSize: 18, color: "#38bdf8" }} />
            <Box>
              <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#e2e8f0" }}>
                Instant QR Scanning
              </Typography>
              <Typography sx={{ fontSize: "0.7rem", color: "#64748b" }}>
                Inspect hardware assets & verify live device specs
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.2,
              p: "8px 12px",
              borderRadius: "10px",
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              textAlign: "left",
            }}
          >
            <VpnKeyOutlinedIcon sx={{ fontSize: 18, color: "#818cf8" }} />
            <Box>
              <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#e2e8f0" }}>
                Secure 2FA Authenticator
              </Typography>
              <Typography sx={{ fontSize: "0.7rem", color: "#64748b" }}>
                High-security TOTP token vault & instant sharing
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Security Footer Notice */}
      <Box
        sx={{
          mt: 3,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: 0.8,
          color: "#64748b",
        }}
      >
        <ShieldOutlinedIcon sx={{ fontSize: 14 }} />
        <Typography variant="caption" sx={{ fontSize: "0.72rem", fontWeight: 550 }}>
          Protected by Instant Zero-Trust Protocol • SSO Verified
        </Typography>
      </Box>
    </Box>
  );
}
