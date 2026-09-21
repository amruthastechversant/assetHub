"use client";
import React from "react";
import Chip from "@mui/material/Chip";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoIcon from "@mui/icons-material/Info";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";

type Status = "Assigned" | "Available" | "Under Maintenance" | "Retired" | string;

interface Props {
  status: Status;
}

export default function DeviceStatusBadge({ status }: Props) {
  const normalized = String(status || "");

  let color: "default" | "primary" | "success" | "warning" | "info" = "default";
  let icon = undefined;

  if (/assigned/i.test(normalized)) {
    color = "success";
    icon = <CheckCircleIcon fontSize="small" />;
  } else if (/available/i.test(normalized)) {
    color = "info";
    icon = <InfoIcon fontSize="small" />;
  } else if (/maintenance/i.test(normalized)) {
    color = "warning";
    icon = <WarningAmberIcon fontSize="small" />;
  } else if (/retired/i.test(normalized)) {
    color = "default";
    icon = <RemoveCircleIcon fontSize="small" />;
  }

  return (
    <Chip
      size="small"
      icon={icon}
      label={normalized}
      color={color}
      aria-label={`Status: ${normalized}`}
      sx={{ fontWeight: 500 }}
    />
  );
}
