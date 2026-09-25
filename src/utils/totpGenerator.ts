export interface TotpConfig {
  type: 'totp';
  issuer?: string;
  accountName?: string;
  secret: string;
  algorithm?: string;
  digits?: number;
  period?: number;
}

export interface TotpState {
  code: string;
  counter: number;
  period: number;
  remainingSeconds: number;
  expiresAt: number;
}

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

const normalizeAlgorithm = (algorithm?: string) => {
  const value = (algorithm || 'SHA1').toUpperCase();
  if (value === 'SHA1' || value === 'SHA-1') return 'SHA1';
  if (value === 'SHA256' || value === 'SHA-256') return 'SHA256';
  if (value === 'SHA512' || value === 'SHA-512') return 'SHA512';
  throw new Error(`Unsupported TOTP algorithm: ${algorithm}`);
};

const normalizeDigits = (digits = 6) => {
  const value = Number(digits || 6);
  if (!Number.isFinite(value) || value < 4 || value > 12) {
    return 6;
  }
  return value;
};

const normalizePeriod = (period = 30) => {
  const value = Number(period || 30);
  if (!Number.isFinite(value) || value <= 0) {
    return 30;
  }
  return value;
};

const uint8ToHex = (bytes: Uint8Array) =>
  Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

const hexToUint8 = (hex: string) => {
  const clean = hex.replace(/\s+/g, '');
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = Number.parseInt(clean.slice(i, i + 2), 16);
  }
  return bytes;
};

export const isValidTotpSecret = (secret?: string): boolean => {
  if (!secret) return false;
  const clean = secret.replace(/\s+/g, '').toUpperCase().replace(/=+$/, '');
  return !!clean && /^[A-Z2-7]+$/.test(clean);
};

export const base32Decode = (value: string): Uint8Array => {
  const clean = value.replace(/\s+/g, '').toUpperCase().replace(/=+$/, '');
  if (!clean || !/^[A-Z2-7]+$/.test(clean)) {
    return new Uint8Array();
  }

  let bits = '';
  for (const char of clean) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) {
      return new Uint8Array();
    }
    bits += index.toString(2).padStart(5, '0');
  }

  const bytes: number[] = [];
  for (let i = 0; i + 7 < bits.length; i += 8) {
    const chunk = bits.slice(i, i + 8);
    bytes.push(parseInt(chunk, 2));
  }

  return new Uint8Array(bytes);
};

const leftRotate = (value: number, shift: number) => ((value << shift) | (value >>> (32 - shift))) >>> 0;

export const sha1 = (message: Uint8Array): Uint8Array => {
  const bytes = Array.from(message);
  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;
  let h4 = 0xc3d2e1f0;

  const totalBits = BigInt(bytes.length) * BigInt(8);
  const padded = [...bytes, 0x80];
  while (padded.length % 64 !== 56) {
    padded.push(0);
  }

  for (let i = 0; i < 8; i += 1) {
    padded.push(Number((totalBits >> BigInt((7 - i) * 8)) & BigInt(0xff)));
  }

  for (let chunkIndex = 0; chunkIndex < padded.length; chunkIndex += 64) {
    const w = new Array<number>(80).fill(0);
    for (let i = 0; i < 16; i += 1) {
      const base = chunkIndex + i * 4;
      w[i] = (
        (padded[base] << 24) |
        (padded[base + 1] << 16) |
        (padded[base + 2] << 8) |
        padded[base + 3]
      ) >>> 0;
    }

    for (let i = 16; i < 80; i += 1) {
      w[i] = leftRotate(w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16], 1);
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;

    for (let i = 0; i < 80; i += 1) {
      let f = 0;
      let k = 0;
      if (i < 20) {
        f = (b & c) | (~b & d);
        k = 0x5a827999;
      } else if (i < 40) {
        f = b ^ c ^ d;
        k = 0x6ed9eba1;
      } else if (i < 60) {
        f = (b & c) | (b & d) | (c & d);
        k = 0x8f1bbcdc;
      } else {
        f = b ^ c ^ d;
        k = 0xca62c1d6;
      }

      const temp = (leftRotate(a, 5) + f + e + k + w[i]) >>> 0;
      e = d;
      d = c;
      c = leftRotate(b, 30) >>> 0;
      b = a;
      a = temp;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
  }

  return new Uint8Array([
    (h0 >>> 24) & 0xff,
    (h0 >>> 16) & 0xff,
    (h0 >>> 8) & 0xff,
    h0 & 0xff,
    (h1 >>> 24) & 0xff,
    (h1 >>> 16) & 0xff,
    (h1 >>> 8) & 0xff,
    h1 & 0xff,
    (h2 >>> 24) & 0xff,
    (h2 >>> 16) & 0xff,
    (h2 >>> 8) & 0xff,
    h2 & 0xff,
    (h3 >>> 24) & 0xff,
    (h3 >>> 16) & 0xff,
    (h3 >>> 8) & 0xff,
    h3 & 0xff,
    (h4 >>> 24) & 0xff,
    (h4 >>> 16) & 0xff,
    (h4 >>> 8) & 0xff,
    h4 & 0xff,
  ]);
};

export const hmacSha1 = (key: Uint8Array, message: Uint8Array): Uint8Array => {
  const blockSize = 64;
  const normalizedKey = key.length > blockSize ? sha1(key) : key;
  const innerKey = new Uint8Array(blockSize);
  const outerKey = new Uint8Array(blockSize);

  for (let i = 0; i < blockSize; i += 1) {
    const k = i < normalizedKey.length ? normalizedKey[i] : 0;
    innerKey[i] = k ^ 0x36;
    outerKey[i] = k ^ 0x5c;
  }

  const innerMessage = new Uint8Array(innerKey.length + message.length);
  innerMessage.set(innerKey, 0);
  innerMessage.set(message, innerKey.length);

  const innerDigest = sha1(innerMessage);
  const outerMessage = new Uint8Array(outerKey.length + innerDigest.length);
  outerMessage.set(outerKey, 0);
  outerMessage.set(innerDigest, outerKey.length);

  return sha1(outerMessage);
};

export const getTotpCounter = (period = 30, date = new Date()) =>
  Math.floor(date.getTime() / 1000 / period);

export const getTotpRemainingSeconds = (config: TotpConfig, date = new Date()) => {
  const period = normalizePeriod(config.period);
  const elapsed = Math.floor(date.getTime() / 1000) % period;
  return period - elapsed;
};

export const generateTotp = (config: TotpConfig, date = new Date()): string => {
  const algorithm = normalizeAlgorithm(config.algorithm);
  if (algorithm !== 'SHA1') {
    throw new Error('This TOTP generator currently supports SHA1.');
  }

  const digits = normalizeDigits(config.digits);
  const period = normalizePeriod(config.period);
  const secret = config.secret?.trim();
  if (!secret || !isValidTotpSecret(secret)) {
    return '';
  }

  const secretBytes = base32Decode(secret);
  if (secretBytes.length === 0) {
    return '';
  }

  const counter = BigInt(getTotpCounter(period, date));
  const counterBuffer = new ArrayBuffer(8);
  const view = new DataView(counterBuffer);
  const mask = BigInt(0xffffffff);
  view.setUint32(0, Number((counter >> BigInt(32)) & mask));
  view.setUint32(4, Number(counter & mask));

  const digest = hmacSha1(secretBytes, new Uint8Array(counterBuffer));
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    (((digest[offset] & 0x7f) << 24) |
      ((digest[offset + 1] & 0xff) << 16) |
      ((digest[offset + 2] & 0xff) << 8) |
      (digest[offset + 3] & 0xff)) >>>
    0;

  const otp = binary % 10 ** digits;
  return otp.toString().padStart(digits, '0');
};

export const getTotpState = (config: TotpConfig, date = new Date()): TotpState => {
  const period = normalizePeriod(config.period);
  const counter = getTotpCounter(period, date);
  const remainingSeconds = getTotpRemainingSeconds(config, date);
  const expiresAt = Math.floor(date.getTime() / 1000) + remainingSeconds;

  return {
    code: generateTotp(config, date),
    counter,
    period,
    remainingSeconds,
    expiresAt,
  };
};

export const parseTotpConfig = (value: unknown): TotpConfig | null => {
  if (value == null) return null;

  if (typeof value === 'string') {
    const input = value.trim();
    if (!input) return null;

    if (/^otpauth:\/\//i.test(input)) {
      try {
        const parsed = new URL(input);
        const secret = parsed.searchParams.get('secret');
        if (!secret) return null;

        const issuer = parsed.searchParams.get('issuer') || undefined;
        const label = parsed.pathname.replace(/^\/+/, '');
        const accountName = label.includes(':') ? decodeURIComponent(label.split(':').slice(1).join(':')) : decodeURIComponent(label);

        return {
          type: 'totp',
          issuer: issuer || undefined,
          accountName: accountName || undefined,
          secret: secret.trim(),
          algorithm: parsed.searchParams.get('algorithm') || 'SHA1',
          digits: normalizeDigits(Number(parsed.searchParams.get('digits') || 6)),
          period: normalizePeriod(Number(parsed.searchParams.get('period') || 30)),
        };
      } catch {
        return null;
      }
    }

    const urlSecret = input.match(/[?&]secret=([^&]+)/i)?.[1];
    if (urlSecret) {
      const params = new URLSearchParams(input.split('?')[1] || '');
      return {
        type: 'totp',
        issuer: params.get('issuer') || undefined,
        accountName: undefined,
        secret: decodeURIComponent(urlSecret),
        algorithm: params.get('algorithm') || 'SHA1',
        digits: normalizeDigits(Number(params.get('digits') || 6)),
        period: normalizePeriod(Number(params.get('period') || 30)),
      };
    }

    return {
      type: 'totp',
      secret: input.replace(/\s+/g, '').replace(/=+$/, ''),
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
    };
  }

  if (typeof value === 'object') {
    const source = value as Record<string, any>;
    const secret =
      source.secret ??
      source.SECRET ??
      source.key ??
      source.KEY ??
      source.data ??
      source.DATA ??
      source.value ??
      source.VALUE;

    if (!secret || typeof secret === 'object') {
      return null;
    }

    const issuer = source.issuer ?? source.ISSUER ?? source.company ?? source.COMPANY;
    const accountName =
      source.accountName ??
      source.ACCOUNTNAME ??
      source.label ??
      source.LABEL ??
      source.name ??
      source.NAME ??
      source.title ??
      source.TITLE;

    return {
      type: 'totp',
      issuer: issuer || undefined,
      accountName: accountName || undefined,
      secret: String(secret).trim(),
      algorithm: (source.algorithm ?? source.ALGORITHM ?? 'SHA1').toUpperCase(),
      digits: normalizeDigits(Number(source.digits ?? source.DIGITS ?? 6)),
      period: normalizePeriod(Number(source.period ?? source.PERIOD ?? 30)),
    };
  }

  return null;
};

export const createTotpUri = (config: TotpConfig) => {
  const label = encodeURIComponent(config.accountName || 'user');
  const issuer = encodeURIComponent(config.issuer || 'Inventory');
  const secret = encodeURIComponent((config.secret || '').trim());
  return `otpauth://totp/${issuer}:${label}?secret=${secret}&issuer=${issuer}&algorithm=${encodeURIComponent(normalizeAlgorithm(config.algorithm))}&digits=${normalizeDigits(config.digits)}&period=${normalizePeriod(config.period)}`;
};

/**
 * Generate a cryptographically random Base32 secret string (20 chars default).
 * Compatible with ColdFusion VaultAuthenticator.generateSecret()
 */
export const generateTotpSecret = (length = 20): string => {
  const chars = BASE32_ALPHABET;
  let secret = '';
  // Works in both browser and Node.js
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const randomBytes = new Uint8Array(length);
    crypto.getRandomValues(randomBytes);
    for (let i = 0; i < length; i++) {
      secret += chars[randomBytes[i] % chars.length];
    }
  } else {
    for (let i = 0; i < length; i++) {
      secret += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  return secret;
};

/**
 * Verify a user-provided TOTP token against a secret with clock-drift grace periods.
 * Compatible with ColdFusion VaultAuthenticator.verifyGoogleToken(secret, userValue, grace=1)
 */
export const verifyTotpCode = (
  secret: string,
  userCode: string,
  grace = 1,
  period = 30,
  digits = 6
): boolean => {
  if (!secret || !userCode) return false;
  const cleanCode = userCode.trim().replace(/\s+/g, '');
  const config: TotpConfig = {
    type: 'totp',
    secret,
    digits,
    period,
    algorithm: 'SHA1',
  };

  const now = new Date();
  for (let offset = 0; offset <= grace; offset++) {
    // Check current interval and prior interval(s) to handle clock drift
    const checkDate = new Date(now.getTime() - offset * period * 1000);
    if (generateTotp(config, checkDate) === cleanCode) {
      return true;
    }
  }
  return false;
};

export const __debugTotp = {
  base32Decode,
  sha1,
  hmacSha1,
  uint8ToHex,
  hexToUint8,
};

export default generateTotp;
