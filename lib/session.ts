import "server-only";

import { cookies } from "next/headers";
import { getIronSession, type SessionOptions } from "iron-session";

export interface AdminSession {
  isAdmin?: boolean;
  loggedInAt?: number;
}

function getSessionOptions(): SessionOptions {
  const password = process.env.ADMIN_SESSION_SECRET;
  if (!password || password.length < 32) {
    throw new Error(
      "ADMIN_SESSION_SECRET must be set and at least 32 characters long"
    );
  }
  return {
    password,
    cookieName: process.env.ADMIN_SESSION_COOKIE_NAME || "portfolio_admin",
    cookieOptions: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      // 7 days
      maxAge: 60 * 60 * 24 * 7,
    },
  };
}

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<AdminSession>(cookieStore, getSessionOptions());
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return Boolean(session.isAdmin);
}
