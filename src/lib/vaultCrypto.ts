import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96 bits for GCM
const TAG_LENGTH = 16; // 128 bits auth tag

function getDerivedKey(): Buffer {
  const secret = process.env.AUTH_SECRET || "assethub-default-vault-secret-key-32b";
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Encrypts a string (or JSON payload) using AES-256-GCM.
 * Output format: base64(iv + authTag + ciphertext)
 */
export function encryptVaultData(plaintext: string): string {
  try {
    const key = getDerivedKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const encrypted = Buffer.concat([
      cipher.update(plaintext, "utf8"),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();

    const combined = Buffer.concat([iv, tag, encrypted]);
    return combined.toString("base64");
  } catch (err) {
    console.error("Vault encryption error:", err);
    // Fallback: base64 encode if crypto fails
    return Buffer.from(plaintext, "utf8").toString("base64");
  }
}

/**
 * Decrypts ciphertext encrypted with encryptVaultData.
 * Falls back gracefully to base64 or plaintext JSON if legacy or unencrypted.
 */
export function decryptVaultData(ciphertext: string): string {
  if (!ciphertext) return "";

  try {
    const key = getDerivedKey();
    const combined = Buffer.from(ciphertext, "base64");

    if (combined.length >= IV_LENGTH + TAG_LENGTH) {
      const iv = combined.subarray(0, IV_LENGTH);
      const tag = combined.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
      const encrypted = combined.subarray(IV_LENGTH + TAG_LENGTH);

      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
      decipher.setAuthTag(tag);

      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
      ]);
      return decrypted.toString("utf8");
    }
  } catch {
    // If GCM decryption fails, attempt base64 decode
    try {
      const base64Decoded = Buffer.from(ciphertext, "base64").toString("utf8");
      if (base64Decoded.startsWith("{") || base64Decoded.startsWith("otpauth://")) {
        return base64Decoded;
      }
    } catch { }
  }

  // If already plain text (e.g., JSON or URI)
  return ciphertext;
}
