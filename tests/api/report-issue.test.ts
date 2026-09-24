/**
 * tests/api/report-issue.test.ts
 *
 * Area: API — auth, correct device ID sent, error handling, device/user not found
 *
 * Strategy: import the route handler directly and mock its external dependencies
 * (auth, pool) so no real DB or NextAuth is needed.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ── Mock @/auth ───────────────────────────────────────────────────────────────
vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

// ── Mock @/lib/db ─────────────────────────────────────────────────────────────
vi.mock("@/lib/db", () => ({
  default: { query: vi.fn() },
}));

import { auth } from "@/auth";
import pool from "@/lib/db";
import { POST } from "@/app/api/report-issue/route";

// ── Helpers ───────────────────────────────────────────────────────────────────
function makeRequest(body: object) {
  return new NextRequest("http://localhost/api/report-issue", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const mockAuth = auth as ReturnType<typeof vi.fn>;
const mockQuery = (pool.query as ReturnType<typeof vi.fn>);

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("POST /api/report-issue — Authentication", () => {
  it("returns 401 when there is no session", async () => {
    mockAuth.mockResolvedValue(null);

    const res = await POST(makeRequest({ assetId: "uuid-1", note: "broken" }));

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/unauthorized/i);
  });

  it("returns 401 when session has no email", async () => {
    mockAuth.mockResolvedValue({ user: {} }); // email missing

    const res = await POST(makeRequest({ assetId: "uuid-1", note: "broken" }));

    expect(res.status).toBe(401);
  });
});

describe("POST /api/report-issue — Input validation", () => {
  beforeEach(() => {
    mockAuth.mockResolvedValue({ user: { email: "test@example.com" } });
  });

  it("returns 400 when assetId is missing", async () => {
    const res = await POST(makeRequest({ note: "broken screen" }));

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/required/i);
  });

  it("returns 400 when note is empty", async () => {
    const res = await POST(makeRequest({ assetId: "uuid-1", note: "   " }));

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/required/i);
  });

  it("returns 400 when body is invalid JSON", async () => {
    mockAuth.mockResolvedValue({ user: { email: "test@example.com" } });
    const req = new NextRequest("http://localhost/api/report-issue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{ bad json",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

describe("POST /api/report-issue — User not found", () => {
  it("returns 404 when user email is not in the users table", async () => {
    mockAuth.mockResolvedValue({ user: { email: "ghost@example.com" } });
    // users table returns no rows
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await POST(makeRequest({ assetId: "uuid-1", note: "broken" }));

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toMatch(/user not found/i);
  });
});

describe("POST /api/report-issue — Request type not found", () => {
  it("returns 404 when 'asset maintenance' is not found in requests table", async () => {
    mockAuth.mockResolvedValue({ user: { email: "admin@example.com" } });
    // user lookup succeeds
    mockQuery.mockResolvedValueOnce({ rows: [{ user_id: "user-uuid-1" }] });
    // requests lookup returns nothing
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await POST(makeRequest({ assetId: "uuid-asset-1", note: "damaged" }));

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toMatch(/asset maintenance/i);
  });
});

describe("POST /api/report-issue — Correct device ID is used", () => {
  it("passes the correct assetId to the INSERT query", async () => {
    const targetAssetId = "c1234567-abcd-0000-0000-000000000001";

    mockAuth.mockResolvedValue({ user: { email: "admin@example.com" } });
    mockQuery
      .mockResolvedValueOnce({ rows: [{ user_id: "user-uuid-1" }] })       // users
      .mockResolvedValueOnce({ rows: [{ request_id: "req-uuid-1" }] })      // requests
      .mockResolvedValueOnce({ rows: [], rowCount: 1 });                     // insert

    await POST(makeRequest({ assetId: targetAssetId, note: "Touchpad broken" }));

    // Third call is the INSERT — check that assetId appears in the params
    const insertCallArgs = mockQuery.mock.calls[2];
    const insertParams: string[] = insertCallArgs[1];
    expect(insertParams).toContain(targetAssetId);
  });
});

describe("POST /api/report-issue — Successful submission", () => {
  it("returns 201 with success: true on a valid request", async () => {
    mockAuth.mockResolvedValue({ user: { email: "admin@example.com" } });
    mockQuery
      .mockResolvedValueOnce({ rows: [{ user_id: "user-uuid-1" }] })
      .mockResolvedValueOnce({ rows: [{ request_id: "req-uuid-1" }] })
      .mockResolvedValueOnce({ rows: [], rowCount: 1 });

    const res = await POST(makeRequest({ assetId: "uuid-asset-1", note: "Screen cracked" }));

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.message).toMatch(/successfully/i);
  });
});

describe("POST /api/report-issue — DB error handling", () => {
  it("returns 500 when the database throws an unexpected error", async () => {
    mockAuth.mockResolvedValue({ user: { email: "admin@example.com" } });
    mockQuery.mockRejectedValueOnce(new Error("DB connection lost"));

    const res = await POST(makeRequest({ assetId: "uuid-asset-1", note: "broken" }));

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/internal server error/i);
  });
});
