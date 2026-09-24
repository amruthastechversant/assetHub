import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import pool from "@/lib/db";

/**
 * POST /api/report-issue
 *
 * Body: { assetId: string; note: string }
 *
 * 1. Authenticates the caller via NextAuth session.
 * 2. Resolves the internal user_id from the session email.
 * 3. Looks up the request_id for "asset maintenance" in the requests table.
 * 4. Inserts a new row into users_requests with the asset_id and note.
 */
export async function POST(request: NextRequest) {
  // ── Auth guard ─────────────────────────────────────────────────────────────
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  // ── Parse body ─────────────────────────────────────────────────────────────
  let body: { assetId?: string; note?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { assetId, note } = body;

  if (!assetId || !note?.trim()) {
    return NextResponse.json(
      { success: false, error: "assetId and note are required" },
      { status: 400 }
    );
  }

  try {
    // ── 1. Resolve user_id from session email ──────────────────────────────
    const userResult = await pool.query<{ user_id: string }>(
      `SELECT user_id
       FROM users
       WHERE LOWER(email_id) = LOWER($1)
         AND active = true
       LIMIT 1`,
      [session.user.email]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "User not found in the system" },
        { status: 404 }
      );
    }

    const userId = userResult.rows[0].user_id;

    // ── 2. Fetch request_id for "asset maintenance" ────────────────────────
    const requestResult = await pool.query<{ request_id: string }>(
      `SELECT request_id
       FROM requests
       WHERE LOWER(request_title) = LOWER('asset maintenance')
       LIMIT 1`
    );

    if (requestResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Request type 'asset maintenance' not found" },
        { status: 404 }
      );
    }

    const requestId = requestResult.rows[0].request_id;

    // ── 3. Insert into users_requests ──────────────────────────────────────
    await pool.query(
      `INSERT INTO users_requests
         (user_id, request_id, asset_id, note,
          requested_date, active, approved, manager_approved,
          revoked, acknowledged, issue_reported, auto_approved)
       VALUES
         ($1, $2, $3::uuid, $4,
          NOW(), true, false, false,
          false, false, false, false)`,
      [userId, requestId, assetId, note.trim()]
    );

    return NextResponse.json(
      { success: true, message: "Issue reported successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[report-issue] Error submitting ticket:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
