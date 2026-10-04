import { createTool } from "@mastra/core/tools";
import { z } from "zod";

import { getRecipeIngredients, type Ingredient } from "../../recipes/spoonacular";

// Assumed to be in every kitchen.
const STAPLES = ["water", "salt", "pepper", "black pepper", "salt and pepper"];
// A recipe asking for a generic oil is covered by any oil the user has.
const GENERIC_OILS = ["oil", "cooking oil", "vegetable oil", "neutral oil"];

const norm = (s: string) => s.toLowerCase().trim().replace(/es$|s$/, "");
const matches = (ingredient: string, item: string) => {
	const a = norm(ingredient);
	const b = norm(item);
	if (GENERIC_OILS.includes(a) && b.endsWith("oil")) return true;
	return a === b || a.includes(b) || b.includes(a);
};

/** Ingredients still to buy, given what the user has. Exported for tests. */
export function missingIngredients(ingredients: Ingredient[], have: string[]) {
	return ingredients.filter(
		(i) => !STAPLES.includes(i.name.toLowerCase()) && !have.some((h) => matches(i.name, h)),
	);
}

export const getShoppingList = createTool({
	id: "getShoppingList",
	description:
		"For a chosen recipe, list the ingredients the user still needs to buy, given what they said they have (from chat or a fridge photo).",
	inputSchema: z.object({
		recipeId: z.number().int(),
		have: z.array(z.string()).describe("Ingredients the user already has"),
	}),
	execute: async ({ recipeId, have }) => {
		try {
			const ingredients = await getRecipeIngredients(recipeId);
			const toBuy = missingIngredients(ingredients, have);
			return { toBuy, alreadyHave: ingredients.length - toBuy.length };
		} catch (error) {
			console.error("[getShoppingList]", error);
			return { error: "Couldn't load the recipe's ingredients right now." };
		}
	},
});
