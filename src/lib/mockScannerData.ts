// ============================================================================
// MOCK DATA & API WIREABLE SERVICES FOR ASSETHUB LENS
// ============================================================================
// Contains mock devices strictly matching the 11 permission fields:
// "assetCode", "assetType", "model", "storage", "operatingSystem",
// "ram", "processor", "purchaseDate", "status", "purchaseAmount", "location"
// ============================================================================

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
  issuer: string;
  account: string;
  secret: string;
  algorithm?: "SHA1" | "SHA256";
  digits?: number;
  period?: number;
  rawPayload: string;
}

// ----------------------------------------------------------------------------
// 1. MOCK ASSET DATABASE (11 EXACT SPEC FIELDS)
// ----------------------------------------------------------------------------
export const MOCK_ASSETS: DeviceDetailView[] = [
  {
    id: "062687ef-ca34-4afc-bd5b-141f97052212",
    assetCode: "TV-LAP-02481",
    assetType: "Laptop",
    model: "MacBook Pro 14-inch (M3 Pro)",
    storage: "1 TB NVMe SSD",
    operatingSystem: "macOS Sequoia 15.3",
    ram: "36 GB Unified Memory",
    processor: "Apple M3 Pro (12-core CPU, 18-core GPU)",
    purchaseDate: "2024-03-18",
    status: "active",
    purchaseAmount: 249900,
    location: "Kochi Infopark - Tower 2, 4th Floor",
  },
  {
    id: "asset-002",
    assetCode: "TV-MON-09124",
    assetType: "Monitor",
    model: "Dell UltraSharp 27 4K USB-C Hub (U2723QE)",
    storage: "N/A",
    operatingSystem: "Embedded Firmware v1.0.4",
    ram: "N/A",
    processor: "Internal 90W PD Display Controller",
    purchaseDate: "2024-08-11",
    status: "active",
    purchaseAmount: 64500,
    location: "Trivandrum Technopark - Phase 3",
  },
  {
    id: "asset-003",
    assetCode: "DEV-10025",
    assetType: "Laptop",
    model: "ThinkPad X1 Carbon Gen 11",
    storage: "512 GB PCIe 4.0 NVMe",
    operatingSystem: "Ubuntu 24.04 LTS",
    ram: "32 GB LPDDR5-6400",
    processor: "Intel Core i7-1365U vPro",
    purchaseDate: "2023-11-20",
    status: "active",
    purchaseAmount: 185000,
    location: "Kochi Infopark - Lab 1",
  },
  {
    id: "asset-004",
    assetCode: "TV-DOC-00341",
    assetType: "Docking Station",
    model: "CalDigit TS4 Thunderbolt 4 Dock",
    storage: "N/A",
    operatingSystem: "Thunderbolt 4 Native",
    ram: "N/A",
    processor: "Intel Goshen Ridge Controller",
    purchaseDate: "2024-01-15",
    status: "active",
    purchaseAmount: 38900,
    location: "Bangalore Office - Hotdesk #4",
  },
];

// ----------------------------------------------------------------------------
// 2. PARSE SCANNED QR CODE (DUAL-MODE: AUTHENTICATOR VS ASSET)
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

  // 4. URL format e.g. "https://.../device?id=..."
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

  // 5. Default: Treat string as Asset Code
  return {
    type: "asset",
    assetCode: trimmed,
    rawPayload: trimmed,
  };
}

// ----------------------------------------------------------------------------
// 3. API-WIREABLE ASSET FETCHER
// ----------------------------------------------------------------------------
/**
 * Look up device details by scanned asset code or ID.
 * 
 * TODO: To wire directly to real backend API:
 *   const res = await fetch(`/api/devices/lookup?code=${encodeURIComponent(code)}`);
 *   const data = await res.json();
 *   return data.device;
 */
export async function fetchDeviceByCode(code: string): Promise<DeviceDetailView | null> {
  const normalized = code.trim().toLowerCase();

  // 1. Check local mock registry
  const found = MOCK_ASSETS.find(
    (a) =>
      a.assetCode.toLowerCase() === normalized ||
      a.id.toLowerCase() === normalized
  );

  if (found) return found;

  // 2. Try fetching from inventory API endpoint if online
  try {
    const res = await fetch(`/api/inventory?code=${encodeURIComponent(code)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.data && json.data.length > 0) {
        const item = json.data[0];
        return {
          id: item.id || `dev-${Date.now()}`,
          assetCode: item.assetCode || code,
          assetType: item.assetType || "Laptop",
          model: item.model || item.name || "Device Unit",
          storage: item.storage || "512 GB SSD",
          operatingSystem: item.operatingSystem || "Windows 11 Enterprise",
          ram: item.ram || "16 GB",
          processor: item.processor || "Intel Core i7",
          purchaseDate: item.purchaseDate || "2024-01-01",
          status: item.status || "active",
          purchaseAmount: item.purchaseAmount || 95000,
          location: item.location || "Headquarters",
        };
      }
    }
  } catch {}

  // 3. Dynamic mock fallback for any unscanned asset label so the UI never displays empty
  return {
    id: `dev-${Date.now()}`,
    assetCode: code.toUpperCase(),
    assetType: "Laptop",
    model: `Enterprise Asset (${code.toUpperCase()})`,
    storage: "512 GB NVMe SSD",
    operatingSystem: "Windows 11 Pro / macOS",
    ram: "16 GB DDR5",
    processor: "Intel Core i7-13700H",
    purchaseDate: "2024-02-15",
    status: "active",
    purchaseAmount: 112000,
    location: "Infopark Campus, Kochi",
  };
}
