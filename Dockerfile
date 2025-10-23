# Usar Node.js oficial
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar TODAS las dependencias (necesarias para build)
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar TypeScript usando npx (evita problemas de permisos)
RUN npx tsc -p tsconfig.json

# Limpiar devDependencies después del build
RUN npm prune --production

# Exponer puerto
EXPOSE 8080

# Comando para ejecutar
CMD ["npm", "start"]