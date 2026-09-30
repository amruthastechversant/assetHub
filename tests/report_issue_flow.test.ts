import { describe, test, mock } from "node:test";
import assert from "node:assert/strict";

process.env.AUTH_SECRET ??= "test-secret";
process.env.AUTH_GOOGLE_ID ??= "test-google-client-id";
process.env.AUTH_GOOGLE_SECRET ??= "test-google-client-secret";

describe("Report issue flow tests", () => {
  test("returns 401 when no session exists", async () => {
    const authModule = await import("../src/lib/auth.ts");
    const { POST } = await import("../src/app/api/report-issue/route.ts");
    const authMock = mock.method(authModule, "auth", async () => null);

    try {
      const res = await POST(
        new Request("http://localhost/api/report-issue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assetId: "DEV-10025",
            note: "Broken screen",
          }),
        }) as any
      );

      assert.equal(res.status, 401);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.error, "Unauthorized");
    } finally {
      authMock.mock.restore();
    }
  });

  test("accepts a valid report-issue request for an existing asset", async () => {
    const authModule = await import("../src/lib/auth.ts");
    const pool = (await import("../src/lib/db.ts")).default;
    const { POST } = await import("../src/app/api/report-issue/route.ts");

    const authMock = mock.method(authModule, "auth", async () => ({
      user: { email: "employee@example.com" },
      expires: new Date(Date.now() + 60_000).toISOString(),
    }));

    const connectMock = mock.method(pool, "connect", async () => ({
      query: async (sql: string) => {
        const normalized = sql.toLowerCase();

        if (normalized.includes("from users") && normalized.includes("where lower(email_id)")) {
          return { rows: [{ user_id: "user-1", employee_id: "emp-1", reporting_manager: null }] };
        }

        if (normalized.includes("from inventory")) {
          return {
            rows: [{ asset_id: "asset-1", asset_type: "Laptop", model: "MacBook Pro" }],
          };
        }

        if (normalized.includes("from users_requests")) {
          return { rows: [] };
        }

        if (normalized.includes("from noc_requests")) {
          return { rows: [] };
        }

        if (normalized.includes("from requests")) {
          return { rows: [{ request_id: "req-1", request_title: "Asset Maintenance" }] };
        }

        if (normalized.includes("select man.is_executive")) {
          return { rows: [{ is_executive: true }] };
        }

        if (normalized.includes("from request_configuration") && normalized.includes("order by approval_order desc")) {
          return { rows: [{ approver_id: "approver-1" }] };
        }

        if (normalized.includes("generate_tv_code('arm')") || normalized.includes("generate_tv_code('ARM')")) {
          return { rows: [{ code: "TV2026-ARM-00055" }] };
        }

        if (normalized.includes("insert into users_requests")) {
          return {
            rows: [{ user_request_id: "ur-1", created_request_id: "TV2026-ARM-00055" }],
          };
        }

        if (normalized.includes("insert into request_log")) {
          return { rows: [] };
        }

        if (normalized.includes("begin") || normalized.includes("commit")) {
          return { rows: [] };
        }

        return { rows: [] };
      },
      release: () => {},
    }));

    try {
      const res = await POST(
        new Request("http://localhost/api/report-issue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assetId: "DEV-10025",
            note: "Screen flickering and battery drains fast",
          }),
        }) as any
      );

      assert.equal(res.status, 201);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.fileContent.createdRequestId, "TV2026-ARM-00055");
    } finally {
      authMock.mock.restore();
      connectMock.mock.restore();
    }
  });
});
