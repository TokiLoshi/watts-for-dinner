import { createAuthClient } from "better-auth/react";

// Browser auth client. Talks to our own /api/auth routes (same origin).
export const authClient = createAuthClient();
