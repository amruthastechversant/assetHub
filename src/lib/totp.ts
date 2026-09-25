import {
  generateTotp,
  getTotpRemainingSeconds,
  parseTotpConfig,
  createTotpUri,
  isValidTotpSecret,
  generateTotpSecret,
  verifyTotpCode,
  base32Decode,
  type TotpConfig,
  type TotpState,
} from "@/utils/totpGenerator";

export {
  generateTotp,
  getTotpRemainingSeconds,
  parseTotpConfig,
  createTotpUri,
  isValidTotpSecret,
  generateTotpSecret,
  verifyTotpCode,
  base32Decode,
};
export type { TotpConfig, TotpState };

/**
 * Decode a Base32 encoded string into a Uint8Array.
 */
export function base32ToBytes(base32: string): Uint8Array {
  return base32Decode(base32);
}

/**
 * Generate a 6 or 8-digit TOTP code for a given secret and current timestamp.
 * Powered by pure RFC 6238 totpGenerator (identical to inventory-dev-env).
 */
export async function generateTOTP(
  secret: string,
  options: {
    timeStep?: number;
    digits?: number;
    algorithm?: "SHA-1" | "SHA-256" | "SHA-512" | "SHA1" | "SHA256" | "SHA512";
    timestamp?: number;
  } = {}
): Promise<string> {
  const period = options.timeStep || 30;
  const digits = options.digits || 6;
  const date = options.timestamp !== undefined ? new Date(options.timestamp) : new Date();

  const config: TotpConfig = {
    type: "totp",
    secret,
    period,
    digits,
    algorithm: "SHA1",
  };

  return generateTotp(config, date);
}

/**
 * Get remaining seconds in the current TOTP cycle.
 */
export function getRemainingSeconds(period = 30): {
  remaining: number;
  percentage: number;
} {
  const config: TotpConfig = { type: "totp", secret: "", period };
  const remaining = getTotpRemainingSeconds(config);
  const percentage = (remaining / period) * 100;
  return { remaining, percentage };
}

/**
 * Format a 6-digit OTP code with a clean center space: e.g. "482 195"
 */
export function formatOtpCode(code: string): string {
  if (code && code.length === 6) {
    return `${code.slice(0, 3)} ${code.slice(3)}`;
  }
  return code;
}
