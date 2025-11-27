# 📊 ANÁLISIS: EQUIPAMIENTO EN RPG vs SURVIVAL

**Fecha**: 27 de Noviembre, 2025  
**Propósito**: Entender cómo funciona el equipamiento en ambos modos y su integración

---

## 🎮 CONTEXTO DE TUS REQUISITOS

### Tu Sistema
```
RPG:
  ├─ Equipo de 1-9 personajes (seleccionables)
  └─ Cada personaje tiene su propio equipamiento independiente

SURVIVAL:
  ├─ Solo entra 1 personaje (el principal/activo)
  └─ Necesita equipamiento para entrar
  
PREGUNTA CLAVE: ¿Cómo y dónde se selecciona/configura ese equipamiento para Survival?
```

---

## 🔍 ANÁLISIS ACTUAL DEL SISTEMA

### 1. MODELO DE DATOS: User.ts

#### Estructura de Personaje (en array `personajes`)
```javascript
{
  personajeId: string              // "Héroe Principal", "Mago", etc.
  nivel: number                    // 1-50
  rango: number                    // Tier de progresión
  etapa: number                    // 1-3 (base, evolución1, evolución2)
  stats: {
    ataque: number
    defensa: number
    velocidad: number
    salud: number
  }
  equipamiento: ObjectId[]         // ARRAY DE IDs DE ITEMS
  saludActual: number
  experiencia: number
  // ... más campos
}
```

#### Campo Global del Usuario
```javascript
personajeActivoId: string          // ID del personaje ACTUALMENTE SELECCIONADO
```

---

## 🎯 CÓMO FUNCIONA ACTUALMENTE

### En RPG - Sistema de Equipamiento

#### PASO 1: Seleccionar Personaje
```
Ruta: POST /api/users/characters/:characterId/set-active
Efecto: user.personajeActivoId = characterId
Resultado: El personaje se marca como "activo"
```

#### PASO 2: Equipar Items en el Personaje Activo
```
Ruta: POST /api/characters/:characterId/equip
Body: { itemId: "123abc" }
Lógica:
  ├─ Busca el personaje en user.personajes por characterId
  ├─ Valida que el item sea del tipo "Equipment"
  ├─ Agrega itemId al array personaje.equipamiento[]
  ├─ Calcula bonificaciones de stats
  ├─ Devuelve los stats actualizados
```

#### PASO 3: Ver Equipamiento
```
El array personaje.equipamiento[] contiene los ObjectIds de los items equipados
Cuando necesita renderizar:
  ├─ Frontend obtiene los IDs del equipamiento
  ├─ Hace otra petición para obtener detalles de cada item
  ├─ Renderiza nombre, imagen, bonificaciones, etc.
```

**IMPORTANTE**: El equipamiento está SEPARADO por personaje
- Personaje "Héroe" puede tener espada + armadura + botas
- Personaje "Mago" puede tener varita + túnica + botas diferentes
- Desequipar de "Héroe" NO afecta a "Mago"

---

## ⚔️ SURVIVAL - SISTEMA ACTUAL

### PASO 1: Entrada a Survival
```
Ruta: POST /api/survival/start
Body: {
  characterId: "123",              // Debe ser personajeActivoId
  equipmentIds: ["a","b","c","d"], // Array de 4 items
  consumableIds: ["x","y","z"]     // Array de 0-5 consumibles
}
```

### PASO 2: Validaciones en /start
```
1. ✅ Verifica que el usuario existe
2. ✅ Verifica que el personaje pertenece al usuario
3. ✅ Verifica que existen exactamente 4 items de equipamiento
4. ✅ Crea una SurvivalSession con:
   - Usuario + Personaje
   - Equipamiento mapeado a slots (head/body/hands/feet)
   - Consumibles con usos_restantes
   - Estado: "active"
```

### PASO 3: Estructura de Equipamiento en Survival
```
SurvivalSession.equipment = {
  head: {
    itemId: ObjectId,
    rareza: "común" | "raro" | "épico",
    bonusAtaque: number,
    bonusDefensa: number,
    bonusVelocidad: number
  },
  body: { ... },
  hands: { ... },
  feet: { ... }
}
```

**DIFERENCIA CRÍTICA CON RPG:**
- RPG: equipamiento = `[id1, id2, id3, ...]` (array plano de IDs)
- SURVIVAL: equipamiento = `{head: {...}, body: {...}}` (objeto estructurado por slots)

---

## ❓ PREGUNTA FUNDAMENTAL: ¿COMPARTEN EQUIPAMIENTO?

### OPCIÓN A: Equipamiento INDEPENDIENTE (Actual)
```
RPG Personaje:
  equipamiento: ["item_001", "item_002", "item_003"]
  
SURVIVAL Sesión:
  equipment: {
    head: {itemId: "item_001"},
    body: {itemId: "item_002"},
    ...
  }

Problema: El usuario debe ELEGIR 4 items cada vez que entra a Survival
Pantalla: "Selecciona 4 items para tu equipamiento en Survival"
```

### OPCIÓN B: Equipamiento COMPARTIDO (Posible implementar)
```
Cuando el usuario dice "quiero entrar a Survival":
  ├─ Toma el personajeActivoId
  ├─ Lee personaje.equipamiento[] (RPG)
  ├─ Valida que haya exactamente 4 items equipados
  ├─ Convierte formato RPG → SURVIVAL automáticamente
  ├─ Crea sesión sin pedir que seleccione items
  
Ventaja: Un solo equipamiento para ambos modos
Desventaja: Menos flexibilidad (si tienes 9 personajes, cada uno solo puede tener 4 items equipados)
```

---

## 📱 FLOW DE PANTALLAS - ANÁLISIS ACTUAL

### Flujo ACTUAL en el Código
```
┌─────────────────────────────────────────────────────┐
│ 1. SELECCIONAR PERSONAJE (RPG)                      │
│    POST /api/users/characters/:id/set-active        │
│    ↓ user.personajeActivoId = id                    │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 2. EQUIPAR ITEMS EN PERSONAJE (RPG)                 │
│    POST /api/characters/:id/equip                   │
│    Body: { itemId }                                 │
│    ↓ Agrega a personaje.equipamiento[]              │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ 3. INICIAR SURVIVAL                                 │
│    POST /api/survival/start                         │
│    Body: {                                          │
│      characterId,          ← personajeActivoId     │
│      equipmentIds: [...],  ← 4 items seleccionados │
│      consumableIds: [...]  ← 0-5 items             │
│    }                                                │
│    ↓ Crea SurvivalSession                           │
└─────────────────────────────────────────────────────┘
```

---

## 🎨 TU PREGUNTA: "¿En qué pantalla se elige equipamiento?"

### SITUACIÓN ACTUAL (Según el código)
```
El código NO especifica UNA pantalla definida para elegir equipamiento de Survival.
La lógica asume que:
  1. Frontend obtiene lista de items disponibles para el personaje
  2. Usuario selecciona 4 items (UI sin definir específicamente)
  3. Envía equipmentIds en el POST /start

Esto significa:
  ├─ Podría ser una pantalla SEPARADA de "Preparar Survival"
  ├─ O parte de la MISMA pantalla de "Entrar a Survival"
  └─ O combinar con pantalla de "Inventario"
```

---

## 🛠️ ANÁLISIS DETALLADO: ¿QUÉ FALTA DEFINIR?

### 1. ¿FLUJO DE SELECCIÓN?

**Opción 1: Equipamiento Predefinido (Recomendado)**
```
Usuario entra a Survival:
  1. Sistema toma personajeActivoId
  2. Lee equipamiento[] del personaje (ya tiene 4 items del RPG)
  3. Automáticamente los usa
  4. Si no tiene 4, muestra error: "Equipa 4 items en RPG primero"
  
VENTAJA: Simple, sin duplicación
DESVENTAJA: Menos flexibilidad (mismo equipo para RPG y Survival)
```

**Opción 2: Selector Flexible (Actual)**
```
Usuario entra a Survival:
  1. Pantalla de "Preparar Sesión de Survival"
  2. Selectores de equipamiento (4 slots):
     ├─ Casco: [seleccionar item]
     ├─ Armadura: [seleccionar item]
     ├─ Manos: [seleccionar item]
     └─ Pies: [seleccionar item]
  3. Selectores de consumibles (0-5):
     ├─ Consumible 1: [seleccionar]
     ├─ Consumible 2: [seleccionar]
     └─ ...
  4. Botón "INICIAR SURVIVAL"
  
VENTAJA: Flexibilidad total (diferente equipo cada sesión)
DESVENTAJA: UX más compleja
```

---

### 2. ¿ESTÁ COMPARTIDO CON RPG O INDEPENDIENTE?

**Estado Actual:**
- ❌ NO están compartidos automáticamente
- ❌ Survival requiere pasar `equipmentIds` explícitamente
- ✅ Pero comparten el mismo `personaje.equipamiento[]` de datos

**Lo que SUCEDE:**
```
User
├─ personajes[0]
│  ├─ personajeId: "Héroe"
│  ├─ equipamiento: ["item_1", "item_2", "item_3", "item_4"]
│  └─ [usado en RPG]
│
└─ [Para Survival, Frontend debe:]
   1. Leer ese array equipamiento[]
   2. Enviar esos IDs en POST /start
   3. Backend transforma a slots {head, body, hands, feet}
```

**CRÍTICO**: El equipamiento NO se "sincroniza" automáticamente
- Si desequipas en RPG → Survival no se actualiza
- Si "usas" equipo en Survival → RPG NO lo consume
- Son lecturas, no transacciones compartidas

---

### 3. ¿SE NECESITA UN ENDPOINT ESPECÍFICO PARA SURVIVAL?

**Respuesta: Probablemente NO, pero depende**

#### Opción A: Usar equipamiento actual del personaje
```
GET /api/users/characters/:characterId/equipment
Devuelve: Equipamiento actual del personaje
Uso: Frontend lo lee y lo pasa a /survival/start
```
✅ YA EXISTE (implícitamente en character.equipamiento[])

#### Opción B: Crear endpoint de "preparación" de Survival
```
POST /api/survival/prepare
Body: { characterId }
Respuesta: {
  character: {...},
  availableEquipment: [...],
  currentEquipped: [...],
  suggestedLoadout: [...]
}
```
❓ NO EXISTE, pero sería útil para UX

---

## 📊 CONCLUSIÓN: ESTADO ACTUAL vs NECESIDADES

### ✅ LO QUE YA EXISTE
1. Sistema de personajes con equipamiento
2. Endpoint `/api/survival/start` que acepta equipmentIds
3. Validación de 4 items de equipamiento
4. Estructura de slots (head/body/hands/feet) en SurvivalSession
5. El equipamiento del personaje activo puede reutilizarse

### ⚠️ LO QUE FALTA DEFINIR
1. **¿Flujo de UX?** ¿Pantalla separada o integrada?
2. **¿Compartido automático?** ¿O flexible/manual?
3. **¿Validación?** ¿Qué pasa si el personaje no tiene 4 items equipados?
4. **¿Endpoint de preparación?** ¿Se necesita uno para "pre-visualizar"?

### 🎯 RECOMENDACIÓN
```
RECOMENDADO: Opción 1 - Equipamiento Automático

Lógica:
  1. Usuario entra a Survival
  2. Sistema toma personajeActivoId
  3. Valida que tenga exactamente 4 items en equipamiento[]
  4. Convierte automáticamente a slots de Survival
  5. Crea sesión con esos items
  6. Si no tiene 4 items → Error: "Equipa 4 items en RPG"

Ventaja: Evita duplicación, simplicidad, UX fluida
Desventaja: Menos flexibilidad (pero es lo lógico)

Frontend Solo Necesita:
  POST /api/survival/start
  Body: { characterId } ← SOLO eso, items vienen del personaje
  
(O seguir con actual si quieres flexibilidad)
```

---

## 🔗 COMPARACIÓN: RPG vs SURVIVAL - Equipamiento

| Aspecto | RPG | SURVIVAL | Compartido? |
|---------|-----|---------|-----------|
| Estructura | Array plano `[id1,id2,...]` | Slots `{head:{},body:{}}` | ❌ No |
| Selección | Per-personaje independiente | Por sesión | ❌ No |
| Duración | Permanente hasta desequipar | Solo durante sesión | ❌ No |
| Datos | En personaje.equipamiento[] | En SurvivalSession.equipment | ⚠️ Referencia |
| Consumo | No se consume | Se usan usos_restantes | ❌ No |
| Validación | 0+ items | Exactamente 4 items | ✅ Rígido en Survival |

---

## 💡 RESPUESTA A TU PREGUNTA ESPECÍFICA

> "¿Cómo funciona el tema del equipamiento en Survival? ¿Se necesita un endpoint más para poder especificar algo relacionado que apunte directamente a entrar a esa modalidad?"

### Respuesta Técnica:

**NO se necesita endpoint adicional AHORA, pero:**

1. **Equipamiento está en**: `User.personajes[id].equipamiento[]`
2. **Se selecciona en**: Frontend (UI no especificada)
3. **Se envía a**: `POST /api/survival/start` con `equipmentIds: [4 items]`
4. **Se transforma en**: `SurvivalSession.equipment` con slots

**Decisión de Diseño Pendiente:**
```
¿Quieres que...?

A) Automático: Leer del equipo actual del personaje (Recomendado)
   → No necesitas UI adicional ni endpoint
   → Frontend: POST /api/survival/start { characterId }

B) Manual/Flexible: Elegir 4 items cada vez (Actual)
   → Necesitas UI de selección
   → Endpoint es suficiente, pero podrías agregar uno de "preview"
   → Frontend: POST /api/survival/start { characterId, equipmentIds: [...] }

C) Hibrido: UI de "pre-visualización" + validación
   → Podrías agregar: GET /api/survival/prepare { characterId }
   → Devuelve equipo recomendado + disponibles
```

**Mi Recomendación**: Ir con **Opción A** (automático)
- Evita confusión
- Usa datos ya existentes
- UX más fluida
- Reduce endpoints

