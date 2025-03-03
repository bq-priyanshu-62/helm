FROM node:23.6-alpine

WORKDIR /app

#COPY ./package*.json ./
#RUN npm ci --only-production

COPY . .

RUN npm install
RUN npm ci --omit=dev

USER node

EXPOSE 8080

CMD ["node", "gw_sanity_server.js"]
