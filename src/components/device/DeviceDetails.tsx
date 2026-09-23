"use client";
import React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";

// Icons
import DevicesOutlinedIcon from "@mui/icons-material/DevicesOutlined";
import MemoryOutlinedIcon from "@mui/icons-material/MemoryOutlined";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import LaptopChromebookOutlinedIcon from "@mui/icons-material/LaptopChromebookOutlined";
import ComputerOutlinedIcon from "@mui/icons-material/ComputerOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import CurrencyRupeeOutlinedIcon from "@mui/icons-material/CurrencyRupeeOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import SpeedOutlinedIcon from "@mui/icons-material/SpeedOutlined";

import DeviceInfoItem from "@/components/device/DeviceInfoItem";
import DeviceStatusBadge from "@/components/device/DeviceStatusBadge";
import { formatDate, formatCurrency } from "@/lib/format";
import type { DeviceDetail } from "@/types/device";

interface Props {
  device: Partial<DeviceDetail>;
}

// ── Section card wrapper ─────────────────────────────────────────────────────
interface SectionCardProps {
  icon: React.ReactElement;
  title: string;
  children: React.ReactNode;
}

function SectionCard({ icon, title, children }: SectionCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 3,
        border: "1px solid rgba(148, 163, 184, 0.18)",
        bgcolor: "#ffffff",
        boxShadow: "0 2px 12px rgba(15, 23, 42, 0.04)",
        transition: "box-shadow 0.2s ease",
        "&:hover": {
          boxShadow: "0 6px 24px rgba(15, 23, 42, 0.08)",
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
        {/* Section header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 2,
            pb: 1.5,
            borderBottom: "1px solid rgba(148, 163, 184, 0.14)",
          }}
        >
          <Box
            aria-hidden
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              bgcolor: "#eff6ff",
              border: "1px solid rgba(37, 99, 235, 0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#2563eb",
              flexShrink: 0,
            }}
          >
            {React.cloneElement(icon, { fontSize: "small" } as object)}
          </Box>

          <Typography
            variant="subtitle1"
            component="h2"
            sx={{
              fontWeight: 700,
              color: "#0f172a",
              fontSize: "0.88rem",
              letterSpacing: "-0.01em",
            }}
          >
            {title}
          </Typography>
        </Box>

        {/* Content */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
          {children}
        </Box>
      </CardContent>
    </Card>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function DeviceDetails({ device }: Props) {
  const os = device.operatingSystem || (device as any).os;
  const hasPurchaseAmount = "purchaseAmount" in device && device.purchaseAmount !== undefined;
  const hasLocation = "location" in device && device.location !== undefined;
  const hasPurchaseDate = "purchaseDate" in device && device.purchaseDate !== undefined;

  return (
    <Box>
      <Grid container spacing={{ xs: 2, md: 2.5 }}>
        {/* Device Information */}
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard
            icon={<DevicesOutlinedIcon />}
            title="Device Information"
          >
            {"assetCode" in device && (
              <>
                <DeviceInfoItem label="Asset Code" value={device.assetCode} />
                <Divider sx={{ borderColor: "rgba(148,163,184,0.12)" }} />
              </>
            )}
            {"assetType" in device && (
              <>
                <DeviceInfoItem label="Asset Type" value={device.assetType} />
                <Divider sx={{ borderColor: "rgba(148,163,184,0.12)" }} />
              </>
            )}
            {"model" in device && (
              <>
                <DeviceInfoItem label="Model" value={device.model} />
                <Divider sx={{ borderColor: "rgba(148,163,184,0.12)" }} />
              </>
            )}

            {/* Status row */}
            {"status" in device && device.status && (
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "#64748b",
                    fontSize: "0.68rem",
                    display: "block",
                    mb: 0.75,
                  }}
                >
                  Status
                </Typography>
                <DeviceStatusBadge status={device.status} size="small" />
              </Box>
            )}
          </SectionCard>
        </Grid>

        {/* Specifications */}
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard
            icon={<MemoryOutlinedIcon />}
            title="Specifications"
          >
            {"processor" in device && (
              <>
                <DeviceInfoItem
                  label="Processor"
                  icon={<SpeedOutlinedIcon fontSize="small" />}
                  value={device.processor}
                />
                <Divider sx={{ borderColor: "rgba(148,163,184,0.12)" }} />
              </>
            )}
            {"ram" in device && (
              <>
                <DeviceInfoItem
                  label="RAM"
                  icon={<MemoryOutlinedIcon fontSize="small" />}
                  value={device.ram}
                />
                <Divider sx={{ borderColor: "rgba(148,163,184,0.12)" }} />
              </>
            )}
            {"storage" in device && (
              <>
                <DeviceInfoItem
                  label="Storage"
                  icon={<StorageOutlinedIcon fontSize="small" />}
                  value={device.storage}
                />
                <Divider sx={{ borderColor: "rgba(148,163,184,0.12)" }} />
              </>
            )}
            {os && (
              <DeviceInfoItem
                label="Operating System"
                icon={<LaptopChromebookOutlinedIcon fontSize="small" />}
                value={os}
              />
            )}
          </SectionCard>
        </Grid>

        {/* Purchase Information — conditionally rendered based on present permitted fields */}
        {(hasPurchaseDate || hasPurchaseAmount) && (
          <Grid size={{ xs: 12, md: 6 }}>
            <SectionCard
              icon={<CurrencyRupeeOutlinedIcon />}
              title="Purchase Information"
            >
              {hasPurchaseDate && (
                <DeviceInfoItem
                  label="Purchase Date"
                  icon={<CalendarTodayOutlinedIcon fontSize="small" />}
                  value={
                    device.purchaseDate ? formatDate(device.purchaseDate) : "N/A"
                  }
                />
              )}
              {hasPurchaseDate && hasPurchaseAmount && (
                <Divider sx={{ borderColor: "rgba(148,163,184,0.12)" }} />
              )}
              {hasPurchaseAmount && (
                <DeviceInfoItem
                  label="Purchase Amount"
                  icon={<CurrencyRupeeOutlinedIcon fontSize="small" />}
                  value={
                    device.purchaseAmount
                      ? formatCurrency(device.purchaseAmount)
                      : "N/A"
                  }
                />
              )}
            </SectionCard>
          </Grid>
        )}

        {/* Location — conditionally rendered based on present permitted fields */}
        {hasLocation && (
          <Grid size={{ xs: 12, md: 6 }}>
            <SectionCard
              icon={<LocationOnOutlinedIcon />}
              title="Location"
            >
              <DeviceInfoItem
                label="Office / Site"
                icon={<LocationOnOutlinedIcon fontSize="small" />}
                value={device.location}
              />
              {"serialNumber" in device && device.serialNumber && (
                <>
                  <Divider sx={{ borderColor: "rgba(148,163,184,0.12)" }} />
                  <DeviceInfoItem
                    label="Serial Number"
                    icon={<ComputerOutlinedIcon fontSize="small" />}
                    value={device.serialNumber}
                  />
                </>
              )}
            </SectionCard>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
