# 🔐 PROBLEMAS DE SEGURIDAD - EXPLICACIÓN SIMPLE

**Fecha:** 22 de octubre de 2025  
**Tema:** Vulnerabilidades en sistema de compra de paquetes  
**Nivel:** Fácil de entender

---

## 🎯 Los 6 Problemas Principales

### ⚠️ PROBLEMA 1: 🔴 CRÍTICA - Race Condition (Abrir paquete 2 veces)

**¿Dónde está el código?**
```
Archivo: src/routes/userPackages.routes.ts
Línea: 67-105 (función POST /open)
```

**¿Cuál es el problema?**
```javascript
// Usuario tiene 1 paquete
// Hace 2 requests AL MISMO TIEMPO:

// REQUEST 1                          // REQUEST 2
POST /open                           POST /open
└─ Busca paquete                      └─ Busca paquete (al mismo tiempo!)
└─ Encuentra: SÍ                       └─ Encuentra: SÍ (todavía existe!)
└─ Abre paquete 1                      └─ Abre paquete 1 (OTRA VEZ!)
└─ Usuario recibe: 1 personaje        └─ Usuario recibe: 1 personaje
                                     
RESULTADO: Usuario tiene 2 personajes del mismo paquete ❌
```

**¿Cómo se arregla?**
```typescript
// AGREGAR ESTO AL INICIO de POST /open:

const session = await mongoose.startSession();
session.startTransaction();

try {
  // Buscar y BLOQUEAR el paquete
  const userPackage = await UserPackage.findOne(
    { userId, paqueteId },
    null,
    { session }
  );
  
  if (!userPackage) {
    await session.abortTransaction();
    return res.status(404).json({ error: 'Paquete no encontrado' });
  }
  
  // MARCAR COMO EN PROCESO (esto previene race condition)
  await UserPackage.findByIdAndUpdate(
    userPackage._id,
    { estado: 'abriendo' }, // ← AGREGAR ESTE CAMPO
    { session }
  );
  
  // ... resto del código ...
  
  // Al final, eliminar el paquete
  await UserPackage.findByIdAndDelete(userPackage._id, { session });
  
  await session.commitTransaction();
  res.json({ ok: true, assigned });
} catch (error) {
  await session.abortTransaction();
  res.status(500).json({ error: 'Error al abrir paquete' });
}
```

---

### ⚠️ PROBLEMA 2: 🔴 CRÍTICA - Sin Autorización (Abrir paquete de otro usuario)

**¿Dónde está el código?**
```
Archivo: src/routes/userPackages.routes.ts
Línea: 67 (función POST /open)
```

**¿Cuál es el problema?**
```javascript
// Usuario A tiene token de autenticación
// Pero INTENTA ABRIR paquete del Usuario B

// Atacante hace:
POST /api/user-packages/open
{
  "userId": "id_del_usuario_b",  // ← PROBLEMA: No hay validación!
  "paqueteId": "paquete_id"
}

// El servidor PERMITE porque NO VALIDA que userId pertenece al usuario autenticado
RESULTADO: Usuario A recibe contenido del paquete de Usuario B ❌
```

**¿Cómo se arregla?**
```typescript
// AL INICIO de POST /open, AGREGAR ESTA VALIDACIÓN:

router.post('/open', async (req, res) => {
  const { userId, paqueteId } = req.body;
  
  // ← AGREGAR ESTO (obtener usuario del JWT, NO del request body)
  const userIdFromJWT = req.user._id; // Del token, no del body
  
  // ← VALIDAR que coinciden
  if (userIdFromJWT.toString() !== userId) {
    return res.status(403).json({ 
      error: 'No tienes permiso para abrir este paquete' 
    });
  }
  
  // ... resto del código ...
});
```

---

### ⚠️ PROBLEMA 3: 🟠 ALTA - Sin Cobro de VAL (Compra gratis)

**¿Dónde está el código?**
```
Archivo: src/routes/userPackages.routes.ts
Línea: 12-20 (función POST /agregar)
```

**¿Cuál es el problema?**
```javascript
// Ruta para agregar paquete (comprar)
router.post('/agregar', async (req, res) => {
  const { userId, paqueteId } = req.body;
  
  // ← PROBLEMA: NO VALIDA si user tiene VAL suficiente
  // ← PROBLEMA: NO RESTA el VAL del usuario
  
  // Solo agrega el paquete sin cobrar
  const nuevo = await UserPackage.create({ userId, paqueteId });
  res.json({ ok: true, userPackage: nuevo });
});

RESULTADO: Usuario compra paquete GRATIS ❌
```

**¿Cómo se arregla?**
```typescript
router.post('/agregar', async (req, res) => {
  const { userId, paqueteId } = req.body;
  
  // ← AGREGAR: Obtener usuario
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  
  // ← AGREGAR: Obtener paquete con precio
  const pkg = await Package.findById(paqueteId);
  if (!pkg) return res.status(404).json({ error: 'Paquete no encontrado' });
  
  // ← AGREGAR: Validar que tiene VAL suficiente
  const paquetePrecio = pkg.precio || 1000; // Precio del paquete
  if (user.val < paquetePrecio) {
    return res.status(402).json({ 
      error: `Necesitas ${paquetePrecio} VAL, tienes ${user.val}` 
    });
  }
  
  // ← AGREGAR: Restar VAL
  user.val -= paquetePrecio;
  await user.save();
  
  // Ahora agregar el paquete
  const nuevo = await UserPackage.create({ userId, paqueteId });
  res.json({ ok: true, userPackage: nuevo });
});
```

---

### ⚠️ PROBLEMA 4: 🟠 ALTA - Sin Logs de Auditoría (No sabemos quién compró qué)

**¿Dónde está el código?**
```
Archivo: NO EXISTE - Hay que crear
```

**¿Cuál es el problema?**
```
Si un usuario frauda (compra sin VAL, abre paquete 2 veces, etc):
- NO HAY REGISTRO de lo que pasó
- No podemos rastrear fraudadores
- No podemos hacer rollback de transacciones

RESULTADO: Imposible detectar fraude ❌
```

**¿Cómo se arregla?**

Paso 1: Crear modelo PurchaseLog en `src/models/PurchaseLog.ts`:
```typescript
import mongoose from 'mongoose';

const purchaseLogSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  paqueteId: mongoose.Schema.Types.ObjectId,
  timestamp: Date,
  action: String, // 'compra' o 'abre'
  valAntes: Number,
  valDespues: Number,
  itemsRecibidos: [String],
  personajesRecibidos: [String],
  estado: String, // 'exito' o 'error'
  error: String, // Si hay error
});

export default mongoose.model('PurchaseLog', purchaseLogSchema);
```

Paso 2: Agregar log en cada compra:
```typescript
// En POST /agregar
const log = await PurchaseLog.create({
  userId,
  paqueteId,
  timestamp: new Date(),
  action: 'compra',
  valAntes: user.val + paquetePrecio, // Antes de restar
  valDespues: user.val, // Después de restar
  estado: 'exito'
});
```

---

### ⚠️ PROBLEMA 5: 🟡 MEDIA - Sin Validación de Límites (50 personajes máximo)

**¿Dónde está el código?**
```
Archivo: src/routes/userPackages.routes.ts
Línea: 90-100 (función POST /open, durante asignación de personajes)
```

**¿Cuál es el problema?**
```javascript
// Usuario tiene 50 personajes (máximo permitido)
// Pero abre paquete que da 1 personaje más

RESULTADO: Usuario tiene 51 personajes (debería ser máximo 50) ❌
```

**¿Cómo se arregla?**
```typescript
// EN POST /open, ANTES de abrir paquete, AGREGAR:

const LIMITE_PERSONAJES = 50;
const LIMITE_ITEMS = 200;

const currentPersonajes = user.personajes.length;
const currentItems = (user.inventarioEquipamiento?.length || 0) + 
                     (user.inventarioConsumibles?.length || 0);

const toAddPersonajes = pkg.personajes || 1;
const toAddItems = (pkg.items_reward?.length || 0);

// Validar límites
if (currentPersonajes + toAddPersonajes > LIMITE_PERSONAJES) {
  return res.status(409).json({
    error: `Límite de personajes alcanzado (${LIMITE_PERSONAJES} máximo)`,
    tienes: currentPersonajes,
    intentas_agregar: toAddPersonajes
  });
}

if (currentItems + toAddItems > LIMITE_ITEMS) {
  return res.status(409).json({
    error: `Límite de items alcanzado (${LIMITE_ITEMS} máximo)`,
    tienes: currentItems,
    intentas_agregar: toAddItems
  });
}

// ... resto del código ...
```

---

### ⚠️ PROBLEMA 6: 🟡 MEDIA - Sin Manejo de Errores en Loops (Loop infinito)

**¿Dónde está el código?**
```
Archivo: src/routes/userPackages.routes.ts
Línea: 98-120 (while loop para asignar personajes)
```

**¿Cuál es el problema?**
```javascript
// LOOP INFINITO POSIBLE:
while (assigned.length < toAssign) {
  // Elegir categoría por probabilidad
  const base = await chooseRandomBaseForCategory(chosenCat);
  
  if (base) {
    // Agregar personaje
    assigned.push(base.id);
  } else {
    // ← PROBLEMA: Si no encuentra base, entra LOOP INFINITO
    // No hay break, no hay contador, sigue intentando infinito
  }
}

RESULTADO: Servidor se cuelga intentando abrir paquete ❌
```

**¿Cómo se arregla?**
```typescript
// REEMPLAZAR el while loop por:

const MAX_INTENTOS = 100; // Máximo de intentos
let intentos = 0;

while (assigned.length < toAssign && intentos < MAX_INTENTOS) {
  intentos++;
  
  // Elegir categoría
  const cats = categoriesList;
  const r = Math.random();
  let accum = 0;
  let chosenCat = cats[cats.length - 1].nombre;
  
  for (const c of cats) {
    accum += (c as any).probabilidad || 0;
    if (r <= accum) { 
      chosenCat = (c as any).nombre; 
      break; 
    }
  }
  
  const base = await chooseRandomBaseForCategory(chosenCat);
  
  if (base) {
    user.personajes.push({
      personajeId: base.id,
      rango: chosenCat,
      nivel: 1,
      etapa: 1,
      progreso: 0,
      stats: base.stats,
      saludActual: base.stats.vida,
      saludMaxima: base.stats.vida,
      estado: 'saludable',
      fechaHerido: null,
      equipamiento: [],
      activeBuffs: []
    } as any);
    assigned.push(base.id);
  }
}

// Si no se asignaron todos, avisar
if (assigned.length < toAssign) {
  console.warn(`Solo se asignaron ${assigned.length} de ${toAssign} personajes`);
}
```

---

## 📋 RESUMEN RÁPIDO

| # | Problema | Archivo | Línea | Solución |
|---|----------|---------|-------|----------|
| 1 | Race condition | userPackages.routes.ts | 67-105 | Transacciones + estado |
| 2 | Sin autorización | userPackages.routes.ts | 67 | Validar `req.user._id` |
| 3 | Sin cobro VAL | userPackages.routes.ts | 12-20 | Validar balance + restar |
| 4 | Sin logs | NO EXISTE | - | Crear PurchaseLog model |
| 5 | Sin límites | userPackages.routes.ts | 90-100 | Validar antes de abrir |
| 6 | Loop infinito | userPackages.routes.ts | 98-120 | Agregar MAX_INTENTOS |

---

## ✅ ORDEN DE PRIORIDAD PARA ARREGLARLO

### HOY - 1 hora (CRÍTICAS):
```
1. Problema 2: Agregar validación de autorización (5 minutos)
2. Problema 3: Agregar validación de balance (10 minutos)
```

### HOY - 2 horas (ALTAS):
```
3. Problema 1: Agregar transacciones atómicas (30 minutos)
4. Problema 4: Crear PurchaseLog model (30 minutos)
```

### MAÑANA - 1 hora (MEDIAS):
```
5. Problema 5: Agregar validación de límites (15 minutos)
6. Problema 6: Agregar máximo de intentos (15 minutos)
```

---

## 🧪 CÓMO VERIFICAR QUE FUNCIONA

Después de cada corrección, ejecuta:

```bash
npm run test -- tests/security/packages.security.test.ts
```

Deberías ver:
```
✅ PASS  Validación de Balance
✅ PASS  Race Conditions
✅ PASS  Prevención de Duplicación
✅ PASS  Protección contra Manipulación
✅ PASS  Auditoría y Logs
✅ PASS  Límites y Validaciones

Total: 17/17 tests passing ✅
```

---

**Documento creado:** 22 de octubre de 2025  
**Propósito:** Explicación simple de vulnerabilidades  
**Estado:** Listo para implementar correcciones

