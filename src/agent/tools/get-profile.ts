import { createTool } from "@mastra/core/tools";
import { z } from "zod";

import { getProfileForUser } from "../../server/profile";

export const getProfile = createTool({
	id: "getProfile",
	description:
		"Get the user's saved profile: dietary preferences, goal, favourite meals and last night's dinner. Returns saved: false if they haven't done onboarding.",
	inputSchema: z.object({}),
	execute: async () => {
		const profile = await getProfileForUser();
		return profile ? { saved: true as const, ...profile } : { saved: false as const };
	},
});
