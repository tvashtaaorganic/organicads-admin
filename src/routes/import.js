import express from 'express';
import multer from 'multer';
import Papa from 'papaparse'; // <-- FIXED
const { parse } = Papa;
import { createClient } from '@libsql/client';

const router = express.Router();
const upload = multer(); // Handles `multipart/form-data`

const client = createClient({
  url: process.env.TURSO_DB_URL,
  authToken: process.env.TURSO_DB_TOKEN,
});

router.post('/', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    let fileContent = file.buffer.toString('utf-8').trim();
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
      return res.status(400).json({ error: "CSV is empty." });
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

    return res.json({
      message: `${inserted.length} record(s) inserted.`,
      duplicates,
    });

  } catch (error) {
    console.error("Import error:", error);
    return res.status(500).json({ error: "Server error", details: error.message });
  }
});

export default router;
