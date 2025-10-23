# 🎯 VULNERABILIDADES - UBICACIÓN EXACTA EN CÓDIGO

**Archivo:** `src/routes/userPackages.routes.ts`  
**Total de vulnerabilidades:** 6

---

## 🔴 VULNERABILIDAD 1: SIN COBRO DE VAL

**Ubicación:** Líneas 11-21

```typescript
// ❌ CÓDIGO CON VULNERABILIDAD:
router.post('/agregar', async (req, res) => {
  const { userId, paqueteId } = req.body;
  if (!userId || !paqueteId) return res.status(400).json({ error: 'Faltan datos.' });

  try {
    const nuevo = await UserPackage.create({ userId, paqueteId });
    // ❌ PROBLEMA: No valida VAL
    // ❌ PROBLEMA: No resta VAL
    // ❌ PROBLEMA: No hay autorización
    res.json({ ok: true, userPackage: nuevo });
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar paquete.' });
  }
});
```

**Lo que falta:**
- ❌ Validar que user tiene suficiente VAL
- ❌ Restar el VAL del usuario
- ❌ Validar que userId pertenece al usuario autenticado

---

## 🔴 VULNERABILIDAD 2: SIN VALIDACIÓN DE AUTORIZACIÓN

**Ubicación:** Línea 65 (inicio de POST /open)

```typescript
// ❌ CÓDIGO CON VULNERABILIDAD:
router.post('/open', async (req, res) => {
  const { userId, paqueteId } = req.body;
  if (!userId) return res.status(400).json({ error: 'Falta userId' });

  try {
    const user = await User.findById(userId); // ❌ PROBLEMA: userId viene del body, no del JWT!
    // Cualquiera puede poner userId de otro jugador
    
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    // ... resto del código ...
```

**Lo que falta:**
- ❌ Validar que `req.user._id` (del JWT) == `userId` (del request)

---

## 🔴 VULNERABILIDAD 3: RACE CONDITION - ABRIR PAQUETE 2 VECES

**Ubicación:** Líneas 65-165 (todo el POST /open)

```typescript
// ❌ CÓDIGO CON VULNERABILIDAD:
router.post('/open', async (req, res) => {
  // ...
  
  let pkg;
  if (paqueteId) {
    pkg = await PackageModel.findById(paqueteId);
  } else {
    // ❌ PROBLEMA: Sin transacciones atómicas
    const up = await UserPackage.findOne({ userId }); // Búsqueda 1
    if (!up) return res.status(404).json({ error: 'Usuario no tiene paquetes' });
    pkg = await PackageModel.findById(up.paqueteId);
    await up.deleteOne(); // ❌ PROBLEMA: Si 2 requests simultáneos, ambos pueden pasar la búsqueda
  }
  
  // Si 2 requests llegan AQUÍ al mismo tiempo:
  // Request 1: up = paquete encontrado
  // Request 2: up = paquete TODAVÍA EXISTE (no fue eliminado aún)
  // Request 1: await up.deleteOne() ← elimina
  // Request 2: continúa y abre el MISMO paquete
  
  // RESULTADO: Paquete abierto 2 veces ❌
```

**Lo que falta:**
- ❌ Transacciones atómicas de MongoDB
- ❌ Lock en el documento UserPackage

---

## 🟠 VULNERABILIDAD 4: SIN VALIDACIÓN DE LÍMITES

**Ubicación:** Líneas 100-130 (asignación de personajes)

```typescript
// ❌ CÓDIGO CON VULNERABILIDAD:
const toAssign = pkg.personajes || 1;
const assigned: any[] = [];

// Rellenar con garantizados
for (const cat of guaranteed) {
  if (assigned.length >= toAssign) break;
  const base = await chooseRandomBaseForCategory(cat);
  if (base) {
    user.personajes.push({ // ❌ PROBLEMA: No valida si user.personajes.length < 50
      personajeId: base.id,
      // ...
    } as any);
    assigned.push(base.id);
  }
}

// ❌ PROBLEMA: Usuario podría tener 51, 52, 100+ personajes
```

**Lo que falta:**
- ❌ Validar antes: `user.personajes.length < 50`
- ❌ Validar límite de items también

---

## 🟡 VULNERABILIDAD 5: LOOP INFINITO POSIBLE

**Ubicación:** Líneas 125-147 (while loop)

```typescript
// ❌ CÓDIGO CON VULNERABILIDAD:
while (assigned.length < toAssign) { // ❌ PROBLEMA: Sin límite de intentos
  // elegir categoría por probabilidad
  const cats = categoriesList;
  const r = Math.random();
  let accum = 0;
  let chosenCat = cats[cats.length - 1].nombre;
  for (const c of cats) {
    accum += (c as any).probabilidad || 0;
    if (r <= accum) { chosenCat = (c as any).nombre; break; }
  }
  const base = await chooseRandomBaseForCategory(chosenCat);
  if (base) {
    user.personajes.push({ // ... });
    assigned.push(base.id);
  } else {
    break; // ❌ DÉBIL: Si categoría no existe, break. Pero puede haber edge cases
  }
}

// ❌ RIESGO: Loop infinito si algo falla
```

**Lo que falta:**
- ❌ Máximo de intentos (ej: MAX_INTENTOS = 100)
- ❌ Counter para evitar loops infinitos

---

## 🟡 VULNERABILIDAD 6: SIN LOGS DE AUDITORÍA

**Ubicación:** ARCHIVO NO EXISTE

```
❌ NO HAY LOGS de:
   - Quién compró qué
   - Cuándo
   - Con qué VAL
   - Si tuvo éxito o error
   - IP del usuario
   - Resultado final

❌ PROBLEMA: Imposible rastrear fraude
```

**Lo que falta:**
- ❌ Crear modelo `PurchaseLog`
- ❌ Loggear cada compra/apertura

---

## 📊 TABLA RESUMEN

| # | Severidad | Ubicación | Líneas | Descripción |
|---|-----------|-----------|--------|-------------|
| 1 | 🔴 CRÍTICA | POST /agregar | 11-21 | Sin cobro de VAL |
| 2 | 🔴 CRÍTICA | POST /open | 65 | Sin validación de autorización |
| 3 | 🔴 CRÍTICA | POST /open | 65-165 | Race condition (abrir 2 veces) |
| 4 | 🟠 ALTA | POST /open | 100-130 | Sin validación de límites |
| 5 | 🟡 MEDIA | POST /open | 125-147 | Loop infinito posible |
| 6 | 🟡 MEDIA | NO EXISTE | - | Sin logs de auditoría |

---

## ✅ CÓMO ARREGLARLO - ORDEN DE PRIORIDAD

### PASO 1: Arreglar PROBLEMA 2 (5 minutos)
**Ubicación:** Línea 65  
**Cambio:** Agregar validación de autorización

**Código a agregar ANTES de `const { userId, paqueteId } = req.body;`:**
```typescript
// Validar autorización
const userIdFromJWT = req.user?._id?.toString();
const requestUserId = req.body.userId;

if (!userIdFromJWT || userIdFromJWT !== requestUserId) {
  return res.status(403).json({ error: 'No autorizado' });
}
```

---

### PASO 2: Arreglar PROBLEMA 1 (10 minutos)
**Ubicación:** Línea 11-21 (POST /agregar)  
**Cambio:** Agregar validación de VAL

**Código a agregar:**
```typescript
router.post('/agregar', async (req, res) => {
  const { userId, paqueteId } = req.body;
  if (!userId || !paqueteId) return res.status(400).json({ error: 'Faltan datos.' });

  try {
    // NUEVO: Validar usuario existe y tiene VAL
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    
    // NUEVO: Obtener paquete
    const pkg = await PackageModel.findById(paqueteId);
    if (!pkg) return res.status(404).json({ error: 'Paquete no encontrado' });
    
    // NUEVO: Validar precio y VAL
    const precio = (pkg as any).precio || 1000;
    if (user.val < precio) {
      return res.status(402).json({ 
        error: `Necesitas ${precio} VAL, tienes ${user.val}` 
      });
    }
    
    // NUEVO: Restar VAL
    user.val -= precio;
    await user.save();
    
    // Original
    const nuevo = await UserPackage.create({ userId, paqueteId });
    res.json({ ok: true, userPackage: nuevo });
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar paquete.' });
  }
});
```

---

### PASO 3: Arreglar PROBLEMA 3 (30 minutos)
**Ubicación:** Línea 65-165 (POST /open)  
**Cambio:** Agregar transacciones atómicas

**Código a agregar AL INICIO del try:**
```typescript
const session = await mongoose.startSession();
session.startTransaction();

try {
  // Buscar con sesión
  const up = await UserPackage.findOne({ userId }, null, { session });
  
  if (!up) {
    await session.abortTransaction();
    return res.status(404).json({ error: 'Usuario no tiene paquetes' });
  }
  
  // MARCAR como abriendo
  await UserPackage.findByIdAndUpdate(
    up._id,
    { estado: 'abriendo' },
    { session }
  );
  
  // ... resto del código ...
  
  // AL FINAL, eliminar
  await UserPackage.findByIdAndDelete(up._id, { session });
  
  await session.commitTransaction();
  res.json({ ok: true, assigned });
} catch (err) {
  await session.abortTransaction();
  console.error('[USER-PACKAGE-OPEN] Error:', err);
  res.status(500).json({ error: 'Error al abrir paquete' });
}
```

---

### PASO 4: Arreglar PROBLEMA 4 (10 minutos)
**Ubicación:** Línea 100  
**Cambio:** Validar límites

**Código a agregar ANTES de asignar:**
```typescript
const LIMITE_PERSONAJES = 50;
const LIMITE_ITEMS = 200;

if (user.personajes.length + toAssign > LIMITE_PERSONAJES) {
  await session.abortTransaction();
  return res.status(409).json({
    error: `Límite de personajes alcanzado (${LIMITE_PERSONAJES} máximo)`
  });
}

const itemCount = (user.inventarioEquipamiento?.length || 0) + 
                 (user.inventarioConsumibles?.length || 0);
if (itemCount + (pkg.items_reward?.length || 0) > LIMITE_ITEMS) {
  await session.abortTransaction();
  return res.status(409).json({
    error: `Límite de items alcanzado (${LIMITE_ITEMS} máximo)`
  });
}
```

---

### PASO 5: Arreglar PROBLEMA 5 (5 minutos)
**Ubicación:** Línea 125  
**Cambio:** Agregar máximo de intentos

**Reemplazar:**
```typescript
while (assigned.length < toAssign) {
```

**Por:**
```typescript
const MAX_INTENTOS = 100;
let intentos = 0;

while (assigned.length < toAssign && intentos < MAX_INTENTOS) {
  intentos++;
```

---

### PASO 6: Arreglar PROBLEMA 6 (20 minutos)
**Ubicación:** Crear nuevo modelo  
**Cambio:** Crear logs de auditoría

Crear archivo `src/models/PurchaseLog.ts`:
```typescript
import mongoose from 'mongoose';

const purchaseLogSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  paqueteId: mongoose.Schema.Types.ObjectId,
  timestamp: { type: Date, default: Date.now },
  action: String, // 'compra' o 'abre'
  valAntes: Number,
  valDespues: Number,
  estado: String, // 'exito' o 'error'
  error: String
});

export default mongoose.model('PurchaseLog', purchaseLogSchema);
```

Y loggear en cada compra:
```typescript
import PurchaseLog from '../models/PurchaseLog';

// Dentro de POST /agregar, después de restar VAL:
await PurchaseLog.create({
  userId,
  paqueteId,
  timestamp: new Date(),
  action: 'compra',
  valAntes: user.val + precio,
  valDespues: user.val,
  estado: 'exito'
});
```

---

## ✅ VERIFICAR QUE FUNCIONA

Después de cada corrección:

```bash
npm run test -- tests/security/packages.security.test.ts
```

Deberías ver más tests pasando:
- Después paso 1: +1 test pasando
- Después paso 2: +1 test pasando
- Después paso 3: +2 tests pasando
- Después paso 4: +2 tests pasando
- Después paso 5: +1 test pasando
- Después paso 6: +2 tests pasando

**Total:** 17/17 tests passing ✅

---

**Documento:** Ubicación exacta de vulnerabilidades  
**Fecha:** 22 de octubre de 2025  
**Estado:** Listo para implementar

