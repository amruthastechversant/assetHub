export type DeviceField =
  | "assetCode"
  | "assetType"
  | "model"
  | "storage"
  | "operatingSystem"
  | "ram"
  | "processor"
  | "purchaseDate"
  | "status"
  | "purchaseAmount"
  | "location";

export type RoleName = "Admin" | "IT Admin" | "Manager" | "Employee" | string;

export interface RolePermissions {
  viewAllFields: boolean;
  viewPurchaseAmount: boolean;
  viewLocation: boolean;
  reportIssue: boolean;
  allowedFields: DeviceField[];
}

export type PermissionKey = keyof Omit<RolePermissions, "allowedFields">;
