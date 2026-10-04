import { createFileRoute } from "@tanstack/react-router";

import { getUserId } from "../../../server/auth";
import { disconnectWhoop } from "../../../server/whoop";

// POST /api/whoop/disconnect: revoke WHOOP access and delete the signed-in user's tokens.
export const Route = createFileRoute("/api/whoop/disconnect")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const userId = await getUserId(request.headers);
				if (!userId) return Response.json({ error: "Please sign in." }, { status: 401 });
				return Response.json(await disconnectWhoop(userId));
			},
		},
	},
});
