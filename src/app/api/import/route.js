import { NextResponse } from "next/server";
import { parse } from "papaparse";
import { createClient } from '@libsql/client';

export const config = {
  api: {
    bodyParser: false,
  },
};

const client = createClient({
  url: process.env.TURSO_DB_URL,
  authToken: process.env.TURSO_DB_TOKEN,
});

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let fileContent = new TextDecoder().decode(buffer).trim();
    fileContent = fileContent.replace(/^\uFEFF/, "");

    const headers = [
      "name",
      "locationin",
      "cityin",
      "countryin",
      "descpost",
      "cat",
      "titletag",
      "descriptiontag",
      "keywordstag",
      "slug",
      "servicename",
    ];

    const parsed = parse(fileContent, {
      header: false,
      skipEmptyLines: true,
    });

    if (!parsed.data || parsed.data.length === 0) {
      return NextResponse.json({ error: "CSV is empty." }, { status: 400 });
    }

    const rows = parsed.data.map((row) =>
      Object.fromEntries(headers.map((key, i) => [key, row[i] || ""]))
    );

    const inserted = [];
    const duplicates = [];

    for (const row of rows) {
      const { slug } = row;
      if (!slug) continue;

      const check = await client.execute({
        sql: "SELECT slug FROM pages WHERE slug = ?",
        args: [slug],
      });

      if (check.rows.length > 0) {
        duplicates.push(`Slug "${slug}" already exists.`);
        continue;
      }

      await client.execute({
        sql: `INSERT INTO pages 
          (name, locationin, cityin, countryin, descpost, cat, titletag, descriptiontag, keywordstag, slug, servicename, date)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          row.name,
          row.locationin,
          row.cityin,
          row.countryin,
          row.descpost,
          row.cat,
          row.titletag,
          row.descriptiontag,
          row.keywordstag,
          row.slug,
          row.servicename,
          new Date().toISOString(),
        ],
      });

      inserted.push(slug);
    }

    return NextResponse.json({
      message: `${inserted.length} record(s) inserted.`,
      duplicates,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json({ error: "Server error", details: error.message }, { status: 500 });
  }
}
