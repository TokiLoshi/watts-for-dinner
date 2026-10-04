import { createTool } from "@mastra/core/tools";
import { z } from "zod";

import { getRecentMeals as loadRecentMeals } from "../../server/meals";
import { getProfileForUser } from "../../server/profile";

export const getRecentMeals = createTool({
	id: "getRecentMeals",
	description:
		"Meals the user chose in the last 7 days, plus last night's dinner from their profile. Avoid suggesting anything too similar.",
	inputSchema: z.object({}),
	execute: async () => {
		const [meals, profile] = await Promise.all([loadRecentMeals(7), getProfileForUser()]);
		return { meals, lastNightDinner: profile?.lastNightDinner ?? null };
	},
});
