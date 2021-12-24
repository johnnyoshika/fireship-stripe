FROM node:16
WORKDIR /usr/server

COPY package*.json ./
RUN npm ci

ENV NODE_ENV=production

COPY . .

RUN npm run build

CMD ["npm", "start"]