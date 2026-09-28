import { NextRequest, NextResponse } from "next/server";
import { listInventoryDevices } from "@/lib/device";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
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
