FROM node:20-alpine

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install --production

COPY . .

EXPOSE 5000

CMD [ "yarn", "start" ]
