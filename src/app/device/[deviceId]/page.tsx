import type { Metadata } from "next";
import { getDeviceByAssetCode } from "@/lib/device";
import { filterDeviceFields, normalizeRole } from "@/lib/permissions";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DeviceHeader from "@/components/device/DeviceHeader";
import DeviceDetails from "@/components/device/DeviceDetails";
import DeviceLayout from "@/components/device/DeviceLayout";
import RoleBadgeBar from "@/components/device/RoleBadgeBar";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

// ── Types ────────────────────────────────────────────────────────────────────
type Props = {
  params: Promise<{ deviceId: string }>;
  searchParams: Promise<{ role?: string }>;
};

// ── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { deviceId } = await params;
  return {
    title: `Device ${deviceId} | AssetHub`,
    description: `Device details for asset ${deviceId} — AssetHub IT asset management`,
  };
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function DevicePage({ params, searchParams }: Props) {
  // Auth guard
  const session = await auth();
  if (!session) {
    redirect("/");
  }

  // Await params & searchParams — required in Next.js 15+
  const { deviceId } = await params;
  const search = await searchParams;

  const userRole = (session?.user as any)?.role;
  const activeRole = normalizeRole(search?.role || userRole || "Employee");

  // Fetch device (by asset code, internal ID, or serial number)
  const rawDevice = await getDeviceByAssetCode(deviceId);

  // ── Device not found ─────────────────────────────────────────────────────
  if (!rawDevice) {
    return (
      <DeviceLayout title="Device Details" maxWidth="sm">
        <Box
          sx={{
            minHeight: "60vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Card
            elevation={0}
            sx={{
              width: "100%",
              borderRadius: 4,
              border: "1px solid rgba(148, 163, 184, 0.18)",
              boxShadow: "0 4px 24px rgba(15, 23, 42, 0.06)",
              textAlign: "center",
            }}
          >
            <CardContent sx={{ py: 6, px: { xs: 3, md: 5 } }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 3,
                  bgcolor: "#f1f5f9",
                  border: "1px solid rgba(148,163,184,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 3,
                  color: "#94a3b8",
                }}
              >
                <SearchOffOutlinedIcon sx={{ fontSize: 32 }} />
              </Box>

              <Typography
                variant="h5"
                component="h1"
                sx={{ fontWeight: 800, letterSpacing: "-0.03em", color: "#0f172a", mb: 1.5 }}
              >
                Device Not Found
              </Typography>

              <Typography
                color="text.secondary"
                sx={{ fontSize: "0.95rem", mb: 3, maxWidth: 340, mx: "auto" }}
              >
                We couldn&apos;t find a device with ID &ldquo;{deviceId}&rdquo;. Please check
                the asset code and try again.
              </Typography>

              <Button
                variant="contained"
                href="/"
                disableElevation
                sx={{
                  borderRadius: 2.5,
                  fontWeight: 700,
                  px: 3.5,
                  bgcolor: "#2563eb",
                  "&:hover": { bgcolor: "#1d4ed8" },
                }}
              >
                Go Back
              </Button>
            </CardContent>
          </Card>
        </Box>
      </DeviceLayout>
    );
  }

  // ── Access control — restricted devices ──────────────────────────────────
  const userEmail = session?.user?.email;
  const isAssignedToUser =
    rawDevice.assignedUserEmail && rawDevice.assignedUserEmail === userEmail;

  if (rawDevice.status === "restricted" && !isAssignedToUser) {
    return (
      <DeviceLayout title="Device Details" maxWidth="sm">
        <Box
          sx={{
            minHeight: "60vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Card
            elevation={0}
            sx={{
              width: "100%",
              borderRadius: 4,
              border: "1px solid rgba(239, 68, 68, 0.15)",
              boxShadow: "0 4px 24px rgba(239, 68, 68, 0.06)",
              textAlign: "center",
            }}
          >
            <CardContent sx={{ py: 6, px: { xs: 3, md: 5 } }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 3,
                  bgcolor: "#fff1f2",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 3,
                  color: "#dc2626",
                }}
              >
                <LockOutlinedIcon sx={{ fontSize: 32 }} />
              </Box>

              <Typography
                variant="h5"
                component="h1"
                sx={{ fontWeight: 800, letterSpacing: "-0.03em", color: "#0f172a", mb: 1.5 }}
              >
                Access Denied
              </Typography>

              <Typography
                color="text.secondary"
                sx={{ fontSize: "0.95rem", mb: 3, maxWidth: 340, mx: "auto" }}
              >
                You don&apos;t have permission to view this device. Please
                contact your IT administrator if you believe this is an error.
              </Typography>

              <Button
                variant="outlined"
                href="/"
                sx={{
                  borderRadius: 2.5,
                  fontWeight: 700,
                  px: 3.5,
                  borderColor: "#dc2626",
                  color: "#dc2626",
                  "&:hover": { borderColor: "#b91c1c", bgcolor: "#fff1f2" },
                }}
              >
                Go Back
              </Button>
            </CardContent>
          </Card>
        </Box>
      </DeviceLayout>
    );
  }

  // Filter device fields based on active role
  const device = filterDeviceFields(rawDevice, activeRole);

  // ── Device found and accessible — render details ─────────────────────────
  return (
    <DeviceLayout title="Device Details" maxWidth="md">
      <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 2, md: 2.5 } }}>
        <RoleBadgeBar currentRole={activeRole} />
        {/* Hero card */}
        <DeviceHeader device={device} role={activeRole} />

        {/* Sectioned detail cards */}
        <DeviceDetails device={device} />
      </Box>
    </DeviceLayout>
  );
}
