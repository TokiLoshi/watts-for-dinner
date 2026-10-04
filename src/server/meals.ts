import { getSql } from "../db/client";
import { DEMO_USER_ID } from "../db/demo-user";
import { isFixtureRecipeId } from "../recipes/spoonacular";

// Spoonacular's terms allow storing only recipe id, title and image URL.
export type LoggedMeal = { recipeId: number; title: string; imageUrl?: string | null };

/** Saves the chosen meal. Fixture recipes (quota fallback / FAKE_SPOONACULAR) are skipped: returns null. */
export async function logMeal(meal: LoggedMeal, userId = DEMO_USER_ID) {
	if (isFixtureRecipeId(meal.recipeId)) return null;
	const sql = getSql();
	const [, rows] = await sql.transaction([
		sql`INSERT INTO users (user_id) VALUES (${userId}) ON CONFLICT DO NOTHING`,
		sql`
			INSERT INTO meals (user_id, title, recipe_source, recipe_id, image_url)
			VALUES (${userId}, ${meal.title}, 'spoonacular', ${String(meal.recipeId)}, ${meal.imageUrl ?? null})
			RETURNING id, suggested_at
		`,
	]);
	return (rows as { id: string; suggested_at: Date }[])[0];
}

export async function getRecentMeals(days = 7, userId = DEMO_USER_ID) {
	const rows = (await getSql()`
		SELECT title, recipe_id, suggested_at FROM meals
		WHERE user_id = ${userId} AND suggested_at > now() - make_interval(days => ${days})
		ORDER BY suggested_at DESC
	`) as { title: string; recipe_id: string | null; suggested_at: Date }[];
	return rows.map((r) => ({
		title: r.title,
		recipeId: r.recipe_id,
		date: new Date(r.suggested_at).toISOString().slice(0, 10),
	}));
}
