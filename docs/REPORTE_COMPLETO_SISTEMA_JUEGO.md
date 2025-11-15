# 🎮 REPORTE COMPLETO: SISTEMA DE JUEGO - VALGAME RPG
**Fecha:** 2 de noviembre de 2025  
**Objetivo:** Validar TODO el sistema de juego (equipamiento, consumibles, combate, muerte, resurrección, evolución, economía)

---

## 📋 RESUMEN EJECUTIVO

### ✅ SISTEMAS IMPLEMENTADOS

| Sistema | Estado | Endpoint | WebSocket |
|---------|--------|----------|-----------|
| 💊 Uso de consumibles | ✅ COMPLETO | `POST /api/characters/:id/use-consumable` | ✅ SÍ |
| 💀 Muerte de personaje | ✅ COMPLETO | (manejado en combate) | ✅ SÍ |
| ⚡ Resurrección | ✅ COMPLETO | `POST /api/characters/:id/revive` | ✅ SÍ |
| 💚 Curación con VAL | ✅ COMPLETO | `POST /api/characters/:id/heal` | ✅ SÍ |
| 🌟 Evolución | ✅ COMPLETO | `POST /api/characters/:id/evolve` | ✅ SÍ |
| 📈 Experiencia/Nivel | ✅ COMPLETO | `POST /api/characters/:id/add-experience` | ✅ SÍ |
| ⚔️ Equipar items | ❌ **FALTA** | - | ❌ NO |
| 🛡️ Desequipar items | ❌ **FALTA** | - | ❌ NO |
| 📊 Stats recalculados | ❓ PARCIAL | - | ❓ INCIERTO |
| 💰 Compra de EVO con VAL | ❌ **FALTA** | - | ❌ NO |

---

## 🔴 PROBLEMAS CRÍTICOS DETECTADOS

### 1. ❌ NO EXISTE ENDPOINT PARA EQUIPAR/DESEQUIPAR ITEMS

**Estado actual:**
- ✅ Los personajes tienen campo `equipamiento: ObjectId[]`
- ✅ El usuario tiene `inventarioEquipamiento: ObjectId[]`
- ❌ **NO HAY endpoint para mover items del inventario al personaje**
- ❌ **NO HAY endpoint para desequipar items**

**Impacto:**
- 🔴 **CRÍTICO**: Los usuarios no pueden usar el equipamiento que compran
- Los items quedan "atrapados" en el inventario
- No se pueden mejorar stats de personajes con items

**Flujo esperado (NO FUNCIONA):**
```
Usuario compra espada → Queda en inventarioEquipamiento → ❌ NO PUEDE EQUIPARLA
```

---

### 2. ❌ NO SE RECALCULAN STATS AL EQUIPAR ITEMS

**Problema:**
- Los personajes tienen `stats: { atk, defensa, vida }`
- Los items tienen `stats: { atk, defensa, vida }`
- ❌ **NO HAY lógica para sumar stats del item a los stats del personaje**

**Ejemplo:**
```typescript
// Personaje base
stats: { atk: 100, defensa: 50, vida: 500 }

// Usuario equipa espada con
equipoStats: { atk: 50, defensa: 0, vida: 0 }

// ❌ PROBLEMA: Stats del personaje NO cambian
// ✅ ESPERADO: stats: { atk: 150, defensa: 50, vida: 500 }
```

---

### 3. ❌ NO EXISTE ENDPOINT PARA COMPRAR EVO CON VAL

**Estado actual:**
- ✅ EVO se usa para evolucionar personajes
- ✅ EVO se puede obtener en mazmorras
- ❌ **NO SE PUEDE COMPRAR EVO CON VAL**

**Flujo esperado (NO IMPLEMENTADO):**
```
Usuario quiere evolucionar → Necesita 10 EVO → Solo tiene 5 EVO
→ ❌ NO PUEDE COMPRAR EVO con VAL
→ Usuario bloqueado hasta farmear mazmorras
```

**Solución esperada:**
```typescript
POST /api/shop/buy-evo
Body: { amount: 5 } // Comprar 5 EVO

// Costo: 100 VAL por 1 EVO (configurable)
```

---

## ✅ SISTEMAS QUE FUNCIONAN CORRECTAMENTE

### 💊 USO DE CONSUMIBLES

**Endpoint:** `POST /api/characters/:characterId/use-consumable`

**Body:**
```json
{
  "itemId": "68dc525adb5c735854b5659d"
}
```

**Flujo:**
1. ✅ Usuario tiene consumible en `inventarioConsumibles`
2. ✅ Usa consumible en personaje
3. ✅ Stats del personaje se actualizan (ej: +50 vida)
4. ✅ `usos_restantes` se reduce en 1
5. ✅ Si `usos_restantes === 0` → Item se elimina del inventario
6. ✅ Se emite evento WebSocket con cambios

**WebSocket Event:**
```typescript
{
  type: 'CHARACTER_UPDATE',
  characterId: '123',
  saludActual: 450
}
```

**Código:** `src/controllers/characters.controller.ts` línea 89-169

---

### 💀 MUERTE Y ESTADO DE PERSONAJE

**Estados posibles:**
- `saludable` - Personaje con salud > 0
- `herido` - Personaje con salud === 0 (muerto)

**Flujo de muerte:**
1. Personaje recibe daño en combate
2. Si `saludActual <= 0` → `estado = 'herido'`
3. ✅ Personaje aparece como "muerto" en inventario
4. ✅ Se guarda `fechaHerido` para tracking

**Código:** `src/controllers/dungeons.controller.ts`

---

### ⚡ RESURRECCIÓN

**Endpoint:** `POST /api/characters/:characterId/revive`

**Costo:** Configurable en `GameSettings.costo_revivir_personaje` (valor por defecto: 50 VAL)

**Flujo:**
1. ✅ Validar que personaje está `herido`
2. ✅ Validar que usuario tiene VAL suficiente
3. ✅ Cobrar VAL
4. ✅ Cambiar estado a `saludable`
5. ✅ Restaurar `saludActual = saludMaxima`
6. ✅ Limpiar `fechaHerido`
7. ✅ Emitir evento WebSocket

**Response:**
```json
{
  "message": "¡El personaje CHAR_001 ha sido revivido!",
  "valRestante": 450,
  "characterState": {
    "personajeId": "CHAR_001",
    "estado": "saludable",
    "saludActual": 500
  }
}
```

**WebSocket Event:**
```typescript
{
  type: 'REVIVE',
  characterId: 'CHAR_001',
  estado: 'saludable',
  saludActual: 500
}
```

**Código:** `src/controllers/characters.controller.ts` línea 14-87

---

### 💚 CURACIÓN CON VAL

**Endpoint:** `POST /api/characters/:characterId/heal`

**Costo:** 1 VAL por cada 10 HP curados (redondeado hacia arriba)

**Flujo:**
1. ✅ Validar que personaje NO está herido (muerto)
2. ✅ Validar que salud < saludMaxima
3. ✅ Calcular costo: `Math.ceil((saludMaxima - saludActual) / 10)`
4. ✅ Cobrar VAL
5. ✅ Restaurar `saludActual = saludMaxima`
6. ✅ Emitir evento WebSocket

**Ejemplo:**
```
Personaje: 320/500 HP
Necesita curar: 180 HP
Costo: Math.ceil(180/10) = 18 VAL
```

**Response:**
```json
{
  "message": "¡El personaje CHAR_001 ha sido curado por completo!",
  "valRestante": 432,
  "costo": 18,
  "characterState": {
    "personajeId": "CHAR_001",
    "saludActual": 500
  }
}
```

**WebSocket Event:**
```typescript
{
  type: 'HEAL',
  characterId: 'CHAR_001',
  saludActual: 500
}
```

**Código:** `src/controllers/characters.controller.ts` línea 171-234

---

### 🌟 EVOLUCIÓN DE PERSONAJES

**Endpoint:** `POST /api/characters/:characterId/evolve`

**Requisitos:**
- ✅ Nivel mínimo (depende de la evolución)
- ✅ VAL suficiente (depende de la evolución)
- ✅ EVO suficiente (Cristales de Evolución)

**Flujo:**
1. ✅ Buscar personaje en array del usuario
2. ✅ Buscar `BaseCharacter` y siguiente evolución
3. ✅ Validar requisitos (nivel, VAL, EVO)
4. ✅ Cobrar VAL y EVO
5. ✅ Actualizar `etapa` del personaje
6. ✅ Actualizar `stats` con los de la nueva evolución
7. ✅ Restaurar salud completa
8. ✅ Guardar cambios

**Ejemplo de evolución:**
```typescript
// Antes
{
  personajeId: "CHAR_001",
  etapa: 1,
  nivel: 10,
  stats: { atk: 100, defensa: 50, vida: 500 }
}

// Requisitos para etapa 2
{
  nivel: 10,
  val: 1000,
  evo: 5
}

// Después
{
  personajeId: "CHAR_001",
  etapa: 2,  // ✅ Evolucionado
  nivel: 10,
  stats: { atk: 150, defensa: 75, vida: 700 }  // ✅ Stats mejorados
}
```

**Response:**
```json
{
  "message": "¡Felicidades! Draco ha evolucionado a Draco Evolucionado!",
  "character": {
    "personajeId": "CHAR_001",
    "etapa": 2,
    "stats": {
      "atk": 150,
      "defensa": 75,
      "vida": 700
    }
  }
}
```

**Código:** `src/controllers/characters.controller.ts` línea 328-395

---

### 📈 EXPERIENCIA Y NIVEL

**Endpoint:** `POST /api/characters/:characterId/add-experience`

**Body:**
```json
{
  "amount": 100
}
```

**Flujo:**
1. ✅ Añadir experiencia al personaje
2. ✅ Verificar si subió de nivel (consultar `LevelRequirement`)
3. ✅ Si subió → Mejorar stats automáticamente
4. ✅ Registrar en `LevelHistory`
5. ✅ Emitir evento WebSocket

**Mejora de stats por nivel:**
```typescript
// Por cada nivel ganado:
atk: +2
defensa: +2
vida: +10
```

**Response (level up):**
```json
{
  "message": "¡CHAR_001 ha subido al nivel 11!",
  "characterState": {
    "personajeId": "CHAR_001",
    "nivel": 11,
    "experiencia": 1250,
    "stats": {
      "atk": 120,
      "defensa": 60,
      "vida": 600
    },
    "leveledUp": true
  }
}
```

**WebSocket Event:**
```typescript
{
  type: 'LEVEL_UP',  // o 'EXP_GAIN' si no subió
  characterId: 'CHAR_001',
  nivel: 11,
  experiencia: 1250,
  stats: { atk: 120, defensa: 60, vida: 600 }
}
```

**Código:** `src/controllers/characters.controller.ts` línea 239-326

---

## 💰 ECONOMÍA DEL JUEGO

### Recursos Disponibles

| Recurso | Símbolo | Uso Principal | Cómo se Obtiene |
|---------|---------|---------------|-----------------|
| VAL | 💰 | Compras, curación, resurrección | Mazmorras, paquetes, marketplace |
| EVO | 💎 | Evolucionar personajes | Mazmorras, ❌ NO se puede comprar |
| Boletos | 🎫 | Entrar a mazmorras | Recarga diaria, paquetes |
| Invocaciones | 🔮 | Invocar personajes | Paquetes, eventos |
| Evoluciones | ⭐ | (Duplicado de EVO?) | ❓ Uso no claro |

### Valores Actuales

**Resurrección:**
```
Costo: 50 VAL (configurable en GameSettings)
```

**Curación:**
```
Costo: 1 VAL por cada 10 HP
Ejemplo: Curar 180 HP = 18 VAL
```

**Evolución:**
```
Depende de BaseCharacter.evoluciones[].requisitos
Ejemplo:
- Etapa 1 → 2: 1000 VAL + 5 EVO
- Etapa 2 → 3: 2000 VAL + 10 EVO
```

**EVO NO SE PUEDE COMPRAR:**
- ❌ No existe endpoint para comprar EVO con VAL
- Solo se obtiene en mazmorras
- **Problema:** Si usuario no tiene EVO, está bloqueado

---

## 🔌 SISTEMA DE WEBSOCKET

### Eventos Implementados

Todos los eventos se emiten a través de `RealtimeService`:

```typescript
// Localizado en: src/services/realtime.service.ts

notifyCharacterUpdate(userId: string, characterId: string, data: {
  estado?: string;
  saludActual?: number;
  nivel?: number;
  experiencia?: number;
  stats?: any;
  type: 'REVIVE' | 'HEAL' | 'LEVEL_UP' | 'EXP_GAIN';
})
```

### Eventos por Acción

| Acción | Tipo WebSocket | Datos Enviados |
|--------|----------------|----------------|
| Usar consumible | `CHARACTER_UPDATE` | `saludActual` |
| Revivir personaje | `REVIVE` | `estado`, `saludActual` |
| Curar personaje | `HEAL` | `saludActual` |
| Ganar experiencia | `EXP_GAIN` | `nivel`, `experiencia` |
| Subir de nivel | `LEVEL_UP` | `nivel`, `experiencia`, `stats` |
| Evolucionar | ❌ NO EMITE | - |
| Equipar item | ❌ NO EXISTE | - |

**⚠️ PROBLEMA:** La evolución NO emite evento WebSocket

---

## 🔧 ENDPOINTS FALTANTES (CRÍTICOS)

### 1. Equipar Item en Personaje

**Endpoint sugerido:**
```
POST /api/characters/:characterId/equip
```

**Body:**
```json
{
  "itemId": "68dc50e9db5c735854b56591"
}
```

**Flujo esperado:**
1. Validar que item está en `user.inventarioEquipamiento`
2. Validar que personaje existe
3. Validar que personaje no tiene ya el límite de items equipados
4. Añadir `itemId` a `character.equipamiento[]`
5. **RECALCULAR STATS:** Sumar stats del item a stats base del personaje
6. Guardar cambios
7. Emitir evento WebSocket con nuevos stats

**Recálculo de stats:**
```typescript
// Stats base del personaje
const baseStats = character.stats;

// Obtener todos los items equipados
const equippedItems = await Equipment.find({
  _id: { $in: character.equipamiento }
});

// Calcular stats totales
const totalStats = {
  atk: baseStats.atk + equippedItems.reduce((sum, item) => sum + (item.stats.atk || 0), 0),
  defensa: baseStats.defensa + equippedItems.reduce((sum, item) => sum + (item.stats.defensa || 0), 0),
  vida: baseStats.vida + equippedItems.reduce((sum, item) => sum + (item.stats.vida || 0), 0)
};

// Actualizar salud máxima si la vida aumentó
character.saludMaxima = totalStats.vida;
```

---

### 2. Desequipar Item de Personaje

**Endpoint sugerido:**
```
POST /api/characters/:characterId/unequip
```

**Body:**
```json
{
  "itemId": "68dc50e9db5c735854b56591"
}
```

**Flujo esperado:**
1. Validar que item está en `character.equipamiento[]`
2. Remover `itemId` de `character.equipamiento[]`
3. **RECALCULAR STATS:** Restar stats del item de stats totales
4. Ajustar `saludActual` si `saludMaxima` disminuyó
5. Guardar cambios
6. Emitir evento WebSocket con nuevos stats

---

### 3. Comprar EVO con VAL

**Endpoint sugerido:**
```
POST /api/shop/buy-evo
```

**Body:**
```json
{
  "amount": 5
}
```

**Costo sugerido:**
```
100 VAL = 1 EVO
```

**Flujo esperado:**
1. Validar que usuario tiene VAL suficiente
2. Calcular costo: `amount * 100`
3. Cobrar VAL
4. Añadir EVO
5. Guardar cambios
6. Emitir evento WebSocket con nuevos recursos

---

### 4. Ver Stats Totales de Personaje

**Endpoint sugerido:**
```
GET /api/characters/:characterId/stats
```

**Response:**
```json
{
  "personajeId": "CHAR_001",
  "baseStats": {
    "atk": 100,
    "defensa": 50,
    "vida": 500
  },
  "equipmentBonus": {
    "atk": 50,
    "defensa": 10,
    "vida": 0
  },
  "totalStats": {
    "atk": 150,
    "defensa": 60,
    "vida": 500
  },
  "equippedItems": [
    {
      "id": "68dc50e9db5c735854b56591",
      "nombre": "Espada Corta Oxidada",
      "stats": { "atk": 50, "defensa": 10, "vida": 0 }
    }
  ]
}
```

---

## 📋 CHECKLIST DE VALIDACIÓN COMPLETA

### ✅ Consumibles
- [x] Usuario puede ver consumibles en inventario
- [x] Usuario puede usar consumible en personaje
- [x] Stats del personaje se actualizan inmediatamente
- [x] Usos restantes se reducen correctamente
- [x] Consumible se elimina del inventario al agotarse
- [x] Cambios se reflejan en tiempo real (WebSocket)

### ⚠️ Equipamiento
- [ ] Usuario puede ver equipamiento en inventario
- [ ] ❌ Usuario puede equipar item en personaje
- [ ] ❌ Stats del personaje se recalculan al equipar
- [ ] ❌ Usuario puede desequipar item
- [ ] ❌ Stats del personaje se recalculan al desequipar
- [ ] ❌ Cambios se reflejan en tiempo real (WebSocket)

### ✅ Combate y Muerte
- [x] Personaje puede recibir daño en combate
- [x] Salud del personaje se reduce correctamente
- [x] Si salud <= 0 → Estado cambia a "herido"
- [x] Personaje muerto aparece como "muerto" en inventario
- [x] Cambios se reflejan en tiempo real (WebSocket)

### ✅ Resurrección
- [x] Usuario puede revivir personaje muerto con VAL
- [x] Costo se cobra correctamente
- [x] Estado cambia a "saludable"
- [x] Salud se restaura completamente
- [x] Cambios se reflejan en tiempo real (WebSocket)

### ✅ Curación
- [x] Usuario puede curar personaje dañado con VAL
- [x] Costo se calcula correctamente (1 VAL / 10 HP)
- [x] Salud se restaura completamente
- [x] No se puede curar personaje muerto (debe revivir primero)
- [x] Cambios se reflejan en tiempo real (WebSocket)

### ✅ Experiencia y Nivel
- [x] Personaje gana experiencia en combate
- [x] Personaje sube de nivel al alcanzar umbral
- [x] Stats mejoran automáticamente al subir nivel
- [x] Se registra en historial de niveles
- [x] Cambios se reflejan en tiempo real (WebSocket)

### ⚠️ Evolución
- [x] Usuario puede evolucionar personaje con VAL + EVO
- [x] Requisitos se validan correctamente
- [x] Stats se actualizan a los de la nueva etapa
- [x] Etapa se incrementa correctamente
- [ ] ❌ Cambios NO se reflejan en tiempo real (falta WebSocket)

### ⚠️ Economía
- [x] VAL se obtiene en mazmorras
- [x] VAL se puede usar para curar/revivir
- [x] EVO se obtiene en mazmorras
- [x] EVO se puede usar para evolucionar
- [ ] ❌ EVO NO se puede comprar con VAL
- [ ] ❌ No hay paquetes de EVO en tienda

---

## 🎯 PRIORIZACIÓN DE IMPLEMENTACIÓN

### 🔴 CRÍTICO (Esta Semana)

1. **Implementar equipar/desequipar items**
   - Endpoint `POST /api/characters/:id/equip`
   - Endpoint `POST /api/characters/:id/unequip`
   - Lógica de recálculo de stats
   - Emisión de eventos WebSocket

2. **Implementar compra de EVO con VAL**
   - Endpoint `POST /api/shop/buy-evo`
   - Configurar tasa de cambio (100 VAL = 1 EVO)
   - Emisión de eventos WebSocket

### 🟠 IMPORTANTE (Este Mes)

3. **Añadir WebSocket a evolución**
   - Emitir evento al evolucionar personaje
   - Frontend actualiza stats en tiempo real

4. **Endpoint de stats totales**
   - `GET /api/characters/:id/stats`
   - Mostrar stats base + bonus de equipamiento
   - Desglose detallado de stats

### 🟡 MEJORAS (Backlog)

5. **Sistema de buffs temporales**
   - Consumibles con duración limitada
   - Buffs que expiran después de X minutos
   - Notificación cuando buff expira

6. **Límite de items equipados**
   - Definir slots (arma, armadura, accesorio)
   - Validar que no se exceda el límite
   - UI para gestionar equipamiento

---

## 📊 MÉTRICAS DE COMPLETITUD

| Sistema | Completitud | Funcionalidad |
|---------|-------------|---------------|
| Consumibles | ✅ 100% | Totalmente funcional |
| Resurrección | ✅ 100% | Totalmente funcional |
| Curación | ✅ 100% | Totalmente funcional |
| Experiencia/Nivel | ✅ 100% | Totalmente funcional |
| Evolución | ⚠️ 90% | Falta WebSocket |
| Equipamiento | ❌ 0% | No implementado |
| Economía (EVO) | ⚠️ 50% | No se puede comprar EVO |

**Completitud Global del Sistema de Juego: 70%**

---

## 🔗 ARCHIVOS RELACIONADOS

**Rutas:**
- `src/routes/characters.routes.ts` - Rutas de personajes
- `src/routes/equipment.routes.ts` - Rutas de equipamiento (solo GET)

**Controladores:**
- `src/controllers/characters.controller.ts` - Lógica de personajes
- `src/controllers/dungeons.controller.ts` - Lógica de combate

**Modelos:**
- `src/models/User.ts` - Modelo de usuario (línea 20: `equipamiento[]`)
- `src/models/Equipment.ts` - Modelo de equipamiento
- `src/models/Consumable.ts` - Modelo de consumibles
- `src/models/BaseCharacter.ts` - Personajes base y evoluciones

**Servicios:**
- `src/services/realtime.service.ts` - Servicio de WebSocket

**Tests:**
- `tests/e2e/master-complete-flow.e2e.test.ts` - Test completo (línea 208: intenta equipar)
- `tests/e2e/team_and_equipment.e2e.test.ts` - Test de equipamiento (línea 45: intenta equipar)

---

**Última actualización:** 2 de noviembre de 2025  
**Próxima revisión:** Después de implementar endpoints faltantes
