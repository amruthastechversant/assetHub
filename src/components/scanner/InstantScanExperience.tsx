"use client";

import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Link from "next/link";
import { useSession } from "next-auth/react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import ScannerViewfinder from "./ScannerViewfinder";
import DeviceDetailsSheet from "./DeviceDetailsSheet";
import AuthenticatorTokenCard from "./AuthenticatorTokenCard";

import {
  parseScannedQr,
  fetchDeviceByCode,
  DeviceDetailView,
  AuthenticatorTokenData,
} from "@/lib/mockScannerData";

export default function InstantScanExperience() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "Admin";
  const userName = session?.user?.name || "Authenticated User";

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showRole, setShowRole] = useState(false);

  // Core Data States
  const [scannedDevice, setScannedDevice] = useState<DeviceDetailView | null>(null);
  const [authTokens, setAuthTokens] = useState<AuthenticatorTokenData[]>([]);
  const [recentDevices, setRecentDevices] = useState<DeviceDetailView[]>([]);
  
  // Desktop Tab
  const [activeTab, setActiveTab] = useState<"recent" | "authenticators">("recent");
  
  // Mobile Tab (bottom nav controls this)
  const [mobileTab, setMobileTab] = useState<"scan" | "recent" | "authenticators">("scan");

  useEffect(() => {
    Promise.all([
      fetchDeviceByCode("TV-LAP-02481"),
      fetchDeviceByCode("TV-MON-09124"),
      fetchDeviceByCode("DEV-10025")
    ]).then((devices) => {
      setRecentDevices(devices.filter(Boolean) as DeviceDetailView[]);
    });
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2500);
  };

  const handleScanResult = async (rawPayload: string) => {
    const parsed = parseScannedQr(rawPayload);

    if (parsed.type === "authenticator" && parsed.authData) {
      setAuthTokens((prev) => {
        const exists = prev.find((t) => t.issuer === parsed.authData!.issuer && t.account === parsed.authData!.account);
        if (exists) return prev;
        return [...prev, parsed.authData!];
      });
      setScannedDevice(null);
      setActiveTab("authenticators");
      setMobileTab("authenticators");
      showToast(`2FA Authenticator added: ${parsed.authData.issuer}`);
    } else {
      const code = parsed.assetCode || rawPayload;
      const device = await fetchDeviceByCode(code);
      if (device) {
        setScannedDevice(device);
        setRecentDevices((prev) => {
          if (prev.find(d => d.assetCode === device.assetCode)) return prev;
          return [device, ...prev].slice(0, 4);
        });
        showToast(`Asset details loaded: ${device.assetCode}`);
      } else {
        showToast("Device details could not be found");
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: { xs: "block", lg: "grid" },
        gridTemplateColumns: { lg: "280px minmax(0, 1fr)" },
        backgroundColor: "#080c14",
        backgroundImage:
          "radial-gradient(circle at 8% 12%, rgba(56,189,248,0.12) 0%, transparent 24rem), radial-gradient(circle at 92% 85%, rgba(99,102,241,0.18) 0%, transparent 25rem)",
        color: "#ffffff",
        fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Toast Alert */}
      {toastMessage && (
        <Box
          sx={{
            position: "fixed",
            left: "50%",
            bottom: { xs: 90, lg: 24 },
            transform: "translateX(-50%)",
            zIndex: 10000,
            backgroundColor: "#08131e",
            color: "#ffffff",
            px: 2,
            py: 1.5,
            borderRadius: "13px",
            fontSize: "0.82rem",
            display: "flex",
            alignItems: "center",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          }}
        >
          {toastMessage}
        </Box>
      )}

      {/* THE RAIL (Desktop Sidebar) */}
      <Box
        className="rail"
        sx={{
          display: { xs: "none", lg: "flex" },
          backgroundColor: "#080c14",
          color: "#ffffff",
          p: "34px 28px",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          "&::after": {
            content: '""',
            position: "absolute",
            width: "240px",
            height: "240px",
            border: "1px solid rgba(99, 102, 241, 0.18)",
            borderRadius: "50%",
            left: "-85px",
            bottom: "-100px",
            boxShadow: "0 0 0 38px rgba(99,102,241,.035), 0 0 0 76px rgba(99,102,241,.025)",
            pointerEvents: "none"
          }
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, zIndex: 1, mb: "auto" }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "12px",
              backgroundColor: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.18)",
              display: "grid",
              placeItems: "center",
              color: "#818cf8",
              fontWeight: 900,
            }}
          >
            ⌁
          </Box>
          <Typography sx={{ fontSize: "1.1rem", fontWeight: 760, letterSpacing: "-0.02em" }}>
            instant
          </Typography>
        </Box>

        <Box sx={{ position: "relative", zIndex: 1, my: 4 }}>
          <Typography sx={{ textTransform: "uppercase", fontSize: "0.72rem", letterSpacing: "0.15em", fontWeight: 750, color: "#38bdf8" }}>
            Universal Scanner
          </Typography>
          <Typography variant="h1" sx={{ fontSize: "2.55rem", lineHeight: 1.02, letterSpacing: "-0.055em", my: 2, fontWeight: 800 }}>
            Scan assets.<br/>Secure access.
          </Typography>
          <Typography sx={{ color: "#818cf8", lineHeight: 1.65, margin: 0, maxWidth: 220, fontSize: "0.95rem" }}>
            Instantly identify enterprise devices for support, or scan authenticator codes to grab your secure one-time passwords.
          </Typography>
        </Box>

        <Typography sx={{ fontSize: "0.78rem", color: "#64748b", position: "relative", zIndex: 1, mt: "auto" }}>
          Inventory · Secure workspace
        </Typography>
      </Box>

      {/* WORKSPACE AREA */}
      <Box sx={{ minWidth: 0, p: { xs: "18px 18px 94px", md: "28px clamp(24px, 5vw, 72px)" }, display: "flex", flexDirection: "column", flex: 1 }}>
        
        {/* TOPBAR */}
        <Box sx={{ height: 50, display: "flex", alignItems: "center", justifyContent: "space-between", mb: { xs: 2, lg: 3 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Link href="/device" style={{ textDecoration: "none" }}>
              <IconButton size="small" sx={{ width: 38, height: 38, borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#94a3b8", "&:hover": { background: "rgba(255,255,255,0.1)" } }}>
                <ArrowBackIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Link>
            {/* Mobile Brand */}
            <Box sx={{ display: { xs: "flex", lg: "none" }, alignItems: "center", gap: 1 }}>
              <Box sx={{ width: 38, height: 38, borderRadius: "12px", background: "rgba(99,102,241,0.18)", display: "grid", placeItems: "center", color: "#818cf8", fontWeight: 900 }}>⌁</Box>
              <Typography sx={{ fontSize: "1.1rem", fontWeight: 760, letterSpacing: "-0.02em", color: "#ffffff" }}>instant</Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, ml: "auto", cursor: "pointer", userSelect: "none" }} onClick={() => setShowRole(!showRole)}>
            <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>
              <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#f1f5f9" }}>{userName}</Typography>
              {showRole && <Typography sx={{ fontSize: "0.7rem", color: "#94a3b8" }}>{userRole}</Typography>}
            </Box>
            <Box sx={{ width: 36, height: 36, borderRadius: "50%", background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", display: "grid", placeItems: "center", fontSize: "0.76rem", fontWeight: 700 }}>
              {userName.slice(0, 2).toUpperCase()}
            </Box>
          </Box>
        </Box>

        {/* CONTENT GRID (Always Rendered) */}
        <Box sx={{ width: "min(1040px, 100%)", margin: "0 auto", display: { xs: "block", lg: "grid" }, gridTemplateColumns: { lg: "minmax(0, 1.08fr) minmax(320px, 0.92fr)" }, gap: 3, alignItems: "stretch", flex: 1 }}>
            
            {/* Left: Camera Scanner (Visible on desktop, OR visible on mobile if tab is scan) */}
            <Box sx={{ display: { xs: mobileTab === "scan" ? "flex" : "none", lg: "flex" }, flexDirection: "column", width: "100%", height: "100%" }}>
              <ScannerViewfinder onScanResult={handleScanResult} onToast={showToast} />
            </Box>

            {/* Right: Side Card (Visible on desktop, OR visible on mobile if tab is recent/auth) */}
            <Box
              sx={{
                background: { xs: "transparent", lg: "#0e1424" },
                border: { xs: "none", lg: "1px solid rgba(99, 102, 241, 0.18)" },
                borderRadius: "32px",
                p: { xs: 0, lg: 3.5 },
                boxShadow: { xs: "none", lg: "0 30px 60px rgba(0,0,0,0.4)" },
                backdropFilter: { xs: "none", lg: "blur(16px)" },
                minHeight: { xs: "auto", lg: "620px" },
                display: { xs: mobileTab !== "scan" ? "flex" : "none", lg: "flex" },
                flexDirection: "column"
              }}
            >
              {/* Custom Tabs / Mini-Title */}
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "22px" }}>
                <Box sx={{ display: "flex", background: "rgba(255,255,255,0.03)", p: "4px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <Box
                    onClick={() => setActiveTab("recent")}
                    sx={{ 
                      px: 2, py: 0.8, 
                      borderRadius: "10px",
                      cursor: "pointer",
                      background: activeTab === "recent" ? "#6366f1" : "transparent",
                      color: activeTab === "recent" ? "#ffffff" : "#64748b",
                      fontWeight: 700, fontSize: "0.88rem",
                      transition: "all 0.2s"
                    }}
                  >
                    Last scanned
                  </Box>
                  <Box
                    onClick={() => setActiveTab("authenticators")}
                    sx={{ 
                      px: 2, py: 0.8, 
                      borderRadius: "10px",
                      cursor: "pointer",
                      background: activeTab === "authenticators" ? "#6366f1" : "transparent",
                      color: activeTab === "authenticators" ? "#ffffff" : "#64748b",
                      fontWeight: 700, fontSize: "0.88rem",
                      transition: "all 0.2s",
                      display: { xs: "none", lg: "block" }
                    }}
                  >
                    Authenticators
                  </Box>
                </Box>
                <Box sx={{ fontSize: "0.72rem", color: "#818cf8", background: "rgba(99,102,241,0.18)", borderRadius: "999px", p: "6px 9px", fontWeight: 700 }}>
                  {activeTab === "recent" ? "All synced" : `${authTokens.length} tokens`}
                </Box>
              </Box>

              {/* Mobile Only Header for current view */}
              <Typography sx={{ display: { xs: "block", lg: "none" }, fontSize: "1.2rem", fontWeight: 800, mb: 2, color: "#ffffff" }}>
                {mobileTab === "scan" ? "Scan Asset" : mobileTab === "recent" ? "Recent Scans" : "Authenticators"}
              </Typography>

              {(mobileTab === "recent" || (activeTab === "recent" && typeof window !== 'undefined' && window.innerWidth >= 1200)) ? (
                <Box sx={{ display: { xs: mobileTab === "recent" ? "flex" : "none", lg: activeTab === "recent" ? "flex" : "none" }, flexDirection: "column", height: "100%" }}>
                  {recentDevices.length > 0 ? (
                    <>
                      {/* Top Device Preview */}
                      <Box
                        onClick={() => setScannedDevice(recentDevices[0])}
                        sx={{
                          p: "20px",
                          border: "1px solid rgba(99, 102, 241, 0.18)",
                          borderRadius: "22px",
                          background: "#0e1424",
                          display: "flex",
                          gap: "16px",
                          alignItems: "center",
                          cursor: "pointer",
                          transition: "0.2s",
                          "&:hover": { borderColor: "#6366f1", boxShadow: "0 4px 20px rgba(99,102,241,0.18)", transform: "translateY(-2px)" }
                        }}
                      >
                        <Box sx={{ width: 68, height: 68, borderRadius: "18px", background: "#131b2e", display: "grid", placeItems: "center", color: "#38bdf8", fontSize: "1.4rem", flexShrink: 0 }}>
                          ▰
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography noWrap sx={{ m: 0, mb: "5px", fontSize: "1rem", fontWeight: 700, color: "#ffffff" }}>{recentDevices[0].model}</Typography>
                          <Typography noWrap sx={{ m: 0, color: "#818cf8", fontSize: "0.8rem" }}>{recentDevices[0].assetType}</Typography>
                          <Box sx={{ display: "inline-block", mt: "8px", p: "3px 8px", background: "#080c14", border: "1px solid rgba(99, 102, 241, 0.18)", borderRadius: "8px", fontSize: "0.65rem", fontWeight: 700, fontFamily: "monospace", color: "#818cf8" }}>
                            {recentDevices[0].assetCode}
                          </Box>
                        </Box>
                      </Box>

                      {/* Recent Activity List */}
                      {recentDevices.length > 1 && (
                        <Box sx={{ mt: "28px" }}>
                          <Typography sx={{ fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.1em", m: "0 0 14px", color: "#64748b", fontWeight: 700 }}>
                            Recent activity
                          </Typography>
                          <Box>
                            {recentDevices.slice(1).map((device, idx) => (
                              <Box
                                key={device.assetCode}
                                onClick={() => setScannedDevice(device)}
                                sx={{
                                  display: "grid",
                                  gridTemplateColumns: "38px 1fr auto",
                                  gap: "10px",
                                  alignItems: "center",
                                  padding: "13px 0",
                                  borderBottom: idx === recentDevices.length - 2 ? 0 : "1px solid rgba(99, 102, 241, 0.18)",
                                  cursor: "pointer",
                                  "&:hover strong": { color: "#ffffff" }
                                }}
                              >
                                <Box sx={{ width: 38, height: 38, borderRadius: "12px", background: "#131b2e", display: "grid", placeItems: "center", color: "#38bdf8" }}>
                                  ⌁
                                </Box>
                                <Box sx={{ minWidth: 0 }}>
                                  <Typography noWrap sx={{ fontSize: "0.86rem", fontWeight: 700, color: "#e2e8f0", display: "block" }}>Device scanned</Typography>
                                  <Typography noWrap sx={{ fontSize: "0.72rem", color: "#818cf8", display: "block" }}>{device.model}</Typography>
                                </Box>
                                <Typography sx={{ fontSize: "0.7rem", color: "#64748b" }}>Past</Typography>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      )}
                    </>
                  ) : (
                    <Typography sx={{ textAlign: "center", color: "#647584", mt: 4, fontSize: "0.9rem" }}>
                      No recent devices found.
                    </Typography>
                  )}

                  {/* Tip Box at the bottom */}
                  <Box sx={{ mt: "auto", background: "#131b2e", color: "#fff", borderRadius: "20px", p: "18px", display: "flex", gap: "13px", alignItems: "flex-start", border: "1px solid rgba(99, 102, 241, 0.18)" }}>
                    <Typography sx={{ fontStyle: "normal", color: "#38bdf8", fontWeight: 800, m: 0 }}>i</Typography>
                    <Box>
                      <Typography sx={{ fontSize: "0.85rem", display: "block", fontWeight: 700, m: 0, color: "#f8fafc" }}>Labels can be small</Typography>
                      <Typography sx={{ fontSize: "0.75rem", color: "#818cf8", m: "4px 0 0", lineHeight: 1.45 }}>Move closer until the QR edges look sharp. Instant will identify the device automatically.</Typography>
                    </Box>
                  </Box>
                </Box>
              ) : null}

              {(mobileTab === "authenticators" || (activeTab === "authenticators" && typeof window !== 'undefined' && window.innerWidth >= 1200)) ? (
                <Box sx={{ display: { xs: mobileTab === "authenticators" ? "flex" : "none", lg: activeTab === "authenticators" ? "flex" : "none" }, flexDirection: "column", gap: 2 }}>
                  {authTokens.length === 0 ? (
                    <Box sx={{ textAlign: "center", py: 4, color: "#647584" }}>
                      <Typography variant="body2">No authenticators added yet.</Typography>
                      <Typography variant="caption">Scan a 2FA QR code to add one.</Typography>
                    </Box>
                  ) : (
                    authTokens.map((token, i) => (
                      <AuthenticatorTokenCard
                        key={i}
                        tokenData={token}
                        onClose={() => setAuthTokens((prev) => prev.filter((_, index) => index !== i))}
                        onScanAnother={() => setMobileTab("scan")}
                        onToast={showToast}
                      />
                    ))
                  )}
                </Box>
              ) : null}
            </Box>
          </Box>
        
        {/* OVERLAYS */}
        {scannedDevice && (
          <Box sx={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", p: { xs: 0, sm: 2.5 } }}>
            <Box sx={{ width: "min(820px, 100%)", maxHeight: { xs: "92vh", sm: "calc(100vh - 30px)" }, borderRadius: { xs: "28px 28px 0 0", sm: "28px" }, backgroundColor: "#0e1424", boxShadow: "0 30px 100px rgba(0,0,0,0.6)", overflow: "auto", display: "flex", flexDirection: "column", alignSelf: { xs: "flex-end", sm: "auto" }, animation: "rise 0.28s ease-out", "@keyframes rise": { from: { transform: "translateY(18px)", opacity: 0 }, to: { transform: "none", opacity: 1 } }, border: { sm: "1px solid rgba(99, 102, 241, 0.18)" } }}>
              <DeviceDetailsSheet device={scannedDevice} currentRole={userRole} onClose={() => setScannedDevice(null)} onScanAnother={() => setScannedDevice(null)} onToast={showToast} />
            </Box>
          </Box>
        )}
      </Box>

      {/* MOBILE BOTTOM NAVIGATION */}
      {!scannedDevice && (
        <Box
          component="nav"
          sx={{
            display: { xs: "grid", lg: "none" },
            position: "fixed",
            zIndex: 10,
            bottom: "12px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "calc(100% - 28px)",
            maxWidth: "480px",
            backgroundColor: "rgba(14,20,36,0.95)",
            backdropFilter: "blur(18px)",
            border: "1px solid rgba(99, 102, 241, 0.18)",
            borderRadius: "22px",
            gridTemplateColumns: "repeat(3, 1fr)",
            padding: "7px",
            boxShadow: "0 16px 50px rgba(0, 0, 0, 0.25)"
          }}
        >
          <Box
            component="button"
            onClick={() => setMobileTab("scan")}
            sx={{
              border: 0,
              backgroundColor: mobileTab === "scan" ? "#131b2e" : "transparent",
              color: mobileTab === "scan" ? "#38bdf8" : "#64748b",
              padding: "9px 4px",
              borderRadius: "15px",
              fontSize: "0.68rem",
              fontWeight: 700,
              display: "flex",
              gap: "4px",
              alignItems: "center",
              flexDirection: "column",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            <Box sx={{ fontSize: "1rem" }}>⌗</Box>
            Scan
          </Box>

          <Box
            component="button"
            onClick={() => { setMobileTab("recent"); setActiveTab("recent"); }}
            sx={{
              border: 0,
              backgroundColor: mobileTab === "recent" ? "#131b2e" : "transparent",
              color: mobileTab === "recent" ? "#38bdf8" : "#64748b",
              padding: "9px 4px",
              borderRadius: "15px",
              fontSize: "0.68rem",
              fontWeight: 700,
              display: "flex",
              gap: "4px",
              alignItems: "center",
              flexDirection: "column",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            <Box sx={{ fontSize: "1rem" }}>▰</Box>
            Recent
          </Box>

          <Box
            component="button"
            onClick={() => { setMobileTab("authenticators"); setActiveTab("authenticators"); }}
            sx={{
              border: 0,
              backgroundColor: mobileTab === "authenticators" ? "#131b2e" : "transparent",
              color: mobileTab === "authenticators" ? "#38bdf8" : "#64748b",
              padding: "9px 4px",
              borderRadius: "15px",
              fontSize: "0.68rem",
              fontWeight: 700,
              display: "flex",
              gap: "4px",
              alignItems: "center",
              flexDirection: "column",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            <Box sx={{ fontSize: "1rem" }}>☷</Box>
            Auth
          </Box>
        </Box>
      )}
    </Box>
  );
}
