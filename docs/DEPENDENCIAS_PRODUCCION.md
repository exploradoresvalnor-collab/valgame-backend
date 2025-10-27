# 📦 DEPENDENCIAS Y VERSIONES EN PRODUCCIÓN

> **Última actualización:** 27 de octubre de 2025  
> **Entorno:** Render.com (Free Tier)  
> **Estado:** ✅ FUNCIONANDO EN PRODUCCIÓN

---

## 🚀 ENTORNO DE PRODUCCIÓN

### Plataforma: Render.com
- **Plan:** Free Tier (512 MB RAM)
- **URL:** https://valgame-backend.onrender.com
- **Runtime:** Node.js 22.16.0
- **Build Command:** `npm install && npm run build`
- **Start Command:** `node dist/app.js`

### Base de Datos: MongoDB Atlas
- **Cluster:** M0 Sandbox (Free Tier)
- **Versión MongoDB:** 8.0
- **Región:** AWS (us-east-1)
- **Conexión:** `MONGODB_URI` en variables de entorno

---

## 📋 VERSIONES EXACTAS DE DEPENDENCIAS

### Runtime Principal
```json
{
  "node": "22.16.0",
  "npm": "10.x"
}
```

### Dependencias de Producción (CRÍTICAS)

#### Framework y Servidor
```json
{
  "express": "^5.1.0",
  "typescript": "^5.9.3",
  "dotenv": "^17.2.1"
}
```

#### Base de Datos
```json
{
  "mongoose": "8.8.4",        // ⚠️ Tiene CVE pero mitigado con Zod
  "mongodb": "6.10.0"         // Driver nativo
}
```

**Nota de Seguridad:** 
- Mongoose 8.8.4 tiene vulnerabilidad de search injection
- **Mitigado:** Todas las entradas validadas con Zod antes de queries
- Actualizar cuando sea compatible con Node 22

#### Autenticación y Seguridad
```json
{
  "jsonwebtoken": "^9.0.2",   // JWT tokens (7 días duración)
  "bcryptjs": "^3.0.2",        // Hash de contraseñas
  "cookie-parser": "^1.4.7",   // httpOnly cookies
  "helmet": "^7.0.0",          // Headers de seguridad
  "express-rate-limit": "^7.0.0" // Rate limiting
}
```

#### CORS y Networking
```json
{
  "cors": "^2.8.5",            // CORS con credentials: true
  "socket.io": "^4.8.1"        // WebSocket tiempo real
}
```

#### Validación
```json
{
  "zod": "^4.1.11"             // Validación de esquemas
}
```

#### Email y Tareas
```json
{
  "nodemailer": "^7.0.6",      // Emails de verificación
  "node-cron": "^4.2.1"        // Cron jobs (permadeath, expiraciones)
}
```

#### TypeScript Types
```json
{
  "@types/cookie-parser": "^1.4.10",
  "@types/cors": "^2.8.19",
  "@types/express": "^5.0.3",
  "@types/jsonwebtoken": "^9.0.10",
  "@types/mongoose": "^5.11.96",
  "@types/node": "^24.2.1",
  "@types/node-cron": "^3.0.11",
  "@types/nodemailer": "^7.0.2"
}
```

---

## 🛠️ DEPENDENCIAS DE DESARROLLO

```json
{
  "devDependencies": {
    "@types/jest": "^29.5.4",
    "@types/supertest": "^2.0.13",
    "@typescript-eslint/eslint-plugin": "^8.46.2",
    "@typescript-eslint/parser": "^8.46.2",
    "eslint": "^9.38.0",
    "globals": "^16.4.0",
    "jest": "^29.6.1",
    "mongodb-memory-server": "^8.12.1",
    "nodemon": "^3.1.10",
    "supertest": "^6.3.3",
    "ts-jest": "^29.1.0",
    "ts-node": "^10.9.2",
    "ts-node-dev": "^2.0.0"
  }
}
```

---

## 🔧 CONFIGURACIÓN CRÍTICA

### Variables de Entorno Requeridas

```bash
# Base de datos
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/valgame

# Seguridad
JWT_SECRET=tu-secreto-super-seguro-aqui

# Servidor
PORT=8080
NODE_ENV=production

# Frontend
FRONTEND_ORIGIN=https://tu-frontend.com

# Email (opcional para verificación)
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_USER=tu-usuario
EMAIL_PASS=tu-password
EMAIL_FROM=noreply@valgame.com

# Testing (SOLO LOCAL, NO EN PRODUCCIÓN)
# TEST_MODE=true  ← NO poner en Render
```

### Configuración TypeScript (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

---

## 📊 VERIFICACIÓN DE COMPATIBILIDAD

### ✅ Compatibilidad Verificada

| Componente | Versión | Estado |
|------------|---------|--------|
| Node.js | 22.16.0 | ✅ Funcionando |
| MongoDB Atlas | 8.0 | ✅ Conectado |
| Express | 5.1.0 | ✅ Stable |
| Mongoose | 8.8.4 | ⚠️ CVE mitigado |
| TypeScript | 5.9.3 | ✅ Compilando |
| Socket.IO | 4.8.1 | ✅ WebSocket OK |

### ⚠️ Advertencias Conocidas

1. **Mongoose 8.8.4:**
   - CVE: Search injection en queries
   - Mitigación: Zod valida todas las entradas
   - Plan: Actualizar cuando sea compatible

2. **Render Free Tier:**
   - Cold start después de 15 min inactividad
   - 512 MB RAM (suficiente para MVP)
   - HTTPS automático incluido

---

## 🚀 COMANDOS DE INSTALACIÓN

### Instalación Limpia
```bash
# Clonar repositorio
git clone https://github.com/exploradoresvalnor-collab/valgame-backend.git
cd valgame-backend

# Instalar dependencias exactas
npm ci  # usa package-lock.json

# Configurar variables
cp .env.example .env
# Editar .env con tus credenciales

# Verificar configuración
npm run check-env

# Compilar TypeScript
npm run build

# Iniciar servidor
npm start
```

### Desarrollo Local
```bash
# Modo watch (recarga automática)
npm run dev

# Ejecutar tests
npm run test:master

# Lint y validación
npm run validate
```

---

## 🔄 PROCESO DE DESPLIEGUE EN RENDER

1. **Conectar GitHub:** Render auto-detecta cambios en `main`
2. **Build automático:** Ejecuta `npm install && npm run build`
3. **Start automático:** Ejecuta `node dist/app.js`
4. **Health Check:** Disponible en `/health`
5. **Logs:** Visibles en dashboard de Render

### Primera vez en Render:
```bash
# 1. Crear Web Service en Render
# 2. Conectar repo GitHub
# 3. Configurar:
Build Command: npm install && npm run build
Start Command: node dist/app.js
Node Version: 22

# 4. Agregar variables de entorno:
MONGODB_URI=...
JWT_SECRET=...
NODE_ENV=production
FRONTEND_ORIGIN=...
```

---

## 📈 MÉTRICAS DE PRODUCCIÓN

### Performance
- **Cold Start:** ~30-45 segundos (primera petición)
- **Warm Response:** <100ms promedio
- **WebSocket:** Conexión estable
- **Rate Limits:** Activos y funcionando

### Recursos
- **RAM Usage:** ~150-200 MB (de 512 MB)
- **CPU:** Bajo (<10% promedio)
- **Conexiones MongoDB:** Pool de 10

---

## 🔒 SEGURIDAD EN PRODUCCIÓN

### Headers de Seguridad (Helmet)
```javascript
helmet({
  contentSecurityPolicy: false,  // Para permitir WebSocket
  crossOriginEmbedderPolicy: false
})
```

### Rate Limiting Activo
```javascript
authLimiter: 50 requests / 15 min
gameplayLimiter: 60 requests / min
marketplaceLimiter: 50 requests / 5 min
apiLimiter: 300 requests / 15 min
```

### CORS Configurado
```javascript
cors({
  origin: process.env.FRONTEND_ORIGIN,
  credentials: true  // Para httpOnly cookies
})
```

---

## 🐛 TROUBLESHOOTING

### Error: "Cannot connect to MongoDB"
```bash
# Verificar IP whitelist en MongoDB Atlas
# Debe incluir: 0.0.0.0/0 para Render

# Verificar MONGODB_URI en variables de entorno
echo $MONGODB_URI
```

### Error: "Cold start timeout"
```bash
# Normal en Free Tier de Render
# Solución: Implementar health check cada 14 min
# O: Upgrade a Starter plan ($7/mes)
```

### Error: "Module not found"
```bash
# Limpiar y reinstalar
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📞 SOPORTE

- **Repositorio:** https://github.com/exploradoresvalnor-collab/valgame-backend
- **Issues:** https://github.com/exploradoresvalnor-collab/valgame-backend/issues
- **Documentación:** `/docs/`

---

**Mantenido por:** Equipo Exploradores de Valnor  
**Última verificación de producción:** 27 de octubre de 2025
