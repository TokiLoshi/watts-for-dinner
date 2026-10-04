import { handleChatStream } from "@mastra/ai-sdk";
import { createUIMessageStreamResponse } from "ai";

import { mastra } from "../agent";

// Streams a Watts reply in AI SDK UI message format (what assistant-ui's
// useChatRuntime expects). Runs server-side only; gateway keys never reach the browser.
export async function handleChat(request: Request) {
	const params = await request.json();
	const stream = await handleChatStream({
		mastra,
		agentId: "watts",
		params,
		version: "v7",
		// Log details server-side; never send stack traces or config errors to the browser.
		onError: (error) => {
			console.error("[chat]", error);
			return "Watts dropped the pan. Please try again.";
		},
	});
	return createUIMessageStreamResponse({ stream });
}
