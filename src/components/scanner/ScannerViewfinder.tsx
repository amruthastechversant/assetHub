"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import FlashOffIcon from "@mui/icons-material/FlashOff";
import CameraswitchIcon from "@mui/icons-material/Cameraswitch";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";

interface ScannerViewfinderProps {
  onScanResult: (rawPayload: string) => void;
  onToast: (msg: string) => void;
}

export default function ScannerViewfinder({
  onScanResult,
  onToast,
}: ScannerViewfinderProps) {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [isProcessing, setIsProcessing] = useState(false);

  const scannerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerContainerId = "camera-viewport-reader";

  // Stop Camera
  const stopCamera = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {}
      scannerRef.current = null;
    }
    setCameraActive(false);
    setTorchOn(false);
  }, []);

  // Audio feedback
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(840, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch {}
  };

  // Start Camera
  const startCamera = useCallback(async () => {
    setCameraError(null);
    setIsProcessing(true);

    try {
      const { Html5Qrcode } = await import("html5-qrcode");

      if (scannerRef.current) {
        await stopCamera();
      }

      const html5QrCode = new Html5Qrcode(scannerContainerId);
      scannerRef.current = html5QrCode;

      const config = {
        fps: 15,
        qrbox: { width: 230, height: 230 },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        { facingMode },
        config,
        (decodedText: string) => {
          playBeep();
          onToast("QR code scanned successfully");
          onScanResult(decodedText);
        },
        () => {}
      );

      setCameraActive(true);
      setIsProcessing(false);
    } catch (err: any) {
      setCameraError(
        err?.message?.includes("NotAllowedError")
          ? "Camera permission was not granted. Please allow camera permissions or upload an image."
          : "Camera not detected. You can upload a QR image from your device."
      );
      setCameraActive(false);
      setIsProcessing(false);
    }
  }, [facingMode, onScanResult, onToast, stopCamera]);

  // Flashlight toggle
  const toggleTorch = async () => {
    if (!scannerRef.current || !cameraActive) {
      setTorchOn((prev) => !prev);
      onToast(torchOn ? "Flashlight off" : "Flashlight on");
      return;
    }
    try {
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ torch: !torchOn }],
      });
      setTorchOn(!torchOn);
      onToast(!torchOn ? "Flashlight on" : "Flashlight off");
    } catch {
      setTorchOn(!torchOn);
      onToast("Flashlight toggled");
    }
  };

  // Flip Camera
  const flipCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
    if (cameraActive) {
      stopCamera().then(() => {
        setTimeout(startCamera, 250);
      });
    } else {
      onToast(`Camera switched to ${facingMode === "environment" ? "Front" : "Rear"}`);
    }
  };

  // Upload image
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const tempScanner = new Html5Qrcode("temp-qr-file-processor");
      const result = await tempScanner.scanFile(file, true);
      tempScanner.clear();
      playBeep();
      onToast("QR code detected in image");
      onScanResult(result);
    } catch {
      onToast("No valid QR code found in this image.");
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.stop();
          scannerRef.current.clear();
        } catch {}
      }
    };
  }, []);

  return (
    <Box
      sx={{
        backgroundColor: "#0e1424",
        borderRadius: { xs: "28px", lg: "32px" },
        border: "1px solid rgba(99, 102, 241, 0.18)",
        p: { xs: "22px", lg: "28px" },
        color: "#ffffff",
        boxShadow: "0 30px 60px rgba(0, 0, 0, 0.4)",
        position: "relative",
        overflow: "hidden",
        width: "100%",
        height: "100%",
        minHeight: { xs: "calc(100vh - 142px)", lg: "620px" },
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Background Gradient overlay like reference */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, rgba(56,189,248,0.08), transparent 35%, rgba(99,102,241,0.07))",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box>
          <Typography
            sx={{
              textTransform: "uppercase",
              fontSize: "0.72rem",
              letterSpacing: "0.15em",
              fontWeight: 750,
              color: "#38bdf8",
              mb: 0.5,
            }}
          >
            Ready to scan
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              fontSize: { xs: "1.35rem", sm: "1.55rem" },
              letterSpacing: "-0.035em",
              color: "#ffffff",
              mt: 0.5,
              mb: 1,
            }}
          >
            Point at a QR code
          </Typography>
          <Typography sx={{ color: "#94a3b8", fontSize: "0.9rem", mt: 0.3 }}>
            Center an asset tag or authenticator inside the frame.
          </Typography>
        </Box>
      </Box>

      {/* Camera Viewport */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 400,
          aspectRatio: "1/1",
          backgroundColor: "#080c14",
          backgroundImage: "radial-gradient(circle at 65% 32%, #131b2e 0%, #080c14 35%, #05080c 75%)",
          borderRadius: "26px",
          border: "1px solid rgba(99, 102, 241, 0.18)",
          overflow: "hidden",
          boxShadow: "inset 0 0 40px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto",
          mt: "12px",
          mb: "24px",
        }}
      >
        <Box
          id={scannerContainerId}
          sx={{
            width: "100%",
            height: "100%",
            display: cameraActive ? "block" : "none",
            "& video": {
              objectFit: "cover !important",
              width: "100% !important",
              height: "100% !important",
              borderRadius: "20px",
            },
          }}
        />

        <div id="temp-qr-file-processor" style={{ display: "none" }} />
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileUpload}
        />

        {/* Reticle */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              position: "relative",
              width: { xs: 190, sm: 220 },
              height: { xs: 190, sm: 220 },
            }}
          >
            {/* 4 Corners */}
            <Box
              className="corner c1"
              sx={{
                position: "absolute",
                width: 42,
                height: 42,
                borderTop: "3px solid #6366f1",
                borderLeft: "3px solid #6366f1",
                borderTopLeftRadius: "12px",
                top: 0,
                left: 0,
                transition: "all 0.3s ease",
                ...(isProcessing && { borderColor: "#10b981", transform: "scale(0.9)" }),
              }}
            />
            <Box
              className="corner c2"
              sx={{
                position: "absolute",
                width: 42,
                height: 42,
                borderTop: "3px solid #6366f1",
                borderRight: "3px solid #6366f1",
                borderTopRightRadius: "12px",
                top: 0,
                right: 0,
                transition: "all 0.3s ease",
                ...(isProcessing && { borderColor: "#10b981", transform: "scale(0.9)" }),
              }}
            />
            <Box
              className="corner c3"
              sx={{
                position: "absolute",
                width: 42,
                height: 42,
                borderBottom: "3px solid #6366f1",
                borderLeft: "3px solid #6366f1",
                borderBottomLeftRadius: "12px",
                bottom: 0,
                left: 0,
                transition: "all 0.3s ease",
                ...(isProcessing && { borderColor: "#10b981", transform: "scale(0.9)" }),
              }}
            />
            <Box
              className="corner c4"
              sx={{
                position: "absolute",
                width: 42,
                height: 42,
                borderBottom: "3px solid #6366f1",
                borderRight: "3px solid #6366f1",
                borderBottomRightRadius: "12px",
                bottom: 0,
                right: 0,
                transition: "all 0.3s ease",
                ...(isProcessing && { borderColor: "#10b981", transform: "scale(0.9)" }),
              }}
            />

            {/* Laser Line */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: "8%",
                right: "8%",
                height: "2px",
                background: "linear-gradient(90deg, rgba(56,189,248,0) 0%, #38bdf8 20%, #38bdf8 80%, rgba(56,189,248,0) 100%)",
                boxShadow: "0 0 16px 2px rgba(56,189,248,0.7)",
                animation: "scanLaser 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite",
                "@keyframes scanLaser": {
                  "0%, 100%": { top: "10%", opacity: 0 },
                  "20%": { opacity: 1 },
                  "80%": { opacity: 1 },
                  "50%": { top: "90%" },
                },
              }}
            />
          </Box>

          {/* Camera Note (Bottom Pill) */}
          <Box
            sx={{
              position: "absolute",
              bottom: 24,
              fontSize: "0.78rem",
              color: "#94a3b8",
              backgroundColor: "rgba(15,23,42,0.8)",
              padding: "8px 12px",
              borderRadius: "999px",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {isProcessing ? "Reading code…" : "Camera preview · live mode"}
          </Box>
        </Box>

        {!cameraActive && (
          <Box
            sx={{
              position: "relative",
              zIndex: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1.5,
              p: 2,
            }}
          >
            <Button
              variant="contained"
              onClick={startCamera}
              startIcon={<PhotoCameraIcon />}
              sx={{
                backgroundColor: "#6366f1",
                color: "#ffffff",
                fontWeight: 780,
                fontSize: "0.88rem",
                px: 3,
                py: 1.3,
                borderRadius: "16px",
                textTransform: "none",
                "&:hover": { backgroundColor: "#818cf8" },
              }}
            >
              Start Camera
            </Button>
            {cameraError && (
              <Typography
                sx={{
                  color: "#f87171",
                  fontSize: "0.78rem",
                  maxWidth: 280,
                  textAlign: "center",
                }}
              >
                {cameraError}
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {/* Bottom Scan Actions */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "10px", position: "relative", zIndex: 1, mt: "auto" }}>
        <Button
          onClick={() => fileInputRef.current?.click()}
          startIcon={<UploadFileIcon />}
          sx={{
            border: 0,
            borderRadius: "16px",
            backgroundColor: "#6366f1",
            color: "#ffffff",
            fontWeight: 780,
            px: "20px",
            py: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textTransform: "none",
            fontSize: "0.95rem",
            "&:hover": { backgroundColor: "#818cf8" }
          }}
        >
          Upload QR Image
        </Button>
        <IconButton
          onClick={toggleTorch}
          sx={{
            width: "54px",
            height: "100%",
            border: "1px solid rgba(99, 102, 241, 0.18)",
            borderRadius: "16px",
            backgroundColor: torchOn ? "rgba(56,189,248, 0.15)" : "rgba(255,255,255,0.03)",
            color: torchOn ? "#38bdf8" : "#ffffff",
            "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" }
          }}
        >
          {torchOn ? <FlashOnIcon /> : <FlashOffIcon />}
        </IconButton>
        <IconButton
          onClick={flipCamera}
          sx={{
            width: "54px",
            height: "100%",
            border: "1px solid rgba(99, 102, 241, 0.18)",
            borderRadius: "16px",
            backgroundColor: "rgba(255,255,255,0.03)",
            color: "#ffffff",
            "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" }
          }}
        >
          <CameraswitchIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
