// The signed-in user's id, set server-side by src/server/chat.ts on Mastra's
// requestContext. Tools never trust a user id from the model or the client.
export function userIdFrom(context: { requestContext?: { get(key: string): unknown } }): string {
	const userId = context.requestContext?.get("userId");
	if (typeof userId !== "string") throw new Error("No signed-in user on the request");
	return userId;
}
