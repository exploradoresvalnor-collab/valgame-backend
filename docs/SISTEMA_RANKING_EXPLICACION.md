# 🏆 SISTEMA DE RANKING - EXPLICACIÓN COMPLETA

**Fecha:** 3 de noviembre de 2025  
**Estado:** ⚠️ **IMPLEMENTADO PARCIALMENTE** (modelos existen pero no conectados)

---

## 📊 RESUMEN EJECUTIVO

### ¿Qué es el Sistema de Ranking?

Es un **leaderboard global** que clasifica a los jugadores según su desempeño en mazmorras. Los jugadores ganan **puntos de ranking** por cada victoria, y se ordenan de mayor a menor.

### Estado Actual

| Componente | Estado | Descripción |
|------------|--------|-------------|
| 📋 Modelo `Ranking` | ✅ EXISTE | Define estructura de datos |
| 📋 Modelo `PlayerStat` | ✅ EXISTE | Guarda estadísticas individuales |
| ⚙️ Campo en GameSettings | ✅ EXISTE | `puntos_ranking_por_victoria: 10` |
| 🔌 Rutas API | ✅ EXISTE | `src/routes/playerStats.routes.ts` |
| 🎮 Lógica en Mazmorras | ❌ **FALTA** | No actualiza ranking en victorias |
| 🌐 WebSocket | ✅ EXISTE | Método `notifyRankingUpdate()` |
| 📖 Endpoints públicos | ❌ **FALTA** | No hay GET para ver rankings |

**Conclusión:** El sistema está **80% implementado** pero **NO FUNCIONA** porque:
- ❌ Las victorias en mazmorras **NO actualizan** el ranking
- ❌ No hay endpoints para **consultar** el ranking
- ❌ No hay lógica de **periodos** (semanal, mensual, global)

---

## 🗂️ MODELOS DE DATOS

### Modelo: `Ranking`

**Ubicación:** `src/models/Ranking.ts`

```typescript
export interface IRanking extends Document {
  userId: Types.ObjectId;       // Referencia al usuario
  puntos: number;                // Puntos totales de ranking
  victorias: number;             // Total de victorias
  derrotas: number;              // Total de derrotas
  ultimaPartida: Date;           // Última vez que jugó
  boletosUsados: number;         // Total de boletos gastados
  periodo: string;               // "global", "2025-W45", "2025-11"
}
```

**Índices:**
- ✅ `userId` (búsquedas rápidas por usuario)
- ✅ `ultimaPartida` (filtrar rankings activos)
- ✅ `periodo` (rankings semanales/mensuales)

**Ejemplo de documento:**
```json
{
  "_id": "68...",
  "userId": "67...",
  "puntos": 350,
  "victorias": 42,
  "derrotas": 8,
  "ultimaPartida": "2025-11-03T15:30:00Z",
  "boletosUsados": 50,
  "periodo": "global"
}
```

---

### Modelo: `PlayerStat`

**Ubicación:** `src/models/PlayerStat.ts`

```typescript
export interface IPlayerStats extends Document {
  userId: Types.ObjectId;       // Referencia al usuario
  personajeId: string;           // ID del personaje usado
  fecha: Date;                   // Fecha de la partida
  valAcumulado: number;          // VAL ganado en esa partida
  fuente: string;                // "victoria_mazmorra_Cueva Oscura"
}
```

**Propósito:** Registro histórico de cada partida para analytics.

**Ejemplo de documento:**
```json
{
  "_id": "68...",
  "userId": "67...",
  "personajeId": "CHAR_001, CHAR_003",
  "fecha": "2025-11-03T15:30:00Z",
  "valAcumulado": 250,
  "fuente": "victoria_mazmorra_Cueva Oscura"
}
```

---

## ⚙️ CONFIGURACIÓN EN GAMESETTINGS

**Campo:** `puntos_ranking_por_victoria`

```typescript
{
  puntos_ranking_por_victoria: 10  // Puntos fijos por victoria
}
```

**Uso esperado:**
- Por cada victoria en mazmorra → +10 puntos de ranking
- Configurable (puede cambiarse a 5, 15, 20, etc.)

---

## 🎮 ¿CÓMO DEBERÍA FUNCIONAR CON MAZMORRAS?

### Flujo Ideal (NO IMPLEMENTADO)

```
1. Usuario inicia mazmorra
   POST /api/dungeons/:id/start { team: [...] }

2. Backend simula combate
   └─ src/controllers/dungeons.controller.ts

3. Si VICTORIA:
   ├─ ✅ Dar recompensas (EXP, VAL, loot)
   ├─ ✅ Registrar PlayerStat ← YA EXISTE
   └─ ❌ FALTA: Actualizar Ranking
       ├─ Buscar o crear ranking del usuario (periodo: "global")
       ├─ Incrementar puntos (+10)
       ├─ Incrementar victorias (+1)
       ├─ Incrementar boletosUsados (+1)
       ├─ Actualizar ultimaPartida
       └─ Guardar cambios

4. Si DERROTA:
   ├─ ❌ No dar recompensas
   └─ ❌ FALTA: Actualizar Ranking
       ├─ Incrementar derrotas (+1)
       └─ No dar puntos
```

---

## 🔧 IMPLEMENTACIÓN NECESARIA

### 1. Actualizar `dungeons.controller.ts`

**Ubicación:** `src/controllers/dungeons.controller.ts` (línea ~358)

**Código a añadir después de victoria:**

```typescript
// --- Registrar estadística de la victoria (YA EXISTE)
await PlayerStat.create({
  userId: user._id,
  personajeId: combatTeam.map(p => p.personajeId).join(', '),
  fecha: new Date(),
  valAcumulado: valGanado,
  fuente: `victoria_mazmorra_${dungeon.nombre}`
});

// ========================================
// NUEVO: Actualizar ranking global
// ========================================
const gameSettings = await GameSettings.findOne();
const puntosRanking = gameSettings?.puntos_ranking_por_victoria || 10;

await Ranking.findOneAndUpdate(
  { 
    userId: user._id, 
    periodo: 'global' 
  },
  {
    $inc: { 
      puntos: puntosRanking,
      victorias: 1,
      boletosUsados: 1
    },
    $set: { 
      ultimaPartida: new Date() 
    }
  },
  { 
    upsert: true,  // Crear si no existe
    new: true 
  }
);

// Notificar cambio de ranking via WebSocket
const realtimeService = RealtimeService.getInstance();
realtimeService.notifyRankingUpdate({ userId: user._id });
```

**Para derrotas:**

```typescript
// Si DERROTA, solo incrementar contador
await Ranking.findOneAndUpdate(
  { 
    userId: user._id, 
    periodo: 'global' 
  },
  {
    $inc: { 
      derrotas: 1,
      boletosUsados: 1
    },
    $set: { 
      ultimaPartida: new Date() 
    }
  },
  { 
    upsert: true,
    new: true 
  }
);
```

---

### 2. Crear Endpoints de Ranking

**Archivo nuevo:** `src/routes/ranking.routes.ts`

```typescript
import { Router } from 'express';
import { Ranking } from '../models/Ranking';
import { User } from '../models/User';

const router = Router();

// GET /api/rankings - Top 100 jugadores globales
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const periodo = (req.query.periodo as string) || 'global';
    
    const rankings = await Ranking.find({ periodo })
      .sort({ puntos: -1 })  // Ordenar por puntos descendente
      .limit(limit)
      .populate('userId', 'username')  // Traer nombre del usuario
      .lean();
    
    res.json({ rankings });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener rankings' });
  }
});

// GET /api/rankings/:userId - Ranking de un usuario específico
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const periodo = (req.query.periodo as string) || 'global';
    
    const ranking = await Ranking.findOne({ userId, periodo })
      .populate('userId', 'username');
    
    if (!ranking) {
      return res.status(404).json({ error: 'Usuario no tiene ranking' });
    }
    
    // Calcular posición en el ranking
    const posicion = await Ranking.countDocuments({
      periodo,
      puntos: { $gt: ranking.puntos }
    }) + 1;
    
    res.json({ 
      ranking,
      posicion
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ranking' });
  }
});

export default router;
```

**Registrar en `app.ts`:**

```typescript
import rankingRoutes from './routes/ranking.routes';

// Rutas públicas
app.use('/api/rankings', rankingRoutes);
```

---

### 3. Sistema de Periodos

**Periodos soportados:**
- `"global"` - Ranking permanente de todos los tiempos
- `"2025-W45"` - Ranking semanal (semana 45 de 2025)
- `"2025-11"` - Ranking mensual (noviembre 2025)

**Función auxiliar para generar periodo:**

```typescript
// src/utils/rankingHelpers.ts
export function getCurrentPeriod(type: 'global' | 'weekly' | 'monthly'): string {
  if (type === 'global') return 'global';
  
  const now = new Date();
  
  if (type === 'weekly') {
    const weekNumber = getWeekNumber(now);
    return `${now.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
  }
  
  if (type === 'monthly') {
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    return `${now.getFullYear()}-${month}`;
  }
  
  return 'global';
}

function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}
```

**Uso:**

```typescript
const periodoSemanal = getCurrentPeriod('weekly');  // "2025-W45"
const periodoMensual = getCurrentPeriod('monthly'); // "2025-11"

// Actualizar ranking semanal
await Ranking.findOneAndUpdate(
  { userId: user._id, periodo: periodoSemanal },
  { $inc: { puntos: 10, victorias: 1 } },
  { upsert: true }
);
```

---

## 🌐 WEBSOCKET PARA RANKINGS

### Evento Existente

**Ubicación:** `src/services/realtime.service.ts` (línea 123)

```typescript
public notifyRankingUpdate(rankings: any): void {
  this.io.emit('rankings:update', rankings);
}
```

### Uso en Frontend

```typescript
// Frontend Angular
this.socket.on('rankings:update', (data) => {
  console.log('Ranking actualizado:', data);
  this.refreshRankings();
});
```

---

## 📊 EJEMPLO DE FLUJO COMPLETO

### Usuario juega y gana

```
1. POST /api/dungeons/68abc123/start
   Body: { team: ["CHAR_001", "CHAR_003"] }

2. Backend simula combate
   └─ Victoria en 180 segundos
   
3. Recompensas:
   ├─ +150 EXP a personajes
   ├─ +250 VAL a usuario
   └─ Loot: Espada Común
   
4. PlayerStat creado:
   {
     userId: "67...",
     fecha: "2025-11-03T15:30:00Z",
     valAcumulado: 250,
     fuente: "victoria_mazmorra_Cueva Oscura"
   }
   
5. Ranking actualizado (NUEVO):
   {
     userId: "67...",
     puntos: 350 → 360  (+10)
     victorias: 42 → 43  (+1)
     boletosUsados: 50 → 51  (+1)
     ultimaPartida: NOW()
     periodo: "global"
   }
   
6. WebSocket emitido:
   rankings:update { userId: "67..." }
   
7. Frontend recibe notificación:
   "¡Has subido al puesto #127 del ranking!"
```

---

## 🎯 ENDPOINTS SUGERIDOS

### 1. Obtener Top Rankings

```
GET /api/rankings?limit=100&periodo=global
```

**Response:**
```json
{
  "rankings": [
    {
      "_id": "68...",
      "userId": {
        "_id": "67...",
        "username": "DragonSlayer"
      },
      "puntos": 1250,
      "victorias": 125,
      "derrotas": 15,
      "ultimaPartida": "2025-11-03T15:30:00Z",
      "periodo": "global"
    },
    {
      "userId": {
        "username": "ShadowNinja"
      },
      "puntos": 980,
      "victorias": 98,
      "derrotas": 22
    }
  ]
}
```

---

### 2. Ranking de un Usuario

```
GET /api/rankings/67abc123?periodo=global
```

**Response:**
```json
{
  "ranking": {
    "userId": "67abc123",
    "username": "MyUsername",
    "puntos": 350,
    "victorias": 42,
    "derrotas": 8,
    "ultimaPartida": "2025-11-03T15:30:00Z"
  },
  "posicion": 127
}
```

---

### 3. Rankings por Periodo

```
GET /api/rankings?periodo=2025-W45  // Ranking semanal
GET /api/rankings?periodo=2025-11    // Ranking mensual
GET /api/rankings?periodo=global     // Ranking global
```

---

## 🚀 PLAN DE IMPLEMENTACIÓN

### Fase 1: Conexión Básica (2-3 horas)

- [ ] Añadir lógica de actualización de ranking en `dungeons.controller.ts`
- [ ] Crear endpoint `GET /api/rankings` (top 100)
- [ ] Crear endpoint `GET /api/rankings/:userId` (ranking individual)
- [ ] Probar con tests E2E

### Fase 2: Sistema de Periodos (1-2 horas)

- [ ] Implementar `getCurrentPeriod()` helper
- [ ] Actualizar rankings semanal y mensual simultáneamente
- [ ] Endpoint para cambiar periodo en query string

### Fase 3: Frontend Integration (1-2 horas)

- [ ] Componente de leaderboard en Angular
- [ ] WebSocket listener para actualizaciones en tiempo real
- [ ] Notificaciones "Subiste de posición"

### Fase 4: Mejoras Avanzadas (opcional)

- [ ] Sistema de ligas (Bronce, Plata, Oro, Platino)
- [ ] Recompensas semanales por posición
- [ ] Historial de posiciones (gráfica de progreso)
- [ ] Ranking por mazmorra específica

---

## 🎮 VALOR PARA EL JUGADOR

### ¿Por qué es importante?

1. **Competitividad**: Los jugadores quieren compararse
2. **Retención**: Incentivo para seguir jugando (subir posición)
3. **Comunidad**: Ver quién es el mejor crea comunidad
4. **Metas**: Objetivo claro más allá de "terminar el juego"
5. **Recompensas**: Potencial para premios semanales/mensuales

### Ejemplos de otros juegos

- **League of Legends**: Sistema de ligas (Bronce → Challenger)
- **Hearthstone**: Rankings por temporada con recompensas
- **Path of Exile**: Ladder races con premios
- **Clash Royale**: Trofeos y ligas

---

## 📝 DOCUMENTACIÓN PARA FRONTEND

### Guía Rápida de Integración

```typescript
// 1. Obtener top 100 rankings
const rankings = await http.get('/api/rankings?limit=100');

// 2. Mostrar ranking del usuario actual
const myRanking = await http.get(`/api/rankings/${userId}`);
console.log(`Estás en el puesto ${myRanking.posicion}`);

// 3. Escuchar cambios en tiempo real
socket.on('rankings:update', () => {
  this.refreshRankings();
});

// 4. Mostrar ranking semanal
const weeklyRankings = await http.get('/api/rankings?periodo=2025-W45');
```

---

## 🔍 DEBUGGING

### Verificar si un usuario tiene ranking

```bash
# MongoDB Compass / Shell
db.ranking.find({ userId: ObjectId("67abc123") })
```

### Simular victoria y verificar

```bash
# 1. Ganar en mazmorra
POST /api/dungeons/68abc/start

# 2. Verificar que se actualizó el ranking
GET /api/rankings/67abc123

# 3. Verificar que se guardó el PlayerStat
db.playerstats.find({ userId: ObjectId("67abc123") }).sort({ fecha: -1 }).limit(1)
```

---

## ✅ CHECKLIST DE VALIDACIÓN

Después de implementar:

- [ ] Victoria en mazmorra incrementa puntos de ranking
- [ ] Derrota en mazmorra incrementa contador de derrotas
- [ ] `ultimaPartida` se actualiza correctamente
- [ ] `boletosUsados` se incrementa en cada partida
- [ ] Endpoint `GET /api/rankings` devuelve top 100
- [ ] Endpoint `GET /api/rankings/:userId` muestra posición
- [ ] WebSocket emite evento al actualizar ranking
- [ ] Rankings se ordenan correctamente (puntos descendente)
- [ ] Sistema de periodos funciona (global, semanal, mensual)
- [ ] Documentación API actualizada

---

**Última actualización:** 3 de noviembre de 2025  
**Estado:** Pendiente de implementación completa  
**Prioridad:** ALTA (mejora la experiencia competitiva)
