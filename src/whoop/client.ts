import { refreshTokens, WhoopError } from "./oauth";
import type { Collection, Cycle, Recovery, Sleep, TokenSet } from "./types";

export const WHOOP_API_BASE = "https://api.prod.whoop.com/developer";

const EXPIRY_SKEW_MS = 60_000;

export type WhoopClientOptions = {
	clientId: string;
	clientSecret: string;
	tokens: TokenSet;
	/** Called with every new token set after a refresh. Persist it. */
	onTokens?: (tokens: TokenSet) => void | Promise<void>;
};

export function createWhoopClient(opts: WhoopClientOptions) {
	let tokens = opts.tokens;
	// WHOOP rotates refresh tokens, so concurrent refreshes with the same token
	// fail. Share one in-flight refresh between callers.
	let refreshing: Promise<void> | null = null;

	function refresh() {
		refreshing ??= (async () => {
			if (!tokens.refreshToken) {
				throw new WhoopError("Access token expired and no refresh token (request the offline scope)", 401);
			}
			tokens = await refreshTokens({
				clientId: opts.clientId,
				clientSecret: opts.clientSecret,
				refreshToken: tokens.refreshToken,
			});
			await opts.onTokens?.(tokens);
		})().finally(() => {
			refreshing = null;
		});
		return refreshing;
	}

	async function get<T>(path: string, params: Record<string, string> = {}): Promise<T> {
		if (refreshing) await refreshing;
		if (Date.now() >= tokens.expiresAt - EXPIRY_SKEW_MS) await refresh();

		const url = new URL(WHOOP_API_BASE + path);
		for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

		const send = (accessToken: string) => fetch(url, { headers: { authorization: `Bearer ${accessToken}` } });
		const used = tokens.accessToken;
		let res = await send(used);
		if (res.status === 401 && tokens.refreshToken) {
			// Another call may already have refreshed; only refresh if not.
			if (tokens.accessToken === used) await refresh();
			res = await send(tokens.accessToken);
		}
		if (!res.ok) throw new WhoopError(`WHOOP GET ${path} failed (${res.status})`, res.status);
		return (await res.json()) as T;
	}

	return {
		/** Most recent recovery, or null if there is none. */
		async getLatestRecovery(): Promise<Recovery | null> {
			const { records } = await get<Collection<Recovery>>("/v2/recovery", { limit: "1" });
			return records[0] ?? null;
		},
		/** Most recent physiological cycle (day strain), or null. May still be in progress. */
		async getLatestCycle(): Promise<Cycle | null> {
			const { records } = await get<Collection<Cycle>>("/v2/cycle", { limit: "1" });
			return records[0] ?? null;
		},
		/** Most recent main sleep (naps skipped), or null. */
		async getLatestSleep(): Promise<Sleep | null> {
			const { records } = await get<Collection<Sleep>>("/v2/activity/sleep", { limit: "10" });
			return records.find((s) => !s.nap) ?? null;
		},
		/** Current token set (after any refresh). */
		getTokens: () => tokens,
	};
}

export type WhoopClient = ReturnType<typeof createWhoopClient>;
