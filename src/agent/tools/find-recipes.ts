import { createTool } from "@mastra/core/tools";
import { z } from "zod";

import { DIETS, INTOLERANCES, searchRecipes } from "../../recipes/spoonacular";

export const findRecipes = createTool({
	id: "findRecipes",
	description:
		"Search real recipes on Spoonacular. Always use this instead of inventing recipes. Returns up to 3 options with title, ready time, image URL, macros per serving and source URL (credit the source when you suggest one; if sourceUrl is null, just give the title and say nothing about links).",
	inputSchema: z.object({
		query: z.string().optional().describe("Dish or cuisine, e.g. 'curry', 'pasta', 'tacos'"),
		diet: z.enum(DIETS).optional(),
		intolerances: z.array(z.enum(INTOLERANCES)).optional(),
		includeIngredients: z.array(z.string()).optional().describe("Ingredients to use, e.g. what's in their fridge"),
		maxReadyTime: z.number().int().min(5).max(180).describe("Max total minutes. Low energy/recovery = short."),
	}),
	execute: async (input) => {
		try {
			let recipes = await searchRecipes({ ...input, number: 3 });
			// Free tier is 50 points/day: broaden here once instead of letting the model retry many times.
			if (!recipes.length && input.query) {
				recipes = await searchRecipes({ ...input, query: undefined, number: 3 });
				if (recipes.length) return { recipes, note: `Nothing matched "${input.query}", so these ignore the query.` };
			}
			return recipes.length ? { recipes } : { recipes, note: "No matches. Try a longer maxReadyTime or fewer ingredients." };
		} catch (error) {
			console.error("[findRecipes]", error);
			return { recipes: [], error: "Recipe search is unavailable right now." };
		}
	},
});
