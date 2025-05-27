import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_DB_URL,
  authToken: process.env.TURSO_DB_TOKEN,
});

export async function PUT(request) {
  try {
    const body = await request.json();

    const {
      id,
      name,
      locationin,
      cityin,
      countryin,
      descpost,
      cat,
      titletag,
      descriptiontag,
      keywordstag,
      slug,
      servicename,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await db.execute(
      `UPDATE pages SET
        name = ?,
        locationin = ?,
        cityin = ?,
        countryin = ?,
        descpost = ?,
        cat = ?,
        titletag = ?,
        descriptiontag = ?,
        keywordstag = ?,
        slug = ?,
        servicename = ?
      WHERE id = ?`,
      [
        name,
        locationin,
        cityin,
        countryin,
        descpost,
        cat,
        titletag,
        descriptiontag,
        keywordstag,
        slug,
        servicename,
        id,
      ]
    );

    return NextResponse.json({ message: "Page updated successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to update page" },
      { status: 500 }
    );
  }
}
