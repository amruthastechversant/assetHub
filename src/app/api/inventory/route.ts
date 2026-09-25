import { NextRequest, NextResponse } from "next/server";
import { listInventoryDevices, getDeviceByAssetCode } from "@/lib/device";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code")?.trim();

  // If a specific asset code or ID is queried
  if (code) {
    try {
      const device = await getDeviceByAssetCode(code);
      if (!device) {
        return NextResponse.json(
          {
            success: false,
            count: 0,
            data: [],
            error: `Device with code "${code}" not found in inventory`,
            source: "inventory",
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        count: 1,
        data: [device],
        source: "inventory",
      });
    } catch (err) {
      console.error("Error looking up device by code:", err);
      return NextResponse.json(
        { success: false, error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }

  const status = searchParams.get("status") ?? undefined;
  const assetType = searchParams.get("assetType") ?? undefined;
  const location = searchParams.get("location") ?? undefined;

  const devices = await listInventoryDevices({
    status: status as "active" | "inactive" | "retired" | "restricted" | undefined,
    assetType: assetType ?? undefined,
    location: location ?? undefined,
  });

  return NextResponse.json({
    success: true,
    count: devices.length,
    data: devices,
    source: "inventory",
  });
}
