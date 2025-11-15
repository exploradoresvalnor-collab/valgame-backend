# 🛠️ SCRIPTS DEL BACKEND - VALGAME RPG

Directorio de scripts de utilidad para mantenimiento, diagnóstico y operaciones de base de datos.

---

## 📋 Índice de Scripts

### 🔍 Diagnóstico y Reparación
- [diagnose-onboarding-flow.ts](#diagnose-onboarding-flowts) - Detectar problemas en flujo de onboarding
- [fix-onboarding-issues.ts](#fix-onboarding-issuests) - Reparar problemas detectados
- [diagnose-user-resources.js](#diagnose-user-resourcesjs) - Detectar recursos NULL
- [migrate-user-resources.js](#migrate-user-resourcesjs) - Migrar recursos NULL a 0

### 🌱 Seeds y Datos Iniciales
- [seed-base-characters.js](#seed-base-charactersjs) - Crear personajes base
- [seed-categories.js](#seed-categoriesjs) - Crear categorías de items
- [seed-items.js](#seed-itemsjs) - Crear items del juego
- [seed-dungeons.js](#seed-dungeonsjs) - Crear mazmorras
- [seed-packages.js](#seed-packagesjs) - Crear paquetes de compra
- [seed_game_settings.ts](#seed_game_settingsts) - Configuración global del juego
- [seed_minimal_e2e.ts](#seed_minimal_e2ets) - Seed mínimo para tests E2E
- [seed-marketplace-test-data.ts](#seed-marketplace-test-datats) - Datos de prueba marketplace

### ✅ Verificación
- [quick-verify.js](#quick-verifyjs) - Verificar usuario manualmente
- [verify-test-user.js](#verify-test-userjs) - Verificar usuario de prueba
- [verify-final-test.js](#verify-final-testjs) - Test de verificación final
- [check-all-collections.ts](#check-all-collectionsts) - Verificar colecciones de DB
- [check-base-characters.ts](#check-base-charactersts) - Verificar personajes base
- [check-dungeons-ready.js](#check-dungeons-readyjs) - Verificar mazmorras
- [check-item-types-simple.ts](#check-item-types-simplets) - Verificar tipos de items
- [check-real-data.ts](#check-real-datats) - Verificar datos reales
- [check-descripcion-rango.ts](#check-descripcion-rangots) - Verificar descripción de rangos

### 🎮 Gestión de Juego
- [manage-characters.ts](#manage-charactersts) - Gestionar personajes
- [add-paquete-pionero.js](#add-paquete-pionerojs) - Añadir paquete pionero manualmente
- [add-precio-val-packages.ts](#add-precio-val-packagests) - Añadir precios a paquetes

### 🏪 Marketplace
- [create-marketplace-indexes.ts](#create-marketplace-indexests) - Crear índices de marketplace
- [create-purchase-index.js](#create-purchase-indexjs) - Crear índice de compras
- [simulacion-marketplace-personajes.ts](#simulacion-marketplace-personajests) - Simular marketplace

### 📖 Lectura de Datos
- [read-all-items.ts](#read-all-itemsts) - Leer todos los items de DB

### 🔐 Seguridad
- [check-env.js](#check-envjs) - Verificar variables de entorno
- [test-cookie-simple.sh](#test-cookie-simplesh) - Test de cookies (simple)
- [test-cookie-security.sh](#test-cookie-securitysh) - Test de seguridad de cookies
- [test-httponly-cookies.js](#test-httponly-cookiesjs) - Test de cookies httpOnly
- [quick-cookie-test.sh](#quick-cookie-testsh) - Test rápido de cookies

### 🧪 Testing
- [test-new-endpoints.sh](#test-new-endpointssh) - Test de nuevos endpoints

### 🔧 Utilidades
- [find-unused-models.sh](#find-unused-modelssh) - Encontrar modelos no usados

---

## 📖 Documentación Detallada

### 🔍 DIAGNÓSTICO Y REPARACIÓN

#### `diagnose-onboarding-flow.ts`

**Propósito:** Analizar toda la base de datos y detectar problemas en el flujo de onboarding de usuarios.

**Uso:**
```bash
npm run diagnose:onboarding
# O directamente:
npx ts-node scripts/diagnose-onboarding-flow.ts
```

**Detecta:**
- ❌ Usuarios verificados sin Paquete Pionero
- ❌ Usuarios con recursos NULL/undefined
- ❌ Flag `receivedPioneerPackage` pero sin personaje
- ❌ Flag `receivedPioneerPackage` pero sin inventario
- ❌ Inconsistencias críticas

**Salida:**
- Reporte detallado en consola
- Archivo JSON: `temp/onboarding-diagnostic-report.json`

**Documentación completa:** `docs/SISTEMA_DIAGNOSTICO_ONBOARDING.md`

---

#### `fix-onboarding-issues.ts`

**Propósito:** Reparar automáticamente problemas detectados en el flujo de onboarding.

**Uso:**
```bash
# DRY RUN (no modifica DB, solo muestra cambios)
npm run fix:onboarding

# APLICAR CAMBIOS REALES
npm run fix:onboarding:apply
```

**Repara:**
1. Inicializa recursos NULL a 0
2. Entrega Paquete Pionero completo a usuarios verificados sin él
3. Re-entrega personaje si falta
4. Re-entrega items si el inventario está vacío
5. Asegura consistencia entre flag y contenido

**⚠️ IMPORTANTE:** Por defecto ejecuta en modo DRY RUN. Para aplicar cambios reales, usa `--apply`.

**Documentación completa:** `docs/SISTEMA_DIAGNOSTICO_ONBOARDING.md`

---

#### `diagnose-user-resources.js`

**Propósito:** Detectar usuarios con recursos NULL en base de datos.

**Uso:**
```bash
node scripts/diagnose-user-resources.js
```

**Detecta:**
- Usuarios con `val: null`
- Usuarios con `boletos: null`
- Usuarios con `evo: null`

---

#### `migrate-user-resources.js`

**Propósito:** Migrar recursos NULL a valores por defecto (0).

**Uso:**
```bash
node scripts/migrate-user-resources.js
```

**Modifica:**
- `val: null → val: 0`
- `boletos: null → boletos: 0`
- `evo: null → evo: 0`

---

### 🌱 SEEDS Y DATOS INICIALES

#### `seed-base-characters.js`

**Propósito:** Crear personajes base (rangos D, C, B, A, S) necesarios para el juego.

**Uso:**
```bash
node scripts/seed-base-characters.js
```

**Crea:**
- Personajes de rango D (inicial)
- Personajes de rango C, B, A, S (evoluciones)
- Stats y habilidades para cada rango

---

#### `seed-items.js`

**Propósito:** Crear todos los items del juego (equipamiento, consumibles, materiales).

**Uso:**
```bash
node scripts/seed-items.js
```

**Crea:**
- Armas (espadas, arcos, bastones)
- Armaduras (ligeras, pesadas, mágicas)
- Consumibles (pociones, elixires)
- Materiales de crafting

---

#### `seed-dungeons.js`

**Propósito:** Crear mazmorras del juego con enemigos y recompensas.

**Uso:**
```bash
node scripts/seed-dungeons.js
```

**Crea:**
- Mazmorras por rango (D, C, B, A, S)
- Oleadas de enemigos
- Recompensas (VAL, EVO, items)

---

#### `seed-packages.js`

**Propósito:** Crear paquetes de compra del marketplace.

**Uso:**
```bash
node scripts/seed-packages.js
```

**Crea:**
- Paquete Pionero
- Paquetes de recursos
- Paquetes premium

---

#### `seed_game_settings.ts`

**Propósito:** Crear configuración global del juego.

**Uso:**
```bash
npx ts-node scripts/seed_game_settings.ts
```

**Configura:**
- Tiempos de recuperación
- Límites de inventario
- Costos de evolución
- Tasas de recompensas

---

### ✅ VERIFICACIÓN

#### `quick-verify.js`

**Propósito:** Verificar manualmente un usuario por email.

**Uso:**
```bash
node scripts/quick-verify.js <email>

# Ejemplo:
node scripts/quick-verify.js usuario@ejemplo.com
```

**Hace:**
- Marca `isVerified: true`
- Limpia tokens de verificación
- **NO entrega Paquete Pionero** (debe hacerse manualmente después)

---

#### `check-all-collections.ts`

**Propósito:** Verificar que todas las colecciones necesarias existen en DB.

**Uso:**
```bash
npx ts-node scripts/check-all-collections.ts
```

**Verifica:**
- Users
- BaseCharacters
- Items (Equipment, Consumables)
- Dungeons
- Packages
- Marketplace
- Purchases

---

### 🎮 GESTIÓN DE JUEGO

#### `manage-characters.ts`

**Propósito:** Gestionar personajes de usuarios (crear, editar, eliminar).

**Uso:**
```bash
npx ts-node scripts/manage-characters.ts
```

**Funciones:**
- Listar personajes de un usuario
- Crear personaje nuevo
- Modificar stats de personaje
- Eliminar personaje

---

#### `add-paquete-pionero.js`

**Propósito:** Añadir Paquete Pionero manualmente a un usuario específico.

**Uso:**
```bash
node scripts/add-paquete-pionero.js <userId>
```

**Entrega:**
- Personaje base rango D
- 50 VAL
- 3 pociones
- 1 espada
- Marca `receivedPioneerPackage: true`

---

### 🏪 MARKETPLACE

#### `create-marketplace-indexes.ts`

**Propósito:** Crear índices de base de datos para marketplace.

**Uso:**
```bash
npx ts-node scripts/create-marketplace-indexes.ts
```

**Crea índices para:**
- Búsquedas rápidas por tipo de item
- Filtros por precio
- Ordenamiento por fecha de publicación
- Búsquedas por vendedor

---

#### `simulacion-marketplace-personajes.ts`

**Propósito:** Simular publicación y compra en marketplace.

**Uso:**
```bash
npx ts-node scripts/simulacion-marketplace-personajes.ts
```

**Simula:**
- Usuario publica personaje en venta
- Otro usuario compra personaje
- Transferencia de recursos
- Actualización de inventarios

---

### 🔐 SEGURIDAD

#### `check-env.js`

**Propósito:** Verificar que todas las variables de entorno necesarias están definidas.

**Uso:**
```bash
npm run check-env
# O:
node scripts/check-env.js
```

**Verifica:**
- `MONGODB_URI`
- `JWT_SECRET`
- `FRONTEND_ORIGIN`
- `EMAIL_USER`
- `EMAIL_PASSWORD`
- Etc.

---

#### `test-cookie-security.sh`

**Propósito:** Test completo de seguridad de cookies httpOnly.

**Uso:**
```bash
bash scripts/test-cookie-security.sh
```

**Prueba:**
- Cookies httpOnly correctamente establecidas
- No accesibles desde JavaScript
- Secure flag en HTTPS
- SameSite configurado

---

### 🔧 UTILIDADES

#### `find-unused-models.sh`

**Propósito:** Encontrar modelos de Mongoose no utilizados en el código.

**Uso:**
```bash
bash scripts/find-unused-models.sh
```

**Detecta:**
- Modelos definidos pero no importados
- Modelos importados pero no usados
- Archivos huérfanos

---

## 🚀 COMANDOS NPM RÁPIDOS

### Comandos Disponibles en `package.json`

```json
{
  "scripts": {
    "seed": "ts-node -r dotenv/config src/seed.ts",
    "diagnose:onboarding": "ts-node scripts/diagnose-onboarding-flow.ts",
    "fix:onboarding": "ts-node scripts/fix-onboarding-issues.ts",
    "fix:onboarding:apply": "ts-node scripts/fix-onboarding-issues.ts --apply",
    "check-env": "node scripts/check-env.js",
    "create-indexes": "node scripts/create-purchase-index.js"
  }
}
```

### Uso Recomendado

```bash
# Inicializar base de datos completa
npm run seed

# Verificar variables de entorno
npm run check-env

# Diagnosticar problemas en onboarding
npm run diagnose:onboarding

# Reparar problemas (DRY RUN primero)
npm run fix:onboarding

# Aplicar reparaciones reales
npm run fix:onboarding:apply

# Crear índices de marketplace
npm run create-indexes
```

---

## 📚 DOCUMENTACIÓN ADICIONAL

- 📄 [Sistema de Diagnóstico de Onboarding](../docs/SISTEMA_DIAGNOSTICO_ONBOARDING.md)
- 📄 [Reporte de Validación de Flujo de Usuario](../docs/REPORTE_VALIDACION_FLUJO_USUARIO.md)
- 📄 [Auditoría Completa del Backend](../docs/AUDITORIA_BACKEND.md)
- 📄 [Mapa del Backend](../docs/MAPA_BACKEND.md)

---

## ⚠️ PRECAUCIONES

### Antes de Ejecutar Scripts en Producción

1. ✅ **Siempre hacer backup de la base de datos**
   ```bash
   mongodump --uri="mongodb+srv://..." --out=backup-$(date +%Y%m%d)
   ```

2. ✅ **Ejecutar en modo DRY RUN primero**
   ```bash
   npm run fix:onboarding  # Muestra cambios sin aplicar
   ```

3. ✅ **Verificar el reporte generado**
   ```bash
   cat temp/onboarding-diagnostic-report.json
   ```

4. ✅ **Aplicar cambios en horario de bajo tráfico**

5. ✅ **Monitorear logs después de aplicar cambios**
   ```bash
   tail -f logs/app.log
   ```

---

## 🐛 Troubleshooting

### Script No Se Ejecuta

```bash
# Verificar permisos
chmod +x scripts/*.sh

# Verificar TypeScript
npx ts-node --version

# Verificar dotenv
npm list dotenv
```

### Error de Conexión a MongoDB

```bash
# Verificar variables de entorno
cat .env | grep MONGODB

# Test de conexión
mongosh "$MONGODB_URI" --eval "db.version()"
```

### Script Se Queda Colgado

```bash
# Forzar timeout
timeout 60 npm run diagnose:onboarding

# Ver procesos activos de Node
ps aux | grep node
```

---

**Última actualización:** 2 de noviembre de 2025  
**Mantenedor:** Equipo Backend Valgame
