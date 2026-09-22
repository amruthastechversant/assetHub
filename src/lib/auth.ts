import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import pool from "./db";
import { normalizeRole } from "./permissions";

/**
 * Fetch user role by email from PostgreSQL database.
 */
export async function getUserRoleByEmail(email?: string | null): Promise<string> {
  if (!email) {
    return normalizeRole(process.env.DEFAULT_USER_ROLE || "Employee");
  }

  try {
    const result = await pool.query(
      `SELECT r.role_name 
       FROM users u 
       JOIN roles r ON u.role_id = r.role_id 
       WHERE LOWER(u.email_id) = LOWER($1) AND u.active = true 
       LIMIT 1`,
      [email]
    );

    if (result.rows.length > 0 && result.rows[0].role_name) {
      return normalizeRole(result.rows[0].role_name);
    }
  } catch (err) {
    console.warn("Could not query role from database, falling back to default:", err);
  }

  return normalizeRole(process.env.DEFAULT_USER_ROLE || "Admin");
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async session({ session }) {
      if (session?.user?.email) {
        const role = await getUserRoleByEmail(session.user.email);
        (session.user as any).role = role;
      }
      return session;
    },
  },
});