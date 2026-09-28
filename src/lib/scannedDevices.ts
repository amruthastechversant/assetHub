import pool from "./db.ts";
import { getDeviceByAssetCode, getDeviceById } from "./device.ts";
import type { DeviceDetail } from "../types/device.ts";
import crypto from "crypto";

export interface ScannedDeviceEntry {
  deviceId: string;
  scannedAt: string; // ISO-8601 timestamp string
}

export interface EnrichedScannedDeviceEntry {
  deviceId: string;
  scannedAt: string;
  device: DeviceDetail | null;
}

/**
 * Pure helper function to update the scanned devices JSON array.
 * - Handles duplicate devices: removes existing entry, adds to the beginning with updated timestamp.
 * - Caps history at max 10 unique items.
 * - Preserves newest -> oldest ordering.
 */
export function processScannedDeviceHistoryArray(
  existingList: ScannedDeviceEntry[],
  newDeviceId: string,
  scannedAtIso?: string
): ScannedDeviceEntry[] {
  const timestamp = scannedAtIso || new Date().toISOString();
  const trimmedId = newDeviceId.trim();

  // Filter out any existing matching entry (case-insensitive deduplication)
  const filtered = (existingList || []).filter(
    (item) => item.deviceId.toLowerCase() !== trimmedId.toLowerCase()
  );

  const newItem: ScannedDeviceEntry = {
    deviceId: trimmedId,
    scannedAt: timestamp,
  };

  // Prepend newest item and keep maximum 10 items
  return [newItem, ...filtered].slice(0, 10);
}

/**
 * Resolves a valid UUID string for the authenticated user from session.
 */
export async function getUserIdFromSession(session: any): Promise<string | null> {
  if (!session?.user) return null;

  // 1. Check if session already has a valid UUID in session.user.id
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (session.user.id && uuidRegex.test(session.user.id)) {
    return session.user.id;
  }

  // 2. Query users table by email if email exists
  const email = session.user.email;
  if (email) {
    try {
      const res = await pool.query(
        `SELECT user_id FROM users WHERE LOWER(email_id) = LOWER($1) LIMIT 1`,
        [email]
      );
      if (res.rows.length > 0 && res.rows[0].user_id) {
        return res.rows[0].user_id;
      }
    } catch (err) {
      console.warn("Error querying user_id from database:", err);
    }

    // 3. Fallback: generate a deterministic UUID v4 based on user email
    const hash = crypto.createHash("md5").update(email.toLowerCase()).digest("hex");
    return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
  }

  return null;
}

/**
 * Record a scanned device for a user in user_scanned_device_history.
 */
export async function recordScannedDevice(
  userId: string,
  deviceId: string
): Promise<{ success: boolean; lastScanned: ScannedDeviceEntry; devices: ScannedDeviceEntry[] }> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const existingRes = await client.query(
      `SELECT user_scanned_id, scanned_devices FROM user_scanned_device_history WHERE scanned_by = $1 FOR UPDATE`,
      [userId]
    );

    let currentList: ScannedDeviceEntry[] = [];
    let userScannedId: string | null = null;

    if (existingRes.rows.length > 0) {
      userScannedId = existingRes.rows[0].user_scanned_id;
      const rawDevices = existingRes.rows[0].scanned_devices;
      if (Array.isArray(rawDevices)) {
        currentList = rawDevices;
      } else if (typeof rawDevices === "string") {
        try {
          currentList = JSON.parse(rawDevices);
        } catch {}
      }
    }

    const updatedList = processScannedDeviceHistoryArray(currentList, deviceId);

    if (userScannedId) {
      await client.query(
        `UPDATE user_scanned_device_history 
         SET scanned_devices = $1::jsonb, scanned_at = NOW(), updated_on = NOW() 
         WHERE user_scanned_id = $2`,
        [JSON.stringify(updatedList), userScannedId]
      );
    } else {
      await client.query(
        `INSERT INTO user_scanned_device_history (scanned_by, scanned_devices, scanned_at, updated_on) 
         VALUES ($1, $2::jsonb, NOW(), NOW())`,
        [userId, JSON.stringify(updatedList)]
      );
    }

    await client.query("COMMIT");
    return {
      success: true,
      lastScanned: updatedList[0],
      devices: updatedList,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Fetch the last scanned device for a user.
 */
export async function getLastScannedDevice(
  userId: string
): Promise<EnrichedScannedDeviceEntry | null> {
  const res = await pool.query(
    `SELECT scanned_devices FROM user_scanned_device_history WHERE scanned_by = $1 LIMIT 1`,
    [userId]
  );

  if (res.rows.length === 0) return null;

  let scannedDevices: ScannedDeviceEntry[] = res.rows[0].scanned_devices || [];
  if (typeof scannedDevices === "string") {
    try {
      scannedDevices = JSON.parse(scannedDevices);
    } catch {
      scannedDevices = [];
    }
  }

  if (!Array.isArray(scannedDevices) || scannedDevices.length === 0) {
    return null;
  }

  const lastItem = scannedDevices[0];
  const device =
    (await getDeviceByAssetCode(lastItem.deviceId)) ||
    (await getDeviceById(lastItem.deviceId));

  return {
    deviceId: lastItem.deviceId,
    scannedAt: lastItem.scannedAt,
    device,
  };
}

/**
 * Fetch recent scanned devices for a user (up to 10 items).
 */
export async function getRecentScannedDevices(
  userId: string
): Promise<EnrichedScannedDeviceEntry[]> {
  const res = await pool.query(
    `SELECT scanned_devices FROM user_scanned_device_history WHERE scanned_by = $1 LIMIT 1`,
    [userId]
  );

  if (res.rows.length === 0) return [];

  let scannedDevices: ScannedDeviceEntry[] = res.rows[0].scanned_devices || [];
  if (typeof scannedDevices === "string") {
    try {
      scannedDevices = JSON.parse(scannedDevices);
    } catch {
      scannedDevices = [];
    }
  }

  if (!Array.isArray(scannedDevices) || scannedDevices.length === 0) {
    return [];
  }

  const enrichedList: EnrichedScannedDeviceEntry[] = await Promise.all(
    scannedDevices.slice(0, 10).map(async (item) => {
      const device =
        (await getDeviceByAssetCode(item.deviceId)) ||
        (await getDeviceById(item.deviceId));
      return {
        deviceId: item.deviceId,
        scannedAt: item.scannedAt,
        device,
      };
    })
  );

  return enrichedList;
}
