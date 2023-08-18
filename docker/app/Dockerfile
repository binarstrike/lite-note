FROM node:18-slim AS builder

WORKDIR /build

RUN apt-get update \
	&& apt-get install -y openssl \
	&& rm -rf /var/lib/apt/lists/* \
	&& rm -rf /var/cache/apt/*

# install pnpm
RUN corepack enable pnpm

COPY pnpm-lock.yaml package.json ./
RUN pnpm install --frozen-lockfile

COPY src prisma tsconfig.json tsconfig.build.json ./
RUN pnpm prisma generate && pnpm build

FROM node:18-slim

WORKDIR /app

RUN apt-get update \
	&& apt-get install -y openssl wget \
	&& rm -rf /var/lib/apt/lists/* \
	&& rm -rf /var/cache/apt/*

RUN corepack enable pnpm

COPY pnpm-lock.yaml package.json ./

# copy node_modules dari builder stage karena terdapat
# library prisma client yang sudah disesuaikan dengan schema.
COPY --from=builder /build/node_modules ./node_modules
RUN pnpm prune --prod

COPY --from=builder /build/dist ./dist

CMD [ "node", "dist/main" ]