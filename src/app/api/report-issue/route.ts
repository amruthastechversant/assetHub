import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import pool from "@/lib/db";
import { validateAttachments } from "@/lib/attachmentValidation";
import fs from "fs/promises";
import path from "path";

/**
 * POST /api/report-issue
 *
 * Implements the Asset Maintenance request creation workflow from userSupport:
 * 1. Authenticates caller via NextAuth session.
 * 2. Resolves user_id and employee_id from users table.
 * 3. Resolves asset_id and asset_type from inventory.
 * 4. Validation: Check if an active maintenance request already exists for this asset:
 *    -> "A maintenance request already exists for the specified asset."
 * 5. Validation: Check if the user has an active NOC request:
 *    -> "Unable to create new requests - You have an active NOC request."
 * 6. Check reporting manager's executive status (is_executive):
 *    - If executive: autoApproved = true, approver is highest approval_order from request_configuration.
 *    - If not executive: autoApproved = false, approver is approval_order = 1 from request_configuration.
 * 7. Transactional insertion:
 *    - Insert into users_requests with auto_approved, priority, note, current_approver_id, etc.
 *    - Insert into request_log ('Request Initiated by you').
 *    - Process and record any attachments in request_attachments.
 */
export async function POST(request: NextRequest) {
  // ── 1. Auth guard ──────────────────────────────────────────────────────────
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json(
      { success: false, error: "Unauthorized", statusCode: 401 },
      { status: 401 }
    );
  }

  // ── 2. Parse request payload (JSON or multipart/form-data) ─────────────────
  let assetId = "";
  let note = "";
  let priority = 1;
  let category = "Technical";
  let selectedUserId: string | null = null;
  let managerNote = "";
  const filesToSave: { name: string; buffer: Buffer }[] = [];

  const contentType = request.headers.get("content-type") || "";
  try {
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      assetId = (formData.get("assetId") as string) || "";
      note = (formData.get("note") as string) || "";
      const p = formData.get("priority");
      if (p) priority = parseInt(p as string, 10) || 1;
      const cat = formData.get("category") || formData.get("assetCategory");
      if (cat) category = String(cat);
      const selUser = formData.get("selectedUserId");
      if (selUser) selectedUserId = String(selUser);
      const mNote = formData.get("managerNote");
      if (mNote) managerNote = String(mNote);

      const uploadedFiles = formData.getAll("files");
      const filesToValidate: { name: string; size: number; file: File }[] = [];
      for (const f of uploadedFiles) {
        if (f instanceof File && f.name) {
          filesToValidate.push({ name: f.name, size: f.size, file: f });
        }
      }

      const validation = validateAttachments(filesToValidate);
      if (!validation.valid) {
        return NextResponse.json(
          {
            success: false,
            error: validation.error,
            errorDetails: {
              message: validation.error,
              details: validation.details,
            },
            statusCode: 400,
          },
          { status: 400 }
        );
      }

      for (const item of filesToValidate) {
        const bytes = await item.file.arrayBuffer();
        filesToSave.push({
          name: item.name,
          buffer: Buffer.from(bytes),
        });
      }
    } else {
      const json = await request.json();
      assetId = json.assetId || "";
      note = json.note || "";
      if (json.priority) priority = parseInt(json.priority, 10) || 1;
      if (json.category || json.assetCategory) category = json.category || json.assetCategory;
      if (json.selectedUserId) selectedUserId = json.selectedUserId;
      if (json.managerNote) managerNote = json.managerNote;
    }
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request payload", statusCode: 400 },
      { status: 400 }
    );
  }

  if (!assetId?.trim() || !note?.trim()) {
    return NextResponse.json(
      {
        success: false,
        error: "Asset identifier and issue note are required.",
        statusCode: 400,
      },
      { status: 400 }
    );
  }

  const client = await pool.connect();
  try {
    // ── 3. Resolve logged-in user from users table ────────────────────────────
    const userRes = await client.query<{
      user_id: string;
      employee_id: string;
      reporting_manager: string | null;
    }>(
      `SELECT user_id, employee_id, reporting_manager
       FROM users
       WHERE LOWER(email_id) = LOWER($1) AND active = true
       LIMIT 1`,
      [session.user.email]
    );

    if (userRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "User not found in system", statusCode: 404 },
        { status: 404 }
      );
    }

    const { user_id: loggedInUserId, employee_id: userEmployeeId } = userRes.rows[0];
    const requestedUserId = selectedUserId?.trim() || loggedInUserId;

    // ── 4. Resolve asset and its type from inventory ──────────────────────────
    const assetRes = await client.query<{
      asset_id: string;
      asset_type: string | null;
      model: string | null;
    }>(
      `SELECT asset_id, asset_type, model
       FROM inventory
       WHERE LOWER(asset_code) = LOWER($1) OR asset_id::TEXT = $1
       LIMIT 1`,
      [assetId.trim()]
    );

    if (assetRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Specified asset not found in inventory", statusCode: 404 },
        { status: 404 }
      );
    }

    const resolvedAssetId = assetRes.rows[0].asset_id;
    const assetTypeId = assetRes.rows[0].asset_type;

    // ── 5. Validation: Check active maintenance request on this asset ─────────
    const existingReqCheck = await client.query(
      `SELECT asset_id
       FROM users_requests
       WHERE asset_id = $1::uuid
         AND active = true
       LIMIT 1`,
      [resolvedAssetId]
    );

    if (existingReqCheck.rows.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "A maintenance request already exists for the specified asset.",
          errorDetails: {
            message: "A maintenance request already exists for the specified asset.",
          },
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    // ── 6. Validation: Check active NOC request for user ───────────────────────
    const checkNoc = await client.query(
      `SELECT request_id
       FROM noc_requests
       WHERE requested_for = $1::uuid
         AND active = true
       LIMIT 1`,
      [requestedUserId]
    );

    if (checkNoc.rows.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Unable to create new requests - You have an active NOC request.",
          errorDetails: {
            message: "Unable to create new requests - You have an active NOC request.",
          },
          statusCode: 400,
        },
        { status: 400 }
      );
    }

    // ── 7. Get "Asset Maintenance" request definition from requests table ──────
    const reqDef = await client.query<{ request_id: string; request_title: string }>(
      `SELECT request_id, request_title
       FROM requests
       WHERE LOWER(request_title) = LOWER('Asset Maintenance')
       LIMIT 1`
    );

    if (reqDef.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Request configuration for 'Asset Maintenance' not found",
          statusCode: 500,
        },
        { status: 500 }
      );
    }

    const requestId = reqDef.rows[0].request_id;

    // ── 8. Check Manager's executive status & determine approver ──────────────
    const managerData = await client.query<{ is_executive: boolean | null }>(
      `SELECT man.is_executive
       FROM users u
       LEFT JOIN users man ON u.reporting_manager = man.user_id
       WHERE u.user_id = $1::uuid
       LIMIT 1`,
      [requestedUserId]
    );

    const isExecutive = Boolean(managerData.rows[0]?.is_executive);
    const autoApproved = isExecutive;

    let approverId: string | null = null;
    if (autoApproved) {
      const approverRes = await client.query<{ approver_id: string }>(
        `SELECT approver_id
         FROM request_configuration
         WHERE request_id = $1::uuid
         ORDER BY approval_order DESC
         LIMIT 1`,
        [requestId]
      );
      approverId = approverRes.rows[0]?.approver_id || null;
    } else {
      const approverRes = await client.query<{ approver_id: string }>(
        `SELECT approver_id
         FROM request_configuration
         WHERE request_id = $1::uuid
           AND approval_order = 1
         LIMIT 1`,
        [requestId]
      );
      approverId = approverRes.rows[0]?.approver_id || null;
    }

    // Fallback if no specific ordered approver found
    if (!approverId) {
      const fallbackApprover = await client.query<{ approver_id: string }>(
        `SELECT approver_id
         FROM request_configuration
         WHERE request_id = $1::uuid
         LIMIT 1`,
        [requestId]
      );
      approverId = fallbackApprover.rows[0]?.approver_id || null;
    }

    // Generate readable TV tracking code (e.g. TV2026-ARM-00055)
    let generatedTvCode: string | null = null;
    try {
      const codeRes = await client.query<{ code: string }>(
        `SELECT generate_tv_code('ARM') AS code`
      );
      generatedTvCode = codeRes.rows[0]?.code || null;
    } catch {
      // If generate_tv_code is unavailable, continue without failure
    }

    // ── 9. Transactional Execution ───────────────────────────────────────────
    await client.query("BEGIN");

    const insertResult = await client.query<{ user_request_id: string; created_request_id?: string }>(
      `INSERT INTO users_requests (
         request_id,
         user_id,
         asset_id,
         asset_type_id,
         asset_category,
         created_request_id,
         manager_note,
         requested_date,
         current_approver_id,
         active,
         note,
         revoked,
         priority,
         auto_approved,
         approved,
         manager_approved,
         acknowledged,
         issue_reported
       ) VALUES (
         $1, $2, $3, $4, $5, COALESCE($6, generate_tv_code('ARM')), $7, NOW(), $8, true, $9, false, $10, $11, false, false, false, false
       )
       RETURNING user_request_id, created_request_id, asset_category`,
      [
        requestId,
        requestedUserId,
        resolvedAssetId,
        assetTypeId,
        category,
        generatedTvCode,
        managerNote,
        approverId,
        note.trim(),
        priority,
        autoApproved,
      ]
    );

    const userRequestId = insertResult.rows[0].user_request_id;
    const trackingCode = insertResult.rows[0].created_request_id || generatedTvCode;

    // Log request initiation in request_log (creator is loggedInUserId)
    await client.query(
      `INSERT INTO request_log (
         user_request_id,
         request_status,
         remarks,
         updated_by,
         updated_on,
         approver_id
       ) VALUES ($1, 'Requested', 'Request Initiated by you', $2, NOW(), $3)`,
      [userRequestId, loggedInUserId, approverId]
    );

    // Handle any uploaded attachments
    if (filesToSave.length > 0) {
      const uploadBase = path.join(process.cwd(), "public", "uploads", "attachments");
      const relativeFolder = path.join(
        (userEmployeeId || requestedUserId).toLowerCase(),
        (generatedTvCode || userRequestId).toLowerCase()
      );
      const targetFolder = path.join(uploadBase, relativeFolder);
      await fs.mkdir(targetFolder, { recursive: true });

      for (let i = 0; i < filesToSave.length; i++) {
        const item = filesToSave[i];
        const ext = path.extname(item.name).toLowerCase();
        const safeName = `${i + 1}${ext}`;
        const finalFilePath = path.join(targetFolder, safeName);
        await fs.writeFile(finalFilePath, item.buffer);

        const dbFilePath = `${relativeFolder.replace(/\\/g, "/")}/${safeName}`.toLowerCase();
        await client.query(
          `INSERT INTO request_attachments (
             user_request_id,
             file_name,
             file_path,
             uploaded_at
           ) VALUES ($1, $2, $3, NOW())`,
          [userRequestId, safeName, dbFilePath]
        );
      }
    }

    await client.query("COMMIT");

    return NextResponse.json(
      {
        success: true,
        message: "Maintenance request created successfully",
        statusCode: 200,
        fileContent: {
          userRequestId,
          createdRequestId: trackingCode,
          autoApproved,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("[report-issue] Error processing request:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process maintenance request",
        errorDetails: {
          message: error.message || "Failed to process maintenance request",
          details: String(error),
        },
        statusCode: 500,
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
