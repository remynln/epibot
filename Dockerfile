FROM node:current-alpine 
RUN npm i -g pnpm

WORKDIR /app

COPY package.json .
RUN pnpm i
COPY . .

CMD pnpm start