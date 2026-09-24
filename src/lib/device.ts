import pool from "./db";
import { filterDeviceFields, normalizeRole } from "./permissions";
import { Device, DeviceDetail } from "@/types/device";

export type { Device, DeviceDetail };

const SELECT_FIELDS = `
  asset_id AS id, 
  model AS name, 
  asset_type AS "assetType", 
  asset_code AS "serialNumber", 
  status, 
  asset_code AS "assetCode", 
  model, 
  storage, 
  os AS "operatingSystem", 
  ram, 
  processor, 
  TO_CHAR(purchase_date, 'YYYY-MM-DD') AS "purchaseDate", 
  purchase_amount AS "purchaseAmount", 
  location
`;

/**
 * Look up a device by its internal ID or serial number.
 */
export async function getDeviceById(id: string): Promise<DeviceDetail | null> {
  try {
    const result = await pool.query(
      `SELECT ${SELECT_FIELDS} FROM inventory WHERE asset_id::TEXT = $1 OR asset_code = $1`,
      [id]
    );
    return (result.rows[0] as DeviceDetail) || null;
  } catch (err) {
    console.error("Error querying device by ID:", err);
    return null;
  }
}

/**
 * Look up a device by its human-readable asset code (e.g. "DEV-10025").
 */
export async function getDeviceByAssetCode(
  assetCode: string
): Promise<DeviceDetail | null> {
  try {
    const result = await pool.query(
      `SELECT ${SELECT_FIELDS} FROM inventory WHERE LOWER(asset_code) = LOWER($1) OR asset_id::TEXT = $1`,
      [assetCode]
    );
    return (result.rows[0] as DeviceDetail) || null;
  } catch (err) {
    console.error("Error querying device by asset code:", err);
    return null;
  }
}

/**
 * Retrieve device details tailored to a user's role.
 * Server-side authorization strips unpermitted fields before returning to the client.
 */
export async function getDeviceByAssetCodeForRole(
  assetCode: string,
  role: string
): Promise<Partial<DeviceDetail> | null> {
  const device = await getDeviceByAssetCode(assetCode);
  if (!device) return null;

  // Enforce server-side field visibility filtering
  return filterDeviceFields(device, role);
}

/**
 * List devices from the inventory table-like data source.
 */
export async function listInventoryDevices(
  filters?: Partial<Pick<DeviceDetail, "status" | "assetType" | "location">>
): Promise<DeviceDetail[]> {
  let query = `SELECT ${SELECT_FIELDS} FROM inventory WHERE 1=1`;
  const values: any[] = [];
  let index = 1;

  if (filters?.status) {
    query += ` AND status = $${index}`;
    values.push(filters.status);
    index++;
  }

  if (filters?.assetType) {
    query += ` AND LOWER(asset_type) = LOWER($${index})`;
    values.push(filters.assetType);
    index++;
  }

  if (filters?.location) {
    query += ` AND LOWER(location) = LOWER($${index})`;
    values.push(filters.location);
    index++;
  }

  const result = await pool.query(query, values);
  return result.rows as DeviceDetail[];
}

/**
 * List devices based on user roles.
 */
export async function listDevicesByRole(
  role: string,
  userEmail?: string,
  filters?: Partial<Pick<DeviceDetail, "status" | "assetType" | "location">>
): Promise<DeviceDetail[]> {
  const normalizedRole = normalizeRole(role);
  let query = `SELECT ${SELECT_FIELDS} FROM inventory WHERE 1=1`;
  const values: any[] = [];
  let index = 1;

  if (normalizedRole === "Employee") {
    if (!userEmail) return [];
    query += ` AND assigned_user_email = $${index}`;
    values.push(userEmail);
    index++;
  }

  if (filters?.status) {
    query += ` AND status = $${index}`;
    values.push(filters.status);
    index++;
  }

  if (filters?.assetType) {
    query += ` AND LOWER(asset_type) = LOWER($${index})`;
    values.push(filters.assetType);
    index++;
  }

  if (filters?.location) {
    query += ` AND LOWER(location) = LOWER($${index})`;
    values.push(filters.location);
    index++;
  }

  const result = await pool.query(query, values);
  return result.rows as DeviceDetail[];
}
