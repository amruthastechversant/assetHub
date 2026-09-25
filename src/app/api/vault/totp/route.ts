import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import pool from "@/lib/db";
import { encryptVaultData, decryptVaultData } from "@/lib/vaultCrypto";
import { parseTotpConfig } from "@/utils/totpGenerator";

/**
 * GET /api/vault/totp
 * Retrieves active TOTP authenticator tokens for the authenticated user.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json(
      { success: false, error: "Unauthorized", statusCode: 401 },
      { status: 401 }
    );
  }

  const client = await pool.connect();
  try {
    const userRes = await client.query<{ user_id: string }>(
      `SELECT user_id FROM users WHERE LOWER(email_id) = LOWER($1) AND active = true LIMIT 1`,
      [session.user.email]
    );

    if (userRes.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: "User not found", statusCode: 404 },
        { status: 404 }
      );
    }

    const userId = userRes.rows[0].user_id;

    const res = await client.query<{
      totp_id: string;
      account_name: string;
      encrypted_data: string | null;
      created_on: string;
      updated_on: string;
    }>(
      `SELECT totp_id, account_name, encrypted_data, created_on, updated_on
       FROM totp_data
       WHERE active = true AND created_by = $1
       ORDER BY created_on DESC`,
      [userId]
    );

    const tokens = [];

    for (const row of res.rows) {
      if (!row.encrypted_data) continue;

      let secret = "";
      let issuer = row.account_name || "Authenticator";
      let account = "";
      let digits = 6;
      let period = 30;
      let algorithm: "SHA1" | "SHA256" = "SHA1";
      let rawPayload = "";

      try {
        const decrypted = decryptVaultData(row.encrypted_data);

        // Check if decrypted string is a JSON object or URI
        if (decrypted.trim().startsWith("{")) {
          const parsed = JSON.parse(decrypted);
          const dataObj = parsed.qrData || parsed;
          secret = dataObj.secret || dataObj.Secret || "";
          issuer = row.account_name || dataObj.issuer || dataObj.accountName || "Authenticator";
          account = dataObj.account || dataObj.accountName || "";
          digits = dataObj.digits || 6;
          period = dataObj.period || 30;
          algorithm = dataObj.algorithm === "SHA256" ? "SHA256" : "SHA1";
          rawPayload = dataObj.rawPayload || "";
        } else if (decrypted.startsWith("otpauth://")) {
          const parsed = parseTotpConfig(decrypted);
          if (parsed) {
            secret = parsed.secret;
            issuer = row.account_name || parsed.issuer || "Authenticator";
            account = parsed.accountName || "";
            digits = parsed.digits || 6;
            period = parsed.period || 30;
            algorithm = parsed.algorithm === "SHA256" ? "SHA256" : "SHA1";
            rawPayload = decrypted;
          }
        }
      } catch (err) {
        console.error("Failed to parse decrypted TOTP data:", err);
      }

      if (secret) {
        tokens.push({
          totpId: row.totp_id,
          id: row.totp_id,
          issuer,
          account,
          secret,
          digits,
          period,
          algorithm,
          rawPayload,
          createdOn: row.created_on,
          updatedOn: row.updated_on,
        });
      }
    }

    return NextResponse.json({
      success: true,
      tokens,
      totalCount: tokens.length,
    });
  } catch (err: any) {
    console.error("GET /api/vault/totp error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch TOTP tokens" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

/**
 * POST /api/vault/totp
 * Enrolls and saves a new TOTP token into totp_data.
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json(
      { success: false, error: "Unauthorized", statusCode: 401 },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const qrData = body.qrData || body;
    const accountName = (body.accountName || qrData.issuer || qrData.account || "Authenticator").trim();

    if (!qrData.secret && !qrData.rawPayload) {
      return NextResponse.json(
        { success: false, error: "TOTP secret is required" },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      const userRes = await client.query<{ user_id: string }>(
        `SELECT user_id FROM users WHERE LOWER(email_id) = LOWER($1) AND active = true LIMIT 1`,
        [session.user.email]
      );

      if (userRes.rowCount === 0) {
        return NextResponse.json(
          { success: false, error: "User not found", statusCode: 404 },
          { status: 404 }
        );
      }

      const userId = userRes.rows[0].user_id;

      // Encrypt the TOTP payload
      const encryptedData = encryptVaultData(JSON.stringify(qrData));

      const insertRes = await client.query<{ totp_id: string }>(
        `INSERT INTO totp_data (account_name, encrypted_data, created_by, created_on, updated_on, active)
         VALUES ($1, $2, $3, NOW(), NOW(), true)
         RETURNING totp_id`,
        [accountName, encryptedData, userId]
      );

      const totpId = insertRes.rows[0].totp_id;

      return NextResponse.json({
        success: true,
        message: "TOTP created successfully",
        totpId,
        accountName,
      });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error("POST /api/vault/totp error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to create TOTP" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/vault/totp
 * Renames / updates an existing TOTP token's account_name.
 */
export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json(
      { success: false, error: "Unauthorized", statusCode: 401 },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const totpId = body.totpId || body.id;
    const accountName = (body.accountName || body.issuer || body.name || "").trim();

    if (!accountName) {
      return NextResponse.json(
        { success: false, error: "accountName is required" },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      const userRes = await client.query<{ user_id: string }>(
        `SELECT user_id FROM users WHERE LOWER(email_id) = LOWER($1) AND active = true LIMIT 1`,
        [session.user.email]
      );

      if (userRes.rowCount === 0) {
        return NextResponse.json(
          { success: false, error: "User not found", statusCode: 404 },
          { status: 404 }
        );
      }

      const userId = userRes.rows[0].user_id;

      if (totpId) {
        const updateRes = await client.query(
          `UPDATE totp_data
           SET account_name = $1, updated_on = NOW()
           WHERE totp_id = $2::uuid AND created_by = $3::uuid AND active = true
           RETURNING totp_id, account_name`,
          [accountName, totpId, userId]
        );

        if (updateRes.rowCount && updateRes.rowCount > 0) {
          return NextResponse.json({
            success: true,
            message: "TOTP updated successfully",
            totpId,
            accountName,
          });
        }
      }

      // If no totpId or not found by totpId, check if qrData or secret is passed to update/upsert
      if (body.qrData || body.secret) {
        const qrData = body.qrData || {
          secret: body.secret,
          issuer: accountName,
          account: body.account || "",
          digits: body.digits || 6,
          period: body.period || 30,
          algorithm: body.algorithm || "SHA1",
          rawPayload: body.rawPayload || "",
        };

        const encryptedData = encryptVaultData(JSON.stringify(qrData));

        const insertRes = await client.query<{ totp_id: string }>(
          `INSERT INTO totp_data (account_name, encrypted_data, created_by, created_on, updated_on, active)
           VALUES ($1, $2, $3, NOW(), NOW(), true)
           RETURNING totp_id`,
          [accountName, encryptedData, userId]
        );

        return NextResponse.json({
          success: true,
          message: "TOTP updated successfully",
          totpId: insertRes.rows[0].totp_id,
          accountName,
        });
      }

      return NextResponse.json(
        { success: false, error: "TOTP token not found to update" },
        { status: 404 }
      );
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error("PATCH /api/vault/totp error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update TOTP" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/vault/totp
 * Soft-deletes a TOTP token.
 */
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json(
      { success: false, error: "Unauthorized", statusCode: 401 },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const body = request.headers.get("content-type")?.includes("application/json")
      ? await request.json().catch(() => ({}))
      : {};

    const totpId = searchParams.get("totpId") || body.totpId || body.id;

    if (!totpId) {
      return NextResponse.json(
        { success: false, error: "totpId is required" },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      const userRes = await client.query<{ user_id: string }>(
        `SELECT user_id FROM users WHERE LOWER(email_id) = LOWER($1) AND active = true LIMIT 1`,
        [session.user.email]
      );

      if (userRes.rowCount === 0) {
        return NextResponse.json(
          { success: false, error: "User not found", statusCode: 404 },
          { status: 404 }
        );
      }

      const userId = userRes.rows[0].user_id;

      await client.query(
        `UPDATE totp_data
         SET active = false, updated_on = NOW()
         WHERE totp_id = $1::uuid AND created_by = $2::uuid`,
        [totpId, userId]
      );

      return NextResponse.json({
        success: true,
        message: "TOTP soft-deleted successfully",
      });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error("DELETE /api/vault/totp error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete TOTP" },
      { status: 500 }
    );
  }
}
