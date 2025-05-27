import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_DB_URL,
  authToken: process.env.TURSO_DB_TOKEN,
});

export async function DELETE(request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await db.execute(`DELETE FROM pages WHERE id = ?`, [id]);

    return NextResponse.json({ message: "Page deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to delete page" },
      { status: 500 }
    );
  }
}
