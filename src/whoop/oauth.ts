import type { TokenSet, WhoopScope } from "./types";

export const WHOOP_AUTHORIZE_URL = "https://api.prod.whoop.com/oauth/oauth2/auth";
export const WHOOP_TOKEN_URL = "https://api.prod.whoop.com/oauth/oauth2/token";

export class WhoopError extends Error {
	constructor(
		message: string,
		readonly status?: number,
	) {
		super(message);
		this.name = "WhoopError";
	}
}

/** Builds the URL to send the user to. `state` must be at least 8 characters. */
export function buildAuthorizeUrl(opts: {
	clientId: string;
	redirectUri: string;
	scopes: WhoopScope[];
	state: string;
}): string {
	if (opts.state.length < 8) throw new WhoopError("state must be at least 8 characters");
	const url = new URL(WHOOP_AUTHORIZE_URL);
	url.searchParams.set("client_id", opts.clientId);
	url.searchParams.set("redirect_uri", opts.redirectUri);
	url.searchParams.set("response_type", "code");
	url.searchParams.set("scope", opts.scopes.join(" "));
	url.searchParams.set("state", opts.state);
	return url.toString();
}

type TokenResponse = {
	access_token: string;
	refresh_token?: string;
	expires_in: number;
	scope: string;
	token_type: string;
};

async function tokenRequest(body: Record<string, string>): Promise<TokenSet> {
	const res = await fetch(WHOOP_TOKEN_URL, {
		method: "POST",
		headers: { "content-type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams(body),
	});
	if (!res.ok) {
		// Don't include the response body: it can echo credentials.
		throw new WhoopError(`WHOOP token request failed (${res.status})`, res.status);
	}
	const json = (await res.json()) as TokenResponse;
	return {
		accessToken: json.access_token,
		refreshToken: json.refresh_token ?? null,
		expiresAt: Date.now() + json.expires_in * 1000,
		scope: json.scope,
	};
}

/** Exchanges the `code` from the OAuth callback for tokens. */
export function exchangeCode(opts: {
	clientId: string;
	clientSecret: string;
	code: string;
	redirectUri: string;
}): Promise<TokenSet> {
	return tokenRequest({
		grant_type: "authorization_code",
		code: opts.code,
		redirect_uri: opts.redirectUri,
		client_id: opts.clientId,
		client_secret: opts.clientSecret,
	});
}

/**
 * Gets a new token set. WHOOP rotates refresh tokens: persist the returned
 * set, the old refresh token stops working.
 */
export function refreshTokens(opts: {
	clientId: string;
	clientSecret: string;
	refreshToken: string;
}): Promise<TokenSet> {
	return tokenRequest({
		grant_type: "refresh_token",
		refresh_token: opts.refreshToken,
		client_id: opts.clientId,
		client_secret: opts.clientSecret,
		scope: "offline",
	});
}
