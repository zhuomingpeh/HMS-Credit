import { NextRequest, NextResponse } from "next/server";
import { startSingpassAuth } from "@/lib/singpass/client";

// Plain GET so a link/official button image can point straight here — no client JS needed.
export async function GET(request: NextRequest) {
  const loanAmountRaw = request.nextUrl.searchParams.get("loanAmount");
  const loanType = request.nextUrl.searchParams.get("loanType") ?? undefined;
  const loanAmount = loanAmountRaw ? Number(loanAmountRaw) : undefined;

  try {
    const { redirectUrl } = await startSingpassAuth({
      loanAmount: Number.isFinite(loanAmount) ? loanAmount : undefined,
      loanType,
    });
    return NextResponse.redirect(redirectUrl);
  } catch (err) {
    // Never leave the applicant on a raw error page — bounce back to the manual form. Most
    // common cause right now: SINGPASS_CLIENT_ID / the signing keys aren't configured yet
    // (the app hasn't been registered in the Singpass Developer Portal).
    console.error(`[singpass start] ${err instanceof Error ? err.message : String(err)}`);
    return NextResponse.redirect(new URL("/apply?singpassError=1", request.url));
  }
}
