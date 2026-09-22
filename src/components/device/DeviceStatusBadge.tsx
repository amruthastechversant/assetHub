"use client";
import React from "react";
import Chip from "@mui/material/Chip";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import PauseCircleOutlinedIcon from "@mui/icons-material/PauseCircleOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import RemoveCircleOutlinedIcon from "@mui/icons-material/RemoveCircleOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

export type DeviceStatus =
  | "active"
  | "inactive"
  | "retired"
  | "restricted"
  | "Active"
  | "Inactive"
  | "Under Maintenance"
  | "Retired"
  | "Assigned"
  | "Available"
  | string;

interface Props {
  status: DeviceStatus;
  size?: "small" | "medium";
}

interface StatusConfig {
  label: string;
  color: "default" | "primary" | "success" | "warning" | "error" | "info";
  icon: React.ReactElement;
}

function getStatusConfig(status: string): StatusConfig {
  const s = status.toLowerCase().trim();

  if (s === "active" || s === "assigned") {
    return {
      label: s === "assigned" ? "Assigned" : "Active",
      color: "success",
      icon: <CheckCircleOutlinedIcon fontSize="small" />,
    };
  }
  if (s === "available") {
    return {
      label: "Available",
      color: "info",
      icon: <CheckCircleOutlinedIcon fontSize="small" />,
    };
  }
  if (s === "inactive") {
    return {
      label: "Inactive",
      color: "default",
      icon: <PauseCircleOutlinedIcon fontSize="small" />,
    };
  }
  if (s.includes("maintenance")) {
    return {
      label: "Under Maintenance",
      color: "warning",
      icon: <BuildOutlinedIcon fontSize="small" />,
    };
  }
  if (s === "retired") {
    return {
      label: "Retired",
      color: "error",
      icon: <RemoveCircleOutlinedIcon fontSize="small" />,
    };
  }
  if (s === "restricted") {
    return {
      label: "Restricted",
      color: "warning",
      icon: <LockOutlinedIcon fontSize="small" />,
    };
  }

  // Fallback: display as-is
  return {
    label: status,
    color: "default",
    icon: <PauseCircleOutlinedIcon fontSize="small" />,
  };
}

export default function DeviceStatusBadge({ status, size = "small" }: Props) {
  const { label, color, icon } = getStatusConfig(status);

  return (
    <Chip
      size={size}
      icon={icon}
      label={label}
      color={color}
      aria-label={`Status: ${label}`}
      sx={{
        fontWeight: 600,
        letterSpacing: "0.01em",
        "& .MuiChip-icon": { fontSize: "1rem" },
      }}
    />
  );
}

