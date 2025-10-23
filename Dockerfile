# Etapa 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar TypeScript directamente
RUN ./node_modules/.bin/tsc -p tsconfig.json

# Etapa 2: Production
FROM node:18-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --omit=dev

# Copiar código compilado desde builder
COPY --from=builder /app/dist ./dist

# Copiar otros archivos necesarios (si los hay)
COPY --from=builder /app/package.json ./

# Exponer puerto
EXPOSE 8080

# Comando para ejecutar
CMD ["npm", "start"]