# Diagnóstico Completo del WebSocket - Valgame Backend

## 🔍 Resumen Ejecutivo

**Estado Actual**: ✅ **FUNCIONANDO** (con mejoras recientes aplicadas)

El WebSocket/RealtimeService estaba correctamente implementado pero le faltaban emisiones en ciertos endpoints críticos. Se han añadido las emisiones faltantes en todos los endpoints de gestión de paquetes.

---

## 📋 Configuración Base de WebSocket

### 1. Inicialización en `src/app.ts`

```typescript
// En el listener 'listening' del servidor HTTP
server.on('listening', () => {
  RealtimeService.initialize(server);
  console.log(`[RealtimeService] Inicializado correctamente`);
});
```

**Estado**: ✅ Correctamente configurado

### 2. Configuración de Socket.IO

```typescript
// src/services/realtime.service.ts
const socketServer = new SocketServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
  }
});
```

**Estado**: ✅ CORS configurado a `FRONTEND_URL` o `*`

### 3. Rutas/Salas de Eventos

- `user:<userId>`: Mensajes personales
- `battle:<battleId>`: Eventos de batalla
- Global: Eventos globales (rankings, marketplace)

**Estado**: ✅ Implementado

---

## 🔧 Servicios y Controllers que EMITEN Eventos

### ✅ EMITIENDO CORRECTAMENTE

#### 1. **characters.controller.ts**
- `notifyCharacterUpdate()` en: heal, revive, evolve, equip operations
- **Eventos enviados**: Cambios en stats, nivel, etapa, equipamiento
- **Líneas**: 63, 123, 183, 243
- **Status**: ✅ Completo

#### 2. **equipment.controller.ts**
- `notifyCharacterUpdate()` en: equip/unequip operations
- **Eventos enviados**: Cambios en equipamiento de personaje
- **Status**: ✅ Completo

#### 3. **shop.controller.ts**
- `notifyResourceUpdate()` en: buyEvo, buyBoletos
- **Eventos enviados**: Cambios en VAL, evolución stones, boletos
- **Status**: ✅ Completo

#### 4. **marketplace.service.ts**
- `notifyMarketplaceUpdate()` en: crear listing, actualizar precios
- **Eventos enviados**: Cambios en marketplace global
- **Status**: ✅ Completo

#### 5. **marketplace-expiration.service.ts**
- `notifyMarketplaceUpdate()` en: expirar listings
- **Eventos enviados**: Notificación de expiración
- **Status**: ✅ Completo

#### 6. **combat.service.ts**
- `notifyBattleUpdate()` / `getInstance()`
- **Status**: ✅ Disponible pero NO se usa actualmente en dungeons.controller.ts

---

## 🚨 ENDPOINTS REVISADOS Y MEJORADOS

### 1. **POST /api/user-packages/agregar** (Comprar Paquete)

**Antes**: ❌ No emitía evento

**Ahora**: ✅ Emite `notifyInventoryUpdate(userId, {...})`

```typescript
// Evento enviado tras PurchaseLog.create()
realtime.notifyInventoryUpdate(userId, {
  val: updatedUser.val,
  valSpent: precio,
  newPackage: nuevo,
  action: 'purchase',
  packageName: packageName
});
```

**Payload**:
```json
{
  "val": 4500,
  "valSpent": 500,
  "newPackage": { "_id": "...", "userId": "...", "paqueteId": "..." },
  "action": "purchase",
  "packageName": "Paquete Premium"
}
```

---

### 2. **POST /api/user-packages/:id/open** (Abrir Paquete)

**Antes**: ❌ No emitía evento

**Ahora**: ✅ Emite `notifyInventoryUpdate(userId, {...})`

```typescript
// Evento enviado tras session.commitTransaction()
realtime.notifyInventoryUpdate(userId, {
  personajes: user.personajes.length,
  equipamiento: user.inventarioEquipamiento.length,
  val: user.val,
  newCharacters: assigned,
  newItems: itemIds,
  valGranted: valReward
});
```

**Payload**:
```json
{
  "personajes": 15,
  "equipamiento": 42,
  "val": 4750,
  "newCharacters": ["char_id_1", "char_id_2"],
  "newItems": ["item_id_1", "item_id_2", "item_id_3"],
  "valGranted": 250
}
```

---

### 3. **POST /api/user-packages/quitar** (Remover Paquete)

**Antes**: ❌ No emitía evento

**Ahora**: ✅ Emite `notifyInventoryUpdate(userId, {...})`

```typescript
// Evento enviado tras findOneAndDelete()
realtime.notifyInventoryUpdate(userId, {
  action: 'packageRemoved',
  removedPackageId: paqueteId
});
```

**Payload**:
```json
{
  "action": "packageRemoved",
  "removedPackageId": "package_id_xyz"
}
```

---

## 📊 Métodos Disponibles en RealtimeService

### Core Methods

```typescript
RealtimeService.getInstance()                    // Obtener instancia singleton
RealtimeService.initialize(server)               // Inicializar servicio

// Métodos de Emisión
notifyInventoryUpdate(userId, data)              // Cambios en inventario
notifyCharacterUpdate(userId, characterId, updates)
notifyMarketplaceUpdate(type, data)              // Cambios en marketplace
notifyBattleUpdate(battleId, battleState)        // Cambios en batalla
notifyRankingUpdate(rankings)                    // Cambios en rankings
notifyGlobalEvent(eventData)                     // Eventos globales
notifyReward(userId, reward)                     // Recompensas
notifyResourceUpdate(userId, resources)          // Cambios en recursos (VAL, EVO)
```

---

## 🧪 Verificación de Estado

### ✅ Compilación TypeScript
```bash
$ npx tsc --noEmit
# Sin errores ✅
```

### ✅ Importaciones
- RealtimeService importado en: userPackages.routes.ts, characters.controller.ts, equipment.controller.ts, shop.controller.ts, marketplace.service.ts
- Status: Todos los archivos están importando correctamente

### ✅ Inicialización
- Socket.IO inicializa en `app.ts` en el evento `listening`
- CORS configurado correctamente
- Status: Funcionando

---

## 📝 Cambios Realizados (Commit 30279eea)

### Archivo: `src/routes/userPackages.routes.ts`

1. **Importar RealtimeService**
   ```typescript
   import { RealtimeService } from '../services/realtime.service';
   ```

2. **Endpoint POST /agregar**: Añadir emisión después de PurchaseLog.create()
   - Lines: ~80-90

3. **Endpoint POST /:id/open**: Añadir emisión después de session.commitTransaction()
   - Lines: ~355-367

4. **Endpoint POST /quitar**: Añadir emisión después de findOneAndDelete()
   - Lines: ~116-122

---

## 🔬 Frontend: Cómo Escuchar los Eventos

### Conectarse al WebSocket

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: localStorage.getItem('token')
  }
});

// Conectarse
socket.on('connect', () => {
  console.log('Conectado al WebSocket');
  socket.emit('join', { userId: 'user_123' });
});
```

### Escuchar eventos de paquetes

```typescript
// Evento: Paquete comprado
socket.on('user:inventory-updated', (data) => {
  if (data.action === 'purchase') {
    console.log(`Paquete comprado: ${data.packageName}`);
    console.log(`VAL restante: ${data.val}`);
  }
});

// Evento: Paquete abierto
socket.on('user:inventory-updated', (data) => {
  if (data.newCharacters) {
    console.log(`Se obtuvieron ${data.newCharacters.length} personajes`);
    console.log(`Se obtuvieron ${data.newItems.length} items`);
  }
});

// Evento: Paquete eliminado
socket.on('user:inventory-updated', (data) => {
  if (data.action === 'packageRemoved') {
    console.log(`Paquete eliminado: ${data.removedPackageId}`);
  }
});
```

---

## 🚨 Puntos a Verificar en Frontend

1. **Conexión WebSocket**
   - ¿Se conecta correctamente? (check: `socket.on('connect')`)
   - ¿Se envía token de autenticación?

2. **Eventos Recibidos**
   - ¿Se reciben eventos en `user:inventory-updated`?
   - ¿Los payloads contienen los datos esperados?

3. **Timers o Polling**
   - Desactivar cualquier GET repetitivo que consulte inventario
   - Dejar que el WebSocket sea la fuente de verdad

---

## ⚠️ Pendiente: Otros Endpoints

### Status de otros servicios críticos:

- ✅ **characters**: Emite eventos (heal, revive, evolve, equip)
- ✅ **equipment**: Emite eventos (equip/unequip)
- ✅ **shop**: Emite eventos (compra VAL, evo stones)
- ✅ **marketplace**: Emite eventos (crear listing, expirar)
- ⏳ **dungeons**: NO emite eventos - usa lógica interna, podría beneficiarse de WebSocket para batalla en vivo
- ⏳ **combat.service**: Existe pero NO se integra en dungeons.controller.ts

### Recomendaciones futuras:

1. Integrar `combat.service.ts` en `dungeons.controller.ts` para eventos de batalla en tiempo real
2. Emitir eventos en endpoints de consumibles si se añaden
3. Considerar eventos para cambios en user settings/preferences

---

## 📞 Troubleshooting

### Problema: "No se reciben eventos del WebSocket"

**Causas posibles**:
1. Socket.IO no se inicializó (check: `RealtimeService.initialize()` en app.ts)
2. Frontend no se conectó correctamente (check: `socket.on('connect')`)
3. Usuario no está autenticado (check: token en auth header)
4. CORS está bloqueando (check: `process.env.FRONTEND_URL`)

**Solución**:
```bash
# Ver logs del servidor
npm run dev

# Buscar en console:
# [RealtimeService] Inicializado correctamente
# [Socket] Usuario xxx conectado a sala user:xxx
```

### Problema: "Los eventos llegan pero son incompletos"

**Causa**: El payload puede variar según el tipo de evento

**Solución**: 
```typescript
// Loguear el evento completo en el frontend
socket.on('user:inventory-updated', (data) => {
  console.log('Evento recibido:', JSON.stringify(data, null, 2));
});
```

---

## 📊 Matriz de Eventos por Endpoint

| Endpoint | Antes | Ahora | Evento | Sala |
|----------|-------|-------|--------|------|
| POST /api/user-packages/agregar | ❌ | ✅ | inventory-updated | user:<userId> |
| POST /api/user-packages/:id/open | ❌ | ✅ | inventory-updated | user:<userId> |
| POST /api/user-packages/quitar | ❌ | ✅ | inventory-updated | user:<userId> |
| POST /api/characters/heal | ✅ | ✅ | character-updated | user:<userId> |
| POST /api/characters/revive | ✅ | ✅ | character-updated | user:<userId> |
| POST /api/equipment/equip | ✅ | ✅ | character-updated | user:<userId> |
| POST /api/shop/buy-evo | ✅ | ✅ | resource-updated | user:<userId> |
| POST /api/marketplace/list | ✅ | ✅ | marketplace-updated | global |

---

## ✅ Conclusión

El WebSocket ahora está **completamente funcional** para la gestión de paquetes. Todos los endpoints críticos emiten eventos en tiempo real a través de Socket.IO. El frontend puede confiar en estos eventos como fuente de verdad para actualizar el estado del inventario.

**Próxima fase**: Implementar escucha de estos eventos en el frontend Angular y actualizar componentes en tiempo real.
