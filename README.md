# Watts for Dinner 🥔

Watts is a warm, slightly cheeky potato who's your personal chef and coach. He reads your **WHOOP recovery**, looks in your **fridge** from one photo, and suggests **three recipes that fit your energy tonight**, from a quick fix to something more ambitious. Pick one and he gives you a short shopping list and step-by-step directions, then remembers which meals were **keepers** so tomorrow's ideas get better.

**Live demo:** https://watts-for-dinner.fly.dev (sign in with Google)

> 📸 _Screenshot coming soon._

<!-- Add docs/screenshot.png, then replace the line above with: ![Watts for Dinner](docs/screenshot.png) -->

## How it works

- **[TanStack Start](https://tanstack.com/start)** (React, TypeScript, Tailwind) for the app and its server routes and server functions.
- **[Mastra](https://mastra.ai)** agent (`src/agent`) with tools for profile, recovery, recipes, cooking steps, meal memory and keeper ratings.
- **Claude** (Sonnet) through the **[Neon AI Gateway](https://neon.com/docs/ai-gateway/overview)**, including vision for fridge photos.
- **[Neon Postgres](https://neon.com)** for profiles, meals, ratings and WHOOP tokens: one SQL file, no ORM (`src/db/schema.sql`).
- **[Better Auth](https://www.better-auth.com)** with Google sign-in, stored in the same Neon database.
- **[assistant-ui](https://www.assistant-ui.com)** for the streaming chat and recipe cards.
- **[Spoonacular](https://spoonacular.com/food-api)** for real recipes, ranked by what's already in your fridge.
- **[WHOOP API v2](https://developer.whoop.com)** for recovery, strain and sleep.
- **[Fly.io](https://fly.io)** for hosting (`Dockerfile`, `fly.toml`).
- **[CodeRabbit](https://coderabbit.ai)** reviews every pull request.

The browser never talks to outside services: every API key stays on the server.

## The WHOOP toolkit (`src/whoop`)

A tiny, dependency-free WHOOP API v2 client you can lift into your own project: OAuth helpers, typed reads, and token refresh that handles WHOOP's refresh-token rotation. Plain `fetch`, so it runs on Node, Bun, Deno and edge runtimes.

```ts
import { buildAuthorizeUrl, createWhoopClient, exchangeCode } from "./whoop";

// 1. Send the user to WHOOP (request "offline" to get a refresh token)
const url = buildAuthorizeUrl({ clientId, redirectUri, state, scopes: ["offline", "read:recovery", "read:cycles", "read:sleep"] });

// 2. In your callback, after checking state
const tokens = await exchangeCode({ clientId, clientSecret, code, redirectUri });

// 3. Read data; persist every refreshed token set
const whoop = createWhoopClient({ clientId, clientSecret, tokens, onTokens: saveTokens });
const recovery = await whoop.getLatestRecovery(); // score.recovery_score, hrv_rmssd_milli, resting_heart_rate
```

More in [`src/whoop/README.md`](src/whoop/README.md). Example responses (real shape, made-up values) are in `src/whoop/fixtures/`.

## Run it yourself

1. Copy `.env.example` to `.env.local` and fill it in: Neon `DATABASE_URL`, Neon AI Gateway, Better Auth + Google OAuth, WHOOP and Spoonacular keys.
2. Install, create the tables and start:

   ```bash
   pnpm install
   pnpm db:migrate
   pnpm dev --port 3100
   ```

3. Spoonacular's free tier is 50 points a day, so in development set `FAKE_SPOONACULAR=1` to use the fixtures in `src/recipes/fixtures/`.

Register `http://localhost:3100/api/auth/callback/google` with Google and `http://localhost:3100/api/whoop/callback` with WHOOP.

## Fork it for your goals

Watts' personality and rules live in one place: the `instructions` in [`src/agent/watts.ts`](src/agent/watts.ts). Change the effort bands, the tone, or what he optimises for (marathon training, a budget, a picky toddler), and the tools in `src/agent/tools/` keep working. The model id is the `WATTS_MODEL` constant in the same file.

## Roadmap

- **Same-fridge memory:** remember what was in your fridge so you don't need a new photo every night.
- **3D Watts moods:** an animated Watts that thinks and talks along with the chat.
- **Voice:** talk to Watts while your hands are busy.
- **Exa recipe inspiration:** ideas from around the web, beyond Spoonacular.

## Credits

Food photos in `public/recipes/` are from [Unsplash](https://unsplash.com), used under the [Unsplash License](https://unsplash.com/license):

- [Yogurt bowl](https://unsplash.com/photos/a-bowl-of-yogurt-with-blackberries-and-granola-qj_zfYm-sdI) by [Natalie Behn](https://unsplash.com/@natalie_behn)
- [Avocado toast](https://unsplash.com/photos/brown-bread-with-green-vegetable-on-white-ceramic-plate-ZSAE2DubK94) by [Fernanda Martinez](https://unsplash.com/@fermtz05)
- [Caprese salad](https://unsplash.com/photos/sliced-tomato-and-green-leaf-vegetable-on-white-ceramic-plate-vIm26fn_QKg) by [Luisa Brimble](https://unsplash.com/@luisabrimble)
- [Veggie wrap](https://unsplash.com/photos/a-wrap-and-salad-on-a-white-plate--KLZWBqfq6c) by [Giorgio Trovato](https://unsplash.com/@giorgiotrovato)
- [Tuna salad](https://unsplash.com/photos/plate-of-food-on-wooden-surface-LzeNab6mRZY) by [Fallon Michael](https://unsplash.com/@fallonmichaeltx)
- [Peanut noodles](https://unsplash.com/photos/white-ceramic-bowl-with-brown-chopsticks-gMHYBkmhI-g) by [laura limsenkhe](https://unsplash.com/@limsenkhe)
- [Quesadilla](https://unsplash.com/photos/a-plate-topped-with-a-quesadilla-cut-in-half-_BW-YmENFcM) by [Benjamin Guardia](https://unsplash.com/@benjaminguardia)
- [Shakshuka](https://unsplash.com/photos/cooked-food-on-pan-gWkvURhoMlA) by [Toa Heftiba](https://unsplash.com/@heftiba)
- [Black bean tacos](https://unsplash.com/photos/vegetable-salad-on-white-ceramic-plate-hAFCfzaeVJg) by [Quin Engle](https://unsplash.com/@twistsandzests)
- [Garlic shrimp](https://unsplash.com/photos/cooked-food-on-black-ceramic-bowl-HNmcgpzPHag) by [Farhad Ibrahimzade](https://unsplash.com/@ferhadd)
- [Pesto pasta with chicken](https://unsplash.com/photos/green-pasta-on-white-plate-aEacRwpDnu4) by [cindy fernandez](https://unsplash.com/@bycindys)
- [Salmon with broccoli](https://unsplash.com/photos/a-black-plate-topped-with-salmon-and-broccoli-RZV1-tNbHy4) by [Camara Negra](https://unsplash.com/@camaranegra)
- [Beef & broccoli stir-fry](https://unsplash.com/photos/beef-and-broccoli-stir-fry-with-vegetables-on-a-red-plate-qKPKDb4_W24) by [Davis Dai](https://unsplash.com/@lingo4208)
- [Green curry](https://unsplash.com/photos/a-close-up-of-a-green-curry-with-mushrooms-and-chili-rhR7wf0aH28) by [Diego Arenas de Rodrigo](https://unsplash.com/@diegoarenasderodrigo)
- [Burrito bowl](https://unsplash.com/photos/corn-and-sliced-tomato-on-white-ceramic-bowl-zhkhwGrqilw) by [David Foodphototasty](https://unsplash.com/@phototastyfood)
- [Chicken tikka masala](https://unsplash.com/photos/roti-and-meat-slices-with-sauce-on-plate-ZSukCSw5VV4) by [amirali mirhashemian](https://unsplash.com/@amir_v_ali)
- [Roast chicken](https://unsplash.com/photos/chicken-on-black-round-plate-BhnZwPW_tIc) by [Anshu A](https://unsplash.com/@anshu18)
- [Lasagna](https://unsplash.com/photos/a-white-plate-topped-with-lasagna-covered-in-sauce-flEUTTwGlJQ) by [Emanuel Ekström](https://unsplash.com/@emanuelekstrom)
- [Pasta with ragù](https://unsplash.com/photos/penne-pasta-with-meat-sauce-flFd8L7_B3g) by [Ben Lei](https://unsplash.com/@bleiplays33)
- [Ramen](https://unsplash.com/photos/round-white-bowl-with-ramen-and-egg-rAyCBQTH7ws) by [Michele Blackwell](https://unsplash.com/@mab_studio)

Fonts: [Fraunces](https://fonts.google.com/specimen/Fraunces) and [Inter](https://fonts.google.com/specimen/Inter), both under the [SIL Open Font License](https://openfontlicense.org).

Recipe data from [Spoonacular](https://spoonacular.com/food-api). Built by Bianca and Michael at a hackathon.

## Licence and privacy

[MIT](LICENSE) © 2026 Bianca and Michael. See the [privacy policy](https://watts-for-dinner.fly.dev/privacy) for what we collect and why.
