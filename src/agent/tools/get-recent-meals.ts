import { createTool } from "@mastra/core/tools";
import { z } from "zod";

import { claimMealToRate, getRatedMeals, getRecentMeals as loadRecentMeals } from "../../server/meals";
import { getProfileForUser } from "../../server/profile";
import { userIdFrom } from "./user";

export const getRecentMeals = createTool({
	id: "getRecentMeals",
	description:
		"Meals the user chose in the last 7 days (with mealId and keeper rating, if any), last night's dinner from their profile, their keepers and non-keepers, and askAbout: a meal to ask 'keeper or not?' about (null if none). Call once at the start of a chat. Pass rateQuestion: false in the app flow (photo / energy slider) so no rating question is used up there.",
	inputSchema: z.object({
		rateQuestion: z
			.boolean()
			.default(true)
			.describe("false in the app flow: don't pick a meal to ask about (it stays for a later chat)"),
	}),
	execute: async ({ rateQuestion }, context) => {
		const userId = userIdFrom(context);
		// Claiming marks the meal as asked, so only claim when Watts will actually ask.
		const askAbout = rateQuestion ? await claimMealToRate(userId) : null;
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
