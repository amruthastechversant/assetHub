import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  generateTotp,
  getTotpRemainingSeconds,
  parseTotpConfig,
  type TotpConfig,
  isValidTotpSecret,
  createTotpUri,
  verifyTotpCode,
  generateTotpSecret,
} from "../src/utils/totpGenerator.ts";

describe("TOTP Generator Tests (matching inventory-dev-env)", () => {
  test("parses an otpauth URI and object payload into a valid TOTP config", () => {
    const uri =
      "otpauth://totp/Inventory:demo-user?secret=JBSWY3DPEHPK3PXP&issuer=Inventory&algorithm=SHA1&digits=8&period=30";
    const uriConfig = parseTotpConfig(uri);

    assert.ok(uriConfig);
    assert.equal(uriConfig.type, "totp");
    assert.equal(uriConfig.issuer, "Inventory");
    assert.equal(uriConfig.accountName, "demo-user");
    assert.equal(uriConfig.secret, "JBSWY3DPEHPK3PXP");
    assert.equal(uriConfig.digits, 8);
    assert.equal(uriConfig.period, 30);

    const objectConfig = parseTotpConfig({
      SECRET: "JBSWY3DPEHPK3PXP",
      ISSUER: "Inventory",
      LABEL: "demo-user",
      DIGITS: 8,
      PERIOD: 30,
    });

    assert.ok(objectConfig);
    assert.equal(objectConfig.type, "totp");
    assert.equal(objectConfig.issuer, "Inventory");
    assert.equal(objectConfig.accountName, "demo-user");
    assert.equal(objectConfig.secret, "JBSWY3DPEHPK3PXP");
    assert.equal(objectConfig.digits, 8);
    assert.equal(objectConfig.period, 30);
  });

  test("generates a valid TOTP code for a known base32 secret", () => {
    const config: TotpConfig = {
      type: "totp",
      secret: "JBSWY3DPEHPK3PXP",
      digits: 8,
      period: 30,
      algorithm: "SHA1",
      issuer: "Inventory",
      accountName: "demo-user",
    };

    const knownUnixTime = 1700000000;
    const code = generateTotp(config, new Date(knownUnixTime * 1000));
    assert.equal(code, "02324550");
  });

  test("generates standard 6-digit TOTP code correctly", () => {
    const config: TotpConfig = {
      type: "totp",
      secret: "JBSWY3DPEHPK3PXP",
      digits: 6,
      period: 30,
    };

    const knownUnixTime = 1700000000;
    const code = generateTotp(config, new Date(knownUnixTime * 1000));
    assert.equal(code, "324550");
  });

  test("returns a remaining window that decreases as time passes", () => {
    const config: TotpConfig = {
      type: "totp",
      secret: "JBSWY3DPEHPK3PXP",
      digits: 6,
      period: 30,
      algorithm: "SHA1",
    };

    const start = getTotpRemainingSeconds(config, new Date("2024-01-01T00:00:00Z"));
    const after = getTotpRemainingSeconds(config, new Date("2024-01-01T00:00:15Z"));

    assert.equal(start, 30);
    assert.equal(after, 15);
  });

  test("validates Base32 secrets accurately", () => {
    assert.equal(isValidTotpSecret("JBSWY3DPEHPK3PXP"), true);
    assert.equal(isValidTotpSecret("jbswy3dpehpk3pxp"), true);
    assert.equal(isValidTotpSecret("JBSW Y3DP"), true);
    assert.equal(isValidTotpSecret("INVALID_1890!"), false);
    assert.equal(isValidTotpSecret(""), false);
  });

  test("creates valid otpauth URI", () => {
    const config: TotpConfig = {
      type: "totp",
      secret: "JBSWY3DPEHPK3PXP",
      issuer: "Inventory Vault",
      accountName: "admin@techversantinfo.com",
      digits: 6,
      period: 30,
    };

    const uri = createTotpUri(config);
    assert.ok(uri.startsWith("otpauth://totp/"));
    assert.ok(uri.includes("secret=JBSWY3DPEHPK3PXP"));
    assert.ok(uri.includes("digits=6"));
    assert.ok(uri.includes("period=30"));
  });

  test("verifies TOTP code with grace period", () => {
    const secret = generateTotpSecret(20);
    assert.equal(isValidTotpSecret(secret), true);

    const config: TotpConfig = { type: "totp", secret };
    const currentCode = generateTotp(config);

    assert.equal(verifyTotpCode(secret, currentCode), true);
    assert.equal(verifyTotpCode(secret, "000000"), false);
  });
});
