FROM node:18-alpine AS builder

WORKDIR /build

RUN --mount=type=cache,id=apk-cache,target=/var/cache/apk apk add openssl

RUN corepack enable pnpm

COPY . .
RUN --mount=type=cache,id=pnpm-store-cache,target=/root/.local/share/pnpm/store pnpm install --frozen-lockfile \
	&& pnpm prisma generate \
	&& pnpm build

FROM node:18-alpine

WORKDIR /app

RUN corepack enable pnpm

RUN --mount=type=cache,id=apk-cache,target=/var/cache/apk apk add openssl curl

COPY ./prisma/schema.prisma ./package.json ./pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-store-cache,target=/root/.local/share/pnpm/store pnpm install --offline --prod

COPY --from=builder /build/dist ./dist

COPY --chmod=700 ./scripts/app-entrypoint.sh /usr/local/bin/

ENTRYPOINT [ "app-entrypoint.sh" ]