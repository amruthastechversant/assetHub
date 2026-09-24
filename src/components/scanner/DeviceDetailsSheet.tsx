"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import CloseIcon from "@mui/icons-material/Close";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import DevicesIcon from "@mui/icons-material/Devices";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { DeviceDetailView } from "@/lib/mockScannerData";
import { getRolePermissions, hasPermission } from "@/lib/permissions";
import type { DeviceField } from "@/types/permissions";

interface DeviceDetailsSheetProps {
  device: DeviceDetailView;
  currentRole?: string;
  themeMode?: "dark" | "light";
  onClose: () => void;
  onScanAnother?: () => void;
  onToast: (msg: string) => void;
}

interface AttachmentItem {
  id: string;
  file: File;
  url: string;
  isImage: boolean;
  name: string;
  size: number;
}

export default function DeviceDetailsSheet({
  device,
  currentRole = "Admin",
  themeMode = "dark",
  onClose,
  onScanAnother,
  onToast,
}: DeviceDetailsSheetProps) {
  const isDark = themeMode === "dark";
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueDescription, setIssueDescription] = useState("");
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const permissions = getRolePermissions(currentRole);
  const allowedFieldSet = new Set<string>(permissions.allowedFields);
  const canReportIssue = hasPermission(currentRole, "reportIssue");

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return null;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Permission fields evaluated against role permissions
  const allFieldDefinitions: { field: DeviceField; label: string; value: string | null; highlight?: boolean }[] = [
    { field: "assetCode", label: "Asset Code", value: device.assetCode, highlight: true },
    { field: "assetType", label: "Asset Type", value: device.assetType },
    { field: "model", label: "Model", value: device.model },
    { field: "storage", label: "Storage", value: device.storage },
    { field: "operatingSystem", label: "Operating System", value: device.operatingSystem },
    { field: "ram", label: "RAM", value: device.ram },
    { field: "processor", label: "Processor", value: device.processor },
    { field: "purchaseDate", label: "Purchase Date", value: device.purchaseDate },
    { field: "purchaseAmount", label: "Purchase Amount", value: formatCurrency(device.purchaseAmount) },
    { field: "location", label: "Location", value: device.location || null },
  ];

  // Role-filtered visible rows
  const visibleRows = allFieldDefinitions.filter((item) => {
    if (permissions.viewAllFields) return true;
    return allowedFieldSet.has(item.field);
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleOpenIssueModal = () => {
    setIssueDescription("");
    attachments.forEach((a) => {
      if (a.url) URL.revokeObjectURL(a.url);
    });
    setAttachments([]);
    setShowIssueModal(true);
  };

  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;

    if (attachments.length + selected.length > 5) {
      onToast(`Maximum 5 attachments allowed (already have ${attachments.length}).`);
      e.target.value = "";
      return;
    }

    const currentTotal = attachments.reduce((sum, a) => sum + a.size, 0);
    const newTotal = selected.reduce((sum, f) => sum + f.size, 0);
    const maxBytes = 25 * 1024 * 1024; // 25 MB

    if (currentTotal + newTotal > maxBytes) {
      onToast("Total attachment size exceeds 25 MB limit.");
      e.target.value = "";
      return;
    }

    const newItems: AttachmentItem[] = selected.map((file) => {
      const isImg = file.type.startsWith("image/");
      const url = URL.createObjectURL(file);
      return {
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        url,
        isImage: isImg,
        name: file.name,
        size: file.size,
      };
    });

    setAttachments((prev) => [...prev, ...newItems]);
    e.target.value = "";
  };

  const handleRemoveAttachment = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setAttachments((prev) => {
      const item = prev.find((a) => a.id === id);
      if (item?.url) URL.revokeObjectURL(item.url);
      return prev.filter((a) => a.id !== id);
    });
  };

  const handleOpenAttachment = (item: AttachmentItem, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (item.isImage) {
      // Create a viewer document in the new tab to guarantee the image renders without about:blank issues
      const win = window.open("", "_blank");
      if (win) {
        win.document.title = item.name;
        win.document.body.style.margin = "0";
        win.document.body.style.backgroundColor = "#0b0f19";
        win.document.body.style.display = "flex";
        win.document.body.style.alignItems = "center";
        win.document.body.style.justifyContent = "center";
        win.document.body.style.minHeight = "100vh";
        win.document.body.style.padding = "20px";
        win.document.body.style.boxSizing = "border-box";
        win.document.body.style.overflow = "auto";

        const img = win.document.createElement("img");
        img.src = item.url;
        img.alt = item.name;
        img.style.maxWidth = "95vw";
        img.style.maxHeight = "95vh";
        img.style.objectFit = "contain";
        img.style.borderRadius = "8px";
        img.style.boxShadow = "0 10px 40px rgba(0,0,0,0.7)";
        win.document.body.appendChild(img);
        return;
      }
    }

    // For PDF and other documents: open via native anchor element preserving origin context
    const link = document.createElement("a");
    link.href = item.url;
    link.target = "_blank";
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmitIssue = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulated API dispatch
    setTimeout(() => {
      const ticketId = `TKT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setIsSubmitting(false);
      setShowIssueModal(false);
      setIssueDescription("");
      attachments.forEach((a) => {
        if (a.url) URL.revokeObjectURL(a.url);
      });
      setAttachments([]);
      onToast(`Issue logged! Ticket: ${ticketId}`);
    }, 450);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        maxHeight: { xs: "92vh", md: "min(780px, calc(100vh - 40px))" },
        backgroundColor: "transparent",
        color: isDark ? "#f1f5f9" : "#08131e",
        width: "100%",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Pinned Header bar */}
  <Box
    sx={{
      flexShrink: 0,
      px: { xs: 2.5, sm: 3.5 },
      py: 2.2,
      borderBottom: isDark ? "1px solid rgba(99, 102, 241, 0.18)" : "1px solid #e2e8f0",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: isDark ? "rgba(14,20,36,0.98)" : "rgba(255,255,255,0.98)",
      backdropFilter: "blur(12px)",
      zIndex: 10,
    }}
  >
    <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color: isDark ? "#ffffff" : "#08131e" }}>
      Device Details
    </Typography>

    {/* Top Actions */}
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
          color: isDark ? "#94a3b8" : "#64748b",
          backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "#f1f5f9",
          width: 36,
          height: 36,
          borderRadius: "12px",
          "&:hover": { backgroundColor: isDark ? "rgba(255, 255, 255, 0.1)" : "#e2e8f0", color: isDark ? "#ffffff" : "#08131e" },
        }}
      >
        <CloseIcon sx={{ fontSize: 20 }} />
      </IconButton>
    </Box>
  </Box>

  {/* Scrollable Content Body */ }
  <Box
    sx={{
      flex: 1,
      overflowY: "auto",
      p: { xs: 2.5, sm: 3.5 },
      scrollbarWidth: "thin",
      scrollbarColor: isDark ? "rgba(255,255,255,0.2) transparent" : "rgba(0,0,0,0.18) transparent",
      "&::-webkit-scrollbar": {
        width: "6px",
      },
      "&::-webkit-scrollbar-track": {
        background: "transparent",
        margin: "6px 0",
      },
      "&::-webkit-scrollbar-thumb": {
        backgroundColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.18)",
        borderRadius: "999px",
        "&:hover": {
          backgroundColor: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.3)",
        },
      },
    }}
  >
    {/* Hero Device Section */}
    <Box
      sx={{
        p: { xs: 2.2, sm: 3 },
        mb: 3,
        backgroundColor: "#131b2e",
        borderRadius: "20px",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        gap: 2.5,
        border: "1px solid rgba(99, 102, 241, 0.18)",
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
        <DevicesIcon sx={{ fontSize: 30 }} />
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

    {/* Fields Grid */}
    <Box sx={{ pb: 1 }}>
      {/* Responsive Field Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
          gap: 1.5,
        }}
      >
        {visibleRows.map((row) => (
          <Box
            key={row.field}
            sx={{
              backgroundColor: isDark ? "#131b2e" : "#f8fafc",
              border: isDark ? "1px solid rgba(99, 102, 241, 0.18)" : "1px solid #e2e8f0",
              borderRadius: "16px",
              p: 2,
            }}
          >
            <Typography
              sx={{
                color: isDark ? "#94a3b8" : "#64748b",
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
                color: row.highlight
                  ? (isDark ? "#38bdf8" : "#4f46e5")
                  : (isDark ? "#ffffff" : "#08131e"),
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
    </Box>
  </Box>

  {/* Pinned Action Buttons Footer */}
  <Box
    sx={{
      flexShrink: 0,
      p: { xs: 2, sm: 2.2 },
      px: { xs: 2.5, sm: 3.5 },
      borderTop: isDark ? "1px solid rgba(99, 102, 241, 0.18)" : "1px solid #e2e8f0",
      backgroundColor: isDark ? "rgba(14,20,36,0.98)" : "rgba(255,255,255,0.98)",
      backdropFilter: "blur(12px)",
      display: "flex",
      justifyContent: { xs: "stretch", sm: "flex-end" },
      alignItems: "center",
      zIndex: 10,
    }}
  >
    <Button
      variant="outlined"
      onClick={onClose}
      startIcon={<CloseIcon sx={{ fontSize: 18 }} />}
      sx={{
        width: { xs: "100%", sm: "auto" },
        minWidth: { sm: 120 },
        borderColor: isDark ? "rgba(255, 255, 255, 0.16)" : "#cbd5e1",
        color: isDark ? "#94a3b8" : "#64748b",
        fontWeight: 650,
        fontSize: "0.9rem",
        py: { xs: 1.25, sm: 1.15 },
        px: { sm: 3.5 },
        borderRadius: "14px",
        textTransform: "none",
        backgroundColor: isDark ? "rgba(255, 255, 255, 0.03)" : "#f8fafc",
        "&:hover": {
          borderColor: isDark ? "rgba(255, 255, 255, 0.3)" : "#94a3b8",
          backgroundColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
          color: isDark ? "#ffffff" : "#0f172a",
        },
      }}
    >
      Close
    </Button>
  </Box>

  {/* REPORT AN ISSUE MODAL */ }
  {
    showIssueModal && (
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

          {/* Form Input: Only Device details (name, id), Description, and Attachment upload */}
          <Box
            component="form"
            onSubmit={handleSubmitIssue}
            sx={{ p: { xs: 2.5, sm: 3 }, overflowY: "auto" }}
          >
            {/* Target Device Details (Name & ID) */}
            <Box
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "14px",
                p: "14px 16px",
                mb: 2.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ color: "#94a3b8", fontSize: "0.72rem", textTransform: "uppercase", fontWeight: 700 }}>
                  Device Details
                </Typography>
                <Typography sx={{ color: "#ffffff", fontWeight: 750, fontSize: "0.95rem", mt: 0.2 }}>
                  {device.model}
                </Typography>
                <Typography sx={{ color: "#818cf8", fontSize: "0.76rem", fontFamily: "monospace", mt: 0.2 }}>
                  ID: {device.assetCode}
                </Typography>
              </Box>
            </Box>

            {/* Description */}
            <Typography sx={{ color: "#cbd5e1", fontSize: "0.8rem", fontWeight: 650, mb: 1 }}>
              Description
            </Typography>
            <Box
              component="textarea"
              rows={4}
              value={issueDescription}
              onChange={(e: any) => setIssueDescription(e.target.value)}
              placeholder="Describe the issue, symptoms, or failure details..."
              required
              sx={{
                width: "100%",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                backgroundColor: "#030712",
                color: "#f8fafc",
                p: 1.5,
                fontSize: "0.85rem",
                outline: "none",
                resize: "none",
                mb: 2.5,
                fontFamily: "inherit",
                boxSizing: "border-box",
                "&:focus": { borderColor: "#6366f1" },
              }}
            />

            {/* Attachment Upload Button & Previews */}
            <Box sx={{ mb: 3 }}>
              <Button
                component="label"
                variant="outlined"
                disabled={attachments.length >= 5}
                startIcon={<AttachFileIcon />}
                sx={{
                  width: "100%",
                  borderRadius: "12px",
                  border: "1px dashed rgba(255, 255, 255, 0.2)",
                  color: attachments.length >= 5 ? "#64748b" : "#38bdf8",
                  py: 1.2,
                  fontSize: "0.84rem",
                  textTransform: "none",
                  fontWeight: 650,
                  backgroundColor: "rgba(255, 255, 255, 0.02)",
                  cursor: attachments.length >= 5 ? "not-allowed" : "pointer",
                  "&:hover": {
                    borderColor: attachments.length >= 5 ? "rgba(255, 255, 255, 0.2)" : "#818cf8",
                    backgroundColor: attachments.length >= 5 ? "transparent" : "rgba(99, 102, 241, 0.08)",
                    color: attachments.length >= 5 ? "#64748b" : "#ffffff",
                  },
                }}
              >
                Add attachments
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  disabled={attachments.length >= 5}
                  onChange={handleAddFiles}
                />
              </Button>

              {/* Limit & size info */}
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 0.8, px: 0.5 }}>
                <Typography sx={{ fontSize: "0.72rem", color: "#64748b" }}>
                  Up to 5 attachments · Max 25 MB total
                </Typography>
                {attachments.length > 0 && (
                  <Typography sx={{ fontSize: "0.72rem", color: "#38bdf8", fontWeight: 650 }}>
                    {attachments.length}/5 ({formatFileSize(attachments.reduce((sum, a) => sum + a.size, 0))})
                  </Typography>
                )}
              </Box>

              {/* Attachment Previews */}
              {attachments.length > 0 && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1.5 }}>
                  {attachments.map((item) => (
                    <Box
                      key={item.id}
                      onClick={(e) => handleOpenAttachment(item, e)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        p: "8px 12px",
                        borderRadius: "10px",
                        backgroundColor: "rgba(255, 255, 255, 0.04)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        gap: 1.5,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          backgroundColor: "rgba(255, 255, 255, 0.08)",
                          borderColor: "rgba(99, 102, 241, 0.4)",
                          transform: "translateY(-1px)",
                        },
                      }}
                    >
                      {/* Thumbnail or File icon */}
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, minWidth: 0, flex: 1 }}>
                        {item.isImage ? (
                          <Box
                            component="img"
                            src={item.url}
                            alt={item.name}
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: "8px",
                              objectFit: "cover",
                              border: "1px solid rgba(255, 255, 255, 0.15)",
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: "8px",
                              backgroundColor: "rgba(99, 102, 241, 0.15)",
                              color: "#818cf8",
                              display: "grid",
                              placeItems: "center",
                              flexShrink: 0,
                            }}
                          >
                            <AttachFileIcon sx={{ fontSize: 20 }} />
                          </Box>
                        )}

                        {/* File Name & Size */}
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                            <Typography
                              sx={{
                                fontSize: "0.8rem",
                                fontWeight: 650,
                                color: "#f1f5f9",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {item.name}
                            </Typography>
                            <OpenInNewIcon sx={{ fontSize: 13, color: "#64748b", flexShrink: 0 }} />
                          </Box>
                          <Typography sx={{ fontSize: "0.7rem", color: "#64748b" }}>
                            {formatFileSize(item.size)} · Click to view
                          </Typography>
                        </Box>
                      </Box>

                      {/* Remove Button */}
                      <Tooltip title="Remove file">
                        <IconButton
                          size="small"
                          onClick={(e) => handleRemoveAttachment(item.id, e)}
                          sx={{
                            color: "#94a3b8",
                            p: 0.6,
                            borderRadius: "8px",
                            "&:hover": { color: "#f87171", backgroundColor: "rgba(239, 68, 68, 0.14)" },
                          }}
                        >
                          <CloseIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ))}
                </Box>
              )}
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
                py: 1.3,
                fontSize: "0.9rem",
                textTransform: "none",
                boxShadow: "0 4px 16px rgba(99, 102, 241, 0.35)",
                "&:hover": { backgroundColor: "#4f46e5" },
              }}
            >
              {isSubmitting ? "Submitting issue..." : "Submit issue"}
            </Button>
          </Box>
        </Box>
      </Box>
    )
  }
    </Box >
  );
}
