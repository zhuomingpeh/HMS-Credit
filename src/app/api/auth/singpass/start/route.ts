import { singpassRedirectUri } from "@/lib/singpass/config";
import { NextRequest, NextResponse } from "next/server";
import { startSingpassAuth } from "@/lib/singpass/client";
import { singpassAvailable } from "@/lib/singpass/availability";
import { takeRateLimit, requestIp } from "@/lib/rateLimit";

// Plain GET so a link/official button image can point straight here — no client JS needed.
export async function GET(request: NextRequest) {
  if (!singpassAvailable(request.nextUrl.host)) return NextResponse.redirect(new URL("/apply?singpassError=1", request.url));
  // Keep the state cookie on the same host as the registered callback.
  const callbackOrigin = new URL(singpassRedirectUri()).origin;
  if (request.nextUrl.origin !== callbackOrigin) {
    return NextResponse.redirect(new URL(request.nextUrl.pathname + request.nextUrl.search, callbackOrigin));
  }
  const loanAmountRaw = request.nextUrl.searchParams.get("loanAmount");
  const loanType = request.nextUrl.searchParams.get("loanType") ?? undefined;
  const loanAmount = loanAmountRaw ? Number(loanAmountRaw) : undefined;

  try {
    if (!await takeRateLimit("singpass-start", await requestIp(), 10, 900)) return NextResponse.redirect(new URL("/apply?singpassError=1", request.url));
    if ((loanType?.length ?? 0) > 100 || (loanAmount !== undefined && (!Number.isSafeInteger(loanAmount) || loanAmount < 1 || loanAmount > 1000000))) return NextResponse.redirect(new URL("/apply?singpassError=1", request.url));
    const { redirectUrl } = await startSingpassAuth({
      loanAmount: Number.isFinite(loanAmount) ? loanAmount : undefined,
      loanType,
    });
    return NextResponse.redirect(redirectUrl);
  } catch (err) {
    // Return to the manual alternative without exposing upstream details to applicants.
    console.error(`[singpass start] ${err instanceof Error ? err.message : String(err)}`);
    return NextResponse.redirect(new URL("/apply?singpassError=1", request.url));
  }
}
