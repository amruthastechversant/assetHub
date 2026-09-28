import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserIdFromSession, getRecentScannedDevices } from "@/lib/scannedDevices";

export async function GET(_request: NextRequest) {
  // 1. Authenticate user
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  // 2. Resolve current authenticated user ID
  const userId = await getUserIdFromSession(session);
  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const devices = await getRecentScannedDevices(userId);

    return NextResponse.json({
      devices: devices.map((item) => ({
        deviceId: item.deviceId,
        scannedAt: item.scannedAt,
        device: item.device,
      })),
    });
  } catch (error) {
    console.error("Error fetching recent scanned devices:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
