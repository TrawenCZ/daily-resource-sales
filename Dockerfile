FROM node:alpine AS deps


WORKDIR /app

COPY ./package.json package.json
RUN npm i
RUN npm i -g pm2 ts-node
RUN apk add --no-cache bash



FROM deps AS build

WORKDIR /app

COPY . .
RUN npx prisma generate
RUN npm run build



FROM deps AS final

WORKDIR /app

RUN npm prune --production

COPY --from=build /app/.next .next/
COPY ./deployment/ .
COPY ./prisma/ prisma/
RUN npx prisma generate
RUN npm i --save-dev @types/pbkdf2

ENTRYPOINT [ "bash", "/app/start.sh" ]