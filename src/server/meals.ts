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
		SELECT m.id, m.title, m.recipe_id, m.suggested_at, r.keeper
		FROM meals m
		LEFT JOIN meal_ratings r ON r.meal_id = m.id AND r.user_id = m.user_id
		WHERE m.user_id = ${userId} AND m.suggested_at > now() - make_interval(days => ${days})
		ORDER BY m.suggested_at DESC
	`) as { id: string; title: string; recipe_id: string | null; suggested_at: Date; keeper: boolean | null }[];
	return rows.map((r) => ({
		mealId: r.id,
		title: r.title,
		recipeId: r.recipe_id,
		date: new Date(r.suggested_at).toISOString().slice(0, 10),
		keeper: r.keeper,
	}));
}

/**
 * Picks the meal to ask "keeper or not?" about, at most once per meal: the most
 * recent unrated meal logged 2h–7d ago that we haven't asked about. Marks it as
 * asked in the same statement, so the question never repeats.
 */
export async function claimMealToRate(userId = DEMO_USER_ID) {
	const rows = (await getSql()`
		UPDATE meals SET rating_prompted_at = now()
		WHERE id = (
			SELECT m.id FROM meals m
			LEFT JOIN meal_ratings r ON r.meal_id = m.id AND r.user_id = m.user_id
			WHERE m.user_id = ${userId}
				AND r.id IS NULL
				AND m.rating_prompted_at IS NULL
				AND m.suggested_at < now() - interval '2 hours'
				AND m.suggested_at > now() - interval '7 days'
			ORDER BY m.suggested_at DESC
			LIMIT 1
			FOR UPDATE OF m SKIP LOCKED
		)
		RETURNING id, title
	`) as { id: string; title: string }[];
	return rows[0] ? { mealId: rows[0].id, title: rows[0].title } : null;
}

/** Saves (or changes) the keeper rating for one of the user's meals. Null if the meal isn't theirs. */
export async function rateMeal(mealId: string, keeper: boolean, userId = DEMO_USER_ID) {
	const rows = (await getSql()`
		INSERT INTO meal_ratings (user_id, meal_id, keeper)
		SELECT user_id, id, ${keeper} FROM meals WHERE id = ${mealId} AND user_id = ${userId}
		ON CONFLICT (user_id, meal_id) DO UPDATE SET keeper = EXCLUDED.keeper, rated_at = now()
		RETURNING meal_id, keeper
	`) as { meal_id: string; keeper: boolean }[];
	return rows[0] ?? null;
}

/** Up to 10 most recent keepers and non-keepers (any age), as titles. */
export async function getRatedMeals(userId = DEMO_USER_ID) {
	const rows = (await getSql()`
		SELECT m.title, r.keeper FROM meal_ratings r
		JOIN meals m ON m.id = r.meal_id
		WHERE r.user_id = ${userId}
		ORDER BY r.rated_at DESC
		LIMIT 40
	`) as { title: string; keeper: boolean }[];
	return {
		keepers: rows.filter((r) => r.keeper).map((r) => r.title).slice(0, 10),
		notKeepers: rows.filter((r) => !r.keeper).map((r) => r.title).slice(0, 10),
	};
}
