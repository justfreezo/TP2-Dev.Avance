FROM node:lts-bookworm-slim

WORKDIR /usr/src/app

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

COPY package*.json ./

RUN npm install

COPY .env ./

COPY . .

CMD ["node", "src/server.js"]