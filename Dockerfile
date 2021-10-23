FROM node:14-alpine
COPY . /src
WORKDIR /src
RUN npm install
EXPOSE 3000
ENTRYPOINT ["npm", "start"]
