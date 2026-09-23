"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LaptopIcon from "@mui/icons-material/Laptop";
import DesktopWindowsIcon from "@mui/icons-material/DesktopWindows";
import SendIcon from "@mui/icons-material/Send";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { DeviceDetailView } from "@/lib/mockScannerData";
import { getRolePermissions, hasPermission } from "@/lib/permissions";
import type { DeviceField } from "@/types/permissions";

interface DeviceDetailsSheetProps {
  device: DeviceDetailView;
  currentRole?: string;
  onClose: () => void;
  onScanAnother: () => void;
  onToast: (msg: string) => void;
}

export default function DeviceDetailsSheet({
  device,
  currentRole = "Admin",
  onClose,
  onScanAnother,
  onToast,
}: DeviceDetailsSheetProps) {
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState("Hardware fault");
  const [issueDescription, setIssueDescription] = useState("");
  const [priority, setPriority] = useState<"Normal" | "Critical">("Critical");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<{
    ticketId: string;
    timestamp: string;
  } | null>(null);

  const permissions = getRolePermissions(currentRole);
  const allowedFieldSet = new Set<string>(permissions.allowedFields);
  const canReportIssue = hasPermission(currentRole, "reportIssue");

  const copyCode = () => {
    navigator.clipboard.writeText(device.assetCode);
    onToast(`Copied ${device.assetCode} to clipboard`);
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return null;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return { bg: "rgba(16, 185, 129, 0.12)", text: "#10b981", border: "rgba(16, 185, 129, 0.25)" };
      case "inactive":
        return { bg: "rgba(239, 68, 68, 0.12)", text: "#ef4444", border: "rgba(239, 68, 68, 0.25)" };
      case "retired":
        return { bg: "rgba(148, 163, 184, 0.12)", text: "#94a3b8", border: "rgba(148, 163, 184, 0.25)" };
      case "restricted":
        return { bg: "rgba(245, 158, 11, 0.12)", text: "#f59e0b", border: "rgba(245, 158, 11, 0.25)" };
      default:
        return { bg: "rgba(99, 102, 241, 0.12)", text: "#6366f1", border: "rgba(99, 102, 241, 0.25)" };
    }
  };

  const statusStyle = getStatusColor(device.status);

  // All 11 permission fields evaluated against role permissions
  const allFieldDefinitions: { field: DeviceField; label: string; value: string | null; highlight?: boolean }[] = [
    { field: "assetCode", label: "Asset Code", value: device.assetCode, highlight: true },
    { field: "assetType", label: "Asset Type", value: device.assetType },
    { field: "model", label: "Model", value: device.model },
    { field: "storage", label: "Storage", value: device.storage },
    { field: "operatingSystem", label: "Operating System", value: device.operatingSystem },
    { field: "ram", label: "RAM", value: device.ram },
    { field: "processor", label: "Processor", value: device.processor },
    { field: "purchaseDate", label: "Purchase Date", value: device.purchaseDate },
    { field: "status", label: "Status", value: device.status },
    { field: "purchaseAmount", label: "Purchase Amount", value: formatCurrency(device.purchaseAmount) },
    { field: "location", label: "Location", value: device.location || null },
  ];

  // Role-filtered visible rows
  const visibleRows = allFieldDefinitions.filter((item) => {
    if (permissions.viewAllFields) return true;
    return allowedFieldSet.has(item.field);
  });

  const hiddenCount = allFieldDefinitions.length - visibleRows.length;

  const handleOpenIssueModal = () => {
    setSubmittedTicket(null);
    setIssueDescription("");
    setShowIssueModal(true);
  };

  const handleSubmitIssue = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulated API dispatch
    setTimeout(() => {
      const ticketId = `TKT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmittedTicket({
        ticketId,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
      setIsSubmitting(false);
      onToast(`Issue logged! Ticket: ${ticketId}`);
    }, 500);
  };

  return (
    <Box
      sx={{
        backgroundColor: "transparent",
        color: "#f1f5f9",
        width: "100%",
        position: "relative",
      }}
    >
      {/* Header bar */}
      <Box
        sx={{
          px: { xs: 2.5, sm: 3.5 },
          py: 2.5,
          borderBottom: "1px solid rgba(99, 102, 241, 0.18)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "rgba(14,20,36,0.95)",
        }}
      >
        <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#ffffff" }}>
          Device Details
        </Typography>

        {/* Top Actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip
            label={device.status.toUpperCase()}
            size="small"
            sx={{
              backgroundColor: statusStyle.bg,
              color: statusStyle.text,
              border: `1px solid ${statusStyle.border}`,
              fontWeight: 700,
              fontSize: "0.72rem",
              borderRadius: "999px",
              height: 26,
            }}
          />

          {/* REPORT AN ISSUE ICON BUTTON */}
          {canReportIssue && (
            <Tooltip title="Report an issue for this device">
              <IconButton
                size="small"
                onClick={handleOpenIssueModal}
                sx={{
                  color: "#ef4444",
                  backgroundColor: "rgba(239, 68, 68, 0.12)",
                  border: "1px solid rgba(239, 68, 68, 0.25)",
                  width: 36,
                  height: 36,
                  borderRadius: "12px",
                  "&:hover": {
                    backgroundColor: "rgba(239, 68, 68, 0.22)",
                    color: "#ef4444",
                  },
                }}
              >
                <ReportProblemOutlinedIcon sx={{ fontSize: 19 }} />
              </IconButton>
            </Tooltip>
          )}

          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              color: "#94a3b8",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              width: 36,
              height: 36,
              borderRadius: "12px",
              "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)", color: "#ffffff" },
            }}
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Hero Device Section */}
      <Box
        sx={{
          m: { xs: 2.5, sm: 3.5 },
          p: { xs: 2.5, sm: 3.5 },
          backgroundColor: "#131b2e",
          borderRadius: "24px",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          gap: 2.5,
          border: "1px solid rgba(99, 102, 241, 0.18)"
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "18px",
            backgroundColor: "rgba(56, 189, 248, 0.05)",
            border: "1px solid rgba(99, 102, 241, 0.18)",
            display: "grid",
            placeItems: "center",
            color: "#38bdf8",
            flexShrink: 0,
          }}
        >
          {device.assetType.toLowerCase().includes("monitor") ? (
            <DesktopWindowsIcon sx={{ fontSize: 28 }} />
          ) : (
            <LaptopIcon sx={{ fontSize: 28 }} />
          )}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: { xs: "1.2rem", sm: "1.35rem" },
              letterSpacing: "-0.02em",
              color: "#ffffff",
              lineHeight: 1.2,
              mb: 0.5,
            }}
          >
            {device.model}
          </Typography>
          <Typography sx={{ color: "#8ea3b0", fontSize: "0.85rem" }}>
            {device.assetType} · {device.assetCode}
          </Typography>
        </Box>
      </Box>

      {/* Role Notice & Fields Grid */}
      <Box sx={{ px: { xs: 2.5, sm: 3.5 }, pb: { xs: 2.5, sm: 3.5 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Typography
            sx={{
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#94a3b8",
            }}
          >
            Specifications ({visibleRows.length} fields visible for {currentRole})
          </Typography>

          {hiddenCount > 0 && (
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.6,
                fontSize: "0.7rem",
                color: "#f59e0b",
                backgroundColor: "rgba(245, 158, 11, 0.1)",
                px: 1.2,
                py: 0.4,
                borderRadius: "8px",
                fontWeight: 700,
              }}
            >
              <LockOutlinedIcon sx={{ fontSize: 13 }} />
              {hiddenCount} field{hiddenCount > 1 ? "s" : ""} restricted
            </Box>
          )}
        </Box>

        {/* Responsive Field Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
            gap: 1.5,
            mb: 4,
          }}
        >
          {visibleRows.map((row) => (
            <Box
              key={row.field}
              sx={{
                backgroundColor: "#131b2e",
                border: "1px solid rgba(99, 102, 241, 0.18)",
                borderRadius: "16px",
                p: 2,
              }}
            >
              <Typography
                sx={{
                  color: "#94a3b8",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  mb: 0.5,
                }}
              >
                {row.label}
              </Typography>
              <Typography
                sx={{
                  color: row.highlight ? "#38bdf8" : "#ffffff",
                  fontWeight: row.highlight ? 800 : 700,
                  fontSize: "0.95rem",
                  wordBreak: "break-word",
                  fontFamily: row.highlight ? "monospace" : "inherit",
                }}
              >
                {row.value || "—"}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
          <Button
            variant="contained"
            onClick={onScanAnother}
            startIcon={<QrCodeScannerIcon />}
            sx={{
              backgroundColor: "#6366f1",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "0.95rem",
              py: 1.5,
              borderRadius: "16px",
              textTransform: "none",
              boxShadow: "0 8px 24px rgba(99, 102, 241, 0.25)",
              "&:hover": { backgroundColor: "#818cf8" },
            }}
          >
            Scan Another QR
          </Button>

          <Button
            variant="outlined"
            onClick={copyCode}
            startIcon={<ContentCopyIcon />}
            sx={{
              borderColor: "rgba(99, 102, 241, 0.18)",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "0.95rem",
              py: 1.5,
              borderRadius: "16px",
              textTransform: "none",
              backgroundColor: "#131b2e",
              "&:hover": {
                borderColor: "#6366f1",
                backgroundColor: "rgba(99,102,241,0.1)",
                color: "#818cf8"
              },
            }}
          >
            Copy Asset Code
          </Button>
        </Box>
      </Box>

      {/* REPORT AN ISSUE MODAL */}
      {showIssueModal && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            backgroundColor: "rgba(3, 7, 18, 0.8)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: { xs: "flex-end", sm: "center" },
            justifyContent: "center",
            p: { xs: 0, sm: 2 },
          }}
        >
          <Box
            sx={{
              backgroundColor: "#111827",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: { xs: "24px 24px 0 0", sm: "24px" },
              width: "100%",
              maxWidth: 480,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
              overflow: "hidden",
              maxHeight: "92vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Modal Header */}
            <Box
              sx={{
                px: { xs: 2.5, sm: 3 },
                py: 2.2,
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#162032",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                <ReportProblemOutlinedIcon sx={{ color: "#f87171", fontSize: 22 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.05rem", color: "#fff" }}>
                  Report Device Issue
                </Typography>
              </Box>

              <IconButton
                size="small"
                onClick={() => setShowIssueModal(false)}
                sx={{ color: "#94a3b8" }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            {submittedTicket ? (
              // Confirmation View
              <Box sx={{ p: { xs: 3, sm: 4 }, textAlign: "center" }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: "18px",
                    backgroundColor: "rgba(16, 185, 129, 0.15)",
                    color: "#10b981",
                    display: "grid",
                    placeItems: "center",
                    mx: "auto",
                    mb: 2,
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 32 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#fff", mb: 0.5, fontSize: "1.1rem" }}>
                  Support Ticket Dispatched
                </Typography>
                <Typography sx={{ color: "#94a3b8", fontSize: "0.82rem", mb: 3 }}>
                  Your incident report has been logged with IT Operations. Updates will follow shortly.
                </Typography>

                <Box
                  sx={{
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "16px",
                    p: 2,
                    mb: 3,
                    textAlign: "left",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography sx={{ color: "#64748b", fontSize: "0.7rem", textTransform: "uppercase", fontWeight: 700 }}>
                      Ticket Number
                    </Typography>
                    <Typography sx={{ color: "#818cf8", fontWeight: 800, fontFamily: "monospace", fontSize: "1rem" }}>
                      {submittedTicket.ticketId}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography sx={{ color: "#64748b", fontSize: "0.7rem", textTransform: "uppercase", fontWeight: 700 }}>
                      Device Code
                    </Typography>
                    <Typography sx={{ color: "#f1f5f9", fontWeight: 700, fontSize: "0.88rem" }}>
                      {device.assetCode}
                    </Typography>
                  </Box>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => setShowIssueModal(false)}
                  sx={{
                    backgroundColor: "#6366f1",
                    color: "#fff",
                    fontWeight: 700,
                    borderRadius: "14px",
                    py: 1.4,
                    textTransform: "none",
                  }}
                >
                  Done
                </Button>
              </Box>
            ) : (
              // Form Input
              <Box
                component="form"
                onSubmit={handleSubmitIssue}
                sx={{ p: { xs: 2.5, sm: 3 }, overflowY: "auto" }}
              >
                {/* Target Device */}
                <Box
                  sx={{
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    borderRadius: "12px",
                    p: 1.5,
                    mb: 2.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "0.85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {device.model}
                    </Typography>
                    <Typography sx={{ color: "#64748b", fontSize: "0.72rem" }}>
                      Asset Code: {device.assetCode}
                    </Typography>
                  </Box>
                  <Chip
                    label={device.status.toUpperCase()}
                    size="small"
                    sx={{
                      backgroundColor: statusStyle.bg,
                      color: statusStyle.text,
                      fontWeight: 700,
                      fontSize: "0.68rem",
                      height: 22,
                    }}
                  />
                </Box>

                {/* Problem category */}
                <Typography sx={{ color: "#cbd5e1", fontSize: "0.78rem", fontWeight: 600, mb: 1 }}>
                  Issue Category
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: 0.8,
                    mb: 2.5,
                  }}
                >
                  {[
                    "Hardware fault",
                    "OS / Boot failure",
                    "Battery / Charging",
                    "Screen / Display",
                    "Network & Wi-Fi",
                    "Other defect",
                  ].map((cat) => (
                    <Box
                      key={cat}
                      onClick={() => setSelectedIssue(cat)}
                      sx={{
                        p: 1.1,
                        borderRadius: "12px",
                        border: "1px solid",
                        borderColor:
                          selectedIssue === cat
                            ? "#6366f1"
                            : "rgba(255, 255, 255, 0.08)",
                        backgroundColor:
                          selectedIssue === cat
                            ? "rgba(99, 102, 241, 0.15)"
                            : "rgba(255, 255, 255, 0.02)",
                        color: selectedIssue === cat ? "#818cf8" : "#94a3b8",
                        fontWeight: 600,
                        fontSize: "0.76rem",
                        textAlign: "center",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {cat}
                    </Box>
                  ))}
                </Box>

                {/* Description */}
                <Typography sx={{ color: "#cbd5e1", fontSize: "0.78rem", fontWeight: 600, mb: 1 }}>
                  Problem Description
                </Typography>
                <Box
                  component="textarea"
                  rows={3}
                  value={issueDescription}
                  onChange={(e: any) => setIssueDescription(e.target.value)}
                  placeholder="Describe symptoms, what triggered the failure, or damage details..."
                  sx={{
                    width: "100%",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    backgroundColor: "#030712",
                    color: "#f8fafc",
                    p: 1.5,
                    fontSize: "0.82rem",
                    outline: "none",
                    resize: "none",
                    mb: 2.5,
                    fontFamily: "inherit",
                    "&:focus": { borderColor: "#6366f1" },
                  }}
                />

                {/* Urgency */}
                <Typography sx={{ color: "#cbd5e1", fontSize: "0.78rem", fontWeight: 600, mb: 1 }}>
                  Urgency Level
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, mb: 3 }}>
                  <Button
                    type="button"
                    onClick={() => setPriority("Normal")}
                    sx={{
                      py: 0.9,
                      borderRadius: "12px",
                      border: "1px solid",
                      borderColor: priority === "Normal" ? "#6366f1" : "rgba(255, 255, 255, 0.1)",
                      backgroundColor: priority === "Normal" ? "rgba(99, 102, 241, 0.12)" : "transparent",
                      color: priority === "Normal" ? "#818cf8" : "#94a3b8",
                      fontWeight: 600,
                      textTransform: "none",
                      fontSize: "0.78rem",
                    }}
                  >
                    Normal Priority
                  </Button>

                  <Button
                    type="button"
                    onClick={() => setPriority("Critical")}
                    sx={{
                      py: 0.9,
                      borderRadius: "12px",
                      border: "1px solid",
                      borderColor: priority === "Critical" ? "#ef4444" : "rgba(255, 255, 255, 0.1)",
                      backgroundColor: priority === "Critical" ? "rgba(239, 68, 68, 0.12)" : "transparent",
                      color: priority === "Critical" ? "#f87171" : "#94a3b8",
                      fontWeight: 600,
                      textTransform: "none",
                      fontSize: "0.78rem",
                    }}
                  >
                    Critical - Work Blocked
                  </Button>
                </Box>

                {/* Submit button */}
                <Button
                  fullWidth
                  type="submit"
                  disabled={isSubmitting}
                  variant="contained"
                  endIcon={<SendIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    backgroundColor: "#6366f1",
                    color: "#ffffff",
                    fontWeight: 700,
                    borderRadius: "14px",
                    py: 1.4,
                    fontSize: "0.88rem",
                    textTransform: "none",
                    boxShadow: "0 4px 14px rgba(99, 102, 241, 0.3)",
                    "&:hover": { backgroundColor: "#4f46e5" },
                  }}
                >
                  {isSubmitting ? "Dispatching ticket..." : "Submit Incident Report"}
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}
