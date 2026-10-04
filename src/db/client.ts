import { neon } from "@neondatabase/serverless";

// Server-only. Created on first use so builds don't need DATABASE_URL.
let sql: ReturnType<typeof neon> | undefined;

export function getSql() {
	if (!sql) {
		const url = process.env.DATABASE_URL;
		if (!url) throw new Error("DATABASE_URL is not set");
		sql = neon(url);
	}
	return sql;
}
