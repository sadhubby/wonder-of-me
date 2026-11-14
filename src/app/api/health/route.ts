import { sql } from "drizzle-orm";
import { connection, NextResponse } from "next/server";

import { getDb } from "@/db";

export async function GET() {
  await connection();

  try {
    await getDb().run(sql`SELECT 1`);

    return NextResponse.json(
      { ok: true, database: "ok" },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("[health] Database check failed", error);

    return NextResponse.json(
      { ok: false, database: "unavailable" },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
