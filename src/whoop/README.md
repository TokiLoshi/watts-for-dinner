# whoop toolkit

A tiny, dependency-free client for the [WHOOP API v2](https://developer.whoop.com/api):
OAuth helpers plus typed `getLatestRecovery`, `getLatestCycle` and `getLatestSleep`.
Uses plain `fetch`, so it runs on Node 18+, Bun, Deno and edge runtimes. MIT licensed.

## OAuth

```ts
import { buildAuthorizeUrl, exchangeCode } from "./whoop";

// 1. Redirect the user (state must be >= 8 chars; store it to compare later)
const url = buildAuthorizeUrl({
  clientId, redirectUri, state,
  scopes: ["offline", "read:recovery", "read:cycles", "read:sleep"],
});

// 2. In your callback, after checking `state`
const tokens = await exchangeCode({ clientId, clientSecret, code, redirectUri });
```

Request `offline` to get a refresh token.

## Reading data

```ts
import { createWhoopClient } from "./whoop";

const whoop = createWhoopClient({
  clientId, clientSecret, tokens,
  onTokens: (next) => saveTokens(next), // WHOOP rotates refresh tokens: always persist
});

const recovery = await whoop.getLatestRecovery(); // score.recovery_score, hrv_rmssd_milli, resting_heart_rate
const cycle = await whoop.getLatestCycle();       // score.strain
const sleep = await whoop.getLatestSleep();       // latest non-nap sleep
```

The client refreshes the access token when it is about to expire, or once on a 401.
Score fields are only present when `score_state === "SCORED"`.

`fixtures/` holds example responses with the real shape and made-up values.
