FROM node:24-alpine

WORKDIR /app

# Сначала копируем манифесты — слой кэша для npm install
COPY package.json ./

# Ставим зависимости ВНУТРИ контейнера
RUN npm install

# Копируем исходники
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]
