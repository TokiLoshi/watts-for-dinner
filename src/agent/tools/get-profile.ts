import { createTool } from "@mastra/core/tools";
import { z } from "zod";

import { getProfileForUser } from "../../server/profile";
import { userIdFrom } from "./user";

export const getProfile = createTool({
	id: "getProfile",
	description:
		"Get the user's saved profile: dietary preferences, goal, favourite meals and last night's dinner. Returns saved: false if they haven't done onboarding.",
	inputSchema: z.object({}),
	execute: async (_input, context) => {
		const profile = await getProfileForUser(userIdFrom(context));
		return profile ? { saved: true as const, ...profile } : { saved: false as const };
	},
});
