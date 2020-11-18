FROM node:12-alpine

RUN mkdir -p /usr/server

WORKDIR /usr/server

COPY package.json /usr/server/package.json

RUN npm install --silent

CMD npm run dev