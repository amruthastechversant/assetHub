"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import FlashOffIcon from "@mui/icons-material/FlashOff";

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
  const facingMode = "environment";
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
      } catch { }
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
    } catch { }
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
          onScanResult(decodedText);
        },
        () => { }
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
  }, [facingMode, onScanResult, stopCamera]);

  // Flashlight toggle
  const toggleTorch = async () => {
    if (!scannerRef.current || !cameraActive) {
      setTorchOn((prev) => !prev);
      return;
    }
    try {
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ torch: !torchOn }],
      });
      setTorchOn(!torchOn);
    } catch {
      setTorchOn(!torchOn);
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
        } catch { }
      }
    };
  }, []);

  return (
    <Box
      sx={{
        backgroundColor: "#0e1424",
        borderRadius: { xs: "22px", md: "26px" },
        border: "1px solid rgba(99, 102, 241, 0.18)",
        p: { xs: "14px 14px 12px", sm: "18px 16px 14px", md: "20px 22px" },
        color: "#ffffff",
        boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
        position: "relative",
        overflow: "hidden",
        width: "100%",
        boxSizing: "border-box",
        height: "100%",
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Hidden file input for image upload */}
      <div id="temp-qr-file-processor" style={{ display: "none" }} />
      <input
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileUpload}
      />
      {/* Background Gradient overlay */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, rgba(56,189,248,0.06), transparent 40%, rgba(99,102,241,0.06))",
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
          mb: 0.5,
        }}
      >
        <Box>
          <Typography
            sx={{
              textTransform: "uppercase",
              fontSize: "0.72rem",
              letterSpacing: "0.15em",
              fontWeight: 800,
              color: "#38bdf8",
              mb: 0.4,
            }}
          >
            READY TO SCAN
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              fontSize: { xs: "1.28rem", sm: "1.38rem", md: "1.45rem" },
              letterSpacing: "-0.03em",
              color: "#ffffff",
              mb: 0.2,
            }}
          >
            Point at a QR code
          </Typography>
          <Typography sx={{ color: "#94a3b8", fontSize: "0.82rem" }}>
            Keep the label inside the frame.
          </Typography>
        </Box>

        {/* Header Controls: Torch & Camera Switch (Replaces removed ? button) */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title={torchOn ? "Turn off flashlight" : "Turn on flashlight"}>
            <IconButton
              onClick={toggleTorch}
              sx={{
                width: 36,
                height: 36,
                border: "1px solid rgba(99, 102, 241, 0.2)",
                borderRadius: "12px",
                backgroundColor: torchOn ? "rgba(56,189,248,0.2)" : "rgba(255,255,255,0.06)",
                color: torchOn ? "#38bdf8" : "#ffffff",
                p: 0,
                "&:hover": { backgroundColor: "rgba(255,255,255,0.12)" },
              }}
            >
              {torchOn ? <FlashOnIcon sx={{ fontSize: 19 }} /> : <FlashOffIcon sx={{ fontSize: 19 }} />}
            </IconButton>
          </Tooltip>

        </Box>
      </Box>

      {/* Camera Viewport (Fills remaining vertical space like native app) */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          flex: 1,
          minHeight: 0,
          backgroundColor: "#080c14",
          backgroundImage: "radial-gradient(circle at 50% 45%, #131b2e 0%, #080c14 75%)",
          borderRadius: "18px",
          border: "1px solid rgba(99, 102, 241, 0.18)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          my: { xs: 1.2, sm: 1.6 },
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
              borderRadius: "16px",
            },
          }}
        />

        {/* Reticle with Original Indigo / Cyan Corners */}
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
              width: { xs: 185, sm: 210 },
              height: { xs: 185, sm: 210 },
            }}
          >
            {/* 4 Corners in Indigo #6366f1 */}
            <Box
              className="corner c1"
              sx={{
                position: "absolute",
                width: 38,
                height: 38,
                borderTop: "3.5px solid #6366f1",
                borderLeft: "3.5px solid #6366f1",
                borderTopLeftRadius: "12px",
                top: 0,
                left: 0,
                transition: "all 0.3s ease",
                filter: "drop-shadow(0 0 6px rgba(99,102,241,0.4))",
                ...(isProcessing && { borderColor: "#10b981", transform: "scale(0.92)" }),
              }}
            />
            <Box
              className="corner c2"
              sx={{
                position: "absolute",
                width: 38,
                height: 38,
                borderTop: "3.5px solid #6366f1",
                borderRight: "3.5px solid #6366f1",
                borderTopRightRadius: "12px",
                top: 0,
                right: 0,
                transition: "all 0.3s ease",
                filter: "drop-shadow(0 0 6px rgba(99,102,241,0.4))",
                ...(isProcessing && { borderColor: "#10b981", transform: "scale(0.92)" }),
              }}
            />
            <Box
              className="corner c3"
              sx={{
                position: "absolute",
                width: 38,
                height: 38,
                borderBottom: "3.5px solid #6366f1",
                borderLeft: "3.5px solid #6366f1",
                borderBottomLeftRadius: "12px",
                bottom: 0,
                left: 0,
                transition: "all 0.3s ease",
                filter: "drop-shadow(0 0 6px rgba(99,102,241,0.4))",
                ...(isProcessing && { borderColor: "#10b981", transform: "scale(0.92)" }),
              }}
            />
            <Box
              className="corner c4"
              sx={{
                position: "absolute",
                width: 38,
                height: 38,
                borderBottom: "3.5px solid #6366f1",
                borderRight: "3.5px solid #6366f1",
                borderBottomRightRadius: "12px",
                bottom: 0,
                right: 0,
                transition: "all 0.3s ease",
                filter: "drop-shadow(0 0 6px rgba(99,102,241,0.4))",
                ...(isProcessing && { borderColor: "#10b981", transform: "scale(0.92)" }),
              }}
            />

            {/* Stylized QR Matrix Pattern Watermark inside Reticle */}
            {!cameraActive && (
              <>
                <Box
                  sx={{
                    position: "absolute",
                    inset: "26px",
                    display: "grid",
                    gridTemplateColumns: "repeat(5, 1fr)",
                    gap: "4px",
                    opacity: 0.14,
                    pointerEvents: "none",
                  }}
                >
                  {[...Array(25)].map((_, i) => (
                    <Box
                      key={i}
                      sx={{
                        borderRadius: "2px",
                        backgroundColor: (i % 2 === 0 || i % 7 === 0) ? "#6366f1" : "transparent",
                        border: (i === 0 || i === 4 || i === 20 || i === 24) ? "2px solid #38bdf8" : "none",
                      }}
                    />
                  ))}
                </Box>

                {/* Centered Start Camera Action inside Viewport */}
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 4,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1.2,
                    pointerEvents: "auto",
                    p: 2,
                  }}
                >
                  <Button
                    variant="contained"
                    onClick={(e) => {
                      e.stopPropagation();
                      startCamera();
                    }}
                    startIcon={<PhotoCameraIcon sx={{ fontSize: 19 }} />}
                    sx={{
                      backgroundColor: "#6366f1",
                      color: "#ffffff",
                      fontWeight: 750,
                      fontSize: "0.88rem",
                      px: 2.8,
                      py: 1.2,
                      borderRadius: "15px",
                      textTransform: "none",
                      boxShadow: "0 8px 24px rgba(99,102,241,0.45)",
                      "&:hover": { backgroundColor: "#818cf8" },
                      "&:active": { transform: "scale(0.97)" },
                    }}
                  >
                    Start Camera
                  </Button>
                  {cameraError && (
                    <Typography
                      sx={{
                        color: "#f87171",
                        fontSize: "0.75rem",
                        maxWidth: 240,
                        textAlign: "center",
                        lineHeight: 1.3,
                      }}
                    >
                      {cameraError}
                    </Typography>
                  )}
                </Box>
              </>
            )}

            {/* Laser Line - active when camera streaming */}
            {cameraActive && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: "6%",
                  right: "6%",
                  height: "2px",
                  background: "linear-gradient(90deg, rgba(56,189,248,0) 0%, #38bdf8 25%, #38bdf8 75%, rgba(56,189,248,0) 100%)",
                  boxShadow: "0 0 16px 2px rgba(56,189,248,0.8)",
                  animation: "scanLaser 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite",
                  "@keyframes scanLaser": {
                    "0%, 100%": { top: "10%", opacity: 0 },
                    "20%": { opacity: 1 },
                    "80%": { opacity: 1 },
                    "50%": { top: "90%" },
                  },
                }}
              />
            )}
          </Box>

          {/* Status Pill at Bottom of Viewport */}
          {/* Status Indicator pill (only when camera is active) */}
          {cameraActive && (
            <Box
              sx={{
                position: "absolute",
                bottom: 14,
                fontSize: "0.74rem",
                color: "#94a3b8",
                backgroundColor: "rgba(15, 23, 42, 0.85)",
                padding: "5px 14px",
                borderRadius: "999px",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                gap: 1,
                zIndex: 3,
              }}
            >
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  backgroundColor: "#10b981",
                  boxShadow: "0 0 8px #10b981",
                }}
              />
              <Typography sx={{ fontSize: "0.74rem", color: "#f1f5f9" }}>
                {isProcessing ? "Reading code…" : "Live camera active"}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Bottom Scan Actions (2 Equal Columns) */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: { xs: "8px", sm: "10px" },
          position: "relative",
          zIndex: 1,
          mt: "auto",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Button 1: Scan / Camera Toggle */}
        <Button
          onClick={cameraActive ? stopCamera : startCamera}
          startIcon={
            cameraActive ? (
              <PhotoCameraIcon sx={{ fontSize: 19 }} />
            ) : (
              <QrCodeScannerIcon sx={{ fontSize: 19 }} />
            )
          }
          sx={{
            width: "100%",
            minWidth: 0,
            border: cameraActive ? "1px solid rgba(239, 68, 68, 0.35)" : "none",
            borderRadius: "14px",
            backgroundColor: cameraActive ? "rgba(239, 68, 68, 0.16)" : "#6366f1",
            color: cameraActive ? "#fca5a5" : "#ffffff",
            fontWeight: 750,
            px: { xs: "8px", sm: "14px" },
            py: { xs: "11px", sm: "12px" },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textTransform: "none",
            fontSize: { xs: "0.82rem", sm: "0.9rem" },
            boxShadow: cameraActive ? "none" : "0 4px 16px rgba(99,102,241,0.35)",
            whiteSpace: "nowrap",
            "&:hover": {
              backgroundColor: cameraActive ? "rgba(239, 68, 68, 0.25)" : "#818cf8",
            },
            "&:active": { transform: "scale(0.98)" },
          }}
        >
          {cameraActive ? "Stop Camera" : "Scan"}
        </Button>

        {/* Button 2: Upload QR Image */}
        <Button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          startIcon={<UploadFileIcon sx={{ fontSize: 19 }} />}
          sx={{
            width: "100%",
            minWidth: 0,
            border: "1px solid rgba(255, 255, 255, 0.14)",
            borderRadius: "14px",
            backgroundColor: "rgba(255, 255, 255, 0.08)",
            color: "#ffffff",
            fontWeight: 700,
            px: { xs: "8px", sm: "14px" },
            py: { xs: "11px", sm: "12px" },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textTransform: "none",
            fontSize: { xs: "0.82rem", sm: "0.9rem" },
            whiteSpace: "nowrap",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              borderColor: "rgba(255, 255, 255, 0.25)",
            },
            "&:active": { transform: "scale(0.98)" },
          }}
        >
          Upload QR Image
        </Button>
      </Box>
    </Box>
  );
}
