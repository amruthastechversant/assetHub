"use client";
import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import LaptopMacOutlinedIcon from "@mui/icons-material/LaptopMacOutlined";
import DevicesOutlinedIcon from "@mui/icons-material/DevicesOutlined";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import TabletMacOutlinedIcon from "@mui/icons-material/TabletMacOutlined";
import SensorsOutlinedIcon from "@mui/icons-material/SensorsOutlined";
import DeviceStatusBadge from "@/components/device/DeviceStatusBadge";
import ReportIssueButton from "@/components/device/ReportIssueButton";
import { hasPermission } from "@/lib/permissions";
import type { DeviceDetail } from "@/lib/device";

interface Props {
  device: Partial<DeviceDetail>;
  role?: string;
}

function DeviceTypeIcon({
  assetType,
  size,
}: {
  assetType?: string;
  size: number;
}) {
  const t = (assetType || "").toLowerCase();
  const sx = { fontSize: size, color: "#1d4ed8" };

  if (t.includes("laptop") || t.includes("notebook"))
    return <LaptopMacOutlinedIcon sx={sx} />;
  if (t.includes("camera")) return <CameraAltOutlinedIcon sx={sx} />;
  if (t.includes("tablet")) return <TabletMacOutlinedIcon sx={sx} />;
  if (t.includes("sensor")) return <SensorsOutlinedIcon sx={sx} />;
  return <DevicesOutlinedIcon sx={sx} />;
}

export default function DeviceHeader({ device, role }: Props) {
  const canReportIssue = hasPermission(role, "reportIssue");

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: { xs: 3, md: 4 },
        border: "1px solid rgba(148, 163, 184, 0.18)",
        background:
          "linear-gradient(135deg, #f0f7ff 0%, #e8f0fe 50%, #f0f7ff 100%)",
        boxShadow: "0 4px 24px rgba(29, 78, 216, 0.08)",
        overflow: "visible",
        position: "relative",
      }}
    >
      {/* Decorative gradient accent strip */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          borderRadius: "12px 12px 0 0",
          background: "linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)",
        }}
      />

      <CardContent
        sx={{
          pt: { xs: 3, md: 3.5 },
          pb: { xs: 2.5, md: 3 },
          px: { xs: 2.5, md: 3.5 },
        }}
      >
        {/* Responsive flex box for header layout */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "center", md: "center" },
            justifyContent: "space-between",
            gap: { xs: 2.5, md: 3 },
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "center", sm: "flex-start" },
              gap: { xs: 2, md: 2.5 },
              textAlign: { xs: "center", sm: "left" },
              width: "100%",
            }}
          >
            {/* Icon bubble */}
            <Box
              aria-hidden
              sx={{
                width: { xs: 72, md: 80 },
                height: { xs: 72, md: 80 },
                borderRadius: { xs: 3, md: 3.5 },
                bgcolor: "rgba(255,255,255,0.85)",
                border: "1px solid rgba(37, 99, 235, 0.15)",
                boxShadow:
                  "0 8px 24px rgba(37, 99, 235, 0.10), inset 0 1px 0 rgba(255,255,255,0.9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <DeviceTypeIcon assetType={device.assetType} size={38} />
            </Box>

            {/* Text block */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {/* Asset Code */}
              <Typography
                component="p"
                sx={{
                  fontSize: { xs: "0.75rem", md: "0.78rem" },
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#2563eb",
                  mb: 0.5,
                }}
              >
                {device.assetCode || device.id || "UNASSIGNED"}
              </Typography>

              {/* Model — primary heading */}
              <Typography
                variant="h5"
                component="h1"
                sx={{
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.15,
                  color: "#0f172a",
                  fontSize: { xs: "1.35rem", sm: "1.5rem", md: "1.6rem" },
                  wordBreak: "break-word",
                  mb: 0.75,
                }}
              >
                {device.model || device.name || "Device Details"}
              </Typography>

              {/* Asset type + status chip row */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: { xs: "center", sm: "flex-start" },
                  gap: 1.5,
                  flexWrap: "wrap",
                }}
              >
                {device.assetType && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#475569",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                    }}
                  >
                    {device.assetType}
                  </Typography>
                )}

                {device.assetType && device.status && (
                  <Box
                    aria-hidden
                    sx={{
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      bgcolor: "#cbd5e1",
                    }}
                  />
                )}

                {device.status && (
                  <DeviceStatusBadge status={device.status} size="small" />
                )}
              </Box>
            </Box>
          </Box>

          {/* Action Button: Report Issue */}
          {canReportIssue && device.assetCode && (
            <Box sx={{ flexShrink: 0, mt: { xs: 1, md: 0 } }}>
              <ReportIssueButton
                assetCode={device.assetCode}
                model={device.model || "Device"}
              />
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
