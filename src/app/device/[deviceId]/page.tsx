import type { Metadata } from "next";
import { getDeviceByAssetCodeForRole } from "@/lib/device";
import { auth, getUserRoleByEmail } from "@/auth";
import { normalizeRole } from "@/lib/permissions";
import DeviceHeader from "@/components/device/DeviceHeader";
import DeviceDetails from "@/components/device/DeviceDetails";
import DeviceLayout from "@/components/device/DeviceLayout";
import RoleBadgeBar from "@/components/device/RoleBadgeBar";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Alert from "@mui/material/Alert";
import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LoginIcon from "@mui/icons-material/Login";

// ── Types ────────────────────────────────────────────────────────────────────
type Props = {
  params: Promise<{ deviceId: string }>;
  searchParams: Promise<{ role?: string }>;
};

// ── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { deviceId } = await params;
  return {
    title: `Device ${deviceId} | Instant`,
    description: `Device details for asset ${deviceId} — Instant IT asset management`,
  };
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function DevicePage({ params, searchParams }: Props) {
  // 1. Authenticate user
  const session = await auth();

  // ── Unauthenticated State ──────────────────────────────────────────────────
  if (!session || !session.user) {
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
              border: "1px solid rgba(239, 68, 68, 0.2)",
              boxShadow: "0 4px 24px rgba(239, 68, 68, 0.08)",
              textAlign: "center",
            }}
          >
            <CardContent sx={{ py: 6, px: { xs: 3, md: 5 } }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 3,
                  bgcolor: "#fef2f2",
                  border: "1px solid rgba(239, 68, 68, 0.25)",
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
                Sign In Required
              </Typography>

              <Alert severity="warning" sx={{ mb: 3, borderRadius: 2, textAlign: "left" }}>
                Please sign in to view device details.
              </Alert>

              <Button
                variant="contained"
                href="/login"
                startIcon={<LoginIcon />}
                disableElevation
                sx={{
                  borderRadius: 2.5,
                  fontWeight: 700,
                  px: 3.5,
                  py: 1,
                  bgcolor: "#2563eb",
                  "&:hover": { bgcolor: "#1d4ed8" },
                }}
              >
                Sign In to Instant
              </Button>
            </CardContent>
          </Card>
        </Box>
      </DeviceLayout>
    );
  }

  // Await params & searchParams (Next.js 15 requirement)
  const { deviceId } = await params;
  const resolvedSearchParams = await searchParams;

  // 2. Resolve User Role (supports searchParam override for role testing/demo)
  const userEmail = session.user.email;
  const dbRole = (session.user as any).role || (await getUserRoleByEmail(userEmail));
  const activeRole = normalizeRole(resolvedSearchParams?.role || dbRole || "Employee");

  // 3. Query permitted device fields on server side
  const device = await getDeviceByAssetCodeForRole(deviceId, activeRole);

  // ── Device Not Found State ─────────────────────────────────────────────────
  if (!device) {
    return (
      <DeviceLayout title="Device Details" maxWidth="sm">
        <RoleBadgeBar currentRole={activeRole} />
        <Box
          sx={{
            minHeight: "50vh",
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
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </Box>
      </DeviceLayout>
    );
  }

  // ── Access Control Check for Restricted Devices ───────────────────────────
  const isAssignedToUser =
    device.assignedUserEmail && device.assignedUserEmail === userEmail;

  if (
    device.status === "restricted" &&
    !isAssignedToUser &&
    activeRole !== "Admin" &&
    activeRole !== "IT Admin"
  ) {
    return (
      <DeviceLayout title="Device Details" maxWidth="sm">
        <RoleBadgeBar currentRole={activeRole} />
        <Box
          sx={{
            minHeight: "50vh",
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

              <Alert severity="error" sx={{ mb: 3, borderRadius: 2, textAlign: "left" }}>
                You do not have permission to view this device.
              </Alert>

              <Typography
                color="text.secondary"
                sx={{ fontSize: "0.95rem", mb: 3, maxWidth: 360, mx: "auto" }}
              >
                Your account role (<strong>{activeRole}</strong>) does not have access to view this restricted asset.
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

  // ── Authorized — Render Details Page ──────────────────────────────────────
  return (
    <DeviceLayout title="Device Details" maxWidth="md">
      <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 2, md: 2.5 } }}>
        {/* Interactive Role Switcher Banner */}
        <RoleBadgeBar currentRole={activeRole} />

        {/* Hero Card with Report Issue Button */}
        <DeviceHeader device={device} role={activeRole} />

        {/* Dynamic Sectioned Details Card */}
        <DeviceDetails device={device} />
      </Box>
    </DeviceLayout>
  );
}
