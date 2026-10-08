# Build stage: install deps and build the Nitro server bundle
FROM node:22-slim AS build
WORKDIR /app
# pnpm version comes from package.json "packageManager" (via corepack).
# Node 22's bundled corepack is too old for current pnpm signing keys, so pin a newer one.
RUN npm install -g corepack@0.35.0 && corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
ARG VITE_POSTHOG_KEY
ARG VITE_POSTHOG_HOST
ENV VITE_POSTHOG_KEY=$VITE_POSTHOG_KEY VITE_POSTHOG_HOST=$VITE_POSTHOG_HOST
RUN pnpm build

# Runtime stage: .output is self-contained, no node_modules needed
FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=8080
COPY --from=build /app/.output ./.output
EXPOSE 8080
CMD ["node", ".output/server/index.mjs"]
