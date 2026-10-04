import { createTool } from "@mastra/core/tools";
import { z } from "zod";

import { logMeal as saveMeal } from "../../server/meals";
import { userIdFrom } from "./user";

export const logMeal = createTool({
	id: "logMeal",
	description: "Record the recipe the user chose to cook, so future suggestions avoid repeats. Call once they pick one.",
	inputSchema: z.object({
		recipeId: z.number().int(),
		title: z.string(),
		imageUrl: z.string().nullable().optional(),
	}),
	execute: async (meal, context) => {
		const row = await saveMeal(userIdFrom(context), meal);
		// Fixture recipes aren't stored, but the demo flow stays the same for the user.
		return { logged: true as const, id: row?.id ?? null };
	},
});
