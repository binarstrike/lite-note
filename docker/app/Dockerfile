FROM node:18-alpine AS builder

WORKDIR /tmp/build

RUN corepack enable pnpm

RUN --mount=type=cache,id=apk-cache,target=/var/cache/apk apk add openssl

COPY . .
RUN --mount=type=cache,id=pnpm-store-cache,target=/root/.local/share/pnpm/store/v3 \
<<EOF
    set -e
    pnpm install --frozen-lockfile
    pnpm prisma generate
    pnpm lint
    pnpm build
EOF

FROM node:18-alpine

LABEL APP_NAME="Lite Note"

ENV APP_WORKDIR=/opt/liteNote
WORKDIR ${APP_WORKDIR}

RUN corepack enable pnpm

COPY --from=builder /tmp/build/dist ./dist

RUN --mount=type=cache,id=apk-cache,target=/var/cache/apk apk add openssl curl

COPY ./prisma/schema.prisma ./package.json ./pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-store-cache,target=/root/.local/share/pnpm/store/v3 pnpm install --offline --prod

COPY --chmod=700 ./scripts/app-entrypoint.sh /usr/local/bin/

ENTRYPOINT [ "app-entrypoint.sh" ]