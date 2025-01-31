# Базовый образ
FROM node:18

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы проекта
COPY package.json package-lock.json ./
RUN npm install --omit-dev

# Копируем весь код
COPY . .

# Собираем TypeScript-код
RUN npm run build

# Указываем порт и команду запуска
EXPOSE 4000
CMD ["node", "dist/index.js"]