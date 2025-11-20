# 🚀 DEPLOYMENT EN RENDER - Valgame Backend

**Última actualización:** 20 de noviembre de 2025  
**Tiempo de lectura:** 12 minutos

---

## 🎯 VISIÓN GENERAL

Guía completa para desplegar el backend Valgame en Render.com, incluyendo configuración, variables de entorno, monitoreo y troubleshooting.

---

## 🏗️ PREPARACIÓN PARA DEPLOYMENT

### Requisitos Previos
- ✅ Cuenta en [Render.com](https://render.com)
- ✅ Repositorio GitHub con código
- ✅ Variables de entorno configuradas
- ✅ Base de datos MongoDB Atlas
- ✅ Tests pasando localmente

### Estructura del Proyecto
```
valgame-backend/
├── src/
│   ├── app.ts              # Configuración Express
│   ├── server.ts           # Punto de entrada
│   └── ...
├── package.json            # Dependencias y scripts
├── tsconfig.json           # Configuración TypeScript
├── jest.config.cjs         # Configuración testing
└── docs/                   # Documentación
```

### Scripts en package.json
```json
{
  "name": "valgame-backend",
  "version": "1.0.0",
  "main": "dist/server.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "test": "jest",
    "lint": "eslint src/**/*.ts",
    "clean": "rm -rf dist"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.0",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "zod": "^3.22.4",
    "helmet": "^7.1.0",
    "cors": "^2.8.5",
    "express-rate-limit": "^7.1.5",
    "winston": "^3.11.0",
    "compression": "^1.7.4"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/express": "^4.17.21",
    "@types/bcrypt": "^5.0.2",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/cors": "^2.8.17",
    "@types/compression": "^1.7.5",
    "typescript": "^5.3.0",
    "ts-node-dev": "^2.0.0",
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "mongodb-memory-server": "^9.0.0"
  }
}
```

---

## 🔧 CONFIGURACIÓN EN RENDER.COM

### Paso 1: Crear Nuevo Web Service

1. **Acceder a Render Dashboard**
   - Ir a [dashboard.render.com](https://dashboard.render.com)
   - Click en "New +" → "Web Service"

2. **Conectar Repositorio**
   - Seleccionar "Connect GitHub"
   - Autorizar acceso al repositorio
   - Buscar y seleccionar `valgame-backend`

3. **Configuración Básica**
   ```
   Name: valgame-backend
   Environment: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

### Paso 2: Configuración Avanzada

#### Runtime
```
Node Version: 18.17.0 (o superior)
Region: Oregon (US-West) - para baja latencia
Instance Type: Free (para desarrollo) / Starter (para producción)
```

#### Build Settings
```
Root Directory: (dejar vacío)
Build Command: npm install && npm run build
Start Command: npm start
Health Check Path: /health
```

#### Environment Variables
Configurar todas las variables requeridas:

```
# Base de Datos
MONGODB_URI=mongodb+srv://user:password@cluster.xxxxx.mongodb.net/valgame-prod?retryWrites=true&w=majority

# Autenticación
JWT_SECRET=tu_jwt_secret_muy_seguro_de_al_menos_256_bits

# Entorno
NODE_ENV=production
PORT=10000

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password

# Logging
LOG_LEVEL=info
```

### Paso 3: Configuración de Red

#### Custom Domain (Opcional)
```
Domain: api.valgame.com
SSL: Automatic (Let's Encrypt)
```

#### CORS Origins
Configurar en código para producción:
```typescript
const corsOptions = {
  origin: [
    'https://valgame-frontend.vercel.app',
    'https://valgame.com',
    'https://www.valgame.com'
  ],
  credentials: true
};
```

---

## 📊 MONITOREO Y LOGGING

### Logs en Render
```bash
# Ver logs en tiempo real
render logs --service-id <service-id>

# Ver logs históricos
render logs --service-id <service-id> --since 1h

# Filtrar logs por nivel
render logs --service-id <service-id> --filter "ERROR"
```

### Health Check Endpoint
```typescript
// src/routes/health.ts
import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/health', async (req, res) => {
  try {
    // Verificar conexión a base de datos
    await mongoose.connection.db.admin().ping();

    // Verificar memoria
    const memUsage = process.memoryUsage();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024),
        total: Math.round(memUsage.heapTotal / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024)
      },
      database: {
        name: mongoose.connection.name,
        state: mongoose.connection.readyState
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
```

### Métricas Personalizadas
```typescript
// src/middleware/metrics.ts
import { Request, Response, NextFunction } from 'express';

export const requestMetrics = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, originalUrl } = req;
    const { statusCode } = res;

    console.log(`[${new Date().toISOString()}] ${method} ${originalUrl} ${statusCode} ${duration}ms`);
  });

  next();
};
```

---

## 🔄 DEPLOYMENT AUTOMÁTICO

### GitHub Integration
```yaml
# .github/workflows/deploy.yml
name: Deploy to Render
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run test:ci

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to Render
        run: curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}
```

### Webhook Configuration
1. En Render: Settings → Webhooks
2. Crear webhook para "Deploy succeeded"
3. URL: Tu webhook de notificación (Slack, Discord, etc.)

---

## 🐛 TROUBLESHOOTING

### Problemas Comunes

#### Build Fails
```
Error: Cannot find module 'typescript'
```
**Solución:** Verificar que TypeScript esté en dependencies, no solo devDependencies.

```
Error: ENOENT: no such file or directory, stat 'dist/server.js'
```
**Solución:** Verificar que el build command genere el archivo correcto.

#### Runtime Errors
```
Error: MongoNetworkError: connection timed out
```
**Solución:** Verificar MONGODB_URI y whitelist de IPs en MongoDB Atlas.

```
Error: JWT secret not found
```
**Solución:** Verificar que JWT_SECRET esté configurado en environment variables.

#### Memory Issues
```
FATAL ERROR: Reached heap limit
```
**Solución:** 
- Aumentar instance type en Render
- Optimizar queries de base de datos
- Implementar caching

### Debug Commands
```bash
# Ver estado del servicio
render services list

# Reiniciar servicio
render services restart <service-id>

# Ver environment variables
render services env <service-id>

# Ver métricas de uso
render services metrics <service-id>
```

---

## 🚀 OPTIMIZACIONES PARA PRODUCCIÓN

### Performance
```typescript
// src/config/production.ts
export const productionConfig = {
  // Connection pooling
  mongoose: {
    maxPoolSize: 10,
    minPoolSize: 5,
    maxIdleTimeMS: 30000
  },

  // Compression
  compression: {
    level: 6,
    threshold: 1024
  },

  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },

  // Caching (si implementas Redis)
  cache: {
    ttl: 3600, // 1 hour
    maxSize: 100 // maximum 100 items
  }
};
```

### Security Hardening
```typescript
// src/middleware/security.ts
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

export const securityMiddleware = [
  // Security headers
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }
  }),

  // Rate limiting
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Demasiadas peticiones desde esta IP'
  })
];
```

### Error Handling
```typescript
// src/middleware/errorHandler.ts
export const errorHandler = (err: Error, req: Request, res: Response, next: Function) => {
  console.error(err.stack);

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(500).json({
    success: false,
    error: {
      message: isDevelopment ? err.message : 'Error interno del servidor',
      ...(isDevelopment && { stack: err.stack })
    }
  });
};
```

---

## 📊 COSTOS Y ESCALABILIDAD

### Planes de Render
| Plan | Precio | Características |
|------|--------|----------------|
| Free | $0 | 750 horas/mes, dormancy, 1GB RAM |
| Starter | $7/mes | Siempre activo, 1GB RAM, SSL |
| Standard | $25/mes | 2GB RAM, más recursos |
| Pro | $85/mes | 4GB RAM, priority support |

### Optimización de Costos
```typescript
// Auto-scaling basado en carga
const autoScaleConfig = {
  minInstances: 1,
  maxInstances: 5,
  targetCPUUtilization: 70,
  targetMemoryUtilization: 80
};

// Implementar en Render dashboard
```

### Backup Strategy
```bash
# Backup automático de base de datos
# Configurado en MongoDB Atlas:
# - Daily backups
# - Point-in-time recovery (últimas 24 horas)
# - Cross-region replication
```

---

## 🔄 ROLLBACKS Y UPDATES

### Zero-Downtime Deployments
```yaml
# En Render, los deployments son zero-downtime por defecto
# El servicio anterior sigue corriendo hasta que el nuevo esté healthy
```

### Rollback Manual
```bash
# Desde Render dashboard:
# 1. Ir al servicio
# 2. Pestaña "Events"
# 3. Encontrar deployment anterior
# 4. Click "Rollback"

# O desde CLI:
render services rollback <service-id> --to <deploy-id>
```

### Blue-Green Deployment
```yaml
# Para cambios críticos:
# 1. Crear nuevo servicio (green)
# 2. Probar exhaustivamente
# 3. Cambiar DNS/load balancer
# 4. Eliminar servicio antiguo (blue)
```

---

## 📋 CHECKLIST DE DEPLOYMENT

### Pre-Deployment
- [x] Tests pasando localmente
- [x] Linting sin errores
- [x] Build funcionando
- [x] Variables de entorno configuradas
- [x] Base de datos accesible
- [x] Health check endpoint implementado

### Durante Deployment
- [x] Build logs limpios
- [x] Health check pasando
- [x] Logs de aplicación normales
- [x] Base de datos conectada
- [x] Endpoints respondiendo

### Post-Deployment
- [x] Funcionalidad básica probada
- [x] Performance aceptable
- [x] Logs monitoreados
- [x] Alertas configuradas
- [x] Backup verificado

---

## 📚 REFERENCIAS

### Documentación Render
- **[Render Docs](https://docs.render.com/)** - Documentación oficial
- **[Node.js Deploy](https://docs.render.com/deploy-node)** - Guía específica para Node.js
- **[Environment Variables](https://docs.render.com/environment-variables)** - Configuración env vars

### Documentos Relacionados
- **[Arquitectura General](../00_INICIO/ARQUITECTURA_GENERAL.md)** - Diseño del sistema
- **[Base de Datos](../01_BACKEND_CORE/BASE_DATOS.md)** - Configuración MongoDB
- **[Auditoría Seguridad](../04_SECURITY/AUDITORIA_SEGURIDAD.md)** - Configuración segura

### Herramientas
- **[Render CLI](https://docs.render.com/render-cli)** - Command line interface
- **[GitHub Actions](https://github.com/features/actions)** - CI/CD automation
- **[MongoDB Atlas](https://www.mongodb.com/atlas)** - Database as a service

---

**🚀 Deployment:** Automatizado y confiable  
**📊 Monitoreo:** Activo con health checks  
**🔒 Seguridad:** Configuración production-ready  
**⚡ Performance:** Optimizado para escala  

---

**📅 Última actualización:** 20 de noviembre de 2025  
**👥 DevOps:** Equipo Valgame  
**📖 Estado:** ✅ Listo para producción</content>
<parameter name="filePath">c:\Users\Haustman\Desktop\valgame-backend\docs_reorganizada\05_DEPLOYMENT\DEPLOYMENT_RENDER.md