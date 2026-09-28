import { DRAFT_COOKIE, DRAFT_SECONDS } from "@/lib/singpass/drafts";
import { NextRequest, NextResponse } from "next/server";
import { completeSingpassAuth } from "@/lib/singpass/client";

// This is the exact redirect_uri registered in the SDP app — see
// src/lib/singpass/config.ts's singpassRedirectUri(). Only reachable once deployed (Singpass
// requires an exact-match HTTPS redirect URI); there's no meaningful way to test this route
// against the real Singpass service from local dev.
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");

  if (error || !code || !state || code.length > 4096 || !/^[A-Za-z0-9_-]{43}$/.test(state)) {
    return NextResponse.redirect(new URL("/apply?singpassError=1", request.url));
  }

  const result = await completeSingpassAuth(code, state).catch(() => ({ error: "Sign-in could not complete" }));
  if ("error" in result) {
    console.error(`[singpass callback] ${result.error}`);
    return NextResponse.redirect(new URL("/apply?singpassError=1", request.url));
  }

  const response = NextResponse.redirect(new URL("/apply/review", request.url));
  response.cookies.set(DRAFT_COOKIE, result.reviewToken, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/apply", maxAge: DRAFT_SECONDS,
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
