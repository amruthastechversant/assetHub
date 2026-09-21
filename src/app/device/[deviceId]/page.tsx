import { getDeviceById } from "@/lib/device";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

type Props = {
  params: { deviceId: string };
};

export default async function DevicePage({ params }: Props) {
  const session = await auth();

  if (!session) {
    // Not authenticated -> redirect to sign in page (root)
    redirect("/");
  }

  const { deviceId } = params;
  const device = await getDeviceById(deviceId);

  // Device not found
  if (!device) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl">
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-3">Device not found</h2>
            <p className="text-sm text-gray-600">No device matches ID “{deviceId}”. Please check the identifier and try again.</p>
          </div>
        </div>
      </main>
    );
  }

  // Access control example: if device is restricted and not assigned to current user
  const userEmail = session?.user?.email;
  const isAssignedToUser = device.assignedUserEmail && device.assignedUserEmail === userEmail;

  if (device.status === "restricted" && !isAssignedToUser) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl">
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-3">Access denied</h2>
            <p className="text-sm text-gray-600">You don't have permission to view this device.</p>
          </div>
        </div>
      </main>
    );
  }

  // Device found and accessible — render details
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-xl">
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h1 className="text-2xl font-semibold mb-4">Device details</h1>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <div className="text-xs text-gray-500">Device ID</div>
              <div className="font-medium">{device.id}</div>
            </div>

            <div>
              <div className="text-xs text-gray-500">Device name</div>
              <div className="font-medium">{device.name}</div>
            </div>

            <div>
              <div className="text-xs text-gray-500">Asset type</div>
              <div className="font-medium">{device.assetType}</div>
            </div>

            <div>
              <div className="text-xs text-gray-500">Serial number</div>
              <div className="font-medium">{device.serialNumber}</div>
            </div>

            <div>
              <div className="text-xs text-gray-500">Status</div>
              <div className="font-medium">{device.status}</div>
            </div>

            <div>
              <div className="text-xs text-gray-500">Assigned user</div>
              <div className="font-medium">{device.assignedUser ?? "—"}</div>
            </div>
          </div>

          <div className="mt-6">
            <a href="/" className="text-sm text-blue-600">Back to dashboard</a>
          </div>
        </div>
      </div>
    </main>
  );
}
