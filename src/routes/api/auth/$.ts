import { createFileRoute } from "@tanstack/react-router";

import { auth } from "../../../server/auth";

// Better Auth endpoints, incl. the Google callback at /api/auth/callback/google.
export const Route = createFileRoute("/api/auth/$")({
	server: {
		handlers: {
			GET: ({ request }) => auth.handler(request),
			POST: ({ request }) => auth.handler(request),
		},
	},
});
