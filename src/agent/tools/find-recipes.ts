import { createTool } from "@mastra/core/tools";
import { z } from "zod";

import { DIETS, INTOLERANCES, type RecipeOption, searchRecipes } from "../../recipes/spoonacular";

// Fetch a few extra candidates so we can return a spread of cook times.
const CANDIDATES = 6;

/** Drops recipes whose title contains any avoid word (e.g. "pizza" after a pizza night). */
export function withoutRepeats(recipes: RecipeOption[], avoid: string[] = []): RecipeOption[] {
	const words = avoid.map((w) => w.toLowerCase().trim()).filter(Boolean);
	return recipes.filter((r) => !words.some((w) => r.title.toLowerCase().includes(w)));
}

/** Up to 3 recipes: the quickest, one from the middle, and the longest, in that order. */
export function pickSpread(recipes: RecipeOption[]): RecipeOption[] {
	const byTime = [...recipes].sort((a, b) => a.readyInMinutes - b.readyInMinutes);
	if (byTime.length <= 3) return byTime;
	return [byTime[0], byTime[Math.floor((byTime.length - 1) / 2)], byTime[byTime.length - 1]];
}

export const findRecipes = createTool({
	id: "findRecipes",
	description:
		"Search real recipes on Spoonacular. Always use this instead of inventing recipes. Returns up to 3 recipes with a spread of cook times (quickest first): title, ready time, image, macros per serving and source URL. With includeIngredients, each recipe also has usedIngredients (from what they have) and missingIngredients (its shopping list). The app shows these as recipe cards.",
	inputSchema: z.object({
		query: z.string().optional().describe("Dish, cuisine or craving, e.g. 'curry', 'pasta', 'cozy'"),
		diet: z.enum(DIETS).optional(),
		intolerances: z.array(z.enum(INTOLERANCES)).optional(),
		includeIngredients: z
			.array(z.string())
			.optional()
			.describe("Ingredients they have, e.g. everything visible in their fridge photo"),
		maxReadyTime: z.number().int().min(5).max(180).describe("Max total minutes. Low energy/recovery = short."),
		avoid: z
			.array(z.string())
			.optional()
			.describe("Dish words to leave out, from recent meals and last night's dinner, e.g. ['pizza', 'chana masala']"),
	}),
	execute: async ({ avoid, ...input }) => {
		try {
			let recipes = withoutRepeats(await searchRecipes({ ...input, number: CANDIDATES }), avoid);
			// Free tier is 50 points/day: broaden here once instead of letting the model retry many times.
			if (!recipes.length && input.query) {
				recipes = withoutRepeats(await searchRecipes({ ...input, query: undefined, number: CANDIDATES }), avoid);
				if (recipes.length) {
					return { recipes: pickSpread(recipes), note: `Nothing matched "${input.query}", so these ignore the query.` };
				}
			}
			return recipes.length
				? { recipes: pickSpread(recipes) }
				: { recipes, note: "No matches. Try a longer maxReadyTime or fewer ingredients." };
		} catch (error) {
			console.error("[findRecipes]", error);
			return { recipes: [], error: "Recipe search is unavailable right now." };
		}
	},
});
