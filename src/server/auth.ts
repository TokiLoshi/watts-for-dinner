import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { Pool } from "pg";

// Better Auth on our Neon database. Tables (user, session, account, verification)
// live in public and are created from src/db/schema.sql. Ids are uuids so they
// match our user_id columns.
export const auth = betterAuth({
	baseURL: process.env.BETTER_AUTH_URL,
	secret: process.env.BETTER_AUTH_SECRET,
	database: new Pool({ connectionString: process.env.DATABASE_URL }),
	advanced: { database: { generateId: "uuid" } },
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
		},
	},
	plugins: [tanstackStartCookies()],
});

export class UnauthorizedError extends Error {
	constructor() {
		super("Not signed in");
		this.name = "UnauthorizedError";
	}
}

/** The signed-in user's id (uuid), or null. */
export async function getUserId(headers: Headers): Promise<string | null> {
	const session = await auth.api.getSession({ headers });
	return session?.user.id ?? null;
}

/** The signed-in user's id; throws UnauthorizedError if signed out. */
export async function requireUserId(headers: Headers): Promise<string> {
	const userId = await getUserId(headers);
	if (!userId) throw new UnauthorizedError();
	return userId;
}
