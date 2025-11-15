# 🔍 SISTEMA DE DIAGNÓSTICO Y REPARACIÓN: FLUJO DE ONBOARDING

Este documento explica el sistema automatizado de detección y corrección de problemas en el flujo de onboarding de nuevos usuarios.

---

## 📋 Índice

1. [Descripción General](#descripción-general)
2. [Flujo de Onboarding Correcto](#flujo-de-onboarding-correcto)
3. [Problemas Detectados](#problemas-detectados)
4. [Scripts Disponibles](#scripts-disponibles)
5. [Uso de los Scripts](#uso-de-los-scripts)
6. [Interpretación de Resultados](#interpretación-de-resultados)
7. [Troubleshooting](#troubleshooting)

---

## Descripción General

El **Paquete Pionero** es un conjunto de recursos iniciales que todo usuario verificado debe recibir automáticamente al confirmar su email. Sin embargo, fallos en el proceso pueden causar que algunos usuarios no reciban estos recursos, afectando su experiencia inicial en el juego.

### ¿Qué contiene el Paquete Pionero?

| Recurso | Cantidad | Descripción |
|---------|----------|-------------|
| 💰 VAL | +50 | Moneda del juego |
| 🎮 Personaje Base | 1 | Personaje Rango D (nivel 1, etapa 1) |
| ⚔️ Espada Corta Oxidada | 1 | Equipamiento inicial |
| 🧪 Poción de Vida Menor | 3 | Consumibles de curación |

### Flag de Control

- **Campo**: `receivedPioneerPackage: boolean`
- **Propósito**: Garantizar que el paquete se entrega solo UNA vez (idempotencia)
- **Ubicación**: Modelo `User`

---

## Flujo de Onboarding Correcto

```
1. Usuario se registra
   ├─ POST /api/auth/register
   ├─ Se crea cuenta con isVerified: false
   └─ Se envía email de verificación
   
2. Usuario hace click en enlace de verificación
   ├─ GET /api/auth/verify/:token
   ├─ Se marca isVerified: true
   └─ ✅ SE ENTREGA PAQUETE PIONERO AUTOMÁTICAMENTE
      ├─ Se añade personaje base rango D
      ├─ Se otorgan 50 VAL
      ├─ Se añaden 3 pociones al inventarioConsumibles
      ├─ Se añade espada al inventarioEquipamiento
      └─ Se marca receivedPioneerPackage: true

3. Usuario hace login
   ├─ POST /api/auth/login
   └─ Recibe JWT con todos sus datos (personajes, inventario, recursos)

4. Usuario accede a su dashboard
   ├─ GET /api/users/me
   └─ Puede ver su personaje, items y recursos
```

---

## Problemas Detectados

### 🔴 Problema 1: Usuario Verificado Sin Paquete Pionero

**Síntoma:**
- `isVerified: true`
- `receivedPioneerPackage: false` o `undefined`
- Sin personajes, sin items, sin VAL inicial

**Causa posible:**
- Error durante la entrega del paquete en el endpoint `/verify/:token`
- Usuario verificado manualmente sin entregar paquete
- Fallo en el servicio de onboarding

**Impacto:** 🔴 CRÍTICO
- Usuario no puede jugar (no tiene personaje)
- Experiencia inicial completamente rota

---

### 🟡 Problema 2: Recursos NULL o Undefined

**Síntoma:**
- `val: null` o `val: undefined`
- `boletos: null` o `boletos: undefined`
- `evo: null` o `evo: undefined`

**Causa posible:**
- Usuario creado antes de que los recursos tuvieran valores por defecto en el schema
- Migración incompleta de base de datos

**Impacto:** 🟡 MEDIO
- Frontend puede mostrar valores incorrectos
- Cálculos de recursos pueden fallar

---

### 🟠 Problema 3: Flag de Paquete Pero Sin Personaje

**Síntoma:**
- `receivedPioneerPackage: true`
- `personajes: []` (array vacío)

**Causa posible:**
- Error al guardar personaje en base de datos
- Inconsistencia durante el proceso de entrega

**Impacto:** 🔴 CRÍTICO
- Usuario marcado como "tiene paquete" pero no puede jugar

---

### 🟠 Problema 4: Flag de Paquete Pero Inventario Vacío

**Síntoma:**
- `receivedPioneerPackage: true`
- `inventarioEquipamiento: []` (sin espada)
- `inventarioConsumibles: []` (sin pociones)

**Causa posible:**
- IDs de items no existen en la base de datos (seed incompleto)
- Error al insertar items en los arrays de inventario

**Impacto:** 🟡 MEDIO
- Usuario puede jugar pero sin ventaja inicial
- Mazmorras más difíciles de completar

---

### 🔴 Problema 5: Flag de Paquete Pero VAL en 0

**Síntoma:**
- `receivedPioneerPackage: true`
- `val: 0` o `val: null`

**Causa posible:**
- Error al incrementar el VAL durante la entrega
- VAL gastado pero paquete no re-entregable

**Impacto:** 🟡 MEDIO
- Usuario no puede comprar en marketplace inicial
- Experiencia económica limitada

---

## Scripts Disponibles

### 1. `diagnose-onboarding-flow.ts`

**Propósito:** Analizar TODA la base de datos y detectar problemas en el flujo de onboarding.

**Qué hace:**
- Cuenta usuarios verificados vs. no verificados
- Detecta usuarios verificados sin paquete pionero
- Detecta recursos NULL/undefined
- Detecta inconsistencias entre flag y contenido real
- Genera reporte visual en consola
- Guarda reporte JSON en `temp/onboarding-diagnostic-report.json`

**Comandos:**
```bash
# Opción 1: Usando npm script
npm run diagnose:onboarding

# Opción 2: Directo con ts-node
npx ts-node scripts/diagnose-onboarding-flow.ts
```

**Salida esperada:**
```
═══════════════════════════════════════════════════════════
🔍 DIAGNÓSTICO COMPLETO: FLUJO DE ONBOARDING
═══════════════════════════════════════════════════════════

📊 RESUMEN GENERAL
═══════════════════════════════════════════════════════════
👥 Total de usuarios: 31
✅ Verificados: 11
⏳ No verificados: 20

📦 PAQUETE PIONERO
═══════════════════════════════════════════════════════════
✅ Con paquete entregado: 10
❌ Sin paquete entregado: 21

🔴 PROBLEMA 1: USUARIOS VERIFICADOS SIN PAQUETE PIONERO
═══════════════════════════════════════════════════════════
Encontrados: 1

1. Email: mchaustman@gmail.com
   Username: haust
   Registrado: 2025-10-30T22:07:19.811Z
```

---

### 2. `fix-onboarding-issues.ts`

**Propósito:** Reparar automáticamente todos los problemas detectados.

**Qué hace:**
- Inicializa recursos NULL a 0
- Entrega Paquete Pionero completo a usuarios verificados sin él
- Re-entrega personaje si falta
- Re-entrega items si el inventario está vacío
- Asegura consistencia entre flag y contenido real

**Modos de ejecución:**

#### Modo DRY RUN (por defecto)
**NO modifica la base de datos**, solo muestra qué cambios se aplicarían.

```bash
# Opción 1: Usando npm script
npm run fix:onboarding

# Opción 2: Directo con ts-node
npx ts-node scripts/fix-onboarding-issues.ts
```

#### Modo APPLY (aplicar cambios reales)
**SÍ modifica la base de datos**, aplica todas las reparaciones.

```bash
# Opción 1: Usando npm script
npm run fix:onboarding:apply

# Opción 2: Directo con ts-node
npx ts-node scripts/fix-onboarding-issues.ts --apply
```

**Salida esperada (DRY RUN):**
```
═══════════════════════════════════════════════════════════
🔧 REPARACIÓN AUTOMÁTICA: FLUJO DE ONBOARDING
═══════════════════════════════════════════════════════════
Modo: 🔍 DRY RUN (no modifica DB)
═══════════════════════════════════════════════════════════

🔧 Usuario: mchaustman@gmail.com
   Username: haust
   Verificado: ✅
   Fixes aplicados:
     - Paquete Pionero entregado (completo)
   🔍 [DRY RUN] Cambios NO guardados

═══════════════════════════════════════════════════════════
📊 REPORTE FINAL
═══════════════════════════════════════════════════════════
👥 Usuarios analizados: 31
🔧 Usuarios reparados: 1
💰 Recursos inicializados: 0
📦 Paquetes entregados: 1
🎮 Personajes añadidos: 1
⚔️  Items añadidos: 4
❌ Errores: 0
═══════════════════════════════════════════════════════════
```

---

## Uso de los Scripts

### Workflow Recomendado

#### Paso 1: Diagnosticar
```bash
npm run diagnose:onboarding
```

Revisa el reporte en consola. Si detecta problemas, pasa al siguiente paso.

#### Paso 2: Simular Reparación (DRY RUN)
```bash
npm run fix:onboarding
```

Revisa los cambios propuestos. Si todo se ve correcto, pasa al siguiente paso.

#### Paso 3: Aplicar Reparación Real
```bash
npm run fix:onboarding:apply
```

Los cambios se aplicarán a la base de datos.

#### Paso 4: Verificar Corrección
```bash
npm run diagnose:onboarding
```

Debe mostrar: `✅ FLUJO DE ONBOARDING CORRECTO`

---

### Casos de Uso Específicos

#### Caso 1: Usuario reporta que no tiene personaje
```bash
# 1. Verificar estado actual
npm run diagnose:onboarding

# 2. Si aparece en el reporte, reparar
npm run fix:onboarding:apply

# 3. Confirmar corrección
npm run diagnose:onboarding

# 4. Pedir al usuario que haga logout/login
```

#### Caso 2: Verificar estado antes de desplegar
```bash
# En PRODUCCIÓN (antes del deploy)
npm run diagnose:onboarding

# Si hay problemas, reparar primero
npm run fix:onboarding:apply

# Confirmar que todo está limpio
npm run diagnose:onboarding
```

#### Caso 3: Después de migración o cambios en schema
```bash
# Siempre ejecutar diagnóstico después de cambios en User model
npm run diagnose:onboarding

# Reparar si es necesario
npm run fix:onboarding:apply
```

---

## Interpretación de Resultados

### Reporte JSON

El archivo `temp/onboarding-diagnostic-report.json` contiene:

```json
{
  "totalUsers": 31,
  "verifiedUsers": 11,
  "unverifiedUsers": 20,
  "usersWithPioneerPackage": 10,
  "usersWithoutPioneerPackage": 21,
  "verifiedButNoPioneerPackage": [
    {
      "email": "usuario@ejemplo.com",
      "username": "usuario1",
      "fechaRegistro": "2025-10-30T22:07:19.811Z"
    }
  ],
  "usersWithNullResources": [],
  "usersWithCharacters": 11,
  "usersWithoutCharacters": 20,
  "pioneerFlagButNoCharacter": [],
  "usersWithEquipment": 0,
  "usersWithConsumables": 2,
  "pioneerFlagButEmptyInventory": [],
  "criticalIssues": []
}
```

### Métricas Clave

| Métrica | ¿Qué indica? | Estado ideal |
|---------|--------------|--------------|
| `verifiedButNoPioneerPackage.length` | Usuarios críticos sin paquete | **0** |
| `usersWithNullResources.length` | Recursos no inicializados | **0** |
| `pioneerFlagButNoCharacter.length` | Inconsistencia flag/personaje | **0** |
| `pioneerFlagButEmptyInventory.length` | Inconsistencia flag/items | **0** |
| `criticalIssues.length` | Problemas graves | **0** |

---

## Troubleshooting

### Error: "BaseCharacter rango D no encontrado"

**Causa:** La base de datos no tiene el personaje base rango D necesario para el paquete pionero.

**Solución:**
```bash
npm run seed
```

Esto creará todos los personajes base, items y recursos necesarios.

---

### Error: "Poción/Espada NO ENCONTRADA"

**Causa:** Los IDs hardcodeados en el script no coinciden con los de tu base de datos.

**Solución 1:** Ejecutar seed completo
```bash
npm run seed
```

**Solución 2:** Actualizar IDs en los scripts

1. Buscar los IDs reales en tu base de datos:
```bash
# Conectar a MongoDB
mongosh

# Buscar poción
use valgame
db.consumables.findOne({ nombre: /poción/i })

# Buscar espada
db.items.findOne({ nombre: /espada/i })
```

2. Actualizar constantes en:
   - `scripts/fix-onboarding-issues.ts`
   - `src/services/onboarding.service.ts`

---

### Usuario Sigue Sin Ver Su Personaje Después de Reparación

**Causa:** El frontend está cacheando datos antiguos.

**Solución:**
1. Pedir al usuario que haga **logout**
2. Cerrar completamente el navegador (limpiar cookies)
3. Hacer **login** de nuevo

---

### Script Se Queda "Colgado" Sin Salida

**Causa:** Problema de conexión a MongoDB.

**Verificar:**
```bash
# Ver contenido del .env
cat .env | grep MONGODB_URI

# Verificar que MongoDB está corriendo
mongosh --eval "db.version()"
```

---

## Mantenimiento Preventivo

### Monitoreo Regular

Ejecutar el diagnóstico cada semana en producción:

```bash
# Crear un cron job o tarea programada
# Ejemplo: Cada lunes a las 9am
0 9 * * 1 cd /path/to/backend && npm run diagnose:onboarding >> logs/onboarding-check.log
```

### Antes de Cada Deploy

Agregar al pipeline CI/CD:

```yaml
# .github/workflows/deploy.yml
- name: Check Onboarding Health
  run: npm run diagnose:onboarding
```

---

## Código Fuente de Referencia

### Servicio de Onboarding
📄 `src/services/onboarding.service.ts`

### Endpoint de Verificación
📄 `src/routes/auth.routes.ts` (línea 85-90)

### Modelo de Usuario
📄 `src/models/User.ts` (campo `receivedPioneerPackage`)

---

## Resumen de Comandos

| Comando | Descripción |
|---------|-------------|
| `npm run diagnose:onboarding` | Diagnosticar problemas (no modifica DB) |
| `npm run fix:onboarding` | Simular reparación (DRY RUN) |
| `npm run fix:onboarding:apply` | Reparar problemas (APLICA CAMBIOS REALES) |

---

## Changelog

### v1.0.0 (2025-11-02)
- ✅ Script de diagnóstico completo
- ✅ Script de reparación automática
- ✅ Modo DRY RUN por defecto
- ✅ Reporte JSON detallado
- ✅ Documentación completa

---

**Última actualización:** 2025-11-02  
**Mantenedor:** Equipo Backend Valgame
