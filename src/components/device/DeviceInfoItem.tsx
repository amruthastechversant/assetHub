"use client";
import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface DeviceInfoItemProps {
  label: string;
  value?: React.ReactNode;
  icon?: React.ReactElement;
}

export default function DeviceInfoItem({ label, value, icon }: DeviceInfoItemProps) {
  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5 }}>
        {icon && (
          <Box
            aria-hidden
            sx={{
              color: "#94a3b8",
              display: "flex",
              alignItems: "center",
              "& svg": { fontSize: "0.9rem" },
            }}
          >
            {icon}
          </Box>
        )}
        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{
            fontSize: "0.68rem",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            lineHeight: 1,
          }}
        >
          {label}
        </Typography>
      </Box>
      <Typography
        variant="body1"
        sx={{
          fontWeight: 600,
          color: "#0f172a",
          fontSize: "0.92rem",
          lineHeight: 1.5,
          wordBreak: "break-word",
          pl: icon ? "1.65rem" : 0,
        }}
      >
        {value ?? "—"}
      </Typography>
    </Box>
  );
}
