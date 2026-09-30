import { describe, test, mock } from "node:test";
import assert from "node:assert/strict";

process.env.AUTH_SECRET ??= "test-secret";
process.env.AUTH_GOOGLE_ID ??= "test-google-client-id";
process.env.AUTH_GOOGLE_SECRET ??= "test-google-client-secret";

import pool from "../src/lib/db.ts";

describe("Auth and session tests", () => {
  test("returns default Employee role when email is missing", async () => {
    const { getUserRoleByEmail } = await import("../src/lib/auth.ts");
    const role = await getUserRoleByEmail(undefined);
    assert.equal(role, "Employee");
  });

  test("normalizes DB role names from the users table", async () => {
    const { getUserRoleByEmail } = await import("../src/lib/auth.ts");
    const original = mock.method(pool, "query", async () => ({
      rows: [{ role_name: "manager" }],
    }));

    try {
      const role = await getUserRoleByEmail("manager@example.com");
      assert.equal(role, "Reporting Manager");
    } finally {
      original.mock.restore();
    }
  });

  test("session role resolution follows the app’s role rules", async () => {
    const { normalizeRole } = await import("../src/lib/permissions.ts");
    assert.equal(normalizeRole("hr"), "HR");
    assert.equal(normalizeRole("manager"), "Reporting Manager");
    assert.equal(normalizeRole("admin"), "System Admin");
  });
});
