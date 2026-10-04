import { createTool } from "@mastra/core/tools";
import { z } from "zod";

import { getRecipeDetails } from "../../recipes/spoonacular";
import { missingIngredients } from "./get-shopping-list";

export const getCookingSteps = createTool({
	id: "getCookingSteps",
	description:
		"For the recipe they chose: the recipe's cooking steps in order, plus toBuy (ingredients they still need, given what they have). One API call; call it once after logMeal.",
	inputSchema: z.object({
		recipeId: z.number().int(),
		have: z
			.array(z.string())
			.describe("Ingredients they already have (from the fridge photo or what they told you); [] if unknown"),
	}),
	execute: async ({ recipeId, have }) => {
		try {
			const { ingredients, steps } = await getRecipeDetails(recipeId);
			return { steps, toBuy: missingIngredients(ingredients, have) };
		} catch (error) {
			console.error("[getCookingSteps]", error);
			return { error: "Couldn't load the recipe's steps right now." };
		}
	},
});
