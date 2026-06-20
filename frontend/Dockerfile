FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8081

ENV CI=1

CMD ["npx", "expo", "start", "--web"]
