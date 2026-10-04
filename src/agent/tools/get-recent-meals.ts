import { createTool } from "@mastra/core/tools";
import { z } from "zod";

import { claimMealToRate, getRatedMeals, getRecentMeals as loadRecentMeals } from "../../server/meals";
import { getProfileForUser } from "../../server/profile";
import { userIdFrom } from "./user";

export const getRecentMeals = createTool({
	id: "getRecentMeals",
	description:
		"Meals the user chose in the last 7 days (with mealId and keeper rating, if any), last night's dinner from their profile, their keepers and non-keepers, and askAbout: a meal to ask 'keeper or not?' about (null if none). Call once at the start of a chat.",
	inputSchema: z.object({}),
	execute: async (_input, context) => {
		const userId = userIdFrom(context);
		// Claim first so the meal list reflects nothing stale; askAbout is returned only once per meal.
		const askAbout = await claimMealToRate(userId);
		const [meals, rated, profile] = await Promise.all([loadRecentMeals(userId, 7), getRatedMeals(userId), getProfileForUser(userId)]);
		return {
			meals,
			lastNightDinner: profile?.lastNightDinner ?? null,
			keepers: rated.keepers,
			notKeepers: rated.notKeepers,
			askAbout,
		};
	},
});
