import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { auth } from "./auth";

/** The signed-in user ({ id, name, email }) or null. Used by the root route guard. */
export const getSessionUser = createServerFn({ method: "GET" }).handler(async () => {
	const session = await auth.api.getSession({ headers: getRequestHeaders() });
	if (!session) return null;
	return { id: session.user.id, name: session.user.name, email: session.user.email };
});
