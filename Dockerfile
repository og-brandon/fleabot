FROM node:lts-stretch

WORKDIR /tmp/fleabot

ADD . ./

RUN npm install

CMD ["node", "fleabot.js"]
