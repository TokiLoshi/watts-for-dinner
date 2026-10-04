// Runs src/db/schema.sql against DATABASE_URL in one transaction.
// Usage: pnpm db:migrate (loads .env.local via node --env-file).
import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
	console.error("DATABASE_URL is not set (expected in .env.local).");
	process.exit(1);
}

const schema = await readFile(new URL("./schema.sql", import.meta.url), "utf8");

// Neon's HTTP driver runs one statement per query, so split the file.
const statements = schema
	.split("\n")
	.map((line) => line.replace(/--.*$/, ""))
	.join("\n")
	.split(";")
	.map((s) => s.trim())
	.filter(Boolean);

const sql = neon(process.env.DATABASE_URL);
await sql.transaction((txn) => statements.map((s) => txn.query(s)));

console.log(`Migrated: ran ${statements.length} statements.`);
