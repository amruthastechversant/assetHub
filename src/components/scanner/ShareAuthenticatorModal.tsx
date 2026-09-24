"use client";

import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import InputBase from "@mui/material/InputBase";
import Checkbox from "@mui/material/Checkbox";
import CloseIcon from "@mui/icons-material/Close";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import SecurityIcon from "@mui/icons-material/Security";
import SearchIcon from "@mui/icons-material/Search";
import SendIcon from "@mui/icons-material/Send";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { OrgUser, ORG_USERS_LIST } from "@/lib/mockScannerData";

interface ShareAuthenticatorModalProps {
  open: boolean;
  issuer: string;
  account: string;
  themeMode?: "dark" | "light";
  onClose: () => void;
  onShare: (selectedUsers: OrgUser[]) => void;
}

export default function ShareAuthenticatorModal({
  open,
  issuer,
  account,
  themeMode = "dark",
  onClose,
  onShare,
}: ShareAuthenticatorModalProps) {
  const isDark = themeMode === "dark";
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedUsers, setSelectedUsers] = useState<OrgUser[]>([]);
  const [expandedColleagueId, setExpandedColleagueId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSearchQuery("");
      setSelectedUsers([]);
      setExpandedColleagueId(null);
    }
  }, [open]);

  if (!open) return null;

  const toggleUser = (user: OrgUser) => {
    setSelectedUsers((prev) => {
      const exists = prev.some((u) => u.id === user.id);
      if (exists) {
        return prev.filter((u) => u.id !== user.id);
      }
      return [...prev, user];
    });
  };

  const removeUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const handleClearAll = () => {
    setSelectedUsers([]);
  };

  const filteredUsers = ORG_USERS_LIST.filter((user) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      user.name.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q) ||
      user.department.toLowerCase().includes(q) ||
      user.role.toLowerCase().includes(q)
    );
  });

  const handleConfirm = () => {
    if (selectedUsers.length === 0) return;
    onShare(selectedUsers);
  };

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        backgroundColor: "rgba(3, 7, 18, 0.82)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 2, sm: 3 },
        pt: { xs: "72px", sm: "84px" },
        pb: { xs: 3, sm: 4 },
        overflowY: "auto",
      }}
    >
      <Box
        sx={{
          backgroundColor: isDark ? "#111827" : "#ffffff",
          border: isDark ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #e2e8f0",
          borderRadius: "22px",
          width: "100%",
          maxWidth: 480,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          maxHeight: "min(530px, calc(100vh - 120px))",
          height: "auto",
          my: "auto",
        }}
      >
        {/* Pinned Modal Header */}
        <Box
          sx={{
            px: 2.5,
            py: 1.8,
            borderBottom: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: isDark ? "#162032" : "#f8fafc",
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            <ShareOutlinedIcon sx={{ color: isDark ? "#38bdf8" : "#6366f1", fontSize: 20 }} />
            <Typography variant="h6" sx={{ fontWeight: 750, fontSize: "1rem", color: isDark ? "#fff" : "#0f172a" }}>
              Share Authenticator
            </Typography>
          </Box>

          <IconButton size="small" onClick={onClose} sx={{ color: isDark ? "#94a3b8" : "#64748b" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Scrollable Modal Body */}
        <Box
          sx={{
            p: { xs: 2, sm: 2.5 },
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 1.6,
            flex: 1,
            minHeight: 0,
            "&::-webkit-scrollbar": { width: 5 },
            "&::-webkit-scrollbar-thumb": { backgroundColor: isDark ? "rgba(255,255,255,0.18)" : "#cbd5e1", borderRadius: 4 },
          }}
        >
          {/* Authenticator Details Preview Card (NO Live 2FA Code) */}
          <Box
            sx={{
              p: 1.4,
              borderRadius: "12px",
              backgroundColor: isDark ? "#131b2e" : "#f8fafc",
              border: isDark ? "1px solid rgba(99, 102, 241, 0.22)" : "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              gap: 1.2,
              flexShrink: 0,
            }}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "10px",
                backgroundColor: isDark ? "rgba(99, 102, 241, 0.15)" : "#e0e7ff",
                border: isDark ? "1px solid rgba(99, 102, 241, 0.3)" : "1px solid #c7d2fe",
                display: "grid",
                placeItems: "center",
                color: isDark ? "#818cf8" : "#6366f1",
                flexShrink: 0,
              }}
            >
              <SecurityIcon sx={{ fontSize: 20 }} />
            </Box>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ fontWeight: 750, fontSize: "0.92rem", color: isDark ? "#ffffff" : "#0f172a", lineHeight: 1.2 }}>
                {issuer}
              </Typography>
              <Typography sx={{ fontSize: "0.76rem", color: isDark ? "#94a3b8" : "#64748b", mt: 0.3 }}>
                {account}
              </Typography>
            </Box>
          </Box>

          {/* User Search & Selection Area */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {/* Search Input */}
            <Box
              sx={{
                borderRadius: "12px",
                border: isDark ? "1px solid rgba(255, 255, 255, 0.16)" : "1px solid #cbd5e1",
                backgroundColor: isDark ? "#030712" : "#ffffff",
                px: 1.4,
                py: "7px",
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexShrink: 0,
                "&:focus-within": { borderColor: "#6366f1", boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.25)" },
              }}
            >
              <SearchIcon sx={{ color: isDark ? "#818cf8" : "#6366f1", fontSize: 18 }} />
              <InputBase
                fullWidth
                placeholder="Search colleagues by name, email, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  color: isDark ? "#ffffff" : "#0f172a",
                  fontSize: "0.86rem",
                  "& input::placeholder": { color: isDark ? "#64748b" : "#94a3b8", opacity: 1 },
                }}
              />
              {searchQuery && (
                <IconButton size="small" onClick={() => setSearchQuery("")} sx={{ color: isDark ? "#94a3b8" : "#64748b", p: 0.2 }}>
                  <CloseIcon sx={{ fontSize: 14 }} />
                </IconButton>
              )}
            </Box>

            {/* Selected Users Preview Area (Scrollable with max height) */}
            {selectedUsers.length > 0 && (
              <Box
                sx={{
                  p: 1.2,
                  borderRadius: "12px",
                  backgroundColor: isDark ? "rgba(99, 102, 241, 0.08)" : "rgba(99, 102, 241, 0.05)",
                  border: isDark ? "1px solid rgba(99, 102, 241, 0.25)" : "1px solid rgba(99, 102, 241, 0.2)",
                  flexShrink: 0,
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.8 }}>
                  <Typography sx={{ fontSize: "0.68rem", color: isDark ? "#818cf8" : "#4f46e5", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Selected Colleagues ({selectedUsers.length})
                  </Typography>
                  <Typography
                    onClick={handleClearAll}
                    sx={{
                      fontSize: "0.72rem",
                      color: "#ef4444",
                      fontWeight: 650,
                      cursor: "pointer",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    Clear all
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 0.8,
                    maxHeight: 110,
                    overflowY: "auto",
                    pr: 0.4,
                    "&::-webkit-scrollbar": { width: 4 },
                    "&::-webkit-scrollbar-thumb": { backgroundColor: isDark ? "rgba(255,255,255,0.2)" : "#cbd5e1", borderRadius: 4 },
                  }}
                >
                  {selectedUsers.map((user) => {
                    const isExpanded = expandedColleagueId === user.id;
                    return (
                      <Box
                        key={user.id}
                        onClick={() => setExpandedColleagueId(isExpanded ? null : user.id)}
                        sx={{
                          display: "inline-flex",
                          flexDirection: isExpanded ? "column" : "row",
                          alignItems: isExpanded ? "flex-start" : "center",
                          gap: 0.8,
                          py: isExpanded ? "6px" : "3px",
                          pl: "8px",
                          pr: "6px",
                          borderRadius: isExpanded ? "12px" : "999px",
                          backgroundColor: isExpanded
                            ? isDark ? "rgba(99, 102, 241, 0.22)" : "#e0e7ff"
                            : isDark ? "#131b2e" : "#ffffff",
                          border: isExpanded
                            ? "1px solid #6366f1"
                            : isDark ? "1px solid rgba(255,255,255,0.14)" : "1px solid #cbd5e1",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          "&:hover": {
                            borderColor: "#6366f1",
                          },
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, width: "100%" }}>
                          <Box
                            sx={{
                              width: 20,
                              height: 20,
                              borderRadius: "50%",
                              backgroundColor: "#6366f1",
                              color: "#ffffff",
                              fontSize: "0.6rem",
                              fontWeight: 800,
                              display: "grid",
                              placeItems: "center",
                              flexShrink: 0,
                            }}
                          >
                            {user.name.slice(0, 2).toUpperCase()}
                          </Box>
                          
                          {/* Name and Email */}
                          <Box sx={{ minWidth: 0, flex: 1, display: "flex", alignItems: "center", gap: 0.6, flexWrap: "wrap" }}>
                            <Typography sx={{ fontSize: "0.74rem", fontWeight: 700, color: isDark ? "#f1f5f9" : "#0f172a", lineHeight: 1.2 }}>
                              {user.name}
                            </Typography>
                            <Typography sx={{ fontSize: "0.68rem", color: isDark ? "#818cf8" : "#6366f1", fontWeight: 550, lineHeight: 1.2 }}>
                              {user.email}
                            </Typography>
                          </Box>

                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeUser(user.id);
                            }}
                            sx={{
                              p: "2px",
                              color: isDark ? "#94a3b8" : "#64748b",
                              "&:hover": { color: "#ef4444" },
                            }}
                          >
                            <CloseIcon sx={{ fontSize: 13 }} />
                          </IconButton>
                        </Box>

                        {/* Minimal Expansion Details on Click */}
                        {isExpanded && (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.6,
                              mt: 0.4,
                              pt: 0.4,
                              width: "100%",
                              borderTop: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
                            }}
                          >
                            <Chip
                              label={`Role: ${user.role}`}
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: "0.62rem",
                                fontWeight: 700,
                                backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "#ffffff",
                                color: isDark ? "#f1f5f9" : "#0f172a",
                              }}
                            />
                            <Chip
                              label={`Dept: ${user.department}`}
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: "0.62rem",
                                fontWeight: 650,
                                backgroundColor: isDark ? "rgba(99,102,241,0.15)" : "#c7d2fe",
                                color: isDark ? "#818cf8" : "#4338ca",
                              }}
                            />
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}

            {/* Scrollable Users List with Multi-select Checkboxes */}
            <Box
              sx={{
                borderRadius: "12px",
                border: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #e2e8f0",
                backgroundColor: isDark ? "#0e1424" : "#f8fafc",
                maxHeight: 180,
                minHeight: 110,
                overflowY: "auto",
                p: 0.5,
                "&::-webkit-scrollbar": { width: 5 },
                "&::-webkit-scrollbar-thumb": { backgroundColor: isDark ? "rgba(255,255,255,0.18)" : "#cbd5e1", borderRadius: 4 },
              }}
            >
              {filteredUsers.length === 0 ? (
                <Box sx={{ p: 2, textAlign: "center", color: isDark ? "#64748b" : "#94a3b8", fontSize: "0.8rem" }}>
                  No matching colleagues found
                </Box>
              ) : (
                filteredUsers.map((user) => {
                  const isChecked = selectedUsers.some((u) => u.id === user.id);
                  return (
                    <Box
                      key={user.id}
                      onClick={() => toggleUser(user)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        p: "7px 10px",
                        borderRadius: "9px",
                        cursor: "pointer",
                        backgroundColor: isChecked
                          ? isDark ? "rgba(99, 102, 241, 0.22)" : "rgba(99, 102, 241, 0.12)"
                          : "transparent",
                        border: isChecked ? "1px solid #6366f1" : "1px solid transparent",
                        transition: "all 0.15s ease",
                        "&:hover": {
                          backgroundColor: isChecked
                            ? isDark ? "rgba(99, 102, 241, 0.28)" : "rgba(99, 102, 241, 0.16)"
                            : isDark ? "rgba(255, 255, 255, 0.04)" : "#ffffff",
                        },
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.1, minWidth: 0 }}>
                        <Checkbox
                          checked={isChecked}
                          icon={<CheckBoxOutlineBlankIcon sx={{ fontSize: 18, color: isDark ? "#64748b" : "#94a3b8" }} />}
                          checkedIcon={<CheckBoxIcon sx={{ fontSize: 18, color: "#6366f1" }} />}
                          sx={{ p: 0 }}
                        />
                        <Box
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            backgroundColor: isDark ? "#1e293b" : "#e2e8f0",
                            color: isDark ? "#38bdf8" : "#4f46e5",
                            display: "grid",
                            placeItems: "center",
                            fontSize: "0.68rem",
                            fontWeight: 800,
                            flexShrink: 0,
                          }}
                        >
                          {user.name.slice(0, 2).toUpperCase()}
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                            <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: isDark ? "#ffffff" : "#0f172a" }}>
                              {user.name}
                            </Typography>
                            <Chip
                              label={user.role}
                              size="small"
                              sx={{
                                height: 17,
                                fontSize: "0.6rem",
                                fontWeight: 700,
                                backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#ffffff",
                                color: isDark ? "#94a3b8" : "#64748b",
                              }}
                            />
                          </Box>
                          <Typography sx={{ fontSize: "0.7rem", color: isDark ? "#818cf8" : "#64748b" }}>
                            {user.email} · {user.department}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  );
                })
              )}
            </Box>
          </Box>
        </Box>

        {/* Pinned Modal Footer */}
        <Box
          sx={{
            p: { xs: 1.8, sm: 2 },
            px: { xs: 2, sm: 2.5 },
            borderTop: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0",
            backgroundColor: isDark ? "#131b2e" : "#f8fafc",
            display: "flex",
            gap: 1.5,
            flexShrink: 0,
          }}
        >
          <Button
            fullWidth
            variant="outlined"
            onClick={onClose}
            sx={{
              borderRadius: "11px",
              borderColor: isDark ? "rgba(255, 255, 255, 0.15)" : "#cbd5e1",
              color: isDark ? "#94a3b8" : "#64748b",
              textTransform: "none",
              fontWeight: 650,
              py: 1,
            }}
          >
            Cancel
          </Button>
          <Button
            fullWidth
            variant="contained"
            disabled={selectedUsers.length === 0}
            onClick={handleConfirm}
            endIcon={<SendIcon sx={{ fontSize: 16 }} />}
            sx={{
              backgroundColor: "#6366f1",
              color: "#ffffff",
              borderRadius: "11px",
              textTransform: "none",
              fontWeight: 750,
              py: 1,
              boxShadow: "0 4px 16px rgba(99, 102, 241, 0.35)",
              "&:hover": { backgroundColor: "#4f46e5" },
            }}
          >
            {selectedUsers.length > 0 ? `Share with (${selectedUsers.length})` : "Share Access"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
