FROM node:20-alpine

WORKDIR /usr/src/app
# Just gives the prisma schema the url at buildtime
ENV DATABASE_URL="postgresql://postgres:postgres@db:5432/oont_db?schema=public"

COPY package*.json ./

RUN npm install

COPY . .
RUN npx prisma generate

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/src/main.js"]