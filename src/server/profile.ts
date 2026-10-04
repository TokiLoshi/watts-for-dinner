import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getSql } from "../db/client";
import { DEMO_USER_ID } from "../db/demo-user";

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
		const sql = getSql();
		await sql.transaction([
			sql`INSERT INTO users (user_id) VALUES (${DEMO_USER_ID}) ON CONFLICT DO NOTHING`,
			sql`
				INSERT INTO profiles (user_id, dietary_preferences, goal, goal_note, favourite_meals, last_night_dinner)
				VALUES (${DEMO_USER_ID}, ${data.dietaryPreferences}, ${data.goal}, ${data.goalNote ?? null}, ${data.favouriteMeals}, ${data.lastNightDinner})
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
