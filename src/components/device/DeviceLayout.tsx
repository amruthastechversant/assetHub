"use client";
import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import DevicesIcon from "@mui/icons-material/Devices";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Props {
  children: React.ReactNode;
  title?: string;
  /** MUI Container maxWidth, default "md" for the device details page */
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false;
}

export default function DeviceLayout({
  children,
  title = "AssetHub",
  maxWidth = "md",
}: Props) {
  const router = useRouter();
  const [openLogoutDialog, setOpenLogoutDialog] = React.useState(false);

  const handleLogout = async () => {
    setOpenLogoutDialog(false);
    await signOut({ callbackUrl: "/" });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f0f7ff 0%, #f8fafc 60%, #ffffff 100%)",
      }}
    >
      {/* ── Top AppBar ── */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "rgba(255,255,255,0.9)",
          color: "#0f172a",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(15, 23, 42, 0.06)",
          boxShadow: "none",
        }}
      >
        <Container maxWidth={maxWidth} disableGutters>
          <Toolbar
            sx={{
              minHeight: { xs: 60, md: 68 },
              px: { xs: 2, md: 3 },
              gap: 1.5,
            }}
          >
            {/* Back button */}
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => router.back()}
              aria-label="go back"
              sx={{
                border: "1px solid rgba(15,23,42,0.1)",
                bgcolor: "#f8fafc",
                boxShadow: "0 2px 8px rgba(15, 23, 42, 0.06)",
                width: { xs: 38, md: 40 },
                height: { xs: 38, md: 40 },
                borderRadius: 2,
                "&:hover": { bgcolor: "#eff6ff", borderColor: "rgba(37,99,235,0.2)" },
                transition: "all 0.15s ease",
              }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>

            {/* Brand mark + title */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flex: 1, minWidth: 0 }}>
              <Box
                sx={{
                  width: { xs: 30, md: 34 },
                  height: { xs: 30, md: 34 },
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "#eff6ff",
                  border: "1px solid rgba(37, 99, 235, 0.15)",
                  color: "#2563eb",
                  flexShrink: 0,
                }}
              >
                <DevicesIcon fontSize="small" />
              </Box>

              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  fontSize: { xs: "0.95rem", md: "1rem" },
                  lineHeight: 1.2,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {title}
              </Typography>
            </Box>

            <Button
              variant="contained"
              size="small"
              href="/scan"
              sx={{
                minWidth: 0,
                px: { xs: 1.5, md: 2 },
                py: 0.8,
                borderRadius: 2,
                bgcolor: "#4f46e5",
                color: "#ffffff",
                textTransform: "none",
                fontWeight: 700,
                letterSpacing: "-0.01em",
                boxShadow: "0 2px 8px rgba(79, 70, 229, 0.25)",
                "&:hover": {
                  bgcolor: "#4338ca",
                },
              }}
            >
              ◈ Scan QR
            </Button>

            <Button
              variant="outlined"
              size="small"
              onClick={() => setOpenLogoutDialog(true)}
              sx={{
                minWidth: 0,
                px: { xs: 1.5, md: 2 },
                py: 0.8,
                borderRadius: 2,
                borderColor: "rgba(15, 23, 42, 0.12)",
                color: "#0f172a",
                bgcolor: "#ffffff",
                textTransform: "none",
                fontWeight: 700,
                letterSpacing: "-0.01em",
                boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
                "&:hover": {
                  bgcolor: "#f8fafc",
                  borderColor: "rgba(15, 23, 42, 0.2)",
                },
              }}
            >
              Logout
            </Button>
          </Toolbar>
        </Container>
      </AppBar>

      <Dialog
        open={openLogoutDialog}
        onClose={() => setOpenLogoutDialog(false)}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
      >
        <DialogTitle id="logout-dialog-title">Confirm logout</DialogTitle>
        <DialogContent>
          <DialogContentText id="logout-dialog-description">
            Are you sure you want to sign out of AssetHub?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenLogoutDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleLogout}
            variant="contained"
            color="error"
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Page content ── */}
      <Container
        maxWidth={maxWidth}
        sx={{
          py: { xs: 2.5, md: 4 },
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        {children}
      </Container>
    </Box>
  );
}
