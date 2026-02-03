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

FROM node:24

# WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .
EXPOSE 8000
CMD ["node", "index.js"]
