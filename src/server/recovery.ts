import { createServerFn } from "@tanstack/react-start";

import { getWhoopClientForUser } from "./whoop";

export type RecoverySummary = {
	connected: boolean;
	recoveryScore: number | null;
	dayStrain: number | null;
};

// For the stats card. Usage: const summary = await getRecoverySummary()
// Never throws: on WHOOP errors it returns nulls so the card can show "–".
export const getRecoverySummary = createServerFn({ method: "GET" }).handler(async (): Promise<RecoverySummary> => {
	const whoop = await getWhoopClientForUser();
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
