FROM node:18

WORKDIR /app

COPY package.json packer-lock.json ./
RUN npm install

COPY . .

RUN npm run build

CMD ["npm", "run", "start"]