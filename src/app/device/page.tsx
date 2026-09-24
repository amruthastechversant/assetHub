import { getDeviceByAssetCode } from "@/lib/device";
import { filterDeviceFields, normalizeRole } from "@/lib/permissions";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DeviceHeader from "@/components/device/DeviceHeader";
import DeviceDetails from "@/components/device/DeviceDetails";
import DeviceLayout from "@/components/device/DeviceLayout";
import RoleBadgeBar from "@/components/device/RoleBadgeBar";

type Props = {
  searchParams: Promise<{ code?: string; role?: string }>;
};

export default async function DeviceIndexPage({ searchParams }: Props) {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  const search = await searchParams;
  const userRole = (session?.user as any)?.role;
  const activeRole = normalizeRole(search?.role || userRole || "Employee");
  const assetCode = search?.code || "062687ef-ca34-4afc-bd5b-141f97052212";

  const rawDevice = await getDeviceByAssetCode(assetCode);
  const device = rawDevice ? filterDeviceFields(rawDevice, activeRole) : null;

  return (
    <DeviceLayout title="Device Details" maxWidth="md">
      <RoleBadgeBar currentRole={activeRole} />
      {!device ? (
        <div
          style={{
            padding: "2rem",
            borderRadius: "12px",
            border: "1px solid rgba(148,163,184,0.2)",
            background: "#fff",
          }}
        >
          <p style={{ color: "#475569" }}>Device details could not be loaded.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <DeviceHeader device={device} role={activeRole} />
          <DeviceDetails device={device} />
        </div>
      )}
    </DeviceLayout>
  );
}
