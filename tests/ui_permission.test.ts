import { describe, test } from "node:test";
import assert from "node:assert/strict";

import {
  hasPermission,
  canViewField,
  filterDeviceFields,
} from "../src/lib/permissions.ts";

describe("UI permission tests", () => {
  const mockDevice = {
    assetCode: "DEV-10025",
    model: "MacBook Pro",
    purchaseAmount: 249999,
    location: "Bangalore HQ",
    status: "active",
  };

  test("Employee cannot see purchaseAmount or location", () => {
    assert.equal(hasPermission("Employee", "reportIssue"), true);
    assert.equal(hasPermission("Employee", "viewPurchaseAmount"), false);
    assert.equal(hasPermission("Employee", "viewLocation"), false);

    assert.equal(canViewField("Employee", "purchaseAmount"), false);
    assert.equal(canViewField("Employee", "location"), false);

    const filtered = filterDeviceFields(mockDevice, "Employee");
    assert.equal("purchaseAmount" in filtered, false);
    assert.equal("location" in filtered, false);
  });

  test("Reporting Manager can see location but not purchaseAmount", () => {
    assert.equal(hasPermission("Reporting Manager", "viewLocation"), true);
    assert.equal(hasPermission("Reporting Manager", "viewPurchaseAmount"), false);

    assert.equal(canViewField("Reporting Manager", "location"), true);
    assert.equal(canViewField("Reporting Manager", "purchaseAmount"), false);

    const filtered = filterDeviceFields(mockDevice, "Reporting Manager");
    assert.equal(filtered.location, "Bangalore HQ");
    assert.equal("purchaseAmount" in filtered, false);
  });

  test("System Admin can see all sensitive fields", () => {
    assert.equal(hasPermission("System Admin", "viewPurchaseAmount"), true);
    assert.equal(hasPermission("System Admin", "viewLocation"), true);
    assert.equal(canViewField("System Admin", "purchaseAmount"), true);
    assert.equal(canViewField("System Admin", "location"), true);

    const filtered = filterDeviceFields(mockDevice, "System Admin");
    assert.equal(filtered.purchaseAmount, 249999);
    assert.equal(filtered.location, "Bangalore HQ");
  });
});
