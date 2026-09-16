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

  if (error || !code || !state) {
    return NextResponse.redirect(new URL("/apply?singpassError=1", request.url));
  }

  const result = await completeSingpassAuth(code, state);
  if ("error" in result) {
    console.error(`[singpass callback] ${result.error}`);
    return NextResponse.redirect(new URL("/apply?singpassError=1", request.url));
  }

  return NextResponse.redirect(new URL(`/apply/success?id=${result.applicantId}`, request.url));
}
