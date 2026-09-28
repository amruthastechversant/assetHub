import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDeviceByAssetCode, getDeviceById } from "@/lib/device";
import { getUserIdFromSession, recordScannedDevice } from "@/lib/scannedDevices";

export async function POST(request: NextRequest) {
  // 1. Authenticate user
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  // 2. Parse & validate request body
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { deviceId } = body || {};
  if (!deviceId || typeof deviceId !== "string" || !deviceId.trim()) {
    return NextResponse.json(
      { success: false, error: "Invalid device ID" },
      { status: 400 }
    );
  }

  const cleanDeviceId = deviceId.trim();

  // 3. Verify device exists in inventory database
  const device =
    (await getDeviceByAssetCode(cleanDeviceId)) ||
    (await getDeviceById(cleanDeviceId));

  if (!device) {
    return NextResponse.json(
      { success: false, error: "Device does not exist" },
      { status: 404 }
    );
  }

  // 4. Resolve current authenticated user ID
  const userId = await getUserIdFromSession(session);
  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  // 5. Update user scan history in user_scanned_device_history
  try {
    const targetCode = device.assetCode || device.id || cleanDeviceId;
    const result = await recordScannedDevice(userId, targetCode);

    return NextResponse.json({
      success: true,
      lastScanned: {
        deviceId: result.lastScanned.deviceId,
        scannedAt: result.lastScanned.scannedAt,
      },
    });
  } catch (error) {
    console.error("Error recording scanned device:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
