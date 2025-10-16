# Use Node.js LTS
FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

# Instalamos todo (en dev necesitamos types)
RUN npm install

COPY . .

# Compila solo si es producción
RUN if [ "$NODE_ENV" = "production" ]; then npm run build; fi

EXPOSE 3000

CMD ["npm", "run", "dev"]
