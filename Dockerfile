FROM node:alpine

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install --loglevel verbose

# COPY nodemon.json .

COPY . .

CMD [ "npm", "run", "dev" ]