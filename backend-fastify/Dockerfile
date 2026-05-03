FROM node:20-alpine

RUN apk add --no-cache openssl libc6-compat

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

# O npx prisma migrate dev irá gerar o client em tempo de execução
CMD ["sh", "-c", "npx prisma migrate dev --name init && node --import ./instrumentation.mjs server.js"]