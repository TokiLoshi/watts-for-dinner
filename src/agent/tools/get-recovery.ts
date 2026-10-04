import { createTool } from "@mastra/core/tools";
import { z } from "zod";

import { getWhoopClientForUser } from "../../server/whoop";
import { userIdFrom } from "./user";

const round1 = (n: number) => Math.round(n * 10) / 10;

export const getRecovery = createTool({
	id: "getRecovery",
	description:
		"Get the user's latest WHOOP recovery score, HRV, resting heart rate, today's strain and last night's sleep. Returns connected: false if they haven't connected WHOOP.",
	inputSchema: z.object({}),
	execute: async (_input, context) => {
		const whoop = await getWhoopClientForUser(userIdFrom(context));
		if (!whoop) return { connected: false as const };

		try {
			const [recovery, cycle, sleep] = await Promise.all([
				whoop.getLatestRecovery(),
				whoop.getLatestCycle(),
				whoop.getLatestSleep(),
			]);
			const stages = sleep?.score?.stage_summary;
			return {
				connected: true as const,
				recoveryScore: recovery?.score?.recovery_score ?? null,
				hrvMs: recovery?.score ? round1(recovery.score.hrv_rmssd_milli) : null,
				restingHeartRate: recovery?.score?.resting_heart_rate ?? null,
				dayStrain: cycle?.score ? round1(cycle.score.strain) : null,
				sleep: {
					performancePct: sleep?.score?.sleep_performance_percentage ?? null,
					hoursAsleep: stages
						? round1(
								(stages.total_light_sleep_time_milli +
									stages.total_slow_wave_sleep_time_milli +
									stages.total_rem_sleep_time_milli) /
									3_600_000,
							)
						: null,
				},
			};
		} catch (error) {
			console.error("[getRecovery]", error);
			return { connected: true as const, error: "WHOOP data is unavailable right now." };
		}
	},
});
