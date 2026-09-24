"use client";
import React, { useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import SendIcon from "@mui/icons-material/Send";

interface ReportIssueButtonProps {
  assetCode: string;
  model: string;
  /** Internal asset UUID (inventory.asset_id) — sent to the API as the asset reference */
  assetId: string;
}

export default function ReportIssueButton({ assetCode, model, assetId }: ReportIssueButtonProps) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpen = () => {
    setOpen(true);
    setSubmitted(false);
    setDescription("");
    setError(null);
  };

  const handleClose = () => {
    if (loading) return; // prevent closing while submitting
    setOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/report-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId, note: description.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit ticket");
      }

      setSubmitted(true);
      setTimeout(() => {
        setOpen(false);
        setSubmitted(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="warning"
        startIcon={<ReportProblemOutlinedIcon />}
        onClick={handleOpen}
        sx={{
          borderRadius: 2.5,
          fontWeight: 700,
          textTransform: "none",
          px: 2.5,
          py: 0.9,
          bgcolor: "#f59e0b",
          boxShadow: "0 2px 8px rgba(245, 158, 11, 0.25)",
          "&:hover": {
            bgcolor: "#d97706",
            boxShadow: "0 4px 12px rgba(245, 158, 11, 0.35)",
          },
        }}
      >
        Report Issue
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: 3, p: 1 },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: "1.25rem", color: "#0f172a" }}>
          Report Issue for {assetCode}
        </DialogTitle>

        <DialogContent>
          {submitted ? (
            <Alert severity="success" sx={{ borderRadius: 2, my: 1 }}>
              Issue report successfully submitted! IT support will contact you shortly.
            </Alert>
          ) : (
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <Typography variant="body2" sx={{ mb: 2, color: "#475569" }}>
                Describe the problem you are experiencing with{" "}
                <strong>
                  {model} ({assetCode})
                </strong>
                .
              </Typography>

              {error && (
                <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }}>
                  {error}
                </Alert>
              )}

              <TextField
                autoFocus
                required
                multiline
                rows={4}
                fullWidth
                label="Issue Description"
                placeholder="E.g., Screen flickering, battery draining fast, OS crash..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": { borderRadius: 2 },
                }}
              />
            </Box>
          )}
        </DialogContent>

        {!submitted && (
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={handleClose}
              color="inherit"
              disabled={loading}
              sx={{ fontWeight: 600 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="warning"
              endIcon={
                loading ? <CircularProgress size={16} color="inherit" /> : <SendIcon />
              }
              onClick={handleSubmit}
              disabled={!description.trim() || loading}
              sx={{ borderRadius: 2, fontWeight: 700, textTransform: "none" }}
            >
              {loading ? "Submitting..." : "Submit Ticket"}
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </>
  );
}
