FROM node:12.3.1

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install -g node-dev \
  && npm install
