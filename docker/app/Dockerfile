FROM node:18-slim AS builder

WORKDIR /build

RUN apt-get update \
	&& apt-get install -y openssl \
	&& rm -rf /var/lib/apt/lists/* \
	&& rm -rf /var/cache/apt/*

RUN corepack enable pnpm

COPY . .
RUN pnpm install --frozen-lockfile \
	&& pnpm prisma generate \
	&& pnpm build \
	&& pnpm prune --prod

FROM node:18-slim

RUN apt-get update \
	&& apt-get install -y openssl wget \
	&& rm -rf /var/lib/apt/lists/* \
	&& rm -rf /var/cache/apt/*

WORKDIR /app

COPY --from=builder /build/node_modules ./node_modules
COPY --from=builder /build/dist ./dist

CMD [ "node", "dist/main" ]