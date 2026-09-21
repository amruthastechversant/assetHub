"use client";
import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface DeviceInfoItemProps {
  label: string;
  value?: React.ReactNode;
}

export default function DeviceInfoItem({ label, value }: DeviceInfoItemProps) {
  return (
    <Box>
      <Typography
        variant="subtitle2"
        color="text.secondary"
        sx={{
          fontSize: "0.72rem",
          fontWeight: 700,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          mb: 0.5,
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          fontWeight: 700,
          color: "#0f172a",
          fontSize: "0.98rem",
          lineHeight: 1.5,
          wordBreak: "break-word",
        }}
      >
        {value ?? "—"}
      </Typography>
    </Box>
  );
}
