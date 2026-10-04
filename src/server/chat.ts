import { handleChatStream } from "@mastra/ai-sdk";
import { RequestContext } from "@mastra/core/request-context";
import { createUIMessageStreamResponse } from "ai";

import { mastra } from "../agent";
import { getUserId } from "./auth";

// Streams a Watts reply in AI SDK UI message format (what assistant-ui's
// useChatRuntime expects). Runs server-side only; gateway keys never reach the browser.
export async function handleChat(request: Request) {
	// Signed-in users only: this endpoint spends model and API credits.
	const userId = await getUserId(request.headers);
	if (!userId) return Response.json({ error: "Please sign in." }, { status: 401 });

	// Only take the conversation from the client; options like requestContext are set here.
	const body = (await request.json()) as { messages?: unknown; trigger?: "submit-message" | "regenerate-message" };
	if (!Array.isArray(body.messages)) return Response.json({ error: "messages is required" }, { status: 400 });

	const requestContext = new RequestContext();
	requestContext.set("userId", userId);

	const stream = await handleChatStream({
		mastra,
		agentId: "watts",
		params: { messages: body.messages, trigger: body.trigger, requestContext },
		version: "v7",
		// Log details server-side; never send stack traces or config errors to the browser.
		onError: (error) => {
			console.error("[chat]", error);
			return "Watts dropped the pan. Please try again.";
		},
	});
	return createUIMessageStreamResponse({ stream });
}
