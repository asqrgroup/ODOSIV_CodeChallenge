FROM node:lts-alpine
WORKDIR /usr/src/app
COPY package.json package-lock.json* ./
COPY server ./server
COPY data ./data
RUN npm ci --production --silent
ENV PORT=4000
EXPOSE 4000
CMD ["node", "./server/index.js"]
