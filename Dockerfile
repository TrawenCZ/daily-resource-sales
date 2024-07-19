FROM node:slim AS deps
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable



WORKDIR /app

COPY ./package.json package.json
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install 
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm add -g pm2 ts-node
RUN apt-get install bash



FROM deps AS build

WORKDIR /app


COPY . .
RUN pnpx prisma generate
RUN pnpm run build



FROM deps AS final

WORKDIR /app

RUN pnpm prune --prod

COPY --from=build /app/.next .next/
COPY ./deployment/ .
COPY ./prisma/ prisma/
RUN pnpx prisma generate
RUN pnpm add @types/pbkdf2

ENTRYPOINT [ "bash", "/app/start.sh" ]