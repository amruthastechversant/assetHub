"use client";

import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import CloseIcon from "@mui/icons-material/Close";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

interface EditAuthenticatorModalProps {
  open: boolean;
  currentName: string;
  account: string;
  themeMode?: "dark" | "light";
  onClose: () => void;
  onSave: (newName: string) => void;
}

export default function EditAuthenticatorModal({
  open,
  currentName,
  account,
  themeMode = "dark",
  onClose,
  onSave,
}: EditAuthenticatorModalProps) {
  const isDark = themeMode === "dark";
  const [name, setName] = useState(currentName);

  useEffect(() => {
    setName(currentName);
  }, [currentName, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed) {
      onSave(trimmed);
    }
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
        component="form"
        onSubmit={handleSubmit}
        sx={{
          backgroundColor: isDark ? "#111827" : "#ffffff",
          border: isDark ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #e2e8f0",
          borderRadius: "22px",
          width: "100%",
          maxWidth: 440,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          maxHeight: "min(480px, calc(100vh - 120px))",
          height: "auto",
          my: "auto",
        }}
      >
        {/* Modal Header */}
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
            <EditOutlinedIcon sx={{ color: isDark ? "#38bdf8" : "#6366f1", fontSize: 20 }} />
            <Typography variant="h6" sx={{ fontWeight: 750, fontSize: "1rem", color: isDark ? "#fff" : "#0f172a" }}>
              Edit Authenticator Name
            </Typography>
          </Box>

          <IconButton size="small" onClick={onClose} sx={{ color: isDark ? "#94a3b8" : "#64748b" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Modal Body */}
        <Box sx={{ p: { xs: 2, sm: 2.5 }, display: "flex", flexDirection: "column", gap: 2, flex: 1, minHeight: 0, overflowY: "auto" }}>
          {/* Account / Identity (Read-only) */}
          <Box>
            <Typography
              sx={{
                color: isDark ? "#94a3b8" : "#64748b",
                fontSize: "0.74rem",
                fontWeight: 700,
                mb: 0.6,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Account (Read-only)
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: "10px 14px",
                borderRadius: "12px",
                backgroundColor: isDark ? "rgba(255, 255, 255, 0.03)" : "#f1f5f9",
                border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0",
              }}
            >
              <Typography sx={{ fontSize: "0.86rem", color: isDark ? "#cbd5e1" : "#475569", fontWeight: 500 }}>
                {account}
              </Typography>
              <LockOutlinedIcon sx={{ fontSize: 16, color: isDark ? "#64748b" : "#94a3b8" }} />
            </Box>
          </Box>

          {/* Editable Name Field */}
          <Box>
            <Typography sx={{ color: isDark ? "#f1f5f9" : "#0f172a", fontSize: "0.8rem", fontWeight: 700, mb: 0.6 }}>
              Authenticator Name
            </Typography>
            <Box
              sx={{
                borderRadius: "12px",
                border: isDark ? "1px solid rgba(255, 255, 255, 0.16)" : "1px solid #cbd5e1",
                backgroundColor: isDark ? "#030712" : "#ffffff",
                p: "8px 12px",
                "&:focus-within": {
                  borderColor: "#6366f1",
                  boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.25)",
                },
              }}
            >
              <InputBase
                fullWidth
                autoFocus
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Google Workspace, GitHub"
                sx={{
                  color: isDark ? "#ffffff" : "#0f172a",
                  fontSize: "0.92rem",
                  fontWeight: 650,
                }}
              />
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
            type="submit"
            variant="contained"
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
            Save Name
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
