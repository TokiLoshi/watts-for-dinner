# Watts for Dinner

Open source (MIT) personal chef + coach agent. Hackathon project by Bianca and Michael.

## Stack
- TanStack Start (React, TypeScript), Tailwind
- Mastra agent, Claude via Neon AI Gateway
- Neon Postgres + Neon Auth
- assistant-ui (chat), React Three Fiber (Watts, the 3D character)
- Spoonacular (recipes), Whoop API (recovery/strain)
- Deployed to Fly.io (Dockerfile in repo root)

## Commands
- `pnpm dev` – dev server
- `pnpm build` – production build
- `pnpm start` – run the production build (`.output/server/index.mjs`; honors `PORT`, Docker/Fly use 8080)

## Folder ownership
- Bianca: `src/agent`, `src/server`, `src/db`
- Michael: `src/components`, `src/routes/onboarding`, `src/world`
- Touching the other person's folders? Ask first.

## Contracts
1. The Watts 3D component takes `mood: "idle" | "thinking" | "talking"`.
2. Onboarding calls the server function `saveProfile(profile: Profile)`:
   ```ts
   type Profile = {
     dietaryPreferences: string[];
     goal: "performance" | "lose_weight" | "build_muscle" | "maintain" | "other";
     goalNote?: string;
     favouriteMeals: string[];
     lastNightDinner: string;
   };
   ```

## Rules
- Every table has a `user_id` column. Until auth lands, use one hardcoded user.
- The browser never calls outside services. All API calls (Claude, Spoonacular,
  Whoop, Exa, Neon) go through server functions. Keys stay server-side; only
  `VITE_`-prefixed vars reach the client, so never put a secret in one.
- Env vars: see `.env.example`. Local values go in `.env.local`.

## Git
- `main` is the base. All changes go through branches + PRs; no direct commits to main.
- Branches: `bianca/<thing>` or `michael/<thing>`. Use `git switch` (`git switch -c bianca/foo`).
- Small PRs, small commits.
- Never commit `.env.local` or any secrets.

## Working style
- Plan before big changes; share the plan before writing code.
- Keep changes small and focused.
