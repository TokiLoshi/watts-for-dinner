import { createTool } from "@mastra/core/tools";
import { z } from "zod";

import { rateMeal as saveRating } from "../../server/meals";

export const rateMeal = createTool({
	id: "rateMeal",
	description:
		"Save whether a logged meal was a keeper (they'd happily cook it again) or not. Use the mealId from getRecentMeals. Can be called again to change a rating.",
	inputSchema: z.object({
		mealId: z.string().uuid(),
		keeper: z.boolean(),
	}),
	execute: async ({ mealId, keeper }) => {
		const saved = await saveRating(mealId, keeper);
		return saved ? { saved: true as const, keeper: saved.keeper } : { saved: false as const, error: "Meal not found" };
	},
});
