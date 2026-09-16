import { NextResponse } from "next/server";
import { singpassPublicJwks } from "@/lib/singpass/jwks";

export function GET() {
  return NextResponse.json(singpassPublicJwks);
}
