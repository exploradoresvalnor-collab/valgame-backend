# 🔧 MODIFICACIÓN USER.TS - PASO A PASO

**Fecha:** 24 de noviembre de 2025  
**Objetivo:** Agregar campos de Survival al modelo User existente  
**Ubicación:** `src/models/User.ts`

---

## 📋 CONTEXTO: FLUJO DE REGISTRO ACTUAL

```
1. Frontend: POST /api/auth/register { email, username, password }
   ↓
2. Backend: auth.routes.ts → router.post('/register')
   ├─ Hash password con bcrypt
   ├─ Crear instancia User
   ├─ Guardar user.save()
   ├─ Enviar email verificación
   ↓
3. Usuario hace click en email
   ├─ GET /api/auth/verify/:token
   ├─ user.isVerified = true
   ├─ Llamar deliverPioneerPackage()
   ├─ Guardar user.save()
   ↓
4. Usuario logueado con Paquete Pionero
```

---

## ✅ ESTRUCTURA ACTUAL DE USER.TS

```typescript
export interface IUser extends Document {
  // Auth
  email: string;
  username: string;
  passwordHash: string;
  isVerified: boolean;
  
  // Moneda & Recursos
  val: number;
  boletos: number;
  evo: number;
  
  // Personajes
  personajes: Types.DocumentArray<IPersonajeSubdocument>;
  
  // Inventario
  inventarioEquipamiento: Types.ObjectId[];
  inventarioConsumibles: Types.DocumentArray<IConsumableItemSubdocument>;
  
  // Dungeons
  dungeon_progress: Map<...>;
  dungeon_stats: {...};
  
  // Settings
  settings: IUserSettings;
  
  // ❌ NO TIENE: Survival fields
}
```

---

## 🎯 QUÉ AGREGAR (3 CAMPOS NUEVOS)

### **1. survivalPoints** - Puntos acumulados del Survival

```typescript
survivalPoints: {
  total: number;           // Total histórico
  available: number;       // Listos para canjear
  lastUpdated: Date;
}
```

**Propósito:**
- `total`: Suma de todos los puntos ganados en runs
- `available`: Puntos sin canjear (el user puede usar)
- `lastUpdated`: Auditoría

---

### **2. currentSurvivalSession** - Sesión activa

```typescript
currentSurvivalSession: {
  sessionId?: Types.ObjectId;    // Referencia a SurvivalSession
  status: 'active' | 'none';     // ¿Hay una sesión abierta?
  startedAt?: Date;              // Cuándo comenzó
}
```

**Propósito:**
- Evitar que user tenga 2 sesiones activas simultáneamente
- Anti-cheat: validar que solo hay 1 sesión por usuario
- Recuperación: si el backend cae, el user puede recuperar la sesión

---

### **3. survivalStats** - Estadísticas históricas

```typescript
survivalStats: {
  totalRuns: number;              // Cuántas runs ha hecho
  maxWaveReached: number;         // La ola máxima alcanzada
  averageWave: number;            // Promedio de olas
  totalEnemiesDefeated: number;   // Total de enemigos derrotados
  bestRunId?: Types.ObjectId;     // ID del mejor run (referencia)
}
```

**Propósito:**
- Leaderboard
- Stats personales
- Logros/achievements

---

## 📝 CÓDIGO EXACTO A AGREGAR

### **PASO 1: Actualizar la INTERFAZ IUser**

En `src/models/User.ts`, después de `dungeon_stats`, agregar:

```typescript
// Línea ~95 (después de dungeon_stats)

export interface IUser extends Document {
  email: string;
  username: string;
  passwordHash: string;
  isVerified: boolean;
  resetPasswordToken?: string;
  resetPasswordTokenExpires?: Date;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  walletAddress?: string;
  val: number;
  boletos: number;
  energia: number;
  energiaMaxima: number;
  ultimoReinicioEnergia?: Date;
  evo: number;
  invocaciones: number;
  evoluciones: number;
  boletosDiarios: number;
  ultimoReinicio?: Date;
  personajes: Types.DocumentArray<IPersonajeSubdocument>;
  inventarioEquipamiento: Types.ObjectId[];
  inventarioConsumibles: Types.DocumentArray<IConsumableItemSubdocument>;
  limiteInventarioEquipamiento: number;
  limiteInventarioConsumibles: number;
  limiteInventarioPersonajes: number;
  personajeActivoId?: string;
  fechaRegistro: Date;
  ultimaActualizacion: Date;
  receivedPioneerPackage?: boolean;
  tutorialCompleted?: boolean;
  settings: IUserSettings;
  dungeon_progress?: Map<string, {...}>;
  dungeon_streak: number;
  max_dungeon_streak: number;
  dungeon_stats: {
    total_victorias: number;
    total_derrotas: number;
    mejor_racha: number;
  };

  // ===== NUEVO: SURVIVAL FIELDS =====
  survivalPoints: {
    total: number;
    available: number;
    lastUpdated: Date;
  };
  currentSurvivalSession: {
    sessionId?: Types.ObjectId;
    status: 'active' | 'none';
    startedAt?: Date;
  };
  survivalStats: {
    totalRuns: number;
    maxWaveReached: number;
    averageWave: number;
    totalEnemiesDefeated: number;
    bestRunId?: Types.ObjectId;
  };
}
```

---

### **PASO 2: Actualizar el SCHEMA UserSchema**

En `src/models/User.ts`, en el `UserSchema`, después de `dungeon_stats`, agregar:

```typescript
// Línea ~180 (en el UserSchema, después de dungeon_stats)

const UserSchema = new Schema<IUser>({
    // ... campos existentes ...
    
    dungeon_stats: {
      type: new Schema({
        total_victorias: { type: Number, default: 0, min: 0 },
        total_derrotas: { type: Number, default: 0, min: 0 },
        mejor_racha: { type: Number, default: 0, min: 0 }
      }, { _id: false }),
      default: () => ({ total_victorias: 0, total_derrotas: 0, mejor_racha: 0 })
    },

    // ===== NUEVO: SURVIVAL FIELDS =====
    survivalPoints: {
      type: new Schema({
        total: { type: Number, default: 0, min: 0 },
        available: { type: Number, default: 0, min: 0 },
        lastUpdated: { type: Date, default: Date.now }
      }, { _id: false }),
      default: () => ({ total: 0, available: 0, lastUpdated: new Date() })
    },

    currentSurvivalSession: {
      type: new Schema({
        sessionId: { type: Schema.Types.ObjectId, ref: 'SurvivalSession' },
        status: { type: String, enum: ['active', 'none'], default: 'none' },
        startedAt: { type: Date }
      }, { _id: false }),
      default: () => ({ status: 'none' })
    },

    survivalStats: {
      type: new Schema({
        totalRuns: { type: Number, default: 0, min: 0 },
        maxWaveReached: { type: Number, default: 0, min: 0 },
        averageWave: { type: Number, default: 0, min: 0 },
        totalEnemiesDefeated: { type: Number, default: 0, min: 0 },
        bestRunId: { type: Schema.Types.ObjectId, ref: 'SurvivalRun' }
      }, { _id: false }),
      default: () => ({ 
        totalRuns: 0, 
        maxWaveReached: 0, 
        averageWave: 0, 
        totalEnemiesDefeated: 0 
      })
    }

  }, {
    timestamps: { createdAt: 'fechaRegistro', updatedAt: 'ultimaActualizacion' },
    versionKey: false
  });
```

---

## 🔄 FLUJO CON SURVIVAL AGREGADO

```
1. Frontend: POST /api/auth/register { email, username, password }
   ↓
2. Backend: Crear usuario
   {
     email: "user@test.com",
     username: "Héroe123",
     val: 0,
     personajes: [],
     inventarioEquipamiento: [],
     
     // NUEVO - Survival inicializado
     survivalPoints: {
       total: 0,
       available: 0,
       lastUpdated: Date.now()
     },
     currentSurvivalSession: {
       status: 'none'
     },
     survivalStats: {
       totalRuns: 0,
       maxWaveReached: 0,
       averageWave: 0,
       totalEnemiesDefeated: 0
     }
   }
   ↓
3. Verificar email (deliverPioneerPackage)
   {
     val: 100,
     boletos: 10,
     evo: 2,
     personajes: [1 nuevo]
   }
   ↓
4. User puede:
   ✅ Jugar RPG (mazmorras)
   ✅ Jugar Survival (oleadas)
   ✅ Ver stats en ambos
```

---

## 🎯 RESUMEN DE CAMBIOS

### **En la INTERFAZ IUser:**
```diff
  dungeon_stats: {...};
+ survivalPoints: {...};
+ currentSurvivalSession: {...};
+ survivalStats: {...};
}
```

### **En el SCHEMA UserSchema:**
```diff
  dungeon_stats: new Schema({...}),
+ survivalPoints: new Schema({...}),
+ currentSurvivalSession: new Schema({...}),
+ survivalStats: new Schema({...})
}
```

---

## 📊 ESTADO DEL USER DESPUÉS DE CAMBIOS

```typescript
// Usuario después de registrarse y verificar email
{
  _id: ObjectId("..."),
  email: "usuario@email.com",
  username: "Héroe123",
  isVerified: true,
  
  // RPG - ya existe
  val: 100,
  boletos: 10,
  evo: 2,
  personajes: [
    { personajeId: "p1", nombre: "Guerrero", nivel: 1, ... }
  ],
  dungeon_stats: {
    total_victorias: 0,
    total_derrotas: 0,
    mejor_racha: 0
  },
  
  // SURVIVAL - NUEVO
  survivalPoints: {
    total: 0,
    available: 0,
    lastUpdated: 2025-11-24T10:00:00Z
  },
  currentSurvivalSession: {
    status: 'none'
  },
  survivalStats: {
    totalRuns: 0,
    maxWaveReached: 0,
    averageWave: 0,
    totalEnemiesDefeated: 0
  },
  
  // Timestamps
  fechaRegistro: 2025-11-24T09:50:00Z,
  ultimaActualizacion: 2025-11-24T10:00:00Z
}
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### **PASO 1: Modificar User.ts**
- [ ] Agregar interfaz `survivalPoints` a `IUser`
- [ ] Agregar interfaz `currentSurvivalSession` a `IUser`
- [ ] Agregar interfaz `survivalStats` a `IUser`
- [ ] Agregar schema `survivalPoints` a `UserSchema`
- [ ] Agregar schema `currentSurvivalSession` a `UserSchema`
- [ ] Agregar schema `survivalStats` a `UserSchema`

### **PASO 2: Crear SurvivalSession.ts** (colección)
```typescript
// src/models/SurvivalSession.ts
export interface ISurvivalSession extends Document {
  userId: Types.ObjectId;
  characterId: Types.ObjectId;
  state: 'active' | 'completed' | 'abandoned';
  currentWave: number;
  currentPoints: number;
  // ... más campos (ver ARQUITECTURA_SURVIVAL_BACKEND.md)
}
```

### **PASO 3: Crear SurvivalRun.ts** (colección)
```typescript
// src/models/SurvivalRun.ts
export interface ISurvivalRun extends Document {
  userId: Types.ObjectId;
  characterId: Types.ObjectId;
  finalWave: number;
  finalPoints: number;
  // ... más campos
}
```

### **PASO 4: Crear SurvivalLeaderboard.ts** (colección)
```typescript
// src/models/SurvivalLeaderboard.ts
export interface ISurvivalLeaderboard extends Document {
  userId: Types.ObjectId;
  username: string;
  maxWave: number;
  totalPoints: number;
  // ... más campos
}
```

### **PASO 5: Crear 12 endpoints nuevos**
- [ ] POST /api/survival/start
- [ ] POST /api/survival/:sessionId/complete-wave
- [ ] POST /api/survival/:sessionId/use-consumable
- [ ] POST /api/survival/:sessionId/pickup-drop
- [ ] POST /api/survival/:sessionId/end
- [ ] POST /api/survival/:sessionId/death
- [ ] POST /api/survival/exchange-points/exp
- [ ] POST /api/survival/exchange-points/val
- [ ] POST /api/survival/exchange-points/guaranteed-item
- [ ] GET /api/survival/leaderboard
- [ ] GET /api/survival/my-stats
- [ ] POST /api/survival/:sessionId/abandon

---

## 🚀 SIGUIENTE PASO

**Una vez hagas los cambios en User.ts:**

1. ✅ Compila TypeScript (`npm run build`)
2. ✅ Verifica no hay errores
3. ✅ Luego creamos las 3 colecciones nuevas
4. ✅ Luego creamos los endpoints

---

## 💡 PREGUNTAS FRECUENTES

**P: ¿Esto rompe el código existente?**
R: NO. Solo agregamos campos nuevos. Los campos RPG existentes siguen igual.

**P: ¿Necesito migración de datos?**
R: NO. Los usuarios nuevos tendrán estos campos inicializados. Los usuarios antiguos pueden inicializarse con un query de update.

**P: ¿Afecta el login?**
R: NO. El login devuelve los mismos datos, solo que con los nuevos campos.

**P: ¿Cuándo se guardan estos campos?**
R: Al registrarse (con defaults). Al verificar email. Al completar una run (se actualizan).

---

_Guía de Modificación User.ts - Survival System  
Valgame v2.0 - 24 de noviembre de 2025_
