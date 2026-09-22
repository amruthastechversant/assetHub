import { NextRequest, NextResponse } from "next/server";
import { listDevicesByRole } from "@/lib/device";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  const session = await auth();
  
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const email = session.user?.email || undefined;
  const { searchParams } = new URL(request.url);
  
  // You could also get role from session if you extend NextAuth, 
  // but here we allow passing it as a query parameter for demonstration.
  // Example: /api/devices/role?role=admin
  const role = searchParams.get("role") || "user";
  
  const status = searchParams.get("status") ?? undefined;
  const assetType = searchParams.get("assetType") ?? undefined;
  const location = searchParams.get("location") ?? undefined;

  try {
    const devices = await listDevicesByRole(role, email, {
      status: status as any,
      assetType,
      location,
    });

    return NextResponse.json({
      success: true,
      count: devices.length,
      data: devices,
      role: role
    });
  } catch (error) {
    console.error("Error fetching devices by role:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
