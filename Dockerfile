FROM node:lts-stretch

WORKDIR /tmp/fleabot

ADD . ./build

RUN mkdir ./app && \
     npm --prefix build install && \
     npm --prefix build run build && \
     mv ./build/dist/* /tmp/fleabot/app && \
     mv ./build/node_modules /tmp/fleabot/app && \
     rm -rf ./build

CMD ["node", "/tmp/fleabot/app/fleabot.js"]
