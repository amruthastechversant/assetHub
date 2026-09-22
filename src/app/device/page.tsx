import { getDeviceById } from "@/lib/device";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DeviceHeader from "@/components/device/DeviceHeader";
import DeviceDetails from "@/components/device/DeviceDetails";
import DeviceLayout from "@/components/device/DeviceLayout";

export default async function DeviceIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  const { id } = await searchParams;
  const deviceId = typeof id === "string" ? id : null;

  // const device = deviceId ? await getDeviceById("062687ef-ca34-4afc-bd5b-141f97052212") : null;
const device = deviceId ? await getDeviceById(deviceId) : null;
  return (
    <DeviceLayout title="Device Details" maxWidth="md">
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
          <DeviceHeader device={device} />
          <DeviceDetails device={device} />
        </div>
      )}
    </DeviceLayout>
  );
}
