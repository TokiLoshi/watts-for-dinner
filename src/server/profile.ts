import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { z } from "zod";

import { getSql } from "../db/client";
import { requireUserId } from "./auth";

// Contract 2 in CLAUDE.md. Keep in sync.
export type Profile = {
	dietaryPreferences: string[];
	goal: "performance" | "lose_weight" | "build_muscle" | "maintain" | "other";
	goalNote?: string;
	favouriteMeals: string[];
	lastNightDinner: string;
};

const profileSchema = z
	.object({
		dietaryPreferences: z.array(z.string()),
		goal: z.enum(["performance", "lose_weight", "build_muscle", "maintain", "other"]),
		goalNote: z.string().optional(),
		favouriteMeals: z.array(z.string()),
		lastNightDinner: z.string(),
	})
	.strict() satisfies z.ZodType<Profile>;

// Usage: await saveProfile({ data: profile })
export const saveProfile = createServerFn({ method: "POST" })
	.validator(profileSchema)
	.handler(async ({ data }) => {
		const userId = await requireUserId(getRequestHeaders());
		const sql = getSql();
		await sql.transaction([
			sql`INSERT INTO users (user_id) VALUES (${userId}) ON CONFLICT DO NOTHING`,
			sql`
				INSERT INTO profiles (user_id, dietary_preferences, goal, goal_note, favourite_meals, last_night_dinner)
				VALUES (${userId}, ${data.dietaryPreferences}, ${data.goal}, ${data.goalNote ?? null}, ${data.favouriteMeals}, ${data.lastNightDinner})
				ON CONFLICT (user_id) DO UPDATE SET
					dietary_preferences = EXCLUDED.dietary_preferences,
					goal = EXCLUDED.goal,
					goal_note = EXCLUDED.goal_note,
					favourite_meals = EXCLUDED.favourite_meals,
					last_night_dinner = EXCLUDED.last_night_dinner,
					updated_at = now()
			`,
		]);
		return { ok: true as const };
	});

/** The user's saved profile, or null if onboarding hasn't saved one. Server-only. */
export async function getProfileForUser(userId: string): Promise<Profile | null> {
	const rows = (await getSql()`
		SELECT dietary_preferences, goal, goal_note, favourite_meals, last_night_dinner
		FROM profiles WHERE user_id = ${userId}
	`) as {
		dietary_preferences: string[];
		goal: Profile["goal"];
		goal_note: string | null;
		favourite_meals: string[];
		last_night_dinner: string;
	}[];
	const r = rows[0];
	if (!r) return null;
	return {
		dietaryPreferences: r.dietary_preferences,
		goal: r.goal,
		...(r.goal_note ? { goalNote: r.goal_note } : {}),
		favouriteMeals: r.favourite_meals,
		lastNightDinner: r.last_night_dinner,
	};
}
