import { createServerFn } from "@tanstack/react-start";

import { getRequestHeaders } from "@tanstack/react-start/server";

import { requireUserId } from "./auth";
import { getWhoopClientForUser } from "./whoop";

export type RecoverySummary = {
	connected: boolean;
	recoveryScore: number | null;
	dayStrain: number | null;
};

// For the stats card. Usage: const summary = await getRecoverySummary()
// Requires a signed-in user. On WHOOP errors it returns nulls so the card can show "–".
export const getRecoverySummary = createServerFn({ method: "GET" }).handler(async (): Promise<RecoverySummary> => {
	const userId = await requireUserId(getRequestHeaders());
	const whoop = await getWhoopClientForUser(userId);
	if (!whoop) return { connected: false, recoveryScore: null, dayStrain: null };
	try {
		const [recovery, cycle] = await Promise.all([whoop.getLatestRecovery(), whoop.getLatestCycle()]);
		return {
			connected: true,
			recoveryScore: recovery?.score?.recovery_score ?? null,
			dayStrain: cycle?.score ? Math.round(cycle.score.strain * 10) / 10 : null,
		};
	} catch (error) {
		console.error("[getRecoverySummary]", error);
		return { connected: true, recoveryScore: null, dayStrain: null };
	}
});
