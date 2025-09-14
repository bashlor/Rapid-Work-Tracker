FROM node:24-alpine AS base

FROM base AS builder
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate
ENV PNPM_HOME=/usr/local/bin

RUN pnpm install -g turbo@^2

COPY . .

# Generate a partial monorepo with a pruned lockfile for a target workspace.
RUN turbo prune rapidwork-web --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate
ENV PNPM_HOME=/usr/local/bin

# Build arguments for frontend environment variables
ARG VITE_API_BASE_URL
ARG VITE_APP_DEBUG
ARG VITE_NODE_ENV

# Set environment variables for build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_APP_DEBUG=$VITE_APP_DEBUG
ENV VITE_NODE_ENV=$VITE_NODE_ENV

# First install the dependencies (as they change less often)
COPY --from=builder /app/out/json/ .
RUN pnpm install --ignore-scripts

# Build the project - IMPORTANT: Build all packages first
COPY --from=builder /app/out/full/ .
# Clean and build domain-rapid-work first (dependency)
RUN pnpm run --filter=domain-rapid-work clean || true
RUN pnpm run build --filter=domain-rapid-work
# Then build the main app
RUN pnpm run build --filter=rapidwork-web
#RUN --mount=type=cache,id=pnpm,target=~/.pnpm-store pnpm prune --prod --no-optional
RUN cd apps/rapidwork-web/build && pnpm i --prod

FROM base AS runner

WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 rapidwork-web
USER rapidwork-web

# Node modules (root and app)
COPY --from=installer --chown=rapidwork-web:nodejs /app/node_modules ./node_modules
COPY --from=installer --chown=rapidwork-web:nodejs /app/apps/rapidwork-web/node_modules ./apps/rapidwork-web/node_modules
COPY --from=installer --chown=rapidwork-web:nodejs /app/package.json ./package.json

# IMPORTANT: Copy the built domain package
COPY --from=installer --chown=rapidwork-web:nodejs /app/packages/domain-rapid-work/dist ./packages/domain-rapid-work/dist
COPY --from=installer --chown=rapidwork-web:nodejs /app/packages/domain-rapid-work/package.json ./packages/domain-rapid-work/package.json

# Application files - Updated paths for new structure
COPY --from=installer --chown=rapidwork-web:nodejs /app/apps/rapidwork-web/build/ace.js ./apps/rapidwork-web/ace.js
COPY --from=installer --chown=rapidwork-web:nodejs /app/apps/rapidwork-web/build/adonisrc.js ./apps/rapidwork-web/adonisrc.js
COPY --from=installer --chown=rapidwork-web:nodejs /app/apps/rapidwork-web/build/package.json ./apps/rapidwork-web/package.json
COPY --from=installer --chown=rapidwork-web:nodejs /app/apps/rapidwork-web/build/app ./apps/rapidwork-web/app
COPY --from=installer --chown=rapidwork-web:nodejs /app/apps/rapidwork-web/build/bin ./apps/rapidwork-web/bin
COPY --from=installer --chown=rapidwork-web:nodejs /app/apps/rapidwork-web/build/config ./apps/rapidwork-web/config
COPY --from=installer --chown=rapidwork-web:nodejs /app/apps/rapidwork-web/build/database ./apps/rapidwork-web/database
COPY --from=installer --chown=rapidwork-web:nodejs /app/apps/rapidwork-web/build/start ./apps/rapidwork-web/start
COPY --from=installer --chown=rapidwork-web:nodejs /app/apps/rapidwork-web/build/public ./apps/rapidwork-web/public
COPY --from=installer --chown=rapidwork-web:nodejs /app/apps/rapidwork-web/build/resources ./apps/rapidwork-web/resources


# Copy entrypoint script
COPY --chown=rapidwork-web:nodejs entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

EXPOSE 3333
ENTRYPOINT ["./entrypoint.sh"]
