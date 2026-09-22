import type { DeviceField } from "./permissions.ts";

export type DeviceStatus = "active" | "inactive" | "retired" | "restricted";

export interface Device {
  id: string;
  name: string;
  assetType: string;
  serialNumber: string;
  status: DeviceStatus;
  assignedUser?: string;
  assignedUserEmail?: string;
}

export interface DeviceDetail extends Device {
  assetCode: string;
  model: string;
  storage: string;
  operatingSystem: string;
  ram: string;
  processor: string;
  purchaseDate: string; // ISO-8601 date string e.g. "2025-01-15"
  purchaseAmount?: number; // Amount in INR (₹) - optional for restricted roles
  location?: string; // Location string - optional for restricted roles
}

export type FilteredDeviceDetail = Partial<DeviceDetail> & {
  id: string;
  assetCode: string;
  assetType: string;
  model: string;
  status: DeviceStatus;
};
