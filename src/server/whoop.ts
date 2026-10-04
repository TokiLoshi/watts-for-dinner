import { randomBytes, timingSafeEqual } from "node:crypto";

import { getSql } from "../db/client";
import { getUserId } from "./auth";
import {
	buildAuthorizeUrl,
	createWhoopClient,
	exchangeCode,
	type TokenSet,
	type WhoopScope,
} from "../whoop";

// No read:body_measurement: the privacy policy doesn't cover it.
const SCOPES: WhoopScope[] = [
	"offline",
	"read:profile",
	"read:recovery",
	"read:cycles",
	"read:sleep",
	"read:workout",
];

const STATE_COOKIE = "whoop_oauth_state";
const CALLBACK_PATH = "/api/whoop/callback";

function credentials() {
	const clientId = process.env.WHOOP_CLIENT_ID;
	const clientSecret = process.env.WHOOP_CLIENT_SECRET;
	if (!clientId || !clientSecret) throw new Error("WHOOP_CLIENT_ID / WHOOP_CLIENT_SECRET not set");
	return { clientId, clientSecret };
}

// Fly terminates TLS and forwards plain HTTP, so prefer the forwarded proto/host.
function publicOrigin(request: Request) {
	const url = new URL(request.url);
	const proto = request.headers.get("x-forwarded-proto")?.split(",")[0].trim() ?? url.protocol.replace(":", "");
	const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? url.host;
	return `${proto}://${host}`;
}

function redirectUri(request: Request) {
	return publicOrigin(request) + CALLBACK_PATH;
}

function readCookie(request: Request, name: string) {
	for (const part of (request.headers.get("cookie") ?? "").split(";")) {
		const [k, ...v] = part.trim().split("=");
		if (k === name) return decodeURIComponent(v.join("="));
	}
	return undefined;
}

function stateCookie(request: Request, value: string, maxAge: number) {
	const secure = publicOrigin(request).startsWith("https:") ? "; Secure" : "";
	return `${STATE_COOKIE}=${value}; Path=${CALLBACK_PATH}; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

/** GET /api/whoop/connect: redirect to WHOOP's consent screen. */
export async function startWhoopConnect(request: Request) {
	if (!(await getUserId(request.headers))) {
		return new Response(null, { status: 302, headers: { location: "/sign-in" } });
	}
	const state = randomBytes(32).toString("base64url");
	const location = buildAuthorizeUrl({
		clientId: credentials().clientId,
		redirectUri: redirectUri(request),
		scopes: SCOPES,
		state,
	});
	return new Response(null, {
		status: 302,
		headers: { location, "set-cookie": stateCookie(request, state, 600) },
	});
}

function safeEqual(a: string, b: string) {
	const ab = Buffer.from(a);
	const bb = Buffer.from(b);
	return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/** GET /api/whoop/callback: verify state, exchange the code, save tokens. */
export async function finishWhoopConnect(request: Request) {
	const params = new URL(request.url).searchParams;
	const clearState = stateCookie(request, "", 0);
	const fail = (message: string, status = 400) =>
		new Response(message, { status, headers: { "set-cookie": clearState } });

	if (params.get("error")) return fail("WHOOP connection was cancelled.");
	const code = params.get("code");
	const state = params.get("state");
	const expected = readCookie(request, STATE_COOKIE);
	if (!code || !state || !expected || !safeEqual(state, expected)) {
		return fail("WHOOP connection failed: invalid or expired state. Please try again.");
	}

	const userId = await getUserId(request.headers);
	if (!userId) return fail("Please sign in before connecting WHOOP.", 401);

	try {
		const tokens = await exchangeCode({ ...credentials(), code, redirectUri: redirectUri(request) });
		await saveTokens(userId, tokens);
	} catch (error) {
		console.error("[whoop] callback failed", error);
		return fail("WHOOP connection failed. Please try again.", 502);
	}
	return new Response(null, { status: 302, headers: { location: "/", "set-cookie": clearState } });
}

async function saveTokens(userId: string, t: TokenSet) {
	const sql = getSql();
	await sql.transaction([
		sql`INSERT INTO users (user_id) VALUES (${userId}) ON CONFLICT DO NOTHING`,
		sql`
			INSERT INTO whoop_connections (user_id, access_token, refresh_token, expires_at, scope)
			VALUES (${userId}, ${t.accessToken}, ${t.refreshToken}, ${new Date(t.expiresAt)}, ${t.scope})
			ON CONFLICT (user_id) DO UPDATE SET
				access_token = EXCLUDED.access_token,
				refresh_token = EXCLUDED.refresh_token,
				expires_at = EXCLUDED.expires_at,
				scope = EXCLUDED.scope,
				updated_at = now()
		`,
	]);
}

/** A WHOOP client for the user, or null if they haven't connected. Persists refreshed tokens. */
export async function getWhoopClientForUser(userId: string) {
	const rows = (await getSql()`
		SELECT access_token, refresh_token, expires_at, scope FROM whoop_connections WHERE user_id = ${userId}
	`) as { access_token: string; refresh_token: string | null; expires_at: Date; scope: string }[];
	const row = rows[0];
	if (!row) return null;
	return createWhoopClient({
		...credentials(),
		tokens: {
			accessToken: row.access_token,
			refreshToken: row.refresh_token,
			expiresAt: new Date(row.expires_at).getTime(),
			scope: row.scope,
		},
		onTokens: (next) => saveTokens(userId, next),
	});
}
