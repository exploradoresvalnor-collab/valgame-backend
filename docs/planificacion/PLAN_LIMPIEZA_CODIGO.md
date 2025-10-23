# 📋 Plan de Limpieza de Código

**Fecha:** 22 de Octubre 2025  
**Branch:** `feature/xp-by-rank`  
**Estado:** Pendiente de ejecución

---

## 🎯 Objetivo

Eliminar código no utilizado del proyecto para reducir la complejidad, mejorar el mantenimiento y evitar confusión en el desarrollo futuro.

---

## 🔍 Análisis Completado

### Metodología
1. **Modelos:** Búsqueda de imports con `grep -r "from.*models/{ModelName}"`
2. **Rutas:** Verificación de registros en `app.ts` con `app.use()`
3. **Base de datos:** Validación de integridad de datos con scripts de verificación

### Herramientas Creadas
- `scripts/find-unused-models.sh` - Script de auditoría de modelos
- `scripts/check-item-types-simple.ts` - Verificación de tipos de items en BD

---

## ❌ Elementos a Eliminar

### 1. Modelos No Utilizados (0 imports)

#### `src/models/Achievement.ts`
- **Imports encontrados:** 0
- **Uso en BD:** No verificado (probablemente sin datos)
- **Impacto:** NINGUNO - puede eliminarse de forma segura

#### `src/models/Ranking.ts`
- **Imports encontrados:** 0
- **Uso en BD:** No verificado
- **Impacto:** NINGUNO - puede eliminarse de forma segura

#### `src/models/TelegramLinkToken.ts`
- **Imports encontrados:** 0
- **Uso en BD:** No verificado
- **Impacto:** NINGUNO - puede eliminarse de forma segura

#### `src/models/Transaction.ts`
- **Imports encontrados:** 0
- **Uso en BD:** No verificado
- **Nota:** NO confundir con `MarketplaceTransaction.ts` (que SÍ se usa)
- **Impacto:** NINGUNO - puede eliminarse de forma segura

---

### 2. Rutas No Registradas

#### `src/routes/purchaseLogs.routes.ts`
- **Estado:** Archivo existe pero NO está importado ni registrado en `app.ts`
- **Uso:** NINGUNO
- **Impacto:** NINGUNO - puede eliminarse de forma segura

---

## ✅ Elementos que SE MANTIENEN (Clarificación)

### Modelos de Items (Discriminators de Mongoose)

#### `src/models/Item.ts` - BASE MODEL ✅ MANTENER
- **Rol:** Modelo base para discriminadores
- **Collection:** `items` (27 documentos)
- **Imports:** 8+
- **Uso crítico en:**
  - `marketplace.service.ts` (líneas 83, 105)
  - `dungeons.controller.ts` (línea 280)

#### `src/models/Equipment.ts` - DISCRIMINATOR ✅ MANTENER
- **Rol:** Discriminator de Item (`tipoItem: 'Equipment'`)
- **Documentos en BD:** 13
- **Imports:** 3
- **Uso crítico en:**
  - `onboarding.service.ts` (línea 61)
  - `seed.ts` (creación de equipamiento inicial)
- **Campos adicionales:** `tipo`, `nivel_minimo_requerido`, `stats`, `habilidades`

#### `src/models/Consumable.ts` - DISCRIMINATOR ✅ MANTENER
- **Rol:** Discriminator de Item (`tipoItem: 'Consumable'`)
- **Documentos en BD:** 14
- **Imports:** 3
- **Uso crítico en:**
  - `onboarding.service.ts` (línea 46)
  - `seed.ts` (creación de consumibles iniciales)
- **Campos adicionales:** `tipo`, `usos_maximos`, `duracion_efecto_minutos`, `efectos`

**⚠️ IMPORTANTE:** Estos NO son modelos redundantes. Son discriminadores de Mongoose que:
- Comparten la misma colección (`items`)
- Añaden campos específicos al esquema base
- Permiten consultas tipo-específicas (`Equipment.find()` auto-filtra por `tipoItem`)
- **Verificación realizada:** Base de datos limpia (solo Equipment y Consumable, 27 docs totales)

---

### Rutas de Items

#### `src/routes/equipment.routes.ts` ✅ MANTENER
- **Registrada en:** `app.ts` línea 104 (`app.use('/api/equipment', equipmentRoutes)`)
- **Propósito:** Endpoint específico para filtrar items tipo Equipment
- **Uso:** Permite al frontend obtener solo equipamiento

#### `src/routes/consumables.routes.ts` ✅ MANTENER
- **Registrada en:** `app.ts` línea 105 (`app.use('/api/consumables', consumableRoutes)`)
- **Propósito:** Endpoint específico para filtrar items tipo Consumable
- **Uso:** Permite al frontend obtener solo consumibles

#### `src/routes/items.routes.ts` ✅ MANTENER
- **Registrada en:** `app.ts` línea 119 (`app.use('/api/items', itemsRoutes)`)
- **Propósito:** Endpoint genérico que devuelve TODOS los items
- **Uso:** Útil para listados completos del inventario

**Arquitectura de 3 endpoints:**
```
GET /api/items          → Todos los items (Equipment + Consumable)
GET /api/equipment      → Solo Equipment (tipoItem='Equipment')
GET /api/consumables    → Solo Consumable (tipoItem='Consumable')
```

---

## 🚀 Plan de Ejecución

### Fase 1: Backup y Preparación (5 min)
```bash
# Crear backup del estado actual
git add -A
git commit -m "checkpoint: antes de limpieza de código no utilizado"

# Crear branch temporal (opcional)
git checkout -b cleanup/remove-unused-code
```

### Fase 2: Eliminación de Modelos (3 min)
```bash
# Eliminar 4 modelos sin uso
rm src/models/Achievement.ts
rm src/models/Ranking.ts
rm src/models/TelegramLinkToken.ts
rm src/models/Transaction.ts
```

### Fase 3: Eliminación de Rutas (2 min)
```bash
# Eliminar ruta no registrada
rm src/routes/purchaseLogs.routes.ts
```

### Fase 4: Verificación de Compilación (3 min)
```bash
# Verificar que TypeScript compila sin errores
npm run build

# Si hay errores, revisar imports huérfanos y eliminarlos
```

### Fase 5: Ejecución de Tests (5 min)
```bash
# Ejecutar tests de seguridad (deben seguir pasando 10/10)
npx jest tests/security/packages.security.test.ts --runInBand

# Ejecutar tests unitarios básicos
npx jest tests/unit/ --runInBand
```

### Fase 6: Prueba Manual del Servidor (3 min)
```bash
# Iniciar el servidor y verificar que arranca sin errores
npm run dev

# Verificar endpoints críticos:
# - GET /api/items (debe devolver 27 items)
# - GET /api/equipment (debe devolver 13 items)
# - GET /api/consumables (debe devolver 14 items)
# - GET /api/marketplace/listings (debe funcionar)
```

### Fase 7: Commit Final (2 min)
```bash
# Si todo funciona correctamente
git add -A
git commit -m "chore: eliminar código no utilizado

- Modelos: Achievement, Ranking, TelegramLinkToken, Transaction (0 imports)
- Rutas: purchaseLogs.routes.ts (no registrada)
- Verificado: compilación OK, tests 10/10, servidor funcional"

# Si estás en branch temporal, hacer merge
git checkout feature/xp-by-rank
git merge cleanup/remove-unused-code
git branch -d cleanup/remove-unused-code
```

---

## 📊 Impacto Esperado

### Métricas de Limpieza
- **Modelos eliminados:** 4 (de 23 = 17.4% reducción)
- **Rutas eliminadas:** 1 (de 20 = 5% reducción)
- **Líneas de código eliminadas:** ~500-800 (estimado)
- **Archivos totales eliminados:** 5

### Beneficios
1. ✅ Menos complejidad mental para nuevos desarrolladores
2. ✅ Reducción de "surface area" para bugs potenciales
3. ✅ Compilación ligeramente más rápida
4. ✅ Claridad sobre qué código está realmente en uso
5. ✅ Prevención de uso accidental de código obsoleto

### Riesgos
- ⚠️ **BAJO:** Los elementos identificados tienen 0 imports
- ⚠️ **MITIGADO:** Tests de seguridad verifican funcionalidad crítica
- ⚠️ **CONTROLADO:** Backup en git permite rollback inmediato

---

## 🔄 Rollback Plan

Si algo falla después de la limpieza:

```bash
# Opción 1: Rollback al commit anterior
git reset --hard HEAD~1

# Opción 2: Recuperar archivos específicos
git checkout HEAD~1 -- src/models/Achievement.ts
git checkout HEAD~1 -- src/routes/purchaseLogs.routes.ts
```

---

## 📝 Checklist de Ejecución

### Pre-ejecución
- [ ] Branch actual: `feature/xp-by-rank`
- [ ] Código compilando sin errores
- [ ] Tests pasando (10/10 security tests)
- [ ] Backup creado (commit checkpoint)

### Ejecución
- [ ] 4 modelos eliminados (Achievement, Ranking, TelegramLinkToken, Transaction)
- [ ] 1 ruta eliminada (purchaseLogs.routes.ts)
- [ ] Compilación TypeScript exitosa (`npm run build`)
- [ ] Tests de seguridad pasando (10/10)
- [ ] Servidor inicia sin errores
- [ ] Endpoints de items funcionales (items, equipment, consumables)

### Post-ejecución
- [ ] Commit realizado con mensaje descriptivo
- [ ] `docs/TODO_PROYECTO.md` actualizado con limpieza completada
- [ ] Este documento movido a `archive/` (ya completado)
- [ ] Equipo notificado de los cambios

---

## 🎓 Lecciones Aprendidas

### Sobre Discriminators de Mongoose
- **NO eliminar** modelos que sean discriminators (Equipment, Consumable)
- Los discriminators comparten colección pero añaden campos específicos
- Patrón válido: `Item` (base) + `Equipment` (discriminator) + `Consumable` (discriminator) = 1 colección

### Sobre Auditoría de Código
- Herramienta `find-unused-models.sh` puede reutilizarse en futuras limpiezas
- Buscar imports (`grep -r "from.*models/{ModelName}"`) es método efectivo
- Siempre verificar BD antes de eliminar modelos

### Sobre Mantenimiento Preventivo
- Limpiezas periódicas (cada 3-6 meses) previenen acumulación de código muerto
- Documentar decisiones de arquitectura previene eliminaciones incorrectas
- Tests automatizados dan confianza para hacer cambios estructurales

---

## 📚 Referencias

- **Auditoría de modelos:** `scripts/find-unused-models.sh`
- **Verificación de BD:** `scripts/check-item-types-simple.ts`
- **Discriminators Mongoose:** https://mongoosejs.com/docs/discriminators.html
- **Estado del proyecto:** `docs/TODO_PROYECTO.md`

---

**Creado por:** Sistema de Auditoría Automática  
**Revisado por:** Equipo Exploradores de Valnor  
**Próxima revisión:** Enero 2026 (auditoría trimestral)
