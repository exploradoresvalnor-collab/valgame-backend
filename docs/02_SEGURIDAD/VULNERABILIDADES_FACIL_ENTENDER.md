# 🔴 PROBLEMAS DE SEGURIDAD - GUÍA SIMPLE Y DIRECTA

**Fecha:** 22 de octubre de 2025  
**Criticidad:** 🔴 URGENTE - Arreglar ANTES de cualquier otro feature

---

## 📍 ¿DÓNDE ESTÁN LOS PROBLEMAS?

Todos los problemas están en **PAQUETES** (compra y apertura):

```
src/
├── routes/
│   └── userPackages.routes.ts  ← 🔴 AQUÍ ESTÁN LOS PROBLEMAS
└── services/
    └── payment.service.ts       ← 🔴 Y AQUÍ
```

---

## 🚨 PROBLEMA #1: Sin Validación de Autorización

### ¿QUÉ ES?
Usuario A puede abrir paquetes de Usuario B si sabe su ID.

### ¿DÓNDE ESTÁ?
**Archivo:** `src/routes/userPackages.routes.ts`  
**Línea:** ~67 (en la ruta `POST /open`)

### ❌ CÓDIGO ACTUAL (VULNERABLE):
```typescript
router.post('/open', async (req, res) => {
  const { userId, paqueteId } = req.body;  // ⚠️ Lee userId del request (¡EL USUARIO LO ENVÍA!)
  if (!userId) return res.status(400).json({ error: 'Falta userId' });

  try {
    const user = await User.findById(userId);  // ⚠️ Usa el userId del request directamente
    // ... resto del código
  }
});
```

**¿El ataque?**
```bash
# Usuario A hace esto:
curl -X POST http://localhost:3000/api/user-packages/open \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_DE_USUARIO_A" \
  -d "{
    \"userId\": \"ID_DE_USUARIO_B\",  # ⚠️ Intenta abrir paquete de B
    \"paqueteId\": \"123\"
  }"

# ¿RESULTADO? Usuario A recibe el contenido del paquete de Usuario B ❌
```

### ✅ CÓMO ARREGLARLO:

```typescript
// En userPackages.routes.ts, cambiar la línea 67 de esto:
router.post('/open', async (req, res) => {
  const { userId, paqueteId } = req.body;

// A ESTO:
router.post('/open', async (req, res, next) => {
  const auth = require('../middlewares/auth');  // Tu middleware de JWT
  
  // PRIMERO: Verificar que está autenticado
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  
  // SEGUNDO: Obtener el userId del JWT (NO del request body)
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const actualUserId = decoded.userId;  // ✅ Del JWT, no del request
  
  const { paqueteId } = req.body;
  
  // TERCERO: Validar que el userId enviado COINCIDE con el del JWT
  if (req.body.userId && req.body.userId !== actualUserId) {
    return res.status(403).json({ error: 'Unauthorized - no puedes abrir paquetes ajenos' });
  }

  try {
    const user = await User.findById(actualUserId);  // ✅ Usa userId del JWT
    // ... resto del código igual
  }
});
```

---

## 🚨 PROBLEMA #2: Sin Cobro de VAL

### ¿QUÉ ES?
Endpoint `/agregar` NO resta VAL al usuario.

### ¿DÓNDE ESTÁ?
**Archivo:** `src/routes/userPackages.routes.ts`  
**Línea:** ~12 (en la ruta `POST /agregar`)

### ❌ CÓDIGO ACTUAL (VULNERABLE):
```typescript
router.post('/agregar', async (req, res) => {
  const { userId, paqueteId } = req.body;
  if (!userId || !paqueteId) return res.status(400).json({ error: 'Faltan datos.' });

  try {
    const nuevo = await UserPackage.create({ userId, paqueteId });  // ⚠️ Crea el paquete sin cobrar
    res.json({ ok: true, userPackage: nuevo });
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar paquete.' });
  }
});
```

**¿El ataque?**
```bash
# Usuario puede llamar a /agregar ilimitadamente
curl -X POST http://localhost:3000/api/user-packages/agregar \
  -d '{"userId": "123", "paqueteId": "456"}'

# ¿RESULTADO? Usuario recibe 1000 paquetes sin gastar nada ❌
```

### ✅ CÓMO ARREGLARLO:

```typescript
// CAMBIAR TODO EL ROUTER.POST('/AGREGAR')

router.post('/agregar', async (req, res) => {
  const { userId, paqueteId } = req.body;
  if (!userId || !paqueteId) return res.status(400).json({ error: 'Faltan datos.' });

  try {
    // PASO 1: Obtener el paquete para saber cuánto cuesta
    const pkg = await Package.findById(paqueteId);
    if (!pkg) return res.status(404).json({ error: 'Paquete no encontrado' });
    
    const precio = pkg.precio || 1000;  // Precio por defecto 1000 VAL
    
    // PASO 2: Obtener al usuario
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    
    // PASO 3: VALIDAR QUE TIENE VAL SUFICIENTE ✅
    if (user.val < precio) {
      return res.status(402).json({ 
        error: 'VAL insuficiente',
        tienes: user.val,
        necesitas: precio,
        falta: precio - user.val
      });
    }
    
    // PASO 4: RESTAR VAL ✅
    user.val -= precio;
    
    // PASO 5: Crear el UserPackage
    const nuevo = await UserPackage.create({ userId, paqueteId });
    
    // PASO 6: Guardar usuario con VAL actualizado
    await user.save();
    
    res.json({ 
      ok: true, 
      userPackage: nuevo,
      valRestante: user.val,
      valGastado: precio
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar paquete.' });
  }
});
```

---

## 🚨 PROBLEMA #3: Race Condition (Abrir paquete 2 veces simultáneamente)

### ¿QUÉ ES?
Si haces 2 requests al mismo tiempo para abrir el mismo paquete, el usuario recibe 2 veces el contenido.

### ¿DÓNDE ESTÁ?
**Archivo:** `src/routes/userPackages.routes.ts`  
**Línea:** ~67 (en la ruta `POST /open`)

### ❌ CÓDIGO ACTUAL (VULNERABLE):
```typescript
router.post('/open', async (req, res) => {
  // ...
  const up = await UserPackage.findOne({ userId });  // ⚠️ Busca el paquete
  if (!up) return res.status(404).json({ error: 'Usuario no tiene paquetes' });
  
  // Si aquí el proceso es lento y llega un SEGUNDO request...
  // El segundo request también encuentra el mismo UserPackage
  // Y ambos lo procesan ❌
  
  await up.deleteOne();  // Solo el primero debería llegar aquí
  // ... resto del código
});
```

**¿El ataque?**
```bash
# Request 1 Y Request 2 al EXACTAMENTE MISMO TIEMPO
curl -X POST http://localhost:3000/api/user-packages/open &
curl -X POST http://localhost:3000/api/user-packages/open &
wait

# ¿RESULTADO? Usuario recibe el contenido 2 veces ❌
```

### ✅ CÓMO ARREGLARLO:

```typescript
// Instalar mongoose-transaction al inicio del archivo:
// npm install mongoose

router.post('/open', async (req, res) => {
  const { userId, paqueteId } = req.body;
  if (!userId) return res.status(400).json({ error: 'Falta userId' });

  // ✅ CREAR UNA SESIÓN PARA TRANSACCIONES ATÓMICAS
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    let pkg;
    if (paqueteId) {
      pkg = await Package.findById(paqueteId).session(session);
    } else {
      // ✅ USAR SESSION AQUÍ TAMBIÉN
      const up = await UserPackage.findOne({ userId }).session(session);
      if (!up) {
        await session.abortTransaction();
        return res.status(404).json({ error: 'Usuario no tiene paquetes' });
      }
      pkg = await Package.findById(up.paqueteId).session(session);
      
      // ✅ ELIMINAR DENTRO DE LA TRANSACCIÓN (IMPORTANTE)
      await UserPackage.findByIdAndDelete(up._id, { session });
    }
    
    if (!pkg) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Paquete no encontrado' });
    }

    // ... resto del código de asignar items y personajes ...

    // ✅ AL FINAL: GUARDAR USUARIO Y CONFIRMAR TRANSACCIÓN
    await user.save({ session });
    await session.commitTransaction();

    res.json({ ok: true, assigned: [...] });
  } catch (err) {
    // ✅ SI ALGO FALLA: DESHACER TODO
    await session.abortTransaction();
    console.error('[USER-PACKAGE-OPEN] Error:', err);
    res.status(500).json({ error: 'Error al abrir paquete' });
  } finally {
    // ✅ SIEMPRE cerrar la sesión
    session.endSession();
  }
});
```

---

## 🚨 PROBLEMA #4: Sin Logs de Auditoría

### ¿QUÉ ES?
No hay registro de quién compró qué, cuándo, ni si funcionó.

### ¿DÓNDE ESTÁ?
**Archivo:** No existe (TODO: Crear)

### ❌ CÓDIGO ACTUAL:
```typescript
// NO HAY REGISTRO DE NADA ❌
```

### ✅ CÓMO ARREGLARLO:

**Paso 1: Crear el modelo** `src/models/PurchaseLog.ts`

```typescript
import { Schema, model, Document } from 'mongoose';

interface IPurchaseLog extends Document {
  userId: Schema.Types.ObjectId;
  paqueteId: Schema.Types.ObjectId;
  timestamp: Date;
  action: 'purchase' | 'open';
  valBefore: number;
  valAfter: number;
  status: 'success' | 'failed' | 'insufficient_val';
  error?: string;
  ip?: string;
}

const purchaseLogSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  paqueteId: { type: Schema.Types.ObjectId, ref: 'Package' },
  timestamp: { type: Date, default: Date.now },
  action: { type: String, enum: ['purchase', 'open'], required: true },
  valBefore: Number,
  valAfter: Number,
  status: { type: String, enum: ['success', 'failed', 'insufficient_val'] },
  error: String,
  ip: String
});

export default model<IPurchaseLog>('PurchaseLog', purchaseLogSchema);
```

**Paso 2: Usar el modelo en `/agregar`**

```typescript
import PurchaseLog from '../models/PurchaseLog';

router.post('/agregar', async (req, res) => {
  const { userId, paqueteId } = req.body;
  const clientIp = req.ip;  // Obtener IP
  
  if (!userId || !paqueteId) {
    // ✅ LOG: Error de validación
    await PurchaseLog.create({
      userId,
      paqueteId,
      action: 'purchase',
      status: 'failed',
      error: 'Missing data',
      ip: clientIp
    });
    return res.status(400).json({ error: 'Faltan datos.' });
  }

  try {
    const pkg = await Package.findById(paqueteId);
    if (!pkg) {
      await PurchaseLog.create({
        userId,
        paqueteId,
        action: 'purchase',
        status: 'failed',
        error: 'Package not found',
        ip: clientIp
      });
      return res.status(404).json({ error: 'Paquete no encontrado' });
    }
    
    const precio = pkg.precio || 1000;
    const user = await User.findById(userId);
    
    const valBefore = user.val;
    
    if (user.val < precio) {
      // ✅ LOG: VAL insuficiente
      await PurchaseLog.create({
        userId,
        paqueteId,
        action: 'purchase',
        status: 'insufficient_val',
        valBefore,
        valAfter: user.val,
        error: `Insufficient VAL: have ${user.val}, need ${precio}`,
        ip: clientIp
      });
      return res.status(402).json({ error: 'VAL insuficiente' });
    }
    
    user.val -= precio;
    const nuevo = await UserPackage.create({ userId, paqueteId });
    await user.save();
    
    // ✅ LOG: Compra exitosa
    await PurchaseLog.create({
      userId,
      paqueteId,
      action: 'purchase',
      status: 'success',
      valBefore,
      valAfter: user.val,
      ip: clientIp
    });
    
    res.json({ ok: true, userPackage: nuevo });
  } catch (error) {
    // ✅ LOG: Error en el servidor
    await PurchaseLog.create({
      userId,
      paqueteId,
      action: 'purchase',
      status: 'failed',
      error: error.message,
      ip: clientIp
    });
    res.status(500).json({ error: 'Error al agregar paquete.' });
  }
});
```

---

## 🚨 PROBLEMA #5: Sin Validación de Límites

### ¿QUÉ ES?
Usuario puede tener más de 50 personajes o 200+ items.

### ¿DÓNDE ESTÁ?
**Archivo:** `src/routes/userPackages.routes.ts`  
**Línea:** ~67 (en `POST /open`)

### ❌ CÓDIGO ACTUAL:
```typescript
// NO VALIDA LÍMITES
while (assigned.length < toAssign) {
  // ... agrega personajes sin límite
  user.personajes.push(...);
}
// ¿Resultado? Usuario puede tener 100+ personajes ❌
```

### ✅ CÓMO ARREGLARLO:

```typescript
const MAX_PERSONAJES = 50;
const MAX_ITEMS = 200;

router.post('/open', async (req, res) => {
  // ...
  const user = await User.findById(userId);
  
  // ✅ VALIDAR LÍMITE ANTES DE ABRIR
  const toAssign = pkg.personajes || 1;
  if (user.personajes.length + toAssign > MAX_PERSONAJES) {
    return res.status(409).json({
      error: 'Limit exceeded',
      current: user.personajes.length,
      max: MAX_PERSONAJES,
      trying_to_add: toAssign
    });
  }
  
  // ✅ VALIDAR ITEMS TAMBIÉN
  const itemsToAdd = (pkg.items_reward || []).length;
  if (user.inventarioEquipamiento.length + itemsToAdd > MAX_ITEMS) {
    return res.status(409).json({
      error: 'Item limit exceeded',
      current: user.inventarioEquipamiento.length,
      max: MAX_ITEMS,
      trying_to_add: itemsToAdd
    });
  }
  
  // ... ahora sí, proceder con normalidad
});
```

---

## 🚨 PROBLEMA #6: Sin Manejo de Errores en Loops

### ¿QUÉ ES?
El loop de asignación de personajes puede entrar en loop infinito.

### ¿DÓNDE ESTÁ?
**Archivo:** `src/routes/userPackages.routes.ts`  
**Línea:** ~100 (en el while loop de `POST /open`)

### ❌ CÓDIGO ACTUAL:
```typescript
while (assigned.length < toAssign) {
  const base = await chooseRandomBaseForCategory(chosenCat);
  if (base) {
    user.personajes.push({...});
    assigned.push(base.id);
  } else {
    // ⚠️ Si no hay base pero el while sigue... ¡LOOP INFINITO!
    break;  // Al menos esto detiene el loop
  }
}
```

### ✅ CÓMO ARREGLARLO:

```typescript
const MAX_ATTEMPTS = 100;  // ✅ Máximo de intentos
let attempts = 0;

while (assigned.length < toAssign && attempts < MAX_ATTEMPTS) {
  attempts++;  // ✅ Contar intentos
  
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
    user.personajes.push({...});
    assigned.push(base.id);
  }
}

// ✅ Si no conseguimos todos los personajes, al menos no es loop infinito
if (assigned.length < toAssign) {
  console.warn(`Solo se asignaron ${assigned.length} de ${toAssign} personajes (MAX_ATTEMPTS alcanzado)`);
}
```

---

## ✅ CHECKLIST DE ARREGLOS

```
PROBLEMA #1: Sin Validación de Autorización
[ ] Cambiar POST /open para usar req.user._id del JWT
[ ] Validar que userId coincide con JWT

PROBLEMA #2: Sin Cobro de VAL
[ ] Agregar validación de balance en POST /agregar
[ ] Restar VAL del usuario al comprar
[ ] Retornar error 402 si VAL insuficiente

PROBLEMA #3: Race Condition
[ ] Importar mongoose.startSession
[ ] Usar sessions y transacciones en POST /open
[ ] Agregar abortTransaction en caso de error

PROBLEMA #4: Sin Logs
[ ] Crear modelo PurchaseLog
[ ] Agregar logs en POST /agregar
[ ] Agregar logs en POST /open

PROBLEMA #5: Sin Límites
[ ] Validar personajes.length < 50 antes de abrir
[ ] Validar items.length < 200 antes de abrir

PROBLEMA #6: Loops infinitos
[ ] Agregar MAX_ATTEMPTS en loops
[ ] Contar intentos en while loops
```

---

## 🚀 ORDEN DE IMPLEMENTACIÓN

**HOY (30 minutos):**
1. Problema #1 (Autorización)
2. Problema #2 (Cobro VAL)
3. Problema #5 (Límites)

**HOY/MAÑANA (1 hora):**
4. Problema #3 (Race Conditions - transacciones)
5. Problema #4 (Logs)
6. Problema #6 (Loops)

---

## 🧪 CÓMO VERIFICAR QUE ESTÁ ARREGLADO

```bash
# Ejecutar los tests de seguridad
npm run test -- tests/security/packages.security.test.ts

# Si ves algo como esto = ✅ CORRECTO:
# ✅ PASS  Validación de Balance (3/3)
# ✅ PASS  Race Conditions (2/2)
# ✅ PASS  Prevención de Duplicación (4/4)
# ✅ PASS  Protección contra Manipulación (3/3)
# ✅ PASS  Auditoría y Logs (2/2)
# ✅ PASS  Límites y Validaciones (2/2)
```

---

**¿Entendido? Ahora empezamos a arreglar todo. ¿Por dónde empezamos?**
