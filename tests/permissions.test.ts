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
      assert.equal(normalizeRole("Employee"), "Employee");
      assert.equal(normalizeRole("employee"), "Employee");
      assert.equal(normalizeRole("Reporting Manager"), "Reporting Manager");
      assert.equal(normalizeRole("reporting manager"), "Reporting Manager");
      assert.equal(normalizeRole("manager"), "Reporting Manager");
      assert.equal(normalizeRole("HR"), "HR");
      assert.equal(normalizeRole("hr"), "HR");
      assert.equal(normalizeRole("System Admin"), "System Admin");
      assert.equal(normalizeRole("system admin"), "System Admin");
      assert.equal(normalizeRole("admin"), "System Admin");
      assert.equal(normalizeRole("CXO"), "CXO");
      assert.equal(normalizeRole("cxo"), "CXO");
      assert.equal(normalizeRole("UnknownRole"), "Employee");
    });

    test("Returns correct permissions structure for each role", () => {
      const sysAdminPerms = getRolePermissions("System Admin");
      assert.equal(sysAdminPerms.viewAllFields, true);
      assert.equal(sysAdminPerms.viewPurchaseAmount, true);
      assert.equal(sysAdminPerms.viewLocation, true);
      assert.equal(sysAdminPerms.reportIssue, true);

      const cxoPerms = getRolePermissions("CXO");
      assert.equal(cxoPerms.viewAllFields, true);
      assert.equal(cxoPerms.viewPurchaseAmount, true);
      assert.equal(cxoPerms.viewLocation, true);
      assert.equal(cxoPerms.reportIssue, true);

      const hrPerms = getRolePermissions("HR");
      assert.equal(hrPerms.viewAllFields, false);
      assert.equal(hrPerms.viewPurchaseAmount, false);
      assert.equal(hrPerms.viewLocation, true);
      assert.equal(hrPerms.reportIssue, true);

      const reportingManagerPerms = getRolePermissions("Reporting Manager");
      assert.equal(reportingManagerPerms.viewAllFields, false);
      assert.equal(reportingManagerPerms.viewPurchaseAmount, false);
      assert.equal(reportingManagerPerms.viewLocation, true);
      assert.equal(reportingManagerPerms.reportIssue, true);

      const employeePerms = getRolePermissions("Employee");
      assert.equal(employeePerms.viewAllFields, false);
      assert.equal(employeePerms.viewPurchaseAmount, false);
      assert.equal(employeePerms.viewLocation, false);
      assert.equal(employeePerms.reportIssue, true);
    });
  });

  describe("2. System Admin Field Visibility", () => {
    test("System Admin can view all permitted fields including purchaseAmount and location", () => {
      const filtered = filterDeviceFields(mockFullDevice, "System Admin");

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

  describe("3. CXO Field Visibility", () => {
    test("CXO can view all permitted fields including purchaseAmount and location", () => {
      const filtered = filterDeviceFields(mockFullDevice, "CXO");

      assert.equal(filtered.purchaseAmount, 249999);
      assert.equal(filtered.location, "Bangalore HQ - Floor 4");
      assert.equal(filtered.model, "MacBook Pro M3 Max 16-inch");
    });
  });

  describe("4. Reporting Manager & HR Field Visibility Restrictions", () => {
    test("Reporting Manager can view location but CANNOT view purchaseAmount", () => {
      const filtered = filterDeviceFields(mockFullDevice, "Reporting Manager");

      assert.equal(filtered.location, "Bangalore HQ - Floor 4");
      assert.equal(filtered.purchaseDate, "2025-01-15");
      assert.equal(filtered.assetCode, "DEV-10025");
      assert.equal("purchaseAmount" in filtered, false, "purchaseAmount must NOT exist in returned payload for Reporting Manager");
      assert.equal(filtered.purchaseAmount, undefined);
    });

    test("HR can view location but CANNOT view purchaseAmount", () => {
      const filtered = filterDeviceFields(mockFullDevice, "HR");

      assert.equal(filtered.location, "Bangalore HQ - Floor 4");
      assert.equal(filtered.purchaseDate, "2025-01-15");
      assert.equal(filtered.assetCode, "DEV-10025");
      assert.equal("purchaseAmount" in filtered, false, "purchaseAmount must NOT exist in returned payload for HR");
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
      const filteredManager = filterDeviceFields(mockFullDevice, "Reporting Manager");
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
      assert.equal(hasPermission("System Admin", "reportIssue"), true);
      assert.equal(hasPermission("CXO", "reportIssue"), true);
      assert.equal(hasPermission("HR", "reportIssue"), true);
      assert.equal(hasPermission("Reporting Manager", "reportIssue"), true);
      assert.equal(hasPermission("Employee", "reportIssue"), true);
    });
  });

  describe("8. Field Level Authorization Helpers", () => {
    test("canViewField helper works accurately", () => {
      assert.equal(canViewField("System Admin", "purchaseAmount"), true);
      assert.equal(canViewField("CXO", "purchaseAmount"), true);
      assert.equal(canViewField("HR", "purchaseAmount"), false);
      assert.equal(canViewField("Reporting Manager", "purchaseAmount"), false);
      assert.equal(canViewField("Employee", "purchaseAmount"), false);

      assert.equal(canViewField("HR", "location"), true);
      assert.equal(canViewField("Reporting Manager", "location"), true);
      assert.equal(canViewField("Employee", "location"), false);
    });
  });
});
