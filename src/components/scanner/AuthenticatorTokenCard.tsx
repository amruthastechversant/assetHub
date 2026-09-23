"use client";

import React, { useEffect, useState, useCallback } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import SecurityIcon from "@mui/icons-material/Security";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import LockResetIcon from "@mui/icons-material/LockReset";
import { generateTOTP, getRemainingSeconds, formatOtpCode } from "@/lib/totp";
import { AuthenticatorTokenData } from "@/lib/mockScannerData";

interface AuthenticatorTokenCardProps {
  tokenData: AuthenticatorTokenData;
  onClose: () => void;
  onScanAnother: () => void;
  onToast: (msg: string) => void;
}

export default function AuthenticatorTokenCard({
  tokenData,
  onClose,
  onScanAnother,
  onToast,
}: AuthenticatorTokenCardProps) {
  const [otpCode, setOtpCode] = useState<string>("------");
  const [remaining, setRemaining] = useState<number>(30);
  const [percentage, setPercentage] = useState<number>(100);
  const [copied, setCopied] = useState<boolean>(false);

  const period = tokenData.period || 30;

  const updateCode = useCallback(async () => {
    try {
      const code = await generateTOTP(tokenData.secret, {
        timeStep: period,
        digits: tokenData.digits || 6,
        algorithm: tokenData.algorithm === "SHA256" ? "SHA-256" : "SHA-1",
      });
      setOtpCode(code);
    } catch (err) {
      console.error("Failed to generate OTP:", err);
    }
  }, [tokenData, period]);

  useEffect(() => {
    updateCode();
    const interval = setInterval(() => {
      const { remaining: rem, percentage: pct } = getRemainingSeconds(period);
      setRemaining(rem);
      setPercentage(pct);
      if (rem === period || rem === 1) {
        updateCode();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [updateCode, period]);

  const handleCopy = () => {
    navigator.clipboard.writeText(otpCode);
    setCopied(true);
    onToast(`Copied OTP ${otpCode} to clipboard`);
    setTimeout(() => setCopied(false), 2200);
  };

  const isUrgent = remaining <= 5;
  const timerColor = isUrgent ? "#ef4444" : remaining <= 10 ? "#f59e0b" : "#6366f1";

  return (
    <Box
      sx={{
        backgroundColor: "#0e1424",
        borderRadius: { xs: 4, md: 5 },
        border: "1px solid rgba(99, 102, 241, 0.2)",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
        color: "#f8fafc",
        overflow: "hidden",
        width: "100%",
        position: "relative",
      }}
    >
      {/* Top Header */}
      <Box
        sx={{
          px: { xs: 2.5, sm: 3.5 },
          pt: 3,
          pb: 2.5,
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#131b2e",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "14px",
              backgroundColor: "rgba(99, 102, 241, 0.15)",
              border: "1px solid rgba(99, 102, 241, 0.3)",
              display: "grid",
              placeItems: "center",
              color: "#818cf8",
            }}
          >
            <SecurityIcon />
          </Box>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "1.05rem", sm: "1.2rem" },
                letterSpacing: "-0.02em",
                color: "#ffffff",
                lineHeight: 1.2,
              }}
            >
              {tokenData.issuer}
            </Typography>
            <Typography sx={{ color: "#94a3b8", fontSize: "0.8rem", mt: 0.3 }}>
              {tokenData.account}
            </Typography>
          </Box>
        </Box>

        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            color: "#94a3b8",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            width: 34,
            height: 34,
            borderRadius: "10px",
            "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.12)", color: "#ffffff" },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Main OTP Display Area */}
      <Box sx={{ p: { xs: 2.5, sm: 3.5 }, textAlign: "center" }}>
        <Typography
          sx={{
            fontSize: "0.75rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#64748b",
            mb: 2,
          }}
        >
          One-Time Password (2FA Authenticator)
        </Typography>

        <Box
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(99, 102, 241, 0.2)",
            borderRadius: "20px",
            p: { xs: 3, sm: 3.5 },
            mb: 3,
            boxShadow: "inset 0 0 24px rgba(99, 102, 241, 0.05)",
          }}
        >
          {/* OTP Code Display */}
          <Typography
            variant="h3"
            sx={{
              fontFamily: "monospace",
              fontWeight: 800,
              fontSize: { xs: "2.4rem", sm: "3rem" },
              letterSpacing: "0.15em",
              color: timerColor,
              my: 1,
              userSelect: "all",
              transition: "color 0.2s ease",
            }}
          >
            {formatOtpCode(otpCode)}
          </Typography>

          {/* Progress track */}
          <Box
            sx={{
              width: "100%",
              maxWidth: 240,
              height: 5,
              borderRadius: "999px",
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              overflow: "hidden",
              mx: "auto",
              mt: 2.5,
              mb: 1.5,
            }}
          >
            <Box
              sx={{
                width: `${percentage}%`,
                height: "100%",
                backgroundColor: timerColor,
                transition: "width 1s linear, background-color 0.3s ease",
              }}
            />
          </Box>

          <Typography
            sx={{
              fontSize: "0.8rem",
              fontWeight: 600,
              color: timerColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.5,
            }}
          >
            <LockResetIcon sx={{ fontSize: 16 }} />
            Refreshes in {remaining}s
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
          <Button
            variant="contained"
            onClick={handleCopy}
            startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
            sx={{
              backgroundColor: copied ? "#10b981" : "#6366f1",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "0.88rem",
              py: 1.4,
              borderRadius: "14px",
              textTransform: "none",
              boxShadow: "0 4px 14px rgba(99, 102, 241, 0.3)",
              "&:hover": { backgroundColor: copied ? "#059669" : "#4f46e5" },
            }}
          >
            {copied ? "Copied!" : "Copy Code"}
          </Button>

          <Button
            variant="outlined"
            onClick={onScanAnother}
            startIcon={<QrCodeScannerIcon />}
            sx={{
              borderColor: "rgba(255, 255, 255, 0.18)",
              color: "#e2e8f0",
              fontWeight: 600,
              fontSize: "0.88rem",
              py: 1.4,
              borderRadius: "14px",
              textTransform: "none",
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              "&:hover": {
                borderColor: "#818cf8",
                backgroundColor: "rgba(99, 102, 241, 0.08)",
                color: "#818cf8",
              },
            }}
          >
            Scan Another QR
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
