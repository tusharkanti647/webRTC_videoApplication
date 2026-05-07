FROM node:24-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install -g nodemon
COPY . .
EXPOSE 8010

CMD ["nodemon", "--legacy-watch", "index.js"]