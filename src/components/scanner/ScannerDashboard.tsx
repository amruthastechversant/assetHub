"use client";

import React, { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import TextField from "@mui/material/TextField";
import InputBase from "@mui/material/InputBase";
import InputAdornment from "@mui/material/InputAdornment";
import { useSession } from "next-auth/react";

import CloseIcon from "@mui/icons-material/Close";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import SecurityIcon from "@mui/icons-material/Security";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckIcon from "@mui/icons-material/Check";
import LockResetIcon from "@mui/icons-material/LockReset";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import HistoryIcon from "@mui/icons-material/History";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import AddIcon from "@mui/icons-material/Add";
import DevicesIcon from "@mui/icons-material/Devices";

import ScannerViewfinder from "./ScannerViewfinder";
import DeviceDetailsSheet from "./DeviceDetailsSheet";
import AuthenticatorTokenCard from "./AuthenticatorTokenCard";
import ScannerBackground from "./ScannerBackground";
import InstantLogo from "./InstantLogo";
import UserProfilePill from "./UserProfilePill";
import { ToastContainer, toast } from "react-toastify";

import {
  parseScannedQr,
  fetchDeviceByCode,
  DeviceDetailView,
  AuthenticatorTokenData,
  MOCK_ASSETS,
} from "@/lib/mockScannerData";
import { generateTOTP, formatOtpCode, getRemainingSeconds } from "@/lib/totp";

// Recent scan entry structure
interface RecentScanItem {
  device: DeviceDetailView;
  scannedAt: number; // millisecond timestamp
}

// 2FA Pop-up Modal state
interface Enrolled2FAModalState {
  token: AuthenticatorTokenData;
  otp: string;
}

// Subcomponent: Live OTP with countdown animation inside Enrolled Modal
function EnrolledModalOtpLive({
  tokenData,
  initialOtp,
  isDark,
  onToast,
}: {
  tokenData: AuthenticatorTokenData;
  initialOtp: string;
  isDark: boolean;
  onToast: (msg: string) => void;
}) {
  const [otp, setOtp] = useState(initialOtp);
  const [remaining, setRemaining] = useState(30);
  const [percentage, setPercentage] = useState(100);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const update = async () => {
      try {
        const code = await generateTOTP(tokenData.secret, {
          timeStep: tokenData.period || 30,
          digits: tokenData.digits || 6,
        });
        setOtp(code);
      } catch { }
    };

    const interval = setInterval(() => {
      const { remaining: rem, percentage: pct } = getRemainingSeconds(tokenData.period || 30);
      setRemaining(rem);
      setPercentage(pct);
      if (rem === (tokenData.period || 30) || rem === 1) {
        update();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [tokenData]);

  const handleCopy = () => {
    navigator.clipboard.writeText(otp);
    setCopied(true);
    onToast(`Copied OTP ${otp} to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUrgent = remaining <= 5;
  const timerColor = isUrgent ? "#ef4444" : remaining <= 10 ? "#f59e0b" : isDark ? "#38bdf8" : "#4f46e5";

  return (
    <Box
      sx={{
        mt: 2,
        p: { xs: "12px 14px", sm: "14px 18px" },
        borderRadius: "16px",
        backgroundColor: isDark ? "rgba(56, 189, 248, 0.08)" : "#f0f9ff",
        border: isDark ? "1px solid rgba(56, 189, 248, 0.25)" : "1px solid #bae6fd",
        display: "flex",
        flexDirection: "column",
        gap: 1.2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ textAlign: "left" }}>
          <Typography sx={{ fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.08em", color: isDark ? "#94a3b8" : "#64748b", fontWeight: 700 }}>
            Live One-Time Password (OTP)
          </Typography>
          <Typography sx={{ fontSize: { xs: "1.45rem", sm: "1.75rem" }, fontWeight: 800, fontFamily: "monospace", letterSpacing: "0.12em", color: timerColor, lineHeight: 1.2 }}>
            {formatOtpCode(otp)}
          </Typography>
        </Box>

        <Tooltip title={copied ? "Copied!" : "Copy OTP"}>
          <IconButton
            onClick={handleCopy}
            sx={{
              backgroundColor: copied ? "#10b981" : "#6366f1",
              color: "#ffffff",
              p: 1.2,
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
              "&:hover": { backgroundColor: copied ? "#059669" : "#818cf8" },
            }}
          >
            {copied ? <CheckIcon sx={{ fontSize: 18 }} /> : <ContentCopyIcon sx={{ fontSize: 18 }} />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Animated Timer Bar with countdown */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box sx={{ flex: 1, height: 4, borderRadius: "999px", backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0", overflow: "hidden" }}>
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
        <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: timerColor, fontFamily: "monospace", display: "flex", alignItems: "center", gap: 0.3, flexShrink: 0 }}>
          <LockResetIcon sx={{ fontSize: 13 }} />
          {remaining}s
        </Typography>
      </Box>
    </Box>
  );
}

export default function ScannerDashboard() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "Administrator";
  const userName = session?.user?.name || "Ashiq S";
  const userEmail = session?.user?.email || "ashiq@company.com";

  const [themeMode, setThemeMode] = useState<"dark" | "light">("dark");
  const isDark = themeMode === "dark";

  // Tabs: "scanner" | "recent" | "authenticators"
  const [activeTab, setActiveTab] = useState<"scanner" | "recent" | "authenticators">("scanner");

  // Core Data States
  const [justScannedItem, setJustScannedItem] = useState<RecentScanItem | null>(null);
  const [recentScans, setRecentScans] = useState<RecentScanItem[]>([]);
  const [authTokens, setAuthTokens] = useState<AuthenticatorTokenData[]>([]);

  // Search in Authenticators tab
  const [authSearchQuery, setAuthSearchQuery] = useState("");

  // Modals
  const [selectedDeviceModal, setSelectedDeviceModal] = useState<DeviceDetailView | null>(null);
  const [enrolled2FAModal, setEnrolled2FAModal] = useState<Enrolled2FAModalState | null>(null);

  // Timer ticker for live "Scanned Xs ago"
  const [, setTicker] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTicker((t) => t + 1), 5000);
    return () => clearInterval(timer);
  }, []);

  // Initialize theme from storage
  useEffect(() => {
    const savedTheme = localStorage.getItem("instant_scanner_theme") || localStorage.getItem("assethub_scanner_theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      setThemeMode(savedTheme);
    }
  }, []);

  // Initialize recent devices and mock 2FA tokens
  useEffect(() => {
    Promise.all([
      fetchDeviceByCode("TV-LAP-02481"),
      fetchDeviceByCode("TV-MON-09124"),
      fetchDeviceByCode("DEV-10025"),
      fetchDeviceByCode("TV-DOC-00341"),
    ]).then((devices) => {
      const valid = devices.filter(Boolean) as DeviceDetailView[];
      if (valid.length > 0) {
        setJustScannedItem({
          device: valid[0],
          scannedAt: Date.now() - 25 * 1000,
        });
        const recents: RecentScanItem[] = [];
        if (valid[1]) recents.push({ device: valid[1], scannedAt: Date.now() - 4 * 60 * 1000 });
        if (valid[2]) recents.push({ device: valid[2], scannedAt: Date.now() - 32 * 60 * 1000 });
        if (valid[3]) recents.push({ device: valid[3], scannedAt: Date.now() - 58 * 60 * 1000 });
        setRecentScans(recents);
      }
    });

    // Default mock 2FA tokens
    try {
      const stored = localStorage.getItem("instant_auth_tokens") || localStorage.getItem("assethub_auth_tokens");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAuthTokens(parsed);
          return;
        }
      }
    } catch { }

    setAuthTokens([
      {
        issuer: "Google Workspace",
        account: "ashiq@company.com",
        secret: "JBSWY3DPEHPK3PXP",
        period: 30,
        digits: 6,
        rawPayload: "otpauth://totp/Google%20Workspace:ashiq@company.com?secret=JBSWY3DPEHPK3PXP&issuer=Google%20Workspace",
      },
      {
        issuer: "GitHub",
        account: "ashiq@company.com",
        secret: "HXDMVJECJJWSRB3HW",
        period: 30,
        digits: 6,
        rawPayload: "otpauth://totp/GitHub:ashiq@company.com?secret=HXDMVJECJJWSRB3HW&issuer=GitHub",
      },
    ]);
  }, []);

  const selectTheme = (theme: "dark" | "light") => {
    setThemeMode(theme);
    try {
      localStorage.setItem("instant_scanner_theme", theme);
    } catch { }
  };

  const showToast = useCallback((msg: string) => {
    const isError = /error|fail|invalid|restricted|not detected|not granted|no valid/i.test(msg);
    const isWarn = /exceed|limit|maximum/i.test(msg);
    const isSuccess = /success|logged|copied|added|enrolled|identified|switched|✓/i.test(msg);

    const cleanMsg = msg.replace(/^✓\s*/, "");

    if (isError) {
      toast.error(cleanMsg);
    } else if (isWarn) {
      toast.warn(cleanMsg);
    } else if (isSuccess) {
      toast.success(cleanMsg);
    } else {
      toast.info(cleanMsg);
    }
  }, []);

  // Format relative timestamp
  const getRelativeTime = (timestamp: number) => {
    const diffSec = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSec < 20) return "Just now";
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  // Format displayed scan timestamp (e.g. "12:45 PM" or "Sep 24, 12:45 PM")
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const timeStr = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    if (isToday) {
      return timeStr;
    }
    const dateStr = date.toLocaleDateString([], { month: "short", day: "numeric" });
    return `${dateStr}, ${timeStr}`;
  };

  // Detailed timestamp with exact time and relative age for hover tooltip
  const getFullDateTimeString = (timestamp: number) => {
    const date = new Date(timestamp);
    const dateStr = date.toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const timeStr = date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    });
    const rel = getRelativeTime(timestamp);
    return `${dateStr} at ${timeStr} • ${rel}`;
  };

  // Universal QR scan handler
  const handleScanResult = async (rawPayload: string) => {
    const parsed = parseScannedQr(rawPayload);

    if (parsed.type === "authenticator" && parsed.authData) {
      const token = parsed.authData;
      let currentOtp = "------";
      try {
        currentOtp = await generateTOTP(token.secret, {
          timeStep: token.period || 30,
          digits: token.digits || 6,
          algorithm: token.algorithm === "SHA256" ? "SHA-256" : "SHA-1",
        });
        if (navigator.clipboard) {
          navigator.clipboard.writeText(currentOtp);
        }
      } catch { }

      setAuthTokens((prev) => {
        const exists = prev.find(
          (t) => t.issuer.toLowerCase() === token.issuer.toLowerCase() && t.account.toLowerCase() === token.account.toLowerCase()
        );
        const next = exists ? prev : [token, ...prev];
        try {
          localStorage.setItem("instant_auth_tokens", JSON.stringify(next));
        } catch { }
        return next;
      });

      // Open 2FA Confirmation Modal
      setEnrolled2FAModal({ token, otp: currentOtp });
      showToast(`✓ Authenticator enrolled: ${token.issuer}`);
    } else {
      const code = parsed.assetCode || rawPayload;
      let device = await fetchDeviceByCode(code);
      if (!device) {
        device = {
          id: `scanned-${Date.now()}`,
          assetCode: code,
          assetType: "Hardware",
          model: `Identified Asset (${code})`,
          storage: "512 GB NVMe",
          operatingSystem: "Enterprise OS",
          ram: "16 GB Unified",
          processor: "Core Chipset",
          purchaseDate: new Date().toISOString().split("T")[0],
          status: "active",
          location: "Corporate Bay",
        };
      }

      const scanEntry: RecentScanItem = {
        device,
        scannedAt: Date.now(),
      };

      // Update Card 2 (Recent scans):
      // Exclude the newly scanned device from recent scans,
      // and move the previous justScannedItem into recent scans.
      setRecentScans((prev) => {
        let updated = prev.filter((item) => item.device.assetCode !== device!.assetCode);
        if (justScannedItem && justScannedItem.device.assetCode !== device!.assetCode) {
          updated = [justScannedItem, ...updated.filter((item) => item.device.assetCode !== justScannedItem.device.assetCode)];
        }
        return updated.slice(0, 10);
      });

      // Set Card 1 (Top right) to the newly scanned device
      setJustScannedItem(scanEntry);

      // Automatically open the Asset Details Modal
      setSelectedDeviceModal(device);
      showToast(`Asset identified: ${device.model}`);
    }
  };

  // Filtered tokens for search
  const filteredTokens = authTokens.filter((token) => {
    const q = authSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return token.issuer.toLowerCase().includes(q) || token.account.toLowerCase().includes(q);
  });

  return (
    <Box
      sx={{
        height: { xs: "100dvh", md: "auto" },
        minHeight: { xs: "100dvh", md: "100vh" },
        maxHeight: { xs: "100dvh", md: "none" },
        width: "100%",
        maxWidth: "100vw",
        overflow: { xs: "hidden", md: "visible" },
        backgroundColor: isDark ? "#080c14" : "#f4f7f5",
        backgroundImage: isDark
          ? "radial-gradient(circle at 10% 12%, rgba(56,189,248,0.07) 0%, transparent 26rem), radial-gradient(circle at 90% 88%, rgba(99,102,241,0.09) 0%, transparent 28rem)"
          : "radial-gradient(circle at 10% 12%, rgba(56,189,248,0.09) 0%, transparent 26rem), radial-gradient(circle at 90% 88%, rgba(99,102,241,0.07) 0%, transparent 28rem)",
        color: isDark ? "#ffffff" : "#08131e",
        fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        transition: "background-color 0.3s ease, color 0.3s ease",
      }}
    >
      {/* Background Canvas */}
      <ScannerBackground isDark={isDark} />

      {/* React-Toastify Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={2800}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
        theme={isDark ? "dark" : "light"}
      />

      {/* ============================================================== */}
      {/* 1. TOP NAVBAR (Compact Mobile Native Header)                   */}
      {/* ============================================================== */}
      <Box
        component="header"
        sx={{
          flexShrink: 0,
          height: { xs: 52, md: 68 },
          px: { xs: 1.5, sm: 2.5, md: 4 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: { xs: "relative", md: "sticky" },
          top: 0,
          zIndex: 100,
          backgroundColor: isDark ? "rgba(8, 12, 20, 0.92)" : "rgba(255, 255, 255, 0.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0",
        }}
      >
        {/* Leftmost: Iconic Instant Brand */}
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 1.5 }, minWidth: 0 }}>
          {/* Iconic Instant Brand */}
          <InstantLogo themeMode={themeMode} size="medium" />
        </Box>

        {/* Rightmost: Theme Toggle & Avatar */}
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 1.5 }, flexShrink: 0 }}>
          {/* Segmented Light / Dark Toggle on Tablet & Desktop */}
          <Box
            role="radiogroup"
            aria-label="Theme toggle"
            sx={{
              display: { xs: "none", sm: "inline-flex" },
              alignItems: "center",
              p: "3px",
              borderRadius: "999px",
              backgroundColor: isDark ? "rgba(255, 255, 255, 0.06)" : "#e2e8f0",
              border: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #cbd5e1",
            }}
          >
            <Tooltip title="Light theme">
              <Box
                component="button"
                type="button"
                onClick={() => selectTheme("light")}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  px: 1.3,
                  py: "4px",
                  borderRadius: "999px",
                  border: 0,
                  cursor: "pointer",
                  backgroundColor: !isDark ? "#ffffff" : "transparent",
                  color: !isDark ? "#0f172a" : "#94a3b8",
                  boxShadow: !isDark ? "0 2px 6px rgba(0, 0, 0, 0.12)" : "none",
                }}
              >
                <LightModeIcon sx={{ fontSize: 15, color: !isDark ? "#f59e0b" : "inherit" }} />
                <Typography sx={{ fontSize: "0.74rem", fontWeight: !isDark ? 700 : 500 }}>
                  Light
                </Typography>
              </Box>
            </Tooltip>
            <Tooltip title="Dark theme">
              <Box
                component="button"
                type="button"
                onClick={() => selectTheme("dark")}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  px: 1.3,
                  py: "4px",
                  borderRadius: "999px",
                  border: 0,
                  cursor: "pointer",
                  backgroundColor: isDark ? "#1e293b" : "transparent",
                  color: isDark ? "#ffffff" : "#64748b",
                  boxShadow: isDark ? "0 2px 6px rgba(0, 0, 0, 0.4)" : "none",
                }}
              >
                <DarkModeIcon sx={{ fontSize: 15, color: isDark ? "#818cf8" : "inherit" }} />
                <Typography sx={{ fontSize: "0.74rem", fontWeight: isDark ? 700 : 500 }}>
                  Dark
                </Typography>
              </Box>
            </Tooltip>
          </Box>

          {/* Compact Single-button Theme Toggle on Mobile */}
          <Tooltip title={`Switch to ${isDark ? "Light" : "Dark"} theme`}>
            <IconButton
              size="small"
              onClick={() => selectTheme(isDark ? "light" : "dark")}
              sx={{
                display: { xs: "flex", sm: "none" },
                width: 34,
                height: 34,
                borderRadius: "10px",
                border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #cbd5e1",
                background: isDark ? "rgba(255,255,255,0.05)" : "#ffffff",
                color: isDark ? "#f59e0b" : "#6366f1",
              }}
            >
              {isDark ? <LightModeIcon sx={{ fontSize: 17 }} /> : <DarkModeIcon sx={{ fontSize: 17 }} />}
            </IconButton>
          </Tooltip>

          {/* User Profile Pill showing Name & Email with minimal expansion on click */}
          <UserProfilePill
            userName={userName}
            userEmail={userEmail}
            userRole={userRole === "Admin" ? "Administrator" : userRole}
            department="IT Operations"
            themeMode={themeMode}
          />
        </Box>
      </Box>

      {/* ============================================================== */}
      {/* 2. MAIN CONTAINER & TOP-LEFT TABS                             */}
      {/* ============================================================== */}
      <Box
        component="main"
        sx={{
          flex: 1,
          minHeight: 0,
          width: "100%",
          maxWidth: 1060,
          margin: "0 auto",
          p: { xs: "8px 12px 6px", sm: "12px 16px 8px", md: "24px 28px 64px" },
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          position: "relative",
          zIndex: 1,
          overflowY: { xs: (activeTab === "scanner" ? "hidden" : "auto"), md: "visible" },
        }}
      >
        {/* Desktop Top-Left Tabs (Hidden on mobile) */}
        <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", justifyContent: "space-between", mb: 3 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              p: "4px",
              borderRadius: "16px",
              backgroundColor: isDark ? "rgba(14, 20, 36, 0.9)" : "#e2e8f0",
              border: isDark ? "1px solid rgba(99, 102, 241, 0.25)" : "1px solid #cbd5e1",
              boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            {/* Tab 1: Scanner */}
            <Box
              component="button"
              onClick={() => setActiveTab("scanner")}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 2.4,
                py: "8px",
                borderRadius: "12px",
                border: 0,
                cursor: "pointer",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                backgroundColor: (activeTab === "scanner" || activeTab === "recent") ? (isDark ? "#6366f1" : "#ffffff") : "transparent",
                color: (activeTab === "scanner" || activeTab === "recent") ? (isDark ? "#ffffff" : "#0f172a") : (isDark ? "#94a3b8" : "#64748b"),
                boxShadow: (activeTab === "scanner" || activeTab === "recent") ? (isDark ? "0 4px 14px rgba(99,102,241,0.35)" : "0 2px 8px rgba(0,0,0,0.1)") : "none",
                fontWeight: (activeTab === "scanner" || activeTab === "recent") ? 750 : 600,
                fontSize: "0.88rem",
              }}
            >
              <QrCodeScannerIcon sx={{ fontSize: 18 }} />
              <span>Scanner</span>
            </Box>

            {/* Tab 2: Authenticators */}
            <Box
              component="button"
              onClick={() => setActiveTab("authenticators")}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 2.4,
                py: "8px",
                borderRadius: "12px",
                border: 0,
                cursor: "pointer",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                backgroundColor: activeTab === "authenticators" ? (isDark ? "#6366f1" : "#ffffff") : "transparent",
                color: activeTab === "authenticators" ? (isDark ? "#ffffff" : "#0f172a") : (isDark ? "#94a3b8" : "#64748b"),
                boxShadow: activeTab === "authenticators" ? (isDark ? "0 4px 14px rgba(99,102,241,0.35)" : "0 2px 8px rgba(0,0,0,0.1)") : "none",
                fontWeight: activeTab === "authenticators" ? 750 : 600,
                fontSize: "0.88rem",
              }}
            >
              <SecurityIcon sx={{ fontSize: 18 }} />
              <span>Authenticators</span>
              {authTokens.length > 0 && (
                <Box
                  sx={{
                    px: 0.8,
                    py: 0.15,
                    borderRadius: "999px",
                    backgroundColor: activeTab === "authenticators" ? "rgba(255,255,255,0.25)" : "#6366f1",
                    color: "#ffffff",
                    fontSize: "0.68rem",
                    fontWeight: 750,
                  }}
                >
                  {authTokens.length}
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {/* ============================================================== */}
        {/* VIEW 1: SCANNER & RECENT (Responsive Desktop & Mobile Tabs)    */}
        {/* ============================================================== */}
        {(activeTab === "scanner" || activeTab === "recent") && (
          <Box
            sx={{
              display: { xs: "flex", md: "grid" },
              flexDirection: "column",
              gridTemplateColumns: { md: "440px minmax(0, 1fr)" },
              gap: { xs: "12px", md: "24px" },
              alignItems: "stretch",
              flex: 1,
              minHeight: 0,
              height: { xs: "100%", md: "auto" },
              width: "100%",
            }}
          >
            {/* LEFT COLUMN: Camera Viewfinder (Fills available space on mobile like Image 2) */}
            <Box
              sx={{
                width: "100%",
                maxWidth: { xs: "100%", md: 440 },
                height: { xs: "100%", md: "auto" },
                flex: 1,
                minHeight: 0,
                display: { xs: activeTab === "scanner" ? "flex" : "none", md: "flex" },
                flexDirection: "column",
              }}
            >
              <ScannerViewfinder onScanResult={handleScanResult} onToast={showToast} />
            </Box>

            {/* RIGHT COLUMN: Two Vertical Cards (Visible on desktop, or on mobile when activeTab is recent) */}
            <Box
              sx={{
                display: { xs: activeTab === "recent" ? "flex" : "none", md: "flex" },
                flexDirection: "column",
                gap: { xs: "16px", md: "20px" },
                width: "100%",
              }}
            >

              {/* CARD 1 (TOP RIGHT): JUST SCANNED (Active Item Focus) */}
              <Box
                sx={{
                  backgroundColor: isDark ? "#0e1424" : "#ffffff",
                  borderRadius: { xs: "22px", sm: "26px", md: "28px" },
                  p: { xs: "16px 14px", sm: "20px", md: "24px" },
                  border: isDark ? "1px solid rgba(99, 102, 241, 0.22)" : "1px solid #e2e8f0",
                  boxShadow: isDark ? "0 20px 50px rgba(0,0,0,0.35)" : "0 12px 35px rgba(0,0,0,0.05)",
                  transition: "all 0.25s ease",
                }}
              >
                {/* Header: Title + Live Timer */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: justScannedItem ? "#10b981" : "#64748b",
                        boxShadow: justScannedItem ? "0 0 10px #10b981" : "none",
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: "0.74rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.12em",
                        fontWeight: 750,
                        color: justScannedItem ? "#38bdf8" : (isDark ? "#64748b" : "#94a3b8"),
                      }}
                    >
                      {justScannedItem ? "Last Scanned" : "Scanner Standby"}
                    </Typography>
                  </Box>

                  {justScannedItem && (
                    <Tooltip title={getFullDateTimeString(justScannedItem.scannedAt)} arrow placement="top">
                      <Box
                        sx={{
                          px: 1,
                          py: 0.2,
                          borderRadius: "8px",
                          backgroundColor: isDark ? "rgba(56, 189, 248, 0.12)" : "#e0f2fe",
                          color: isDark ? "#38bdf8" : "#0284c7",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {formatTimestamp(justScannedItem.scannedAt)}
                      </Box>
                    </Tooltip>
                  )}
                </Box>

                {justScannedItem ? (
                  <Box>
                    <Box sx={{ display: "flex", gap: { xs: 1.5, sm: 2 }, alignItems: "center", mb: 2 }}>
                      <Box
                        sx={{
                          width: { xs: 50, sm: 58 },
                          height: { xs: 50, sm: 58 },
                          borderRadius: { xs: "15px", sm: "18px" },
                          backgroundColor: isDark ? "#131b2e" : "#f1f5f9",
                          border: isDark ? "1px solid rgba(99, 102, 241, 0.25)" : "1px solid #e2e8f0",
                          display: "grid",
                          placeItems: "center",
                          color: isDark ? "#38bdf8" : "#6366f1",
                          flexShrink: 0,
                        }}
                      >
                        <DevicesIcon sx={{ fontSize: { xs: 26, sm: 32 } }} />
                      </Box>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography noWrap sx={{ fontSize: { xs: "1.02rem", sm: "1.12rem" }, fontWeight: 750, color: isDark ? "#ffffff" : "#08131e" }}>
                          {justScannedItem.device.model}
                        </Typography>
                        <Typography sx={{ fontSize: "0.82rem", color: isDark ? "#818cf8" : "#64748b", mt: 0.2 }}>
                          {justScannedItem.device.assetType}
                        </Typography>

                        {/* Tag + 1-Click Copy */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mt: 0.8 }}>
                          <Box
                            sx={{
                              p: "2px 8px",
                              borderRadius: "7px",
                              backgroundColor: isDark ? "#080c14" : "#f8fafc",
                              border: isDark ? "1px solid rgba(99, 102, 241, 0.2)" : "1px solid #e2e8f0",
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              fontFamily: "monospace",
                              color: isDark ? "#818cf8" : "#475569",
                            }}
                          >
                            {justScannedItem.device.assetCode}
                          </Box>
                          <Tooltip title="Copy asset code">
                            <IconButton
                              size="small"
                              onClick={() => {
                                navigator.clipboard.writeText(justScannedItem.device.assetCode);
                                showToast("Asset code copied to clipboard");
                              }}
                              sx={{
                                p: 0.4,
                                color: isDark ? "#818cf8" : "#64748b",
                                "&:hover": { color: isDark ? "#ffffff" : "#0f172a" },
                              }}
                            >
                              <ContentCopyIcon sx={{ fontSize: 13 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Box>

                    {/* View Full Details Button */}
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => setSelectedDeviceModal(justScannedItem.device)}
                      endIcon={<ArrowForwardIcon />}
                      sx={{
                        backgroundColor: "#6366f1",
                        color: "#ffffff",
                        fontWeight: 750,
                        borderRadius: "14px",
                        py: { xs: 1.1, sm: 1.2 },
                        textTransform: "none",
                        fontSize: "0.88rem",
                        boxShadow: "0 6px 20px rgba(99,102,241,0.3)",
                        "&:hover": { backgroundColor: "#818cf8" },
                      }}
                    >
                      View Full Details
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: "center", py: 3, px: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: "16px",
                        backgroundColor: isDark ? "rgba(99,102,241,0.1)" : "#eef2ff",
                        color: "#6366f1",
                        display: "grid",
                        placeItems: "center",
                        margin: "0 auto 12px",
                      }}
                    >
                      <QrCodeScannerIcon sx={{ fontSize: 26 }} />
                    </Box>
                    <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: isDark ? "#f1f5f9" : "#08131e", mb: 0.5 }}>
                      No Device Scanned Yet
                    </Typography>
                    <Typography sx={{ fontSize: "0.8rem", color: isDark ? "#94a3b8" : "#64748b", maxWidth: 280, mx: "auto" }}>
                      Aim camera at any asset label, barcode, or 2FA code to view instant specifications.
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* CARD 2 (BOTTOM RIGHT): SCAN HISTORY (Last Scanned Assets) */}
              <Box
                sx={{
                  backgroundColor: isDark ? "#0e1424" : "#ffffff",
                  borderRadius: { xs: "22px", sm: "26px", md: "28px" },
                  p: { xs: "16px 14px", sm: "20px", md: "24px" },
                  border: isDark ? "1px solid rgba(99, 102, 241, 0.18)" : "1px solid #e2e8f0",
                  boxShadow: isDark ? "0 20px 50px rgba(0,0,0,0.35)" : "0 12px 35px rgba(0,0,0,0.05)",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Header */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <HistoryIcon sx={{ fontSize: 18, color: "#818cf8" }} />
                    <Typography sx={{ fontSize: "0.92rem", fontWeight: 750, color: isDark ? "#f1f5f9" : "#08131e" }}>
                      Recent Scans
                    </Typography>
                  </Box>
                </Box>

                {recentScans.length > 0 ? (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {recentScans.map((item, idx) => (
                      <Box
                        key={item.device.assetCode}
                        onClick={() => {
                          setSelectedDeviceModal(item.device);
                        }}
                        sx={{
                          p: { xs: "10px 12px", sm: "12px 14px" },
                          borderRadius: "14px",
                          border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid #f1f5f9",
                          backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "#f8fafc",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            backgroundColor: isDark ? "rgba(99, 102, 241, 0.1)" : "#f1f5f9",
                            borderColor: "#6366f1",
                            transform: "translateX(3px)",
                          },
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, minWidth: 0, flex: 1 }}>
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: "10px",
                              backgroundColor: isDark ? "#131b2e" : "#ffffff",
                              border: isDark ? "1px solid rgba(99,102,241,0.2)" : "1px solid #e2e8f0",
                              display: "grid",
                              placeItems: "center",
                              color: isDark ? "#38bdf8" : "#6366f1",
                              flexShrink: 0,
                            }}
                          >
                            <DevicesIcon sx={{ fontSize: 18 }} />
                          </Box>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography noWrap sx={{ fontSize: "0.86rem", fontWeight: 700, color: isDark ? "#f8fafc" : "#08131e" }}>
                              {item.device.model}
                            </Typography>
                            <Typography noWrap sx={{ fontSize: "0.72rem", color: isDark ? "#818cf8" : "#64748b", fontFamily: "monospace" }}>
                              {item.device.assetCode}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, flexShrink: 0, ml: 1 }}>
                          <Tooltip title={getFullDateTimeString(item.scannedAt)} arrow placement="top">
                            <Typography sx={{ fontSize: "0.72rem", color: isDark ? "#94a3b8" : "#8b989f", fontWeight: 550, cursor: "pointer" }}>
                              {formatTimestamp(item.scannedAt)}
                            </Typography>
                          </Tooltip>
                          <Tooltip title="Show the full details" arrow placement="top">
                            <Button
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setJustScannedItem(item);
                                setSelectedDeviceModal(item.device);
                              }}
                              sx={{
                                minWidth: 0,
                                px: "10px",
                                py: "3px",
                                borderRadius: "8px",
                                fontSize: "0.72rem",
                                fontWeight: 750,
                                textTransform: "none",
                                backgroundColor: isDark ? "rgba(99, 102, 241, 0.16)" : "#e0e7ff",
                                color: isDark ? "#38bdf8" : "#4338ca",
                                border: isDark ? "1px solid rgba(99, 102, 241, 0.3)" : "1px solid #c7d2fe",
                                "&:hover": {
                                  backgroundColor: isDark ? "rgba(99, 102, 241, 0.3)" : "#c7d2fe",
                                },
                              }}
                            >
                              View
                            </Button>
                          </Tooltip>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography sx={{ color: isDark ? "#64748b" : "#94a3b8", fontSize: "0.85rem", textAlign: "center", my: "auto" }}>
                    No recent history.
                  </Typography>
                )}

                {/* Helpful Tip Box at the Bottom of Card 2 */}
                <Box
                  sx={{
                    mt: "auto",
                    pt: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Typography sx={{ fontSize: "0.74rem", color: isDark ? "#64748b" : "#8b989f", lineHeight: 1.4 }}>
                    💡 Click any recent scan above to view its full details
                  </Typography>
                </Box>
              </Box>

            </Box>
          </Box>
        )}

        {/* ============================================================== */}
        {/* VIEW 2: AUTHENTICATORS TAB (Full 2FA TOTP Vault View)          */}
        {/* ============================================================== */}
        {activeTab === "authenticators" && (
          <Box sx={{ width: "min(960px, 100%)", margin: "0 auto", flex: 1, pt: { xs: 2.5, sm: 3, md: 0 }, pb: { xs: 9, md: 2 } }}>
            {/* Header: Title + Scan New Authenticator Button */}
            <Box
              sx={{
                display: "flex",
                alignItems: { xs: "flex-start", sm: "center" },
                justifyContent: "space-between",
                mb: 2.5,
                flexDirection: { xs: "column", sm: "row" },
                gap: 1.5,
              }}
            >
              <Box>
                <Typography variant="h1" sx={{ fontSize: { xs: "1.3rem", sm: "1.5rem", md: "1.8rem" }, fontWeight: 800, letterSpacing: "-0.03em" }}>
                  2FA Authenticators
                </Typography>
                <Typography sx={{ color: isDark ? "#94a3b8" : "#64748b", fontSize: { xs: "0.78rem", sm: "0.88rem" }, mt: 0.3 }}>
                  Manage Time-based One-Time Passwords (TOTP) synced with your workspace
                </Typography>
              </Box>

              <Button
                variant="contained"
                onClick={() => {
                  setActiveTab("scanner");
                }}
                startIcon={<AddIcon />}
                sx={{
                  backgroundColor: "#6366f1",
                  color: "#ffffff",
                  fontWeight: 750,
                  borderRadius: "14px",
                  px: { xs: 2.2, sm: 2.8 },
                  py: { xs: 0.9, sm: 1.1 },
                  textTransform: "none",
                  fontSize: "0.88rem",
                  boxShadow: "0 6px 20px rgba(99,102,241,0.3)",
                  alignSelf: { xs: "stretch", sm: "auto" },
                  "&:hover": { backgroundColor: "#818cf8" },
                }}
              >
                Scan QR Code
              </Button>
            </Box>

            {/* Search Input (Standard, beautiful, robustly styled) */}
            <Box
              sx={{
                mb: 2.5,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                backgroundColor: isDark ? "rgba(14, 20, 36, 0.85)" : "#ffffff",
                border: isDark ? "1.5px solid rgba(99, 102, 241, 0.28)" : "1.5px solid #cbd5e1",
                borderRadius: "16px",
                px: 2,
                py: "10px",
                boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.3)" : "0 2px 10px rgba(0,0,0,0.04)",
                transition: "all 0.2s ease",
                "&:focus-within": {
                  borderColor: "#6366f1",
                  boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.25)",
                },
              }}
            >
              <SearchIcon sx={{ color: isDark ? "#818cf8" : "#6366f1", fontSize: 21, flexShrink: 0 }} />
              <InputBase
                fullWidth
                placeholder="Search services, accounts or emails..."
                value={authSearchQuery}
                onChange={(e) => setAuthSearchQuery(e.target.value)}
                sx={{
                  color: isDark ? "#ffffff" : "#0f172a",
                  fontSize: "0.9rem",
                  "& input::placeholder": {
                    color: isDark ? "#64748b" : "#94a3b8",
                    opacity: 1,
                  },
                }}
              />
              {authSearchQuery && (
                <IconButton
                  size="small"
                  onClick={() => setAuthSearchQuery("")}
                  sx={{ color: isDark ? "#94a3b8" : "#64748b", p: 0.5 }}
                >
                  <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
              )}
            </Box>

            {/* Authenticators List */}
            {filteredTokens.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: { xs: 5, md: 8 },
                  px: 3,
                  backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "#ffffff",
                  borderRadius: { xs: "22px", md: "28px" },
                  border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e2e8f0",
                }}
              >
                <Box sx={{ fontSize: "2.6rem", mb: 1.5 }}>🔐</Box>
                <Typography sx={{ fontSize: "1.15rem", fontWeight: 750, color: isDark ? "#ffffff" : "#08131e", mb: 1 }}>
                  No Authenticators Found
                </Typography>
                <Typography sx={{ fontSize: "0.85rem", color: isDark ? "#94a3b8" : "#64748b", maxWidth: 340, mx: "auto", mb: 3 }}>
                  Scan a two-factor QR code with the Instant Scanner to add your first secure credential.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setActiveTab("scanner")}
                  startIcon={<QrCodeScannerIcon />}
                  sx={{
                    backgroundColor: "#6366f1",
                    color: "#ffffff",
                    fontWeight: 750,
                    borderRadius: "14px",
                    px: 3.5,
                    py: 1.2,
                    textTransform: "none",
                    fontSize: "0.92rem",
                    boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
                    "&:hover": { backgroundColor: "#818cf8" },
                  }}
                >
                  Go to Scanner
                </Button>
              </Box>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(auto-fill, minmax(280px, 1fr))",
                  },
                  gap: { xs: 1.5, sm: 2 },
                }}
              >
                {filteredTokens.map((token, i) => (
                  <AuthenticatorTokenCard
                    key={`${token.issuer}-${token.account}-${i}`}
                    tokenData={token}
                    themeMode={themeMode}
                    onClose={() => {
                      const updated = authTokens.filter((_, idx) => idx !== i);
                      setAuthTokens(updated);
                      try {
                        localStorage.setItem("instant_auth_tokens", JSON.stringify(updated));
                      } catch { }
                      showToast(`Removed ${token.issuer}`);
                    }}
                    onUpdateToken={(updatedToken) => {
                      setAuthTokens((prev) => {
                        const copy = prev.map((t) =>
                          t.secret === token.secret && t.account === token.account ? updatedToken : t
                        );
                        try {
                          localStorage.setItem("instant_auth_tokens", JSON.stringify(copy));
                        } catch { }
                        return copy;
                      });
                    }}
                    onScanAnother={() => setActiveTab("scanner")}
                    onToast={showToast}
                  />
                ))}
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* ============================================================== */}
      {/* 3. MODAL A: FULL ASSET DETAILS SHEET                           */}
      {/* ============================================================== */}
      {selectedDeviceModal && (
        <Box
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedDeviceModal(null);
          }}
          sx={{
            position: "fixed",
            inset: 0,
            backgroundColor: isDark ? "rgba(4,14,22,0.76)" : "rgba(8,19,30,0.55)",
            backdropFilter: "blur(8px)",
            zIndex: 1000,
            display: "flex",
            alignItems: { xs: "flex-end", md: "center" },
            justifyContent: "center",
            p: { xs: 0, md: "20px" },
          }}
        >
          <Box
            sx={{
              width: { xs: "min(480px, 100%)", md: "min(840px, 100%)" },
              maxHeight: { xs: "92vh", md: "min(780px, calc(100vh - 30px))" },
              borderRadius: { xs: "28px 28px 0 0", md: "28px" },
              backgroundColor: isDark ? "#0e1424" : "#ffffff",
              boxShadow: isDark ? "0 30px 100px rgba(0,0,0,0.6)" : "0 30px 100px rgba(0,0,0,0.2)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              border: isDark ? { md: "1px solid rgba(99, 102, 241, 0.22)" } : { md: "1px solid #e2e8f0" },
              animation: "sheetRise 0.25s ease-out",
              "@keyframes sheetRise": {
                from: { transform: "translateY(20px)", opacity: 0 },
                to: { transform: "none", opacity: 1 },
              },
            }}
          >
            <DeviceDetailsSheet
              device={selectedDeviceModal}
              currentRole={userRole}
              themeMode={themeMode}
              onClose={() => setSelectedDeviceModal(null)}
              onScanAnother={() => setSelectedDeviceModal(null)}
              onToast={showToast}
            />
          </Box>
        </Box>
      )}

      {/* ============================================================== */}
      {/* 4. MODAL B: 2FA ENROLLMENT CONFIRMATION MODAL                  */}
      {/* ============================================================== */}
      {enrolled2FAModal && (
        <Box
          onClick={(e) => {
            if (e.target === e.currentTarget) setEnrolled2FAModal(null);
          }}
          sx={{
            position: "fixed",
            inset: 0,
            backgroundColor: isDark ? "rgba(4,14,22,0.76)" : "rgba(8,19,30,0.55)",
            backdropFilter: "blur(10px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 2,
          }}
        >
          <Box
            sx={{
              width: "min(480px, 100%)",
              backgroundColor: isDark ? "#0e1424" : "#ffffff",
              borderRadius: "28px",
              p: { xs: "20px 16px", sm: "30px" },
              border: isDark ? "1px solid rgba(16, 185, 129, 0.35)" : "1px solid #10b981",
              boxShadow: isDark ? "0 25px 80px rgba(0,0,0,0.65)" : "0 20px 60px rgba(0,0,0,0.15)",
              textAlign: "center",
              animation: "cardPop 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
              "@keyframes cardPop": {
                from: { transform: "scale(0.92)", opacity: 0 },
                to: { transform: "scale(1)", opacity: 1 },
              },
            }}
          >
            {/* Success Icon */}
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: "20px",
                backgroundColor: "rgba(16, 185, 129, 0.12)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                display: "grid",
                placeItems: "center",
                color: "#10b981",
                margin: "0 auto 16px",
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 34 }} />
            </Box>

            <Typography sx={{ fontSize: { xs: "1.15rem", sm: "1.3rem" }, fontWeight: 800, color: isDark ? "#ffffff" : "#08131e", mb: 0.5 }}>
              Authenticator Added
            </Typography>
            <Typography sx={{ fontSize: "0.85rem", color: isDark ? "#818cf8" : "#64748b", mb: 2.5 }}>
              Successfully added to your authenticators
            </Typography>

            {/* Service & Account Banner */}
            <Box
              sx={{
                p: "14px 18px",
                borderRadius: "16px",
                backgroundColor: isDark ? "#080c14" : "#f8fafc",
                border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0",
                mb: 2.5,
              }}
            >
              <Typography sx={{ fontSize: "1.1rem", fontWeight: 750, color: isDark ? "#ffffff" : "#08131e" }}>
                {enrolled2FAModal.token.issuer}
              </Typography>
              <Typography sx={{ fontSize: "0.82rem", color: isDark ? "#94a3b8" : "#64748b", mt: 0.2 }}>
                {enrolled2FAModal.token.account}
              </Typography>

              {/* Live Animated OTP with Countdown Timer */}
              <EnrolledModalOtpLive
                tokenData={enrolled2FAModal.token}
                initialOtp={enrolled2FAModal.otp}
                isDark={isDark}
                onToast={showToast}
              />
            </Box>

            {/* Modal Actions */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
              <Button
                variant="outlined"
                onClick={() => setEnrolled2FAModal(null)}
                sx={{
                  borderRadius: "14px",
                  borderColor: isDark ? "rgba(255,255,255,0.15)" : "#cbd5e1",
                  color: isDark ? "#f1f5f9" : "#0f172a",
                  textTransform: "none",
                  fontWeight: 700,
                  py: 1.2,
                  fontSize: "0.88rem",
                  "&:hover": { borderColor: "#6366f1" },
                }}
              >
                Keep Scanning
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  setEnrolled2FAModal(null);
                  setActiveTab("authenticators");
                }}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  borderRadius: "14px",
                  backgroundColor: "#6366f1",
                  color: "#ffffff",
                  textTransform: "none",
                  fontWeight: 750,
                  py: 1.2,
                  fontSize: "0.88rem",
                  boxShadow: "0 6px 20px rgba(99,102,241,0.35)",
                  "&:hover": { backgroundColor: "#818cf8" },
                }}
              >
                Show Authenticator
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      {/* ============================================================== */}
      {/* 5. MOBILE BOTTOM NAVIGATION DOCK (Matching Image 2 Style)      */}
      {/* ============================================================== */}
      <Box
        component="nav"
        aria-label="Mobile Navigation"
        sx={{
          display: { xs: "block", md: "none" },
          flexShrink: 0,
          px: "14px",
          pb: "calc(10px + env(safe-area-inset-bottom, 0px))",
          pt: "2px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <Box
          sx={{
            maxWidth: 420,
            mx: "auto",
            backgroundColor: "#0d1622",
            borderRadius: "20px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            p: "4px",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "4px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* Mobile Tab 1: Scan */}
          <Box
            component="button"
            onClick={() => setActiveTab("scanner")}
            sx={{
              border: 0,
              borderRadius: "14px",
              backgroundColor: activeTab === "scanner" ? "rgba(99, 102, 241, 0.18)" : "transparent",
              color: activeTab === "scanner" ? "#38bdf8" : "#94a3b8",
              py: "6px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "3px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <QrCodeScannerIcon sx={{ fontSize: 18 }} />
            <Typography sx={{ fontSize: "0.72rem", fontWeight: activeTab === "scanner" ? 800 : 600, color: "inherit", lineHeight: 1 }}>
              Scan
            </Typography>
          </Box>

          {/* Mobile Tab 2: Last device */}
          <Box
            component="button"
            onClick={() => setActiveTab("recent")}
            sx={{
              border: 0,
              borderRadius: "14px",
              backgroundColor: activeTab === "recent" ? "rgba(99, 102, 241, 0.18)" : "transparent",
              color: activeTab === "recent" ? "#38bdf8" : "#94a3b8",
              py: "6px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "3px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <DevicesIcon sx={{ fontSize: 18 }} />
            <Typography sx={{ fontSize: "0.72rem", fontWeight: activeTab === "recent" ? 800 : 600, color: "inherit", lineHeight: 1 }}>
              Recent Devices
            </Typography>
          </Box>

          {/* Mobile Tab 3: Reports / Auth */}
          <Box
            component="button"
            onClick={() => setActiveTab("authenticators")}
            sx={{
              border: 0,
              borderRadius: "14px",
              backgroundColor: activeTab === "authenticators" ? "rgba(99, 102, 241, 0.18)" : "transparent",
              color: activeTab === "authenticators" ? "#38bdf8" : "#94a3b8",
              py: "6px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "3px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              position: "relative",
            }}
          >
            <SecurityIcon sx={{ fontSize: 18 }} />
            <Typography sx={{ fontSize: "0.68rem", fontWeight: activeTab === "authenticators" ? 800 : 600, color: "inherit", lineHeight: 1 }}>
              Authenticator
            </Typography>
            {authTokens.length > 0 && (
              <Box
                sx={{
                  position: "absolute",
                  top: 3,
                  right: "18%",
                  px: "5px",
                  py: "1px",
                  borderRadius: "999px",
                  backgroundColor: "#6366f1",
                  color: "#ffffff",
                  fontSize: "0.6rem",
                  fontWeight: 800,
                  lineHeight: 1,
                }}
              >
                {authTokens.length}
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
