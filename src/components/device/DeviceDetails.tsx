"use client";
import React from "react";
import DeviceInfoItem from "@/components/device/DeviceInfoItem";
import DeviceStatusBadge from "@/components/device/DeviceStatusBadge";
import { formatDate, formatCurrency } from "@/lib/format";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import BugReportIcon from "@mui/icons-material/BugReport";

export interface DeviceDetailsType {
  id?: string;
  name?: string;
  assetCode?: string;
  assetType?: string;
  model?: string;
  storage?: string;
  os?: string;
  ram?: string;
  processor?: string;
  purchaseDate?: string;
  status?: string;
  purchaseAmount?: number;
  location?: string;
  [key: string]: any;
}

interface Props {
  device: DeviceDetailsType;
}

export default function DeviceDetails({ device }: Props) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        border: "1px solid rgba(148, 163, 184, 0.18)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.96) 100%)",
        boxShadow: "0 18px 40px rgba(15, 23, 42, 0.06)",
        overflow: "hidden",
      }}
    >
      <CardContent sx={{ p: 2.1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.5,
            mb: 2,
            pb: 1.25,
            borderBottom: "1px solid rgba(148, 163, 184, 0.16)",
          }}
        >
          <Typography
            variant="h5"
            component="h2"
            sx={{
              fontWeight: 800,
              letterSpacing: "-0.05em",
              color: "#0f172a",
              fontSize: "1.35rem",
            }}
          >
            Device info
          </Typography>

          <Tooltip title="Report an issue" arrow placement="left">
            <IconButton
              aria-label="Report an issue"
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                border: "1px solid rgba(239, 68, 68, 0.18)",
                bgcolor: "#fff1f2",
                color: "#e11d48",
                boxShadow: "0 8px 18px rgba(225, 29, 72, 0.08)",
                '&:hover': { bgcolor: "#ffe4e6" },
              }}
            >
              <BugReportIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 1.15,
          }}
        >
          <Box sx={{ p: 1.2, borderRadius: 2.5, bgcolor: "#f8fafc", border: "1px solid rgba(148,163,184,0.12)" }}>
            <DeviceInfoItem label="Asset Code" value={device.assetCode ?? device.id} />
          </Box>

          <Box sx={{ p: 1.2, borderRadius: 2.5, bgcolor: "#f8fafc", border: "1px solid rgba(148,163,184,0.12)" }}>
            <DeviceInfoItem label="Asset Type" value={device.assetType} />
          </Box>

          <Box sx={{ p: 1.2, borderRadius: 2.5, bgcolor: "#f8fafc", border: "1px solid rgba(148,163,184,0.12)" }}>
            <DeviceInfoItem label="Model" value={device.model} />
          </Box>

          <Box sx={{ p: 1.2, borderRadius: 2.5, bgcolor: "#f8fafc", border: "1px solid rgba(148,163,184,0.12)" }}>
            <DeviceInfoItem label="Processor" value={device.processor} />
          </Box>

          <Box sx={{ p: 1.2, borderRadius: 2.5, bgcolor: "#f8fafc", border: "1px solid rgba(148,163,184,0.12)" }}>
            <DeviceInfoItem label="RAM" value={device.ram} />
          </Box>

          <Box sx={{ p: 1.2, borderRadius: 2.5, bgcolor: "#f8fafc", border: "1px solid rgba(148,163,184,0.12)" }}>
            <DeviceInfoItem label="Storage" value={device.storage} />
          </Box>

          <Box sx={{ p: 1.2, borderRadius: 2.5, bgcolor: "#f8fafc", border: "1px solid rgba(148,163,184,0.12)" }}>
            <DeviceInfoItem label="OS" value={device.os} />
          </Box>

          <Box sx={{ p: 1.2, borderRadius: 2.5, bgcolor: "#f8fafc", border: "1px solid rgba(148,163,184,0.12)" }}>
            <DeviceInfoItem label="Purchase Date" value={device.purchaseDate ? formatDate(device.purchaseDate) : undefined} />
          </Box>

          <Box sx={{ p: 1.2, borderRadius: 2.5, bgcolor: "#f8fafc", border: "1px solid rgba(148,163,184,0.12)" }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Status
            </Typography>
            <Box sx={{ mt: 1 }}>
              <DeviceStatusBadge status={device.status ?? "Available"} />
            </Box>
          </Box>

          <Box sx={{ p: 1.2, borderRadius: 2.5, bgcolor: "#f8fafc", border: "1px solid rgba(148,163,184,0.12)" }}>
            <DeviceInfoItem label="Purchase Amount" value={device.purchaseAmount ? formatCurrency(device.purchaseAmount) : undefined} />
          </Box>

          <Box sx={{ p: 1.2, borderRadius: 2.5, bgcolor: "#f8fafc", border: "1px solid rgba(148,163,184,0.12)" }}>
            <DeviceInfoItem label="Location" value={device.location} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
