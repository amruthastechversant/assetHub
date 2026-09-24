"use client";

import React, { useState, useRef, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SecurityIcon from "@mui/icons-material/Security";
import EmailIcon from "@mui/icons-material/Email";
import BusinessIcon from "@mui/icons-material/Business";
import CloseIcon from "@mui/icons-material/Close";
import LogoutIcon from "@mui/icons-material/Logout";
import { signOut } from "next-auth/react";

interface UserProfilePillProps {
  userName: string;
  userEmail: string;
  userRole?: string;
  department?: string;
  themeMode?: "dark" | "light";
}

export default function UserProfilePill({
  userName,
  userEmail,
  userRole = "Administrator",
  department = "IT Operations",
  themeMode = "dark",
}: UserProfilePillProps) {
  const isDark = themeMode === "dark";
  const [expanded, setExpanded] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking or tapping outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setExpanded(false);
      }
    }
    if (expanded) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [expanded]);

  return (
    <Box ref={containerRef} sx={{ position: "relative" }}>
      {/* The User Details Pill */}
      <Box
        onClick={() => setExpanded((prev) => !prev)}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: { xs: 1, sm: 1.2 },
          cursor: "pointer",
          userSelect: "none",
          py: "5px",
          px: { xs: "6px", sm: "12px" },
          pl: { xs: "6px", sm: "14px" },
          borderRadius: "999px",
          border: isDark ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #cbd5e1",
          backgroundColor: isDark
            ? expanded ? "rgba(99, 102, 241, 0.15)" : "rgba(255, 255, 255, 0.04)"
            : expanded ? "#e0e7ff" : "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(12px)",
          transition: "all 0.2s ease",
          "&:hover": {
            borderColor: isDark ? "rgba(99, 102, 241, 0.5)" : "#94a3b8",
            backgroundColor: isDark ? "rgba(99, 102, 241, 0.12)" : "#f1f5f9",
            transform: "translateY(-1px)",
          },
        }}
      >
        {/* Name and Email display */}
        <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" }, minWidth: 0 }}>
          <Typography
            noWrap
            sx={{
              fontSize: "0.82rem",
              fontWeight: 750,
              color: isDark ? "#f1f5f9" : "#08131e",
              lineHeight: 1.2,
            }}
          >
            {userName}
          </Typography>
          <Typography
            noWrap
            sx={{
              fontSize: "0.68rem",
              color: isDark ? "#818cf8" : "#6366f1",
              fontWeight: 550,
              lineHeight: 1.1,
              mt: 0.2,
            }}
          >
            {userEmail}
          </Typography>
        </Box>

        {/* User Avatar with Green Active Dot */}
        <Box sx={{ position: "relative", flexShrink: 0 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: isDark
                ? "linear-gradient(135deg, #4f46e5 0%, #1e1b4b 100%)"
                : "linear-gradient(135deg, #08131e 0%, #312e81 100%)",
              border: isDark ? "1.5px solid rgba(255, 255, 255, 0.2)" : "1.5px solid #08131e",
              color: "#ffffff",
              display: "grid",
              placeItems: "center",
              fontSize: "0.72rem",
              fontWeight: 800,
            }}
          >
            {userName.slice(0, 2).toUpperCase()}
          </Box>
          {/* Active Status Pulse Dot */}
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "#10b981",
              border: isDark ? "1.5px solid #080c14" : "1.5px solid #ffffff",
            }}
          />
        </Box>

        {/* Small Arrow indicator */}
        <KeyboardArrowDownIcon
          sx={{
            fontSize: 16,
            color: isDark ? "#94a3b8" : "#64748b",
            transition: "transform 0.2s ease",
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            display: { xs: "none", sm: "block" },
          }}
        />
      </Box>

      {/* Minimal Expansion Floating Card */}
      {expanded && (
        <Box
          sx={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            zIndex: 1000,
            width: { xs: "min(310px, calc(100vw - 24px))", sm: 320 },
            maxWidth: "calc(100vw - 20px)",
            backgroundColor: isDark ? "#111827" : "#ffffff",
            border: isDark ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #e2e8f0",
            borderRadius: "16px",
            boxShadow: isDark
              ? "0 20px 40px -8px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05)"
              : "0 20px 40px -8px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)",
            overflow: "hidden",
            animation: "fadeInDown 0.18s ease-out",
            "@keyframes fadeInDown": {
              from: { opacity: 0, transform: "translateY(-6px)" },
              to: { opacity: 1, transform: "translateY(0)" },
            },
          }}
        >
          {/* Expansion Header */}
          <Box
            sx={{
              p: 1.6,
              backgroundColor: isDark ? "#162032" : "#f8fafc",
              borderBottom: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, minWidth: 0, flex: 1 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: isDark
                    ? "linear-gradient(135deg, #6366f1 0%, #312e81 100%)"
                    : "linear-gradient(135deg, #08131e 0%, #4338ca 100%)",
                  color: "#ffffff",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "0.8rem",
                  fontWeight: 800,
                  boxShadow: "0 4px 10px rgba(99, 102, 241, 0.25)",
                  flexShrink: 0,
                }}
              >
                {userName.slice(0, 2).toUpperCase()}
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography noWrap sx={{ fontSize: "0.86rem", fontWeight: 750, color: isDark ? "#ffffff" : "#0f172a", lineHeight: 1.2 }}>
                  {userName}
                </Typography>
                <Typography noWrap sx={{ fontSize: "0.7rem", color: isDark ? "#94a3b8" : "#64748b", mt: 0.2, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {userEmail}
                </Typography>
              </Box>
            </Box>

            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(false);
              }}
              sx={{
                color: isDark ? "#94a3b8" : "#64748b",
                flexShrink: 0,
                p: 0.5,
                "&:hover": { color: isDark ? "#ffffff" : "#0f172a" },
              }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>

          {/* Expansion Details Rows - Clean & Unified specs style */}
          <Box sx={{ p: 1.6, display: "flex", flexDirection: "column", gap: 1.3 }}>
            {/* Role Row */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, flexShrink: 0 }}>
                <SecurityIcon sx={{ fontSize: 16, color: isDark ? "#818cf8" : "#6366f1" }} />
                <Typography sx={{ fontSize: "0.74rem", color: isDark ? "#94a3b8" : "#64748b", fontWeight: 600 }}>
                  Role
                </Typography>
              </Box>
              <Chip
                label={userRole}
                size="small"
                sx={{
                  height: 22,
                  fontSize: "0.68rem",
                  fontWeight: 750,
                  backgroundColor: isDark ? "rgba(99, 102, 241, 0.15)" : "#e0e7ff",
                  color: isDark ? "#818cf8" : "#4f46e5",
                  border: isDark ? "1px solid rgba(99, 102, 241, 0.3)" : "1px solid #c7d2fe",
                }}
              />
            </Box>

            {/* Email Row */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5, minWidth: 0 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, flexShrink: 0 }}>
                <EmailIcon sx={{ fontSize: 16, color: isDark ? "#818cf8" : "#6366f1" }} />
                <Typography sx={{ fontSize: "0.74rem", color: isDark ? "#94a3b8" : "#64748b", fontWeight: 600 }}>
                  Email
                </Typography>
              </Box>
              <Tooltip title={userEmail} arrow placement="top">
                <Typography
                  noWrap
                  sx={{
                    fontSize: "0.74rem",
                    color: isDark ? "#f1f5f9" : "#0f172a",
                    fontWeight: 600,
                    textAlign: "right",
                    minWidth: 0,
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {userEmail}
                </Typography>
              </Tooltip>
            </Box>

            {/* Department Row */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5, minWidth: 0 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, flexShrink: 0 }}>
                <BusinessIcon sx={{ fontSize: 16, color: isDark ? "#818cf8" : "#6366f1" }} />
                <Typography sx={{ fontSize: "0.74rem", color: isDark ? "#94a3b8" : "#64748b", fontWeight: 600 }}>
                  Department
                </Typography>
              </Box>
              <Typography
                noWrap
                sx={{
                  fontSize: "0.74rem",
                  color: isDark ? "#f1f5f9" : "#0f172a",
                  fontWeight: 600,
                  textAlign: "right",
                }}
              >
                {department}
              </Typography>
            </Box>

            {/* Sign Out Action */}
            <Box sx={{ pt: 0.5, borderTop: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0" }}>
              <Button
                fullWidth
                size="small"
                onClick={() => signOut({ callbackUrl: "/" })}
                startIcon={<LogoutIcon sx={{ fontSize: 15 }} />}
                sx={{
                  height: 32,
                  fontSize: "0.75rem",
                  fontWeight: 650,
                  color: isDark ? "#f87171" : "#dc2626",
                  backgroundColor: isDark ? "rgba(239, 68, 68, 0.08)" : "rgba(239, 68, 68, 0.05)",
                  border: isDark ? "1px solid rgba(239, 68, 68, 0.2)" : "1px solid rgba(239, 68, 68, 0.15)",
                  borderRadius: "8px",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: isDark ? "rgba(239, 68, 68, 0.18)" : "rgba(239, 68, 68, 0.1)",
                  },
                }}
              >
                Sign Out
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}
