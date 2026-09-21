"use client";
import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import DevicesIcon from "@mui/icons-material/Devices";
import IconButton from "@mui/material/IconButton";
import HomeIcon from "@mui/icons-material/Home";
import { useRouter } from "next/navigation";

interface Props {
  children: React.ReactNode;
  title?: string;
}

export default function DeviceLayout({ children, title = "AssetHub" }: Props) {
  const router = useRouter();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #eef4ff 0%, #f8fafc 100%)",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 430, minHeight: "100vh", bgcolor: "rgba(255,255,255,0.55)" }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: "rgba(255,255,255,0.9)",
            color: "#0f172a",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(15, 23, 42, 0.06)",
            boxShadow: "none",
            maxWidth: 430,
            mx: "auto",
          }}
        >
          <Toolbar
            sx={{
              minHeight: 64,
              px: 2,
              py: 0.75,
              gap: 1.5,
            }}
          >
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => router.back()}
              aria-label="go back"
              sx={{
                border: "1px solid rgba(15,23,42,0.08)",
                bgcolor: "#f8fafc",
                boxShadow: "0 8px 18px rgba(15, 23, 42, 0.06)",
                width: 38,
                height: 38,
                borderRadius: 2,
              }}
            >
              <HomeIcon fontSize="small" />
            </IconButton>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0, flex: 1 }}>
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                  color: "#1d4ed8",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)",
                  flexShrink: 0,
                }}
              >
                <DevicesIcon fontSize="small" />
              </Box>

              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  fontSize: "1rem",
                  lineHeight: 1.2,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {title}
              </Typography>
            </Box>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ px: 2, py: 2.2 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
