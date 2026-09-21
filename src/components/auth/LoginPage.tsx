"use client";

import { useState } from "react";
import GoogleIcon from "@mui/icons-material/Google";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Paper,
  Typography,
} from "@mui/material";
import { signIn } from "next-auth/react";

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const googleLogin = async () => {
    setIsLoading(true);
    // After successful SSO redirect to the device UI page
    await signIn("google", { callbackUrl: "/device" });
  };

  return (
    <Box
      component="main"
      sx={{
        alignItems: "center",
        bgcolor: "common.white",
        color: "text.primary",
        display: "flex",
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
        minHeight: "100vh",
        px: 2,
        py: 4,
      }}
    >
      <Paper
        component="section"
        elevation={0}
        sx={{
          bgcolor: "common.white",
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: '0 30px 80px rgba(2,6,23,0.45)',
          transition: 'transform 220ms ease, box-shadow 220ms ease',
          '&:hover': {
            boxShadow: '0 40px 100px rgba(11, 17, 41, 0.6)',
            transform: 'translateY(-6px)'
          },
          borderRadius: 2,
          maxWidth: 420,
          p: { xs: 3, sm: 4 },
          width: "100%",
        }}
      >
        <Box
          sx={{
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
            textAlign: "center",
          }}
        >
          <Avatar
            sx={{
              bgcolor: "grey.900",
              borderRadius: 2,
              fontSize: 18,
              fontWeight: 700,
              height: 56,
              width: 56,
            }}
            variant="rounded"
          >
            AH
          </Avatar>

          <Box>
            <Typography sx={{ fontWeight: 700, color: "text.primary" }} variant="h5">
              AssetHub
            </Typography>
            <Typography sx={{ mt: 1, maxWidth: 300, color: "text.secondary" }} variant="body2">
              Sign in with your Google account to continue.
            </Typography>
          </Box>

          <Button
            color="inherit"
            disabled={isLoading}
            fullWidth
            onClick={googleLogin}
            size="large"
            startIcon={
              isLoading ? (
                <CircularProgress color="inherit" size={18} />
              ) : (
                <GoogleIcon fontSize="small" sx={{ color: 'inherit' }} />
              )
            }
            sx={{
              bgcolor: "grey.900",
              borderRadius: 1.5,
              color: "common.white",
              height: 48,
              mt: 1,
              textTransform: "none",
              "&:hover": {
                bgcolor: "grey.800",
              },
              "&.Mui-disabled": {
                bgcolor: "grey.500",
                color: "common.white",
              },
            }}
            type="button"
            variant="contained"
          >
            {isLoading ? "Redirecting..." : "Sign in with Google"}
          </Button>
        </Box>
      </Paper>

      <Typography sx={{ mt: 3, color: "text.secondary" }} variant="caption">
        Secure access for AssetHub
      </Typography>
    </Box>
  );
}
