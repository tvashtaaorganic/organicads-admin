import { NextResponse } from "next/server";
import client from "../../../db/turso";

function mapRowsToObjects(columns, rows) {
  return rows.map(row => {
    const obj = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return obj;
  });
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "0");
    const search = url.searchParams.get("search") || "";
    const descpost = url.searchParams.get("descpost") || "";

    const pageSize = 10;
    const offset = page * pageSize;
    const searchPattern = `%${search}%`;

    const query = `
      SELECT * FROM pages 
      WHERE descpost = ? AND (name LIKE ? OR slug LIKE ?)
      ORDER BY date DESC
      LIMIT ? OFFSET ?
    `;

    const pagesResult = await client.execute(query, [descpost, searchPattern, searchPattern, pageSize, offset]);
    const pages = mapRowsToObjects(pagesResult.columns, pagesResult.rows);

    const countQuery = `
      SELECT COUNT(*) as count FROM pages
      WHERE descpost = ? AND (name LIKE ? OR slug LIKE ?)
    `;

    const countResult = await client.execute(countQuery, [descpost, searchPattern, searchPattern]);
    const countRows = mapRowsToObjects(countResult.columns, countResult.rows);
    const totalCount = countRows[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    return NextResponse.json({ items: pages, totalPages });
  } catch (error) {
    console.error("API /api/pages GET error:", error);
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
