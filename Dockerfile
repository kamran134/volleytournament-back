FROM node:18

WORKDIR /app

COPY package.json packer-lock.json ./
RUN npm install --omit=dev

COPY . .

RUN npm run build

CMD ["npm", "run", "start"]