import "server-only";
import { cookies } from "next/headers";
import { timingSafeEqual } from "node:crypto";

// Binds the browser that started the Singpass redirect to the one completing the callback —
// a lightweight CSRF/session-fixation guard alongside the OAuth `state` param itself.
const COOKIE = "singpass_auth_state";

export async function bindSingpassBrowser(state: string): Promise<void> {
  (await cookies()).set(COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth/singpass",
    maxAge: 600,
  });
}

export async function consumeSingpassBrowser(state: string): Promise<boolean> {
  const jar = await cookies();
  const expected = jar.get(COOKIE)?.value;
  if (!expected || Buffer.byteLength(expected) !== Buffer.byteLength(state)) return false;
  if (!timingSafeEqual(Buffer.from(expected), Buffer.from(state))) return false;
  jar.set(COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth/singpass",
    maxAge: 0,
  });
  return true;
}
