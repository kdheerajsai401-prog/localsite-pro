"use server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const SESSION_COOKIE = "localsite_session";
const SESSION_VALUE = "localsite_v1";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function login(password: string): Promise<boolean> {
  const hash = process.env.ADMIN_PASSWORD_HASH;

  if (hash) {
    // Production: compare against bcrypt hash
    const valid = await bcrypt.compare(password, hash);
    if (valid) await setSession();
    return valid;
  }

  // No hash set — fall back to plaintext ADMIN_PASSWORD env var
  // Works in both dev and production for easy initial setup
  const plaintext = process.env.ADMIN_PASSWORD ?? "admin";
  if (password === plaintext) {
    await setSession();
    return true;
  }

  return false;
}

async function setSession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, SESSION_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value === SESSION_VALUE;
}
