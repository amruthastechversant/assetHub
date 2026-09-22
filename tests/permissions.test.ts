import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  rolePermissions,
  normalizeRole,
  getRolePermissions,
  canViewField,
  hasPermission,
  filterDeviceFields,
} from "../src/lib/permissions.ts";
import type { DeviceDetail } from "../src/types/device.ts";

// Sample test device containing all 11 fields plus standard identifiers
const mockFullDevice: DeviceDetail = {
  id: "asset-12345",
  name: "MacBook Pro 16",
  assetCode: "DEV-10025",
  assetType: "Laptop",
  serialNumber: "DEV-10025",
  model: "MacBook Pro M3 Max 16-inch",
  storage: "1TB SSD",
  operatingSystem: "macOS Sequoia",
  ram: "36GB Unified",
  processor: "Apple M3 Max (16-core)",
  purchaseDate: "2025-01-15",
  status: "active",
  purchaseAmount: 249999,
  location: "Bangalore HQ - Floor 4",
  assignedUser: "Jane Doe",
  assignedUserEmail: "jane.doe@example.com",
};

describe("Role-Based Access Control and Field Visibility Tests", () => {
  describe("1. Role Normalization and Config Lookup", () => {
    test("Normalizes role names correctly", () => {
      assert.equal(normalizeRole("Admin"), "Admin");
      assert.equal(normalizeRole("admin"), "Admin");
      assert.equal(normalizeRole("IT Admin"), "IT Admin");
      assert.equal(normalizeRole("it_admin"), "IT Admin");
      assert.equal(normalizeRole("Manager"), "Manager");
      assert.equal(normalizeRole("manager"), "Manager");
      assert.equal(normalizeRole("Employee"), "Employee");
      assert.equal(normalizeRole("employee"), "Employee");
      assert.equal(normalizeRole("user"), "Employee");
      assert.equal(normalizeRole("UnknownRole"), "Employee");
    });

    test("Returns correct permissions structure for each role", () => {
      const adminPerms = getRolePermissions("Admin");
      assert.equal(adminPerms.viewAllFields, true);
      assert.equal(adminPerms.viewPurchaseAmount, true);
      assert.equal(adminPerms.viewLocation, true);
      assert.equal(adminPerms.reportIssue, true);

      const itAdminPerms = getRolePermissions("IT Admin");
      assert.equal(itAdminPerms.viewAllFields, true);
      assert.equal(itAdminPerms.viewPurchaseAmount, true);
      assert.equal(itAdminPerms.viewLocation, true);
      assert.equal(itAdminPerms.reportIssue, true);

      const managerPerms = getRolePermissions("Manager");
      assert.equal(managerPerms.viewAllFields, false);
      assert.equal(managerPerms.viewPurchaseAmount, false);
      assert.equal(managerPerms.viewLocation, true);
      assert.equal(managerPerms.reportIssue, true);

      const employeePerms = getRolePermissions("Employee");
      assert.equal(employeePerms.viewAllFields, false);
      assert.equal(employeePerms.viewPurchaseAmount, false);
      assert.equal(employeePerms.viewLocation, false);
      assert.equal(employeePerms.reportIssue, true);
    });
  });

  describe("2. Admin Field Visibility", () => {
    test("Admin can view all permitted fields including purchaseAmount and location", () => {
      const filtered = filterDeviceFields(mockFullDevice, "Admin");

      assert.equal(filtered.assetCode, "DEV-10025");
      assert.equal(filtered.assetType, "Laptop");
      assert.equal(filtered.model, "MacBook Pro M3 Max 16-inch");
      assert.equal(filtered.storage, "1TB SSD");
      assert.equal(filtered.operatingSystem, "macOS Sequoia");
      assert.equal(filtered.ram, "36GB Unified");
      assert.equal(filtered.processor, "Apple M3 Max (16-core)");
      assert.equal(filtered.purchaseDate, "2025-01-15");
      assert.equal(filtered.status, "active");
      assert.equal(filtered.purchaseAmount, 249999);
      assert.equal(filtered.location, "Bangalore HQ - Floor 4");
    });
  });

  describe("3. IT Admin Field Visibility", () => {
    test("IT Admin can view all permitted fields", () => {
      const filtered = filterDeviceFields(mockFullDevice, "IT Admin");

      assert.equal(filtered.purchaseAmount, 249999);
      assert.equal(filtered.location, "Bangalore HQ - Floor 4");
      assert.equal(filtered.model, "MacBook Pro M3 Max 16-inch");
    });
  });

  describe("4. Manager Field Visibility Restrictions", () => {
    test("Manager can view location but CANNOT view purchaseAmount", () => {
      const filtered = filterDeviceFields(mockFullDevice, "Manager");

      assert.equal(filtered.location, "Bangalore HQ - Floor 4");
      assert.equal(filtered.purchaseDate, "2025-01-15");
      assert.equal(filtered.assetCode, "DEV-10025");
      assert.equal("purchaseAmount" in filtered, false, "purchaseAmount must NOT exist in returned payload for Manager");
      assert.equal(filtered.purchaseAmount, undefined);
    });
  });

  describe("5. Employee Field Visibility Restrictions", () => {
    test("Employee CANNOT view purchaseAmount and CANNOT view location", () => {
      const filtered = filterDeviceFields(mockFullDevice, "Employee");

      assert.equal(filtered.assetCode, "DEV-10025");
      assert.equal(filtered.model, "MacBook Pro M3 Max 16-inch");
      assert.equal(filtered.purchaseDate, "2025-01-15");
      assert.equal("purchaseAmount" in filtered, false, "purchaseAmount must NOT exist in returned payload for Employee");
      assert.equal("location" in filtered, false, "location must NOT exist in returned payload for Employee");
      assert.equal(filtered.purchaseAmount, undefined);
      assert.equal(filtered.location, undefined);
    });
  });

  describe("6. Server-Side Data Stripping Verification", () => {
    test("Restricted fields are strictly deleted from payload before client delivery", () => {
      const filteredManager = filterDeviceFields(mockFullDevice, "Manager");
      const filteredEmployee = filterDeviceFields(mockFullDevice, "Employee");

      const managerKeys = Object.keys(filteredManager);
      const employeeKeys = Object.keys(filteredEmployee);

      assert.equal(managerKeys.includes("purchaseAmount"), false);
      assert.equal(employeeKeys.includes("purchaseAmount"), false);
      assert.equal(employeeKeys.includes("location"), false);
    });
  });

  describe("7. Report Issue Action Permissions", () => {
    test("Report Issue action permission follows configuration across all roles", () => {
      assert.equal(hasPermission("Admin", "reportIssue"), true);
      assert.equal(hasPermission("IT Admin", "reportIssue"), true);
      assert.equal(hasPermission("Manager", "reportIssue"), true);
      assert.equal(hasPermission("Employee", "reportIssue"), true);
    });
  });

  describe("8. Field Level Authorization Helpers", () => {
    test("canViewField helper works accurately", () => {
      assert.equal(canViewField("Admin", "purchaseAmount"), true);
      assert.equal(canViewField("IT Admin", "purchaseAmount"), true);
      assert.equal(canViewField("Manager", "purchaseAmount"), false);
      assert.equal(canViewField("Employee", "purchaseAmount"), false);

      assert.equal(canViewField("Manager", "location"), true);
      assert.equal(canViewField("Employee", "location"), false);
    });
  });
});
