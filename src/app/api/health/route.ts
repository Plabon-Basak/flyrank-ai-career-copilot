
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      status: "Operational",
      application: "FlyRank Career Copilot",
      framework: "Next.js 16",
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
