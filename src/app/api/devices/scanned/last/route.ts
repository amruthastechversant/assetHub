import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserIdFromSession, getLastScannedDevice } from "@/lib/scannedDevices";

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
    const lastItem = await getLastScannedDevice(userId);

    if (!lastItem) {
      return NextResponse.json({ device: null });
    }

    return NextResponse.json({
      deviceId: lastItem.deviceId,
      scannedAt: lastItem.scannedAt,
      device: lastItem.device,
    });
  } catch (error) {
    console.error("Error fetching last scanned device:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
