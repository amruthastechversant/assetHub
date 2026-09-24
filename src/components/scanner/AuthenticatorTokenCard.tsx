"use client";

import React, { useEffect, useState, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import SecurityIcon from "@mui/icons-material/Security";
import LockResetIcon from "@mui/icons-material/LockReset";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import { generateTOTP, getRemainingSeconds, formatOtpCode } from "@/lib/totp";
import { AuthenticatorTokenData } from "@/lib/mockScannerData";
import EditAuthenticatorModal from "./EditAuthenticatorModal";

interface AuthenticatorTokenCardProps {
  tokenData: AuthenticatorTokenData;
  themeMode?: "dark" | "light";
  onClose: () => void;
  onScanAnother?: () => void;
  onToast: (msg: string) => void;
  onUpdateToken?: (updated: AuthenticatorTokenData) => void;
}

export default function AuthenticatorTokenCard({
  tokenData,
  themeMode = "dark",
  onClose,
  onToast,
  onUpdateToken,
}: AuthenticatorTokenCardProps) {
  const isDark = themeMode === "dark";
  const [otpCode, setOtpCode] = useState<string>("------");
  const [remaining, setRemaining] = useState<number>(30);
  const [percentage, setPercentage] = useState<number>(100);
  const [copied, setCopied] = useState<boolean>(false);

  // Active Authenticator State
  const [issuer, setIssuer] = useState<string>(tokenData.issuer);

  // Modal Visibility States
  const [showEditModal, setShowEditModal] = useState<boolean>(false);

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

  useEffect(() => {
    setIssuer(tokenData.issuer);
  }, [tokenData.issuer]);

  const handleCopy = () => {
    navigator.clipboard.writeText(otpCode);
    setCopied(true);
    onToast(`Copied OTP ${otpCode} to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveName = (newName: string) => {
    setIssuer(newName);
    const updatedToken = { ...tokenData, issuer: newName };
    onUpdateToken?.(updatedToken);
    onToast(`Updated name to "${newName}"`);
    setShowEditModal(false);
  };

  const isUrgent = remaining <= 5;
  const timerColor = isUrgent ? "#ef4444" : remaining <= 10 ? "#f59e0b" : isDark ? "#38bdf8" : "#4f46e5";

  return (
    <>
      <Box
        sx={{
          backgroundColor: isDark ? "#0e1424" : "#ffffff",
          borderRadius: "18px",
          border: isDark ? "1px solid rgba(99, 102, 241, 0.18)" : "1px solid #e2e8f0",
          boxShadow: isDark
            ? "0 10px 30px rgba(0, 0, 0, 0.35)"
            : "0 4px 20px rgba(0, 0, 0, 0.05)",
          p: { xs: "12px 14px", sm: "14px 16px" },
          display: "flex",
          flexDirection: "column",
          gap: 1.2,
          position: "relative",
          overflow: "hidden",
          transition: "all 0.2s ease",
          "&:hover": {
            borderColor: isDark ? "rgba(99, 102, 241, 0.4)" : "#cbd5e1",
            boxShadow: isDark
              ? "0 14px 40px rgba(0, 0, 0, 0.45)"
              : "0 8px 30px rgba(0, 0, 0, 0.08)",
            transform: "translateY(-2px)",
          },
        }}
      >
        {/* Top Row: Service details + Action Icons (Edit, Share, Delete) */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, minWidth: 0, flex: 1 }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: "10px",
                backgroundColor: isDark ? "rgba(99, 102, 241, 0.15)" : "#e0e7ff",
                border: isDark ? "1px solid rgba(99, 102, 241, 0.3)" : "1px solid #c7d2fe",
                display: "grid",
                placeItems: "center",
                color: isDark ? "#818cf8" : "#6366f1",
                flexShrink: 0,
              }}
            >
              <SecurityIcon sx={{ fontSize: 18 }} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                noWrap
                sx={{
                  fontWeight: 750,
                  fontSize: "0.92rem",
                  color: isDark ? "#f8fafc" : "#0f172a",
                  lineHeight: 1.2,
                }}
              >
                {issuer}
              </Typography>
              <Typography
                noWrap
                sx={{
                  color: isDark ? "#94a3b8" : "#64748b",
                  fontSize: "0.74rem",
                  mt: 0.2,
                }}
              >
                {tokenData.account}
              </Typography>
            </Box>
          </Box>

          {/* Action Controls: Edit (opens modal), Share (opens modal), Delete */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
            <Tooltip title="Edit name" placement="top">
              <IconButton
                size="small"
                onClick={() => setShowEditModal(true)}
                sx={{
                  color: isDark ? "#94a3b8" : "#64748b",
                  p: "5px",
                  borderRadius: "8px",
                  "&:hover": {
                    backgroundColor: isDark ? "rgba(99, 102, 241, 0.15)" : "#e0e7ff",
                    color: isDark ? "#38bdf8" : "#6366f1",
                  },
                }}
              >
                <EditOutlinedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>


            <Tooltip title="Delete authenticator" placement="top">
              <IconButton
                size="small"
                onClick={onClose}
                sx={{
                  color: isDark ? "#64748b" : "#94a3b8",
                  p: "5px",
                  borderRadius: "8px",
                  "&:hover": {
                    backgroundColor: "rgba(239, 68, 68, 0.15)",
                    color: "#ef4444",
                  },
                }}
              >
                <DeleteIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Center Row: OTP Code + Copy Button */}
        <Box
          onClick={handleCopy}
          sx={{
            backgroundColor: isDark ? "rgba(255, 255, 255, 0.02)" : "#f8fafc",
            border: isDark ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid #f1f5f9",
            borderRadius: "12px",
            p: "8px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            transition: "all 0.15s ease",
            "&:hover": {
              backgroundColor: isDark ? "rgba(99, 102, 241, 0.08)" : "#f1f5f9",
              borderColor: isDark ? "rgba(99, 102, 241, 0.3)" : "#e2e8f0",
            },
          }}
        >
          <Typography
            sx={{
              fontFamily: "monospace",
              fontWeight: 800,
              fontSize: { xs: "1.45rem", sm: "1.6rem" },
              letterSpacing: "0.12em",
              color: timerColor,
              lineHeight: 1,
              userSelect: "all",
              transition: "color 0.2s ease",
            }}
          >
            {formatOtpCode(otpCode)}
          </Typography>

          <Tooltip title={copied ? "Copied!" : "Copy Code"}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleCopy();
              }}
              sx={{
                backgroundColor: copied
                  ? "#10b981"
                  : isDark
                    ? "rgba(99, 102, 241, 0.15)"
                    : "#e0e7ff",
                color: copied ? "#ffffff" : isDark ? "#38bdf8" : "#4f46e5",
                p: "6px",
                borderRadius: "8px",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: copied ? "#059669" : "#6366f1",
                  color: "#ffffff",
                },
              }}
            >
              {copied ? <CheckIcon sx={{ fontSize: 16 }} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
            </IconButton>
          </Tooltip>
        </Box>

        {/* Bottom Row: Animated Timer Bar + Countdown */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              flex: 1,
              height: 4,
              borderRadius: "999px",
              backgroundColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                width: `${percentage}%`,
                height: "100%",
                backgroundColor: timerColor,
                borderRadius: "999px",
                transition: "width 1s linear, background-color 0.3s ease",
              }}
            />
          </Box>

          <Typography
            sx={{
              fontSize: "0.7rem",
              fontWeight: 700,
              color: timerColor,
              fontFamily: "monospace",
              display: "flex",
              alignItems: "center",
              gap: 0.3,
              flexShrink: 0,
            }}
          >
            <LockResetIcon sx={{ fontSize: 13 }} />
            {remaining}s
          </Typography>
        </Box>
      </Box>

      {/* 1. SEPARATE EDIT AUTHENTICATOR MODAL (ONLY NAME IS EDITABLE) */}
      <EditAuthenticatorModal
        open={showEditModal}
        currentName={issuer}
        account={tokenData.account}
        themeMode={themeMode}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveName}
      />
    </>
  );
}
