import { createFileRoute } from "@tanstack/react-router";

import { finishWhoopConnect } from "../../../server/whoop";

export const Route = createFileRoute("/api/whoop/callback")({
	server: {
		handlers: {
			GET: ({ request }) => finishWhoopConnect(request),
		},
	},
});
