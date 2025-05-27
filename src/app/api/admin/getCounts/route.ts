import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DB_URL!,
  authToken: process.env.TURSO_DB_TOKEN!,
});

export async function GET() {
  try {
    const domesticQuery = await client.execute(
      "SELECT COUNT(*) AS count FROM pages WHERE countryin = 'domestic'"
    );
    const internationalQuery = await client.execute(
      "SELECT COUNT(*) AS count FROM pages WHERE countryin != 'international'"
    );

    const domestic = Number(domesticQuery.rows[0].count);
    const international = Number(internationalQuery.rows[0].count);

    return NextResponse.json({ domestic, international });
  } catch (error: any) {
    console.error("Count Fetch Error:", error.message);
    return NextResponse.json({ error: "Failed to fetch counts" }, { status: 500 });
  }
}
