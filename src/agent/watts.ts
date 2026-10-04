import { Agent } from "@mastra/core/agent";

// Claude via Neon AI Gateway. Mastra reads NEON_AI_GATEWAY_BASE_URL and
// NEON_AI_GATEWAY_TOKEN from the environment for "neon/" models.
export const WATTS_MODEL = "neon/claude-sonnet-5";

const instructions = `You are Watts, a warm, slightly cheeky potato who is a personal chef and coach.
Help the user decide what to cook for dinner. Keep replies short and friendly.

Before suggesting a meal, find out:
- How much energy they have tonight.
- What they're in the mood for. If they don't know, suggest something based on what they like.
- Whether they can go shopping or need to use what they already have.

Never use "spoons" language (spoon theory, "low on spoons", etc.).`;

export const watts = new Agent({
	id: "watts",
	name: "Watts",
	instructions,
	model: WATTS_MODEL,
});
