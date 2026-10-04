# AGENTS.md

Short mirror of `CLAUDE.md` (the source of truth) for other coding agents.

- **App:** Watts for Dinner, an MIT-licensed personal chef + coach agent.
- **Stack:** TanStack Start + React + TS, Tailwind, Mastra, Claude via Neon AI Gateway,
  Neon Postgres, Better Auth (Google), assistant-ui, Spoonacular, Whoop, React Three Fiber, Fly.io.
- **Commands:** `pnpm dev`, `pnpm build`, `pnpm start`.
- **Ownership:** Bianca owns `src/agent`, `src/server`, `src/db`. Michael owns
  `src/components`, `src/routes/onboarding`, `src/world`.
- **Contract 1:** Watts 3D component prop `mood: "idle" | "thinking" | "talking"`.
- **Contract 2:** onboarding calls `saveProfile({ data: profile })` from `src/server/profile.ts`, where
  `Profile = { dietaryPreferences: string[]; goal: "performance" | "lose_weight" | "build_muscle" | "maintain" | "other"; goalNote?: string; favouriteMeals: string[]; lastNightDinner: string }`.
- **Contract 4:** chat UI sends the fridge photo as an image part, then `Energy: N/10` (+ `Craving: x`); recipe cards render `findRecipes` output; cook = `Let's cook <title> (recipe <id>)`.
- **Data:** every table has `user_id`; it's the signed-in user's id (uuid; Better Auth with Google, `src/server/auth.ts`); signed-out requests are rejected. Migrate: `pnpm db:migrate`.
- **Security:** the browser never calls outside services; keys stay server-side.
- **Git:** base is `main`; work on `bianca/<thing>` or `michael/<thing>` via `git switch`;
  small PRs and commits; never commit `.env.local`.
- **Process:** plan before big changes.
