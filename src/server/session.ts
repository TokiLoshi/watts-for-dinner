import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { auth } from "./auth";
import { hasProfile } from "./profile";

/** The signed-in user ({ id, name, email, hasProfile }) or null. Used by the root route guard. */
export const getSessionUser = createServerFn({ method: "GET" }).handler(async () => {
	const session = await auth.api.getSession({ headers: getRequestHeaders() });
	if (!session) return null;
	const { id, name, email } = session.user;
	return { id, name, email, hasProfile: await hasProfile(id) };
});
