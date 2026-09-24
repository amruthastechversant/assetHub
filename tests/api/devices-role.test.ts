/**
 * tests/api/devices-role.test.ts
 *
 * Area: API — authentication, correct device ID requested, API error handling
 *
 * Tests the GET /api/devices/role route handler directly with mocked auth + DB.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ── Mock dependencies ─────────────────────────────────────────────────────────
vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/device", () => ({
  listDevicesByRole: vi.fn(),
}));

import { auth } from "@/auth";
import { listDevicesByRole } from "@/lib/device";
import { GET } from "@/app/api/devices/role/route";

const mockAuth = auth as ReturnType<typeof vi.fn>;
const mockListDevices = listDevicesByRole as ReturnType<typeof vi.fn>;

function makeRequest(params: Record<string, string> = {}) {
  const url = new URL("http://localhost/api/devices/role");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url.toString());
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("GET /api/devices/role — Authentication", () => {
  it("returns 401 when there is no session", async () => {
    mockAuth.mockResolvedValue(null);

    const res = await GET(makeRequest());

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/unauthorized/i);
  });

  it("proceeds normally when a valid session exists", async () => {
    mockAuth.mockResolvedValue({ user: { email: "admin@example.com" } });
    mockListDevices.mockResolvedValue([]);

    const res = await GET(makeRequest({ role: "System Admin" }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});

describe("GET /api/devices/role — Correct device data returned", () => {
  beforeEach(() => {
    mockAuth.mockResolvedValue({ user: { email: "hr@example.com" } });
  });

  it("returns all devices from listDevicesByRole", async () => {
    const fakeDevices = [
      { id: "uuid-001", assetCode: "DEV-001", model: "Dell XPS" },
      { id: "uuid-002", assetCode: "DEV-002", model: "MacBook Pro" },
    ];
    mockListDevices.mockResolvedValue(fakeDevices);

    const res = await GET(makeRequest({ role: "HR" }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.count).toBe(2);
    expect(body.data).toHaveLength(2);
    expect(body.data[0].assetCode).toBe("DEV-001");
  });

  it("passes the role query param to listDevicesByRole", async () => {
    mockListDevices.mockResolvedValue([]);

    await GET(makeRequest({ role: "Reporting Manager" }));

    expect(mockListDevices).toHaveBeenCalledWith(
      "Reporting Manager",
      expect.anything(),
      expect.anything()
    );
  });

  it("returns an empty list when no devices match", async () => {
    mockListDevices.mockResolvedValue([]);

    const res = await GET(makeRequest({ role: "Employee" }));

    const body = await res.json();
    expect(body.count).toBe(0);
    expect(body.data).toEqual([]);
  });
});

describe("GET /api/devices/role — API error handling", () => {
  it("returns 500 when listDevicesByRole throws an error", async () => {
    mockAuth.mockResolvedValue({ user: { email: "admin@example.com" } });
    mockListDevices.mockRejectedValue(new Error("DB query failed"));

    const res = await GET(makeRequest({ role: "System Admin" }));

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/internal server error/i);
  });
});
