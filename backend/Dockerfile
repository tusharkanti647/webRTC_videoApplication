# # Development Stage
# FROM node:18 AS development
# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# COPY . .
# CMD ["npm", "run", "dev"]

# # Production Stage
# FROM node:18 AS production
# WORKDIR /app
# COPY package*.json ./
# RUN npm install --production
# COPY . .
# CMD ["npm", "start"]

FROM node:24-alpine AS base

WORKDIR /app

COPY package*.json ./

# ======================
# Development
# ======================
FROM base AS development

RUN npm install
RUN npm install -g nodemon

COPY . .

EXPOSE 8000

CMD ["nodemon", "--legacy-watch", "index.js"]


# ======================
# Production
# ======================
FROM base AS production

RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production

EXPOSE 8000

USER node

CMD ["node", "index.js"]