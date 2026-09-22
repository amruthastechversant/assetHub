import type { DeviceField, PermissionKey, RolePermissions } from "../types/permissions.ts";

/**
 * Centralized Role Permissions Configuration
 */
export const rolePermissions: Record<string, RolePermissions> = {
  Admin: {
    viewAllFields: true,
    viewPurchaseAmount: true,
    viewLocation: true,
    reportIssue: true,
    allowedFields: [
      "assetCode",
      "assetType",
      "model",
      "storage",
      "operatingSystem",
      "ram",
      "processor",
      "purchaseDate",
      "status",
      "purchaseAmount",
      "location",
    ],
  },
  "IT Admin": {
    viewAllFields: true,
    viewPurchaseAmount: true,
    viewLocation: true,
    reportIssue: true,
    allowedFields: [
      "assetCode",
      "assetType",
      "model",
      "storage",
      "operatingSystem",
      "ram",
      "processor",
      "purchaseDate",
      "status",
      "purchaseAmount",
      "location",
    ],
  },
  Manager: {
    viewAllFields: false,
    viewPurchaseAmount: false,
    viewLocation: true,
    reportIssue: true,
    allowedFields: [
      "assetCode",
      "assetType",
      "model",
      "storage",
      "operatingSystem",
      "ram",
      "processor",
      "purchaseDate",
      "status",
      "location",
    ],
  },
  Employee: {
    viewAllFields: false,
    viewPurchaseAmount: false,
    viewLocation: false,
    reportIssue: true,
    allowedFields: [
      "assetCode",
      "assetType",
      "model",
      "storage",
      "operatingSystem",
      "ram",
      "processor",
      "purchaseDate",
      "status",
    ],
  },
};

/**
 * Normalize role input to match defined role keys.
 * Supports case-insensitivity and common role aliases.
 */
export function normalizeRole(role?: string | null): string {
  if (!role) return "Employee";
  const r = role.trim().toLowerCase();
  
  if (r === "admin" || r === "administrator" || r === "super admin") return "Admin";
  if (r === "it admin" || r === "it_admin" || r === "it administrator") return "IT Admin";
  if (r === "manager" || r === "mgr") return "Manager";
  if (r === "employee" || r === "user" || r === "staff") return "Employee";

  // Check direct key match (case-insensitive)
  const exactKey = Object.keys(rolePermissions).find(
    (k) => k.toLowerCase() === r
  );
  if (exactKey) return exactKey;

  // Default fallback for unknown roles
  return "Employee";
}

/**
 * Get permissions object for a given role.
 */
export function getRolePermissions(role?: string | null): RolePermissions {
  const normalized = normalizeRole(role);
  return rolePermissions[normalized] || rolePermissions.Employee;
}

/**
 * Check if a role can view a specific device field.
 */
export function canViewField(role: string | null | undefined, field: DeviceField): boolean {
  const permissions = getRolePermissions(role);
  if (permissions.viewAllFields) return true;
  return permissions.allowedFields.includes(field);
}

/**
 * Check if a role has a specific permission (e.g., 'reportIssue', 'viewPurchaseAmount', 'viewLocation').
 */
export function hasPermission(
  role: string | null | undefined,
  permission: PermissionKey
): boolean {
  const permissions = getRolePermissions(role);
  return Boolean(permissions[permission]);
}

/**
 * Filter device fields on the server side so restricted fields are NOT
 * returned in the payload sent to the client.
 */
export function filterDeviceFields<T extends Record<string, any>>(
  device: T,
  role: string | null | undefined
): Partial<T> {
  if (!device) return device;

  const permissions = getRolePermissions(role);
  const allowedSet = new Set<string>(permissions.allowedFields);

  // Always keep basic system identification properties
  const baseKeysToKeep = new Set(["id", "name", "serialNumber", "assignedUser", "assignedUserEmail"]);

  const filtered = { ...device };

  // Field mappings between DB / object properties and DeviceField names
  const fieldMapping: Record<string, DeviceField> = {
    assetCode: "assetCode",
    assetType: "assetType",
    model: "model",
    storage: "storage",
    os: "operatingSystem",
    operatingSystem: "operatingSystem",
    ram: "ram",
    processor: "processor",
    purchaseDate: "purchaseDate",
    status: "status",
    purchaseAmount: "purchaseAmount",
    location: "location",
  };

  for (const [key, fieldName] of Object.entries(fieldMapping)) {
    if (key in filtered) {
      if (!allowedSet.has(fieldName)) {
        delete filtered[key];
      }
    }
  }

  return filtered;
}
