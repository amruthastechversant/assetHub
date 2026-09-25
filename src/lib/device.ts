import pool from "./db";
import { filterDeviceFields, normalizeRole } from "./permissions";
import { Device, DeviceDetail } from "@/types/device";

export type { Device, DeviceDetail };

const SELECT_FIELDS = `
  i.asset_id AS id, 
  i.model AS name, 
  COALESCE(att.asset_type, i.asset_type::TEXT, 'Device') AS "assetType", 
  i.asset_code AS "serialNumber", 
  i.status, 
  i.asset_code AS "assetCode", 
  i.model, 
  i.storage, 
  i.os AS "operatingSystem", 
  i.ram, 
  i.processor, 
  TO_CHAR(i.purchase_date, 'YYYY-MM-DD') AS "purchaseDate", 
  CAST(i.purchase_amount AS DOUBLE PRECISION) AS "purchaseAmount", 
  COALESCE(loc.location_name, i.location::TEXT, 'Unknown') AS location,
  u.name AS "assignedUser",
  u.email_id AS "assignedUserEmail"
`;

const FROM_CLAUSE = `
  inventory i
  LEFT JOIN asset_type_table att ON i.asset_type = att.asset_type_id
  LEFT JOIN locations loc ON i.location = loc.location_id
  LEFT JOIN assigned_assets aa ON i.asset_id = aa.asset_id AND aa.active = true
  LEFT JOIN users u ON aa.user_id = u.user_id
`;

/**
 * Look up a device by its internal ID or serial number.
 */
export async function getDeviceById(id: string): Promise<DeviceDetail | null> {
  try {
    const result = await pool.query(
      `SELECT ${SELECT_FIELDS} FROM ${FROM_CLAUSE} WHERE i.asset_id::TEXT = $1 OR i.asset_code = $1`,
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
      `SELECT ${SELECT_FIELDS} FROM ${FROM_CLAUSE} WHERE LOWER(i.asset_code) = LOWER($1) OR i.asset_id::TEXT = $1`,
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
  let query = `SELECT ${SELECT_FIELDS} FROM ${FROM_CLAUSE} WHERE 1=1`;
  const values: any[] = [];
  let index = 1;

  if (filters?.status) {
    query += ` AND i.status = $${index}`;
    values.push(filters.status);
    index++;
  }

  if (filters?.assetType) {
    query += ` AND (LOWER(att.asset_type) = LOWER($${index}) OR LOWER(i.asset_type::TEXT) = LOWER($${index}))`;
    values.push(filters.assetType);
    index++;
  }

  if (filters?.location) {
    query += ` AND (LOWER(loc.location_name) = LOWER($${index}) OR LOWER(i.location::TEXT) = LOWER($${index}))`;
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
  let query = `SELECT ${SELECT_FIELDS} FROM ${FROM_CLAUSE} WHERE 1=1`;
  const values: any[] = [];
  let index = 1;

  if (normalizedRole === "Employee") {
    if (!userEmail) return [];
    query += ` AND LOWER(u.email_id) = LOWER($${index})`;
    values.push(userEmail);
    index++;
  }

  if (filters?.status) {
    query += ` AND i.status = $${index}`;
    values.push(filters.status);
    index++;
  }

  if (filters?.assetType) {
    query += ` AND (LOWER(att.asset_type) = LOWER($${index}) OR LOWER(i.asset_type::TEXT) = LOWER($${index}))`;
    values.push(filters.assetType);
    index++;
  }

  if (filters?.location) {
    query += ` AND (LOWER(loc.location_name) = LOWER($${index}) OR LOWER(i.location::TEXT) = LOWER($${index}))`;
    values.push(filters.location);
    index++;
  }

  const result = await pool.query(query, values);
  return result.rows as DeviceDetail[];
}
