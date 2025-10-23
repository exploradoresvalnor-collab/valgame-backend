# 🚀 PLAN DE VALIDACIÓN COMPLETO - PRODUCCIÓN

## Objetivo
Validar que el código está 100% listo para desplegar en producción sin errores de compilación, runtime, o configuración.

---

## ✅ FASE 1: VALIDACIÓN DE CÓDIGO FUENTE

### 1.1 Compilación TypeScript
```bash
npx tsc --noEmit
```
**Objetivo:** Verificar que NO hay errores de tipos.
**Criterio de éxito:** 0 errores de TypeScript.

### 1.2 Linting (Calidad de código)
```bash
npm run lint
```
**Objetivo:** Detectar errores de estilo y malas prácticas.
**Criterio de éxito:** 0 errores críticos (warnings aceptables).

### 1.3 Build de producción
```bash
npm run build
```
**Objetivo:** Verificar que el código compila a JavaScript sin errores.
**Criterio de éxito:** Carpeta `dist/` generada sin errores.

---

## ✅ FASE 2: VALIDACIÓN DE DEPENDENCIAS

### 2.1 Verificar dependencias instaladas
```bash
npm install
npm audit
```
**Objetivo:** Detectar vulnerabilidades y dependencias faltantes.
**Criterio de éxito:** 0 vulnerabilidades críticas/altas.

### 2.2 Verificar versiones Node.js
```bash
node --version
npm --version
```
**Objetivo:** Confirmar compatibilidad con producción.
**Requerimiento:** Node.js >= 18.x, npm >= 9.x

### 2.3 Limpiar node_modules y reinstalar
```bash
rm -rf node_modules package-lock.json
npm install
```
**Objetivo:** Garantizar instalación limpia sin conflictos.

---

## ✅ FASE 3: VALIDACIÓN DE CONFIGURACIÓN

### 3.1 Variables de entorno
- [ ] Verificar `.env.example` tiene todas las variables necesarias
- [ ] Verificar que NO hay valores hardcoded en el código
- [ ] Verificar que secretos NO están en el repositorio

**Archivo a revisar:**
```bash
cat .env.example
```

**Variables críticas:**
- `MONGODB_URI`
- `JWT_SECRET`
- `PORT`
- `NODE_ENV`
- `CORS_ORIGIN`

### 3.2 Configuración de base de datos
```bash
# Verificar que la conexión a MongoDB funciona
npm run test:db-connection
```
**Nota:** Si no existe este script, lo crearemos.

### 3.3 Configuración de producción
- [ ] `NODE_ENV=production` configurado
- [ ] CORS configurado correctamente
- [ ] Rate limiting activado
- [ ] Helmet configurado para seguridad

---

## ✅ FASE 4: VALIDACIÓN DE TESTS

### 4.1 Tests unitarios
```bash
npm run test:unit
```
**Objetivo:** Verificar lógica de negocio funciona correctamente.
**Criterio de éxito:** 100% tests pasando.

### 4.2 Tests E2E (End-to-End)
```bash
npm run test:e2e
```
**Objetivo:** Verificar flujos completos de usuario.
**Criterio de éxito:** Todos los flujos principales funcionan.

### 4.3 Test de compras y paquetes
```bash
npm run test-purchases
```
**Objetivo:** Validar marketplace, compras, apertura de paquetes.
**Criterio de éxito:** Todas las transacciones se completan.

### 4.4 Coverage de tests
```bash
npm run test:coverage
```
**Objetivo:** Medir cobertura de código.
**Criterio de éxito:** >70% de cobertura (ideal >80%).

---

## ✅ FASE 5: VALIDACIÓN DE DATOS

### 5.1 Seeds de base de datos
```bash
npm run seed
```
**Objetivo:** Verificar que los datos iniciales se cargan correctamente.

**Archivos a validar:**
- `scripts/seed_game_settings.ts` - Configuración del juego
- `scripts/seed_minimal_e2e.ts` - Datos mínimos para testing

### 5.2 Índices de MongoDB
```bash
npm run create-indexes
```
**Objetivo:** Crear índices para optimizar consultas.

**Scripts necesarios:**
- `scripts/create-purchase-index.js`

### 5.3 Migraciones (si aplica)
- [ ] Verificar que no hay migraciones pendientes
- [ ] Verificar compatibilidad de esquemas

---

## ✅ FASE 6: VALIDACIÓN DE RUNTIME

### 6.1 Iniciar servidor en modo desarrollo
```bash
npm run dev
```
**Objetivo:** Verificar que el servidor arranca sin errores.
**Criterio de éxito:** 
- Servidor escuchando en puerto configurado
- Conexión a MongoDB exitosa
- No hay errores en consola

### 6.2 Iniciar servidor en modo producción
```bash
NODE_ENV=production npm start
```
**Objetivo:** Verificar comportamiento en producción.
**Criterio de éxito:** 
- Servidor arranca correctamente
- Logs de producción funcionan
- Errores se manejan correctamente

### 6.3 Health check endpoint
```bash
curl http://localhost:3000/health
```
**Objetivo:** Verificar endpoint de salud.
**Criterio de éxito:** Respuesta 200 OK con status "healthy".

### 6.4 Endpoints principales
**Verificar manualmente o con Postman:**
- [ ] POST `/api/auth/register` - Registro de usuario
- [ ] POST `/api/auth/login` - Login
- [ ] GET `/api/characters` - Listar personajes
- [ ] POST `/api/dungeons/enter` - Entrar a dungeon
- [ ] GET `/api/marketplace/listings` - Ver marketplace
- [ ] POST `/api/packages/purchase` - Comprar paquete

---

## ✅ FASE 7: VALIDACIÓN DE SEGURIDAD

### 7.1 Análisis de vulnerabilidades
```bash
npm audit
npm audit fix
```
**Objetivo:** Detectar y corregir vulnerabilidades conocidas.

### 7.2 Verificar autenticación
- [ ] JWT secret es fuerte (>32 caracteres)
- [ ] Tokens expiran correctamente
- [ ] Refresh tokens implementados (si aplica)

### 7.3 Verificar autorización
- [ ] Rutas protegidas requieren autenticación
- [ ] Usuarios no pueden acceder a recursos de otros

### 7.4 Rate limiting
- [ ] Rate limiting configurado en rutas críticas
- [ ] Límites apropiados (ej: 100 req/15min)

### 7.5 Validación de inputs
- [ ] Todos los endpoints validan datos de entrada
- [ ] Protección contra inyección SQL/NoSQL
- [ ] Sanitización de inputs

---

## ✅ FASE 8: VALIDACIÓN DE DOCKER

### 8.1 Build de imagen Docker
```bash
docker build -t valgame-backend .
```
**Objetivo:** Verificar que Dockerfile funciona correctamente.
**Criterio de éxito:** Imagen se construye sin errores.

### 8.2 Ejecutar contenedor localmente
```bash
docker run -p 3000:3000 --env-file .env valgame-backend
```
**Objetivo:** Verificar que la app funciona en contenedor.

### 8.3 Docker Compose (si aplica)
```bash
docker-compose up
```
**Objetivo:** Verificar stack completo (app + MongoDB).

---

## ✅ FASE 9: VALIDACIÓN DE DOCUMENTACIÓN

### 9.1 README.md actualizado
- [ ] Instrucciones de instalación claras
- [ ] Variables de entorno documentadas
- [ ] Comandos principales listados

### 9.2 API Documentation
- [ ] Endpoints documentados
- [ ] Ejemplos de requests/responses
- [ ] Códigos de error documentados

### 9.3 Arquitectura documentada
- [ ] Diagramas de flujo actualizados
- [ ] Estructura de carpetas explicada
- [ ] Decisiones técnicas documentadas

---

## ✅ FASE 10: VALIDACIÓN DE DESPLIEGUE (RENDER)

### 10.1 Preparación pre-despliegue
- [ ] Crear cuenta en Render
- [ ] Conectar repositorio GitHub
- [ ] Configurar variables de entorno en Render

### 10.2 Configuración de Render
**Variables de entorno a configurar:**
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=tu_secret_super_seguro
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://tu-frontend.com
```

### 10.3 Health checks en Render
- [ ] Configurar health check path: `/health`
- [ ] Configurar auto-deploy desde rama `main`

### 10.4 Verificación post-despliegue
```bash
curl https://tu-app.onrender.com/health
```
**Criterio de éxito:** Respuesta 200 OK.

### 10.5 Monitoreo inicial
- [ ] Verificar logs en Render
- [ ] Verificar que no hay errores de arranque
- [ ] Verificar conexión a MongoDB Atlas

---

## 📊 CHECKLIST FINAL

### Antes de desplegar:
- [ ] ✅ TypeScript compila sin errores
- [ ] ✅ Linter sin errores críticos
- [ ] ✅ Build de producción exitoso
- [ ] ✅ Todos los tests pasan
- [ ] ✅ Seeds funcionan correctamente
- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ Docker build exitoso
- [ ] ✅ Documentación actualizada
- [ ] ✅ Vulnerabilidades de seguridad resueltas
- [ ] ✅ Health check endpoint funciona

### Durante el despliegue:
- [ ] ✅ Variables de entorno configuradas en Render
- [ ] ✅ MongoDB Atlas configurado
- [ ] ✅ Dominio configurado (opcional)
- [ ] ✅ SSL/HTTPS habilitado

### Después del despliegue:
- [ ] ✅ Health check responde correctamente
- [ ] ✅ Logs sin errores críticos
- [ ] ✅ Endpoints principales funcionan
- [ ] ✅ Base de datos accesible
- [ ] ✅ Monitoreo configurado

---

## 🚨 CRITERIOS DE SHOW-STOPPER

**NO desplegar si:**
1. ❌ TypeScript tiene errores de compilación
2. ❌ Tests E2E fallan
3. ❌ Vulnerabilidades críticas sin resolver
4. ❌ JWT_SECRET no está configurado
5. ❌ MongoDB no es accesible
6. ❌ Servidor no arranca en modo producción

---

## 🔧 SCRIPTS ÚTILES

Agregar a `package.json`:
```json
{
  "scripts": {
    "validate": "npm run lint && npm run build && npm run test",
    "validate:full": "npm run validate && npm run test:e2e",
    "preproduction": "npm run validate:full && npm run test-purchases",
    "check:env": "node scripts/check-env.js",
    "test:db-connection": "ts-node scripts/test-db-connection.ts"
  }
}
```

---

## 📝 NOTAS

- Este plan debe ejecutarse en orden secuencial
- Cada fase debe completarse 100% antes de la siguiente
- Documentar cualquier error encontrado y su solución
- Mantener este documento actualizado con cada despliegue

---

**Fecha de creación:** 21 de octubre de 2025  
**Última actualización:** 21 de octubre de 2025  
**Estado:** 🟡 En progreso
