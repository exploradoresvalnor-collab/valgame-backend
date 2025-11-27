# 🔗 INTEGRACIÓN: RPG + SURVIVAL - GUÍA PARA FRONTEND

**Propósito**: Entender cómo conviven RPG y Survival sin conflictos  
**Fecha**: 27 de Noviembre, 2025  
**Para**: Desarrolladores Frontend

---

## 📊 VISIÓN GENERAL DEL SISTEMA

```
┌─────────────────────────────────────────────────────┐
│                    VALGAME v2.0                      │
│              (RPG DUAL-MODE SYSTEM)                  │
└─────────────────────────────────────────────────────┘
           ↓                              ↓
      ┌─────────┐                  ┌──────────────┐
      │   RPG   │                  │  SURVIVAL    │
      │ (MAIN)  │                  │  (NEW MODE)  │
      └─────────┘                  └──────────────┘
           ↓                              ↓
      ┌─────────────────────────────────────────────┐
      │        USER (Datos Compartidos)             │
      ├─────────────────────────────────────────────┤
      │ ├─ personajes[] (1-50)                      │
      │ ├─ personajeActivoId (SELECCIONADO)         │
      │ ├─ val (Recursos)                           │
      │ ├─ evo (Recursos)                           │
      │ ├─ survivalPoints (Nuevo)                   │
      │ └─ currentSurvivalSession (Nuevo)           │
      └─────────────────────────────────────────────┘
```

---

## 🎮 ARQUITECTURA DE MODOS

### Modo 1: RPG (Juego Principal)

#### Qué es
- Sistema tradicional de MMORPG
- Progresión de personajes (EXP, Nivel, Stats)
- Dungeons (5 mazmorras)
- Marketplace (compra/venta items)
- Teams (jugar con amigos)
- Monetización (Stripe + Web3)

#### Datos Clave
```typescript
interface RPGData {
  // Datos del usuario
  userId: ObjectId;
  personajes: Character[];      // Array 1-50
  personajeActivoId: string;   // El que está jugando RPG

  // Recursos globales
  val: number;                  // Moneda en juego
  evo: number;                  // Tokens de evolución
  boletos: number;              // Boletos de dungeon
  
  // Cada personaje tiene
  character: {
    nivel: number;              // 1-50
    experiencia: number;        // Para subir nivel
    equipamiento: ObjectId[];   // 4+ items equipados
    stats: {
      ataque: number;
      defensa: number;
      // ...
    }
  }
}
```

#### Dinámicas
```
Acción RPG → Consume recursos → Gana recompensas

Ejemplos:
1. Entrar dungeon → cuesta boleto → gana EXP + VAL + items
2. Equipar item → permanente → suma stats
3. Evolucionar char → cuesta VAL + EVO → sube tier
4. Marketplace → vende item → gana VAL
```

---

### Modo 2: SURVIVAL (Nuevo)

#### Qué es
- Juego de oleadas contra enemigos
- Sesiones independientes (sin consumir recursos RPG)
- Genera PUNTOS (no EXP directo)
- Leaderboard global
- Canje de puntos por recompensas

#### Datos Clave
```typescript
interface SurvivalData {
  // Sesión activa
  sessionId: ObjectId;
  userId: ObjectId;
  characterId: ObjectId;       // Personaje seleccionado (1 solo)
  
  // Equipo (tomado de RPG automáticamente)
  equipment: {
    head: { itemId: ObjectId };
    body: { itemId: ObjectId };
    hands: { itemId: ObjectId };
    feet: { itemId: ObjectId };
  };
  
  // Progreso
  currentWave: number;         // Oleada actual
  currentPoints: number;       // Puntos acumulados
  status: 'active' | 'completed' | 'failed';
  
  // Histórico
  survivalPoints: number;      // En User, puntos totales
  survivalStats: {
    totalRuns: number;
    maxWave: number;
    totalPoints: number;
  };
}
```

#### Dinámicas
```
Acción Survival → Sin consumir RPG → Genera puntos → Canjear

Ejemplos:
1. Completar oleada → +250 puntos
2. Finalizar sesión exitosa → +50 survival points
3. Canjear 100 puntos → +100 EXP RPG
4. Leaderboard → +prestigio (cosmético)
```

---

## 🔄 FLUJO DE DATOS COMPARTIDOS

### Recurso 1: VAL (Moneda)

```
RPG:
  - Ganas: Vendiendo en marketplace, dungeons
  - Gastas: Evolucionar personajes
  - Ubicación: User.val

SURVIVAL:
  - Ganas: Canjeando 200 puntos
  - Gastas: NADA (Survival no consume VAL)
  - Ubicación: User.val (mismo campo)

FLUJO:
  User: { val: 500 }
    ↓ (juega RPG, gasta 100)
  User: { val: 400 }
    ↓ (juega Survival, canjea 200 puntos por 100 VAL)
  User: { val: 500 }
```

### Recurso 2: EXP/Nivel

```
RPG:
  - Ganas: Completando dungeons
  - Consumes: Sube de nivel (automático)
  - Ubicación: character.experiencia, character.nivel

SURVIVAL:
  - Ganas: Canjeando survivalPoints
  - Consumes: NADA
  - Ubicación: character.experiencia, character.nivel (MISMOS)

FLUJO:
  Character: { nivel: 35, experiencia: 5000 }
    ↓ (juega RPG, gana 1000 EXP)
  Character: { nivel: 35, experiencia: 6000 }
    ↓ (juega Survival, canjea 100 points por 100 EXP)
  Character: { nivel: 36, experiencia: 100 }  ← SUBE NIVEL
```

### Recurso 3: Equipamiento

```
RPG:
  - Ubicación: character.equipamiento[] (Array de IDs)
  - Se equipa: POST /api/characters/equip
  - Se desequipa: POST /api/characters/unequip
  - Formato: ["item1", "item2", "item3", ...]

SURVIVAL:
  - Ubicación: SurvivalSession.equipment (Slots)
  - Se toma: Automáticamente al iniciar sesión
  - NO se modifica: (Read-only durante sesión)
  - Formato: { head: {itemId}, body: {itemId}, ... }

FLUJO:
  1. RPG: Equipa 4 items → character.equipamiento = [a,b,c,d]
  2. Survival: Inicia sesión → session.equipment = {head: {a}, body: {b}, ...}
  3. Survival: Termina → character.equipamiento = [a,b,c,d] (sin cambios)
  4. RPG: Desequipa item d → character.equipamiento = [a,b,c]
  5. Survival: Siguiente sesión FALLARÁ (requiere 4 items)

IMPORTANTE: El equipamiento se LEE desde RPG, no se COMPARTE en tiempo real
```

### Recurso 4: Survival Points (NUEVO)

```
RPG:
  - NO existe en RPG
  - Es exclusivo de Survival
  - Ubicación: User.survivalPoints

SURVIVAL:
  - Se gana: Completando sesiones exitosas
  - Se gasta: Canjeando por EXP/VAL/Items
  - Ubicación: User.survivalPoints

FLUJO:
  User: { survivalPoints: 0 }
    ↓ (completa sesión Survival)
  User: { survivalPoints: 50 }
    ↓ (canjea 100 puntos por EXP, pero solo tiene 50 → ERROR)
```

---

## 🎯 INTERACCIONES CLAVE

### Interacción 1: Seleccionar Personaje para Survival

```typescript
// PASO 1: En pantalla de selección RPG
// Usuario hace click en "ENTRAR SURVIVAL"

if (!user.personajeActivoId) {
  showError("Debe seleccionar un personaje primero");
  return;
}

// PASO 2: Validar que tiene 4 items equipados
const activeChar = user.personajes.id(user.personajeActivoId);
if (!activeChar.equipamiento || activeChar.equipamiento.length !== 4) {
  showError("Equipa 4 items en RPG primero (cabeza, cuerpo, manos, pies)");
  return;
}

// PASO 3: Iniciar Survival
POST /api/survival/start
{
  characterId: user.personajeActivoId
  // ← SIN equipmentIds (se toman automáticamente)
}

// PASO 4: Backend
// - Lee character.equipamiento (4 items)
// - Convierte a slots: {head, body, hands, feet}
// - Crea SurvivalSession
// - Devuelve sessionId

// PASO 5: Frontend redirige a pantalla de combate
navigateTo('survival/combat', { sessionId });
```

### Interacción 2: Canjear Puntos Survival por EXP

```typescript
// PASO 1: Usuario en pantalla de canje
const userSurvivalPoints = user.survivalPoints; // ej: 150
const desiredExchange = 100; // puntos a canjear

if (userSurvivalPoints < desiredExchange) {
  showError(`Necesitas ${desiredExchange} points, tienes ${userSurvivalPoints}`);
  return;
}

// PASO 2: Solicitar canje
POST /api/survival/exchange-points/exp
{
  points: 100
}

// PASO 3: Backend
// - Resta 100 de User.survivalPoints
// - Suma 100 a character.experiencia
// - Si experiencia >= threshold → sube nivel
// - Actualiza User y Character

// PASO 4: Respuesta
{
  message: "Exchanged 100 points for 100 EXP",
  expGained: 100,
  pointsRemaining: 50,
  characterLevel: 36  // si subió
}

// PASO 5: Actualizar UI
user.survivalPoints = 50;
character.experiencia = newExp;
character.nivel = 36;
```

### Interacción 3: Finales de Sesión Survival

#### Si Gana:
```typescript
POST /api/survival/:sessionId/end
{
  finalWave: 5,
  totalEnemiesDefeated: 18,
  totalPoints: 1250,
  duration: 765
}

// Backend:
// - Crea SurvivalRun (historial)
// - Suma survivalPoints: user.survivalPoints += 50
// - Suma recompensas (EXP, VAL) directamente al personaje
// - Actualiza leaderboard
// - Devuelve rewards

Response: {
  rewards: {
    exp: 250,      // → sumado a character.experiencia
    val: 150,      // → sumado a user.val
    survivalPoints: 50  // → sumado a user.survivalPoints
  }
}

// Frontend:
user.val += 150;
user.survivalPoints += 50;
character.experiencia += 250;
showRewards(rewards);
```

#### Si Pierde:
```typescript
POST /api/survival/:sessionId/report-death
{
  finalWave: 2,
  totalEnemiesDefeated: 8,
  totalPoints: 350,
  duration: 270
}

// Backend:
// - Crea SurvivalRun (marcada como failed)
// - NO suma rewards
// - NO suma survivalPoints
// - NO agrega a leaderboard
// - Devuelve solo puntos acumulados

Response: {
  rewards: { survivalPoints: 0 },
  message: "Session ended without rewards"
}

// Frontend:
showMessage("No hay recompensas, pero puedes reintentar");
```

---

## 🛡️ CONFLICTOS EVITADOS

### ✅ Conflicto 1: ¿Puede el usuario estar en RPG y Survival simultáneamente?

**RESPUESTA**: NO, por diseño
```
- User.personajeActivoId es GLOBAL
- Si está en Survival → no puede entrar dungeon RPG
- Si está en RPG → sesión Survival se abandona automáticamente
- Validación: Frontend chequea si hay currentSurvivalSession activa
```

### ✅ Conflicto 2: ¿Qué pasa si cambia de personaje en RPG mientras está en Survival?

**RESPUESTA**: Sesión se abandona
```
- Acción: User hace switch personaje
- Sistema: POST /api/users/characters/:id/set-active
- Efecto: user.personajeActivoId = new_char_id
- Trigger: Si User.currentSurvivalSession existe → abandonar sesión
- Notificación: "Sesión Survival abandonada"
```

### ✅ Conflicto 3: ¿Puede usar el mismo item en RPG y Survival?

**RESPUESTA**: SÍ, pero diferente
```
RPG: 
  - Item está en character.equipamiento
  - Se puede desequipar
  - Modifica stats permanentemente

SURVIVAL:
  - Item se LEE (copia) al iniciar sesión
  - NO se modifica
  - Solo durante esa sesión
  
Ejemplo:
  - Personaje equipa "Espada de Fuego" en RPG
  - Entra Survival con esa espada
  - Survival termina
  - Espada sigue en RPG
  - Puede volver a usarla en siguiente Survival
```

### ✅ Conflicto 4: ¿VAL generado en ambos modos causa inflation?

**RESPUESTA**: Controlado con tasas diferentes
```
RPG: 
  - Dungeon = +100 VAL promedio
  - Marketplace sell = variable (0-500)
  
SURVIVAL:
  - Canje 200 points = +100 VAL (tasa 2:1)
  - Canje más lento que RPG
  
Diseño: Survival es "farming" alternativo, no principal
```

---

## 📱 INTERFAZ DE USUARIO

### Menú Principal (COMPARTIDO)

```
┌─────────────────────────────────┐
│      VALGAME - MENÚ PRINCIPAL   │
├─────────────────────────────────┤
│                                 │
│  👤 Usuario: "JohnDoe"          │
│  💰 VAL: 500                    │
│  ⭐ Survival Points: 150        │
│                                 │
│  ┌─ PERSONAJES DISPONIBLES ──┐  │
│  │ ☑ Héroe (Nv35) [ACTIVO]   │  │
│  │ ☐ Mago (Nv28)             │  │
│  │ ☐ Paladín (Nv32)          │  │
│  └────────────────────────────┘  │
│                                 │
│  [JUGAR RPG]  [JUGAR SURVIVAL]  │
│  [MARKETPLACE] [LEADERBOARD]    │
│                                 │
└─────────────────────────────────┘
```

### Botones Condicionales

```typescript
if (user.currentSurvivalSession) {
  // Hay sesión activa → mostrar opciones de retomar
  showButtons([
    "Continuar Survival",
    "Abandonar Sesión",
    "Ver Estadísticas"
  ]);
} else {
  // No hay sesión → mostrar opciones normales
  showButtons([
    "Jugar RPG",
    "Jugar Survival",
    "Ver Puntos",
    "Marketplace"
  ]);
}
```

---

## 🔐 VALIDACIONES

### Antes de Entrar a Survival

```typescript
function validateSurvivalEntry(user: IUser, characterId: string) {
  const errors: string[] = [];

  // 1. Validar personaje existe
  const char = user.personajes.id(characterId);
  if (!char) {
    errors.push("Character not found");
  }

  // 2. Validar que pertenece al usuario
  if (!user._id.equals(char.userId)) {
    errors.push("Character doesn't belong to this user");
  }

  // 3. Validar 4 items equipados
  if (!char.equipamiento || char.equipamiento.length !== 4) {
    errors.push(`Character must have 4 equipped items (has ${char.equipamiento?.length || 0})`);
  }

  // 4. Validar no hay sesión activa
  if (user.currentSurvivalSession) {
    errors.push("You already have an active Survival session");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
```

### Antes de Canjear Puntos

```typescript
function validateExchange(user: IUser, points: number, type: 'exp' | 'val' | 'items') {
  const errors: string[] = [];

  // 1. Puntos suficientes
  if (user.survivalPoints < points) {
    errors.push(`Insufficient points: need ${points}, have ${user.survivalPoints}`);
  }

  // 2. Cantidad válida según tipo
  if (type === 'exp' && points < 50) {
    errors.push("Minimum 50 points for EXP exchange");
  }
  if (type === 'val' && points < 100) {
    errors.push("Minimum 100 points for VAL exchange");
  }
  if (type === 'items' && points < 150) {
    errors.push("Minimum 150 points per item");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
```

---

## 📊 FLOWCHART: DECISIONES USUARIO

```
INICIO
  ↓
¿Tiene personaje seleccionado?
  ├─ NO → Mostrar selector personajes → Vuelve al inicio
  └─ SÍ ↓
¿Quiere jugar RPG o Survival?
  ├─ RPG → Verificar boletos → Entrar dungeon
  └─ Survival ↓
¿Personaje tiene 4 items equipados?
  ├─ NO → Mostrar error "Equipa en RPG" → RPG equip screen
  └─ SÍ ↓
¿Tiene sesión Survival activa?
  ├─ SÍ → Mostrar opciones (continuar, abandonar)
  └─ NO ↓
Iniciar sesión Survival
  ↓
JUGAR (oleadas)
  ↓
¿Completó todas las oleadas?
  ├─ SÍ (5/5) → Sesión exitosa → +recompensas
  └─ NO ↓
¿Murio o abandonó?
  ├─ SÍ → Sesión fallida → +0 recompensas
  └─ NO → Continuar jugando
```

---

## 📚 ARCHIVOS RELACIONADOS

- **Análisis Equipamiento**: `/ANALISIS_EQUIPAMIENTO_RPG_VS_SURVIVAL.md`
- **Guía Survival**: `/FRONTEND_STARTER_KIT/23_GUIA_SURVIVAL_MODO_GAME.md`
- **API Reference**: `/FRONTEND_STARTER_KIT/00_BACKEND_API_REFERENCE.md`
- **Auth & Sessions**: `/FRONTEND_STARTER_KIT/15_GUIA_COMPLETA_AUTENTICACION_SESIONES.md`
- **Estado Final**: `/ESTADO_FINAL_PROYECTO.md`

---

**ÚLTIMA ACTUALIZACIÓN**: 27 de Noviembre, 2025  
**ESTADO**: ✅ Listo para implementación

