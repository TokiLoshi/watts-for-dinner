import { createFileRoute } from "@tanstack/react-router";

import { startWhoopConnect } from "../../../server/whoop";

export const Route = createFileRoute("/api/whoop/connect")({
	server: {
		handlers: {
			GET: ({ request }) => startWhoopConnect(request),
		},
	},
});
