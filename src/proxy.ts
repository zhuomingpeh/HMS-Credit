import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const dev = process.env.NODE_ENV !== "production";
  const policy = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'", // Existing React style attributes; scripts remain nonce-only.
    "img-src 'self' data: blob:", "font-src 'self'", `connect-src 'self'${dev ? " ws: wss:" : ""}`,
    "object-src 'none'", "base-uri 'self'", "frame-ancestors 'none'", "form-action 'self'",
    ...(!dev ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", policy);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", policy);
  const sensitive = /^\/(staff|apply|api)(\/|$)/.test(request.nextUrl.pathname);
  if (sensitive) {
    response.headers.set("Cache-Control", "private, no-store, max-age=0");
    response.headers.set("Referrer-Policy", "no-referrer");
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }
  if (request.nextUrl.hostname.endsWith(".vercel.app")) response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return response;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon|photos/|brand/|logo).*)"] };
