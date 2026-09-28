import { DeviceStatus } from "@/types/device";

export interface DeviceDetailView {
  id: string;
  assetCode: string;
  assetType: string;
  model: string;
  storage: string;
  operatingSystem: string;
  ram: string;
  processor: string;
  purchaseDate: string; // ISO-8601 or YYYY-MM-DD
  status: DeviceStatus;
  purchaseAmount?: number; // In INR (₹)
  location?: string;
}

export interface AuthenticatorTokenData {
  totpId?: string;
  id?: string;
  issuer: string;
  account: string;
  secret: string;
  algorithm?: "SHA1" | "SHA256";
  digits?: number;
  period?: number;
  rawPayload: string;
  createdOn?: string;
  updatedOn?: string;
}

// ----------------------------------------------------------------------------
// PARSE SCANNED QR CODE (DUAL-MODE: AUTHENTICATOR VS ASSET)
// ----------------------------------------------------------------------------
export function parseScannedQr(payload: string): {
  type: "authenticator" | "asset";
  assetCode?: string;
  authData?: AuthenticatorTokenData;
  rawPayload: string;
} {
  const trimmed = payload.trim();

  // 1. Authenticator OTP URI format (RFC 6238)
  if (trimmed.toLowerCase().startsWith("otpauth://")) {
    try {
      const url = new URL(trimmed);
      const pathname = decodeURIComponent(url.pathname.replace(/^\/\/?totp\/?/i, ""));
      const parts = pathname.split(":");
      let issuer = url.searchParams.get("issuer") || "";
      let account = "";

      if (parts.length > 1) {
        if (!issuer) issuer = parts[0].trim();
        account = parts.slice(1).join(":").trim();
      } else {
        account = pathname;
      }

      if (!issuer) issuer = "Authenticator";

      const secret = (url.searchParams.get("secret") || "").toUpperCase();
      const algorithm = (url.searchParams.get("algorithm")?.toUpperCase() || "SHA1") as "SHA1" | "SHA256";
      const digits = parseInt(url.searchParams.get("digits") || "6", 10);
      const period = parseInt(url.searchParams.get("period") || "30", 10);

      return {
        type: "authenticator",
        authData: {
          issuer,
          account,
          secret,
          algorithm,
          digits,
          period,
          rawPayload: trimmed,
        },
        rawPayload: trimmed,
      };
    } catch {
      const secretMatch = trimmed.match(/secret=([A-Z0-9]+)/i);
      if (secretMatch) {
        return {
          type: "authenticator",
          authData: {
            issuer: "Authenticator",
            account: "User Account",
            secret: secretMatch[1].toUpperCase(),
            algorithm: "SHA1",
            digits: 6,
            period: 30,
            rawPayload: trimmed,
          },
          rawPayload: trimmed,
        };
      }
    }
  }

  // 2. JSON Payload
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const json = JSON.parse(trimmed);
      if (json.secret || json.type === "totp" || json.type === "authenticator") {
        return {
          type: "authenticator",
          authData: {
            issuer: json.issuer || "Authenticator",
            account: json.account || "Account",
            secret: (json.secret || "").toUpperCase(),
            algorithm: json.algorithm || "SHA1",
            digits: json.digits || 6,
            period: json.period || 30,
            rawPayload: trimmed,
          },
          rawPayload: trimmed,
        };
      }
      if (json.assetCode || json.assetId || json.id) {
        return {
          type: "asset",
          assetCode: json.assetCode || json.assetId || json.id,
          rawPayload: trimmed,
        };
      }
    } catch {}
  }

  // 3. Asset Prefix e.g. "ASSET:TV-LAP-02481"
  if (trimmed.startsWith("ASSET:")) {
    return {
      type: "asset",
      assetCode: trimmed.replace("ASSET:", "").trim(),
      rawPayload: trimmed,
    };
  }

  // 4. URL format e.g. "https://.../device?id=..." or "https://.../device/TV-LAP-02481"
  if (trimmed.includes("/device")) {
    try {
      const parsedUrl = new URL(trimmed);
      const idParam = parsedUrl.searchParams.get("id");
      if (idParam) {
        return {
          type: "asset",
          assetCode: idParam,
          rawPayload: trimmed,
        };
      }
      const segments = parsedUrl.pathname.split("/").filter(Boolean);
      const last = segments[segments.length - 1];
      if (last && last !== "device") {
        return {
          type: "asset",
          assetCode: last,
          rawPayload: trimmed,
        };
      }
    } catch {}
  }

  // 5. Default: Treat raw string directly as Asset Code
  return {
    type: "asset",
    assetCode: trimmed,
    rawPayload: trimmed,
  };
}

// ----------------------------------------------------------------------------
// ASSET INVENTORY FETCHER
// ----------------------------------------------------------------------------
/**
 * Look up device details by scanned asset code or ID from the inventory database.
 */
export async function fetchDeviceByCode(code: string): Promise<DeviceDetailView | null> {
  const trimmed = code?.trim();
  if (!trimmed) return null;

  try {
    const res = await fetch(`/api/inventory?code=${encodeURIComponent(trimmed)}`);
    if (!res.ok) {
      return null;
    }
    const json = await res.json();
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      const item = json.data[0];
      return {
        id: String(item.id || item.assetId || ""),
        assetCode: String(item.assetCode || trimmed),
        assetType: item.assetType || "Hardware",
        model: item.model || item.name || "Device Unit",
        storage: item.storage || "N/A",
        operatingSystem: item.operatingSystem || "N/A",
        ram: item.ram || "N/A",
        processor: item.processor || "N/A",
        purchaseDate: item.purchaseDate || "N/A",
        status: item.status || "active",
        purchaseAmount: item.purchaseAmount ?? undefined,
        location: item.location || "N/A",
      };
    }
  } catch (err) {
    console.error("Error fetching device by code from inventory API:", err);
  }

  // Not found in database
  return null;
}
