import { getDeviceById } from "@/lib/device";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DeviceDetails from "@/components/device/DeviceDetails";
import DeviceLayout from "@/components/device/DeviceLayout";

import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default async function DeviceIndexPage() {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  const base = await getDeviceById("device-001");

  const device = base
    ? {
        ...base,
        assetCode: base.serialNumber ?? base.id,
        model: "Dell Latitude 5440",
        storage: "512 GB SSD",
        os: "Windows 11",
        ram: "16 GB",
        processor: "Intel Core i5",
        purchaseDate: "2026-05-15",
        status: base.status === "active" ? "Assigned" : "Available",
        purchaseAmount: 75000,
        location: "Kochi Office",
      }
    : null;

  return (
    <DeviceLayout title="AssetHub">
      <Container
        maxWidth={false}
        sx={{
          maxWidth: 430,
          mx: "auto",
          px: 0,
          py: 0,
        }}
      >
        <Box
          sx={{
            mb: 2,
            p: 2,
            borderRadius: 3,
            background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(239,246,255,0.9) 100%)",
            border: "1px solid rgba(148, 163, 184, 0.18)",
            boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
          }}
        >
          <Typography
            variant="overline"
            sx={{
              display: "block",
              color: "#475569",
              letterSpacing: "0.1em",
              fontWeight: 700,
              mb: 0.6,
              fontSize: "0.68rem",
            }}
          >
            Inventory record
          </Typography>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 800,
              letterSpacing: "-0.06em",
              lineHeight: 1.08,
              fontSize: "1.8rem",
              color: "#0f172a",
            }}
          >
            {device ? device.name ?? device.assetCode ?? "Device Details" : "Device Details"}
          </Typography>
          {device?.assetCode && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.8, fontWeight: 600, fontSize: "0.76rem", letterSpacing: "0.04em", textTransform: "uppercase" }}
            >
              Asset ID: {device.assetCode}
            </Typography>
          )}
        </Box>

        {!device ? (
          <Box
            sx={{
              p: 3,
              borderRadius: 3,
              border: "1px solid rgba(148,163,184,0.2)",
              bgcolor: "#fff",
              boxShadow: "0 12px 30px rgba(15, 23, 42, 0.04)",
            }}
          >
            <Typography variant="h6" sx={{ mb: 1 }}>
              Device details could not be loaded.
            </Typography>
            <Typography color="text.secondary">Please try again.</Typography>
          </Box>
        ) : (
          <DeviceDetails device={device} />
        )}
      </Container>
    </DeviceLayout>
  );
}
