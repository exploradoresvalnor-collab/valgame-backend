# 🎮 PROPUESTA: NUEVAS FUNCIONALIDADES DE JUGABILIDAD

**Fecha:** 3 de noviembre de 2025  
**Objetivo:** Expandir el contenido del juego para aumentar retención y engagement

---

## 📋 ÍNDICE

1. [🗡️ Sistema PvP (Combate Jugador vs Jugador)](#1️⃣-sistema-pvp)
2. [👥 Sistema de Gremios/Clanes](#2️⃣-sistema-de-gremios)
3. [🏟️ Arena y Torneos](#3️⃣-arena-y-torneos)
4. [🎯 Sistema de Misiones Diarias](#4️⃣-misiones-diarias)
5. [🌟 Sistema de Logros](#5️⃣-sistema-de-logros)
6. [🎲 Eventos Temporales](#6️⃣-eventos-temporales)
7. [🏰 Mazmorras Cooperativas](#7️⃣-mazmorras-cooperativas)
8. [📦 Battle Pass / Pase de Temporada](#8️⃣-battle-pass)
9. [🎨 Personalización de Personajes](#9️⃣-personalización)
10. [💼 Sistema de Comercio Directo](#🔟-comercio-directo)

---

## 1️⃣ SISTEMA PVP (Combate Jugador vs Jugador)

### 🎯 Concepto

Los jugadores pueden **desafiarse mutuamente** a combates 1v1 o 3v3 con sus equipos de personajes.

### 🎮 Mecánicas Principales

#### Modo 1v1 (Duelo)
```
Jugador A vs Jugador B
- 1 personaje cada uno
- Sistema de turnos o tiempo real
- Apuestas de VAL opcionales
- Ranking PvP separado del PvE
```

#### Modo 3v3 (Batalla de Equipos)
```
Equipo A (3 personajes) vs Equipo B (3 personajes)
- Combate similar a mazmorras
- Estrategia de formación
- No hay apuestas (para evitar abuso)
```

---

### 📊 Diseño de Sistema

#### Modelo de Datos: `PvPMatch`

```typescript
// src/models/PvPMatch.ts
export interface IPvPMatch extends Document {
  matchId: string;
  tipo: 'duelo' | 'equipo' | 'ranked';
  
  // Jugadores
  jugador1: {
    userId: Types.ObjectId;
    equipo: string[];  // IDs de personajes
    resultado: 'victoria' | 'derrota' | 'empate' | null;
  };
  jugador2: {
    userId: Types.ObjectId;
    equipo: string[];
    resultado: 'victoria' | 'derrota' | 'empate' | null;
  };
  
  // Configuración
  apuesta_val?: number;           // Opcional para duelos
  ranked: boolean;                // Si cuenta para ranking PvP
  
  // Resultado
  estado: 'esperando' | 'en_progreso' | 'finalizado' | 'cancelado';
  ganador?: Types.ObjectId;
  log_combate: string[];
  duracion_segundos?: number;
  
  // Rankings
  elo_jugador1_antes?: number;
  elo_jugador1_despues?: number;
  elo_jugador2_antes?: number;
  elo_jugador2_despues?: number;
  
  fechaInicio?: Date;
  fechaFin?: Date;
}
```

---

#### Sistema de Matchmaking

```typescript
// src/services/pvpMatchmaking.service.ts

export async function buscarOponente(userId: string, tipo: 'duelo' | 'equipo') {
  // Buscar jugador con ELO similar (+/- 100 puntos)
  const miRanking = await PvPRanking.findOne({ userId });
  const miElo = miRanking?.elo || 1000; // ELO base 1000
  
  const oponente = await PvPRanking.findOne({
    userId: { $ne: userId },  // No yo mismo
    elo: { 
      $gte: miElo - 100, 
      $lte: miElo + 100 
    },
    buscando_partida: true
  }).populate('userId');
  
  if (!oponente) {
    // Añadir a cola de espera
    await PvPRanking.updateOne(
      { userId },
      { buscando_partida: true }
    );
    
    return { estado: 'en_cola' };
  }
  
  // Crear match
  const match = await PvPMatch.create({
    tipo,
    jugador1: { userId, equipo: [], resultado: null },
    jugador2: { userId: oponente.userId, equipo: [], resultado: null },
    ranked: true,
    estado: 'esperando',
    elo_jugador1_antes: miElo,
    elo_jugador2_antes: oponente.elo
  });
  
  // Notificar a ambos jugadores via WebSocket
  const realtimeService = RealtimeService.getInstance();
  realtimeService.notifyMatchFound(userId, match);
  realtimeService.notifyMatchFound(oponente.userId, match);
  
  return { estado: 'match_encontrado', match };
}
```

---

#### Sistema ELO (Rating)

```typescript
// src/utils/eloCalculator.ts

/**
 * Calcula nuevo ELO después de una partida
 * Basado en el sistema estándar de ajedrez
 */
export function calcularNuevoELO(
  eloGanador: number,
  eloPerdedor: number,
  kFactor: number = 32  // Sensibilidad del cambio
): { nuevoEloGanador: number; nuevoEloPerdedor: number } {
  
  // Probabilidad esperada de victoria
  const probabilidadGanador = 1 / (1 + Math.pow(10, (eloPerdedor - eloGanador) / 400));
  const probabilidadPerdedor = 1 / (1 + Math.pow(10, (eloGanador - eloPerdedor) / 400));
  
  // Actualizar ELO
  const nuevoEloGanador = Math.round(eloGanador + kFactor * (1 - probabilidadGanador));
  const nuevoEloPerdedor = Math.round(eloPerdedor + kFactor * (0 - probabilidadPerdedor));
  
  return { nuevoEloGanador, nuevoEloPerdedor };
}

// Ejemplo:
// Jugador A (ELO 1200) vence a Jugador B (ELO 1100)
// Resultado: A sube a ~1211, B baja a ~1089
```

---

#### Endpoints PvP

```typescript
// src/routes/pvp.routes.ts

// Buscar partida
POST /api/pvp/buscar
Body: { tipo: 'duelo' | 'equipo' }
Response: { estado: 'en_cola' | 'match_encontrado', match? }

// Seleccionar equipo
POST /api/pvp/match/:matchId/seleccionar-equipo
Body: { personajes: ["CHAR_001", "CHAR_002"] }

// Cancelar búsqueda
POST /api/pvp/cancelar-busqueda

// Ver mi ranking PvP
GET /api/pvp/mi-ranking
Response: { elo: 1250, posicion: 42, victorias: 85, derrotas: 32 }

// Ver historial de matches
GET /api/pvp/historial?limit=20

// Ranking global PvP
GET /api/pvp/leaderboard?limit=100
```

---

### 🎁 Recompensas PvP

```typescript
// Recompensas por victoria
const recompensasVictoria = {
  val: 100,
  exp_personaje: 50,
  puntos_elo: calcularNuevoELO(),
  
  // Bonus por racha
  racha_3: { val: +50, titulo: "En Racha" },
  racha_5: { val: +100, titulo: "Imparable" },
  racha_10: { val: +250, titulo: "Leyenda PvP" }
};

// Recompensas semanales PvP
const recompensasSemanalesPvP = [
  { posicion: 1, val: 2000, evo: 20, titulo: "Campeón Arena" },
  { posicion: 2-10, val: 1000, evo: 10 },
  { posicion: 11-50, val: 500, evo: 5 }
];
```

---

### ⚖️ Balance y Fairness

**Prevención de Abuso:**
- ✅ Límite de 20 partidas ranked por día
- ✅ No se puede desafiar al mismo jugador más de 3 veces al día
- ✅ Apuestas de VAL solo en duelos amistosos (no ranked)
- ✅ Penalización por desconexión (-50 ELO)
- ✅ Sistema de reportes para comportamiento tóxico

**Ventajas del Sistema:**
- 🎮 Contenido infinito (jugadores siempre diferentes)
- 🏆 Competitividad sana
- 💰 No afecta economía principal (sin apuestas ranked)
- 📊 Métricas claras de progreso (ELO)

---

## 2️⃣ SISTEMA DE GREMIOS / CLANES

### 🎯 Concepto

Los jugadores pueden **crear o unirse a gremios** para cooperar, competir y obtener beneficios grupales.

### 🏰 Funcionalidades

#### Creación de Gremio

```typescript
// Modelo: Guild
export interface IGuild extends Document {
  nombre: string;                 // "Los Dragones Negros"
  tag: string;                    // [LDN]
  lider: Types.ObjectId;          // Usuario líder
  oficiales: Types.ObjectId[];    // Hasta 3 oficiales
  miembros: Types.ObjectId[];     // Hasta 50 miembros
  
  // Recursos del gremio
  tesoro_val: number;             // VAL acumulado
  nivel: number;                  // 1-20
  experiencia: number;            // Para subir nivel
  
  // Stats
  victorias_guerra: number;
  derrotas_guerra: number;
  ranking_global: number;
  
  // Personalización
  escudo_icono?: string;
  color_primario?: string;
  lema?: string;
  
  // Configuración
  requisito_nivel_minimo: number;
  abierto: boolean;               // Entrada libre o aprobación
  
  fechaCreacion: Date;
}
```

#### Beneficios de Gremio

```typescript
// Bonos por nivel de gremio
const bonosGremio = {
  nivel_5: { bonus_exp: +5%, bonus_val: +5% },
  nivel_10: { bonus_exp: +10%, bonus_val: +10%, slots_inventario: +10 },
  nivel_15: { bonus_exp: +15%, bonus_val: +15%, descuento_shop: -10% },
  nivel_20: { bonus_exp: +20%, bonus_val: +20%, personaje_exclusivo: true }
};
```

#### Eventos de Gremio

**Guerra de Gremios:**
```
Gremio A vs Gremio B
- Duración: 3 días
- Objetivos: Acumular puntos
  ├─ Victorias en mazmorras: +10 pts
  ├─ Victorias PvP: +15 pts
  └─ Eventos especiales: +50 pts
- Ganador: Gremio con más puntos
- Premios: VAL para el tesoro, EXP de gremio
```

**Mazmorras de Gremio:**
```
Mazmorra especial para 5-10 jugadores
- Requiere coordinación
- Recompensas multiplicadas x2
- Solo disponible para gremios nivel 5+
```

#### Endpoints

```typescript
// Crear gremio
POST /api/guilds/crear
Body: { nombre, tag, requisito_nivel }
Costo: 5,000 VAL

// Unirse a gremio
POST /api/guilds/:id/unirse

// Donar VAL al tesoro
POST /api/guilds/donar
Body: { cantidad_val: 500 }

// Iniciar guerra
POST /api/guilds/guerra/:guildIdEnemigo
Costo: 1,000 VAL del tesoro

// Ver ranking de gremios
GET /api/guilds/ranking?limit=100

// Chat de gremio (WebSocket)
socket.emit('guild:message', { mensaje: "¡Hola a todos!" })
```

---

## 3️⃣ ARENA Y TORNEOS

### 🎯 Concepto

Eventos competitivos con **bracket de eliminación** y premios grandes.

### 🏆 Tipos de Torneos

#### Torneo Semanal

```
- Inscripción: Lunes a Viernes
- Costo entrada: 1,000 VAL o 10 Boletos
- Formato: Single elimination (32 jugadores)
- Partidas: Sábado y Domingo
- Premios:
  🥇 Campeón: 20,000 VAL + 50 EVO + Personaje Exclusivo
  🥈 Finalista: 10,000 VAL + 25 EVO
  🥉 Semifinales: 5,000 VAL + 10 EVO
```

#### Torneo Mensual

```
- Inscripción: Todo el mes
- Clasificación: Top 64 del ranking PvP
- Formato: Double elimination
- Premios masivos (100,000 VAL total pool)
```

#### Modelo de Datos

```typescript
export interface ITournament extends Document {
  nombre: string;                 // "Torneo Semanal Noviembre"
  tipo: 'semanal' | 'mensual' | 'especial';
  
  participantes: {
    userId: Types.ObjectId;
    seed: number;                 // Posición en bracket
    estado: 'activo' | 'eliminado';
  }[];
  
  bracket: {
    ronda: number;                // 1 (Round 32), 2 (Round 16), etc.
    matches: Types.ObjectId[];    // Referencias a PvPMatch
  }[];
  
  estado: 'inscripcion' | 'en_progreso' | 'finalizado';
  premios: {
    primer_lugar: { val: number; evo: number; personajes?: string[] };
    segundo_lugar: { val: number; evo: number };
    tercer_lugar: { val: number; evo: number };
  };
  
  costo_entrada: { val?: number; boletos?: number };
  fecha_inicio: Date;
  fecha_fin: Date;
}
```

---

## 4️⃣ MISIONES DIARIAS

### 🎯 Concepto

Tareas diarias que otorgan **recompensas al completarse**.

### 📋 Tipos de Misiones

```typescript
const misionesDiarias = [
  {
    id: 'victoria_3_mazmorras',
    titulo: 'Gana 3 mazmorras',
    descripcion: 'Completa 3 mazmorras victoriosamente',
    progreso: '0/3',
    recompensa: { val: 200, exp: 100 }
  },
  {
    id: 'usar_5_consumibles',
    titulo: 'Usa 5 consumibles',
    progreso: '0/5',
    recompensa: { val: 150, boletos: 2 }
  },
  {
    id: 'vender_marketplace',
    titulo: 'Vende un item en el marketplace',
    progreso: '0/1',
    recompensa: { val: 300 }
  },
  {
    id: 'pvp_2_victorias',
    titulo: 'Gana 2 combates PvP',
    progreso: '0/2',
    recompensa: { val: 250, evo: 2 }
  },
  {
    id: 'evolucionar_personaje',
    titulo: 'Evoluciona un personaje',
    progreso: '0/1',
    recompensa: { val: 500, evo: 5 }
  }
];
```

### 🎁 Recompensas

**Completar todas las misiones diarias:**
```
Bonus: +500 VAL + 10 Boletos + 1 Cofre de Misiones
```

**Racha de misiones:**
```
7 días consecutivos: +1,000 VAL + Título "Dedicado"
30 días consecutivos: +5,000 VAL + Personaje Exclusivo
```

---

## 5️⃣ SISTEMA DE LOGROS

### 🎯 Concepto

**Objetivos a largo plazo** que otorgan recompensas permanentes y títulos.

### 🏅 Categorías

#### Exploración
```
- Completa 10 mazmorras diferentes
- Alcanza nivel 20 en una mazmorra
- Derrota 1,000 enemigos totales
```

#### Coleccionista
```
- Obtén 50 personajes únicos
- Obtén un personaje SSS
- Colecciona 100 equipamientos diferentes
```

#### Combate
```
- Gana 100 combates PvP
- Gana una batalla sin recibir daño
- Derrota un boss en menos de 60 segundos
```

#### Economía
```
- Acumula 100,000 VAL (histórico)
- Realiza 50 transacciones en marketplace
- Gana 10,000 VAL en un solo día
```

### 📊 Modelo de Datos

```typescript
export interface IAchievement extends Document {
  id: string;                     // 'obtener_50_personajes'
  titulo: string;                 // "Maestro Coleccionista"
  descripcion: string;
  categoria: 'exploracion' | 'coleccionista' | 'combate' | 'economia';
  
  // Progreso
  objetivo: number;               // 50
  tipo_contador: string;          // 'personajes_unicos'
  
  // Recompensas
  recompensa: {
    val?: number;
    evo?: number;
    boletos?: number;
    titulo?: string;
    icono_perfil?: string;
  };
  
  // Rareza
  rareza: 'comun' | 'raro' | 'epico' | 'legendario';
  puntos_logro: number;           // Para ranking de logros
  
  oculto: boolean;                // Logro secreto
}
```

---

## 6️⃣ EVENTOS TEMPORALES

### 🎯 Concepto

**Eventos limitados** con mecánicas únicas y recompensas exclusivas.

### 🎪 Tipos de Eventos

#### Evento de Boss Raid

```
Duración: 1 semana
Mecánica:
- Boss global con 1,000,000 HP
- Todos los jugadores atacan al mismo boss
- Contribución individual registrada
- Recompensas según daño hecho

Premios:
- Top 1: Personaje exclusivo SSS
- Top 10: 10,000 VAL + 50 EVO
- Top 100: 5,000 VAL + 20 EVO
- Todos los participantes: Título del evento
```

#### Evento de Drop Rate x2

```
Duración: 48 horas (fin de semana)
Mecánica:
- Probabilidad de drops duplicada en todas las mazmorras
- Items exclusivos disponibles temporalmente
- EXP x1.5
```

#### Evento de Cosecha

```
Duración: 3 días
Mecánica:
- Aparecen "Slimes de Oro" en mazmorras aleatorias
- Derrotarlos da 5x VAL normal
- Spawn rate: 10%
```

---

## 7️⃣ MAZMORRAS COOPERATIVAS

### 🎯 Concepto

Mazmorras más difíciles que requieren **2-4 jugadores trabajando juntos**.

### 🤝 Mecánicas

#### Sala de Espera

```typescript
// Crear sala coop
POST /api/dungeons/coop/crear
Body: { dungeonId, max_jugadores: 4 }
Response: { salaId, codigo_invitacion: "ABC123" }

// Unirse a sala
POST /api/dungeons/coop/unirse
Body: { codigo: "ABC123" }

// Iniciar cuando todos estén listos
POST /api/dungeons/coop/:salaId/iniciar
```

#### Roles de Equipo

```
- Tanque: +50% DEF, -20% ATK
- DPS: +50% ATK, -20% DEF
- Support: +30% curación, -10% stats
- Balanced: Sin modificadores
```

#### Recompensas

```
Recompensas base x1.5
Bonus por coordinación:
- Ningún personaje muerto: +50% VAL
- Tiempo record: +100% EXP
- Sin usar consumibles: +25% todo
```

---

## 8️⃣ BATTLE PASS / PASE DE TEMPORADA

### 🎯 Concepto

Sistema de **progresión con niveles** que otorga recompensas.

### 📊 Estructura

```
Temporada: 3 meses
Niveles: 50
Progreso: Experiencia de Pase (BP XP)

Gratis vs Premium:
┌─────────────┬──────────────┬─────────────┐
│ Nivel       │ Gratis       │ Premium     │
├─────────────┼──────────────┼─────────────┤
│ 1           │ 100 VAL      │ 500 VAL     │
│ 5           │ 5 Boletos    │ 15 Boletos  │
│ 10          │ -            │ Personaje C │
│ 15          │ 1 EVO        │ 10 EVO      │
│ 20          │ -            │ Skin exclusivo
│ 25          │ 500 VAL      │ 2,000 VAL   │
│ 30          │ -            │ Personaje B │
│ 50 (final)  │ 1,000 VAL    │ Personaje S │
└─────────────┴──────────────┴─────────────┘

Costo Premium: $9.99 o 20,000 VAL
```

### 🎮 Obtener BP XP

```
- Victoria en mazmorra: +50 BP XP
- Victoria PvP: +75 BP XP
- Misión diaria completada: +100 BP XP
- Venta en marketplace: +25 BP XP
- Login diario: +50 BP XP
```

---

## 9️⃣ PERSONALIZACIÓN DE PERSONAJES

### 🎯 Concepto

Los jugadores pueden **customizar la apariencia** de sus personajes.

### 🎨 Opciones

#### Skins (Apariencia)

```typescript
export interface ISkin extends Document {
  nombre: string;                 // "Armadura de Dragón"
  personaje_base: string;         // "base_a_001"
  rareza: 'comun' | 'raro' | 'epico' | 'legendario';
  
  // Obtención
  obtenible_por: 'compra' | 'evento' | 'logro' | 'battle_pass';
  precio_val?: number;
  
  // Visual
  imagen_url: string;
  animaciones_especiales: boolean;
  
  // Exclusividad
  limitado: boolean;
  fecha_disponibilidad?: Date;
}
```

#### Emotes y Gestos

```
- Victoria Dance
- Taunt
- Saludo
- GG (Good Game)
```

#### Marcos de Perfil

```
- Marco de Campeón (oro)
- Marco de Veterano (plateado)
- Marco de Evento (temático)
```

---

## 🔟 COMERCIO DIRECTO

### 🎯 Concepto

Los jugadores pueden **enviar regalos o tradear** directamente.

### 🤝 Mecánicas

#### Ventana de Trade

```typescript
// Iniciar trade
POST /api/trade/iniciar
Body: { target_userId }

// Añadir item a trade
POST /api/trade/:tradeId/añadir
Body: { type: 'personaje' | 'equipamiento', itemId }

// Añadir VAL a trade
POST /api/trade/:tradeId/añadir-val
Body: { cantidad: 500 }

// Aceptar trade
POST /api/trade/:tradeId/aceptar

// Sistema de confirmación:
1. Jugador A propone items
2. Jugador B propone items
3. Ambos deben aceptar
4. Confirmación de seguridad (escribir "CONFIRMAR")
5. Trade ejecutado
```

#### Restricciones

```
- Solo entre amigos (lista de amigos)
- Máximo 3 trades por día
- No se puede tradear items equipados
- Items con más de 100,000 VAL requieren fee 5%
- Personajes SSS no tradeables
```

---

## 📊 PRIORIZACIÓN DE FUNCIONALIDADES

### 🔴 ALTA PRIORIDAD (Implementar Primero)

| Funcionalidad | Tiempo Estimado | Valor para Jugadores |
|---------------|-----------------|---------------------|
| **PvP 1v1** | 2 semanas | ⭐⭐⭐⭐⭐ Contenido infinito |
| **Misiones Diarias** | 1 semana | ⭐⭐⭐⭐⭐ Retención diaria |
| **Sistema de Logros** | 1 semana | ⭐⭐⭐⭐ Metas a largo plazo |

### 🟡 MEDIA PRIORIDAD (Próximos 2-3 Meses)

| Funcionalidad | Tiempo Estimado | Valor para Jugadores |
|---------------|-----------------|---------------------|
| **Gremios** | 3 semanas | ⭐⭐⭐⭐ Aspecto social |
| **Eventos Temporales** | 1 semana | ⭐⭐⭐⭐ Engagement |
| **Arena/Torneos** | 2 semanas | ⭐⭐⭐ Competitividad |

### 🟢 BAJA PRIORIDAD (Futuro)

| Funcionalidad | Tiempo Estimado | Valor para Jugadores |
|---------------|-----------------|---------------------|
| **Battle Pass** | 2 semanas | ⭐⭐⭐ Monetización |
| **Mazmorras Coop** | 2 semanas | ⭐⭐⭐ Cooperación |
| **Personalización** | 1 semana | ⭐⭐ Estético |
| **Comercio Directo** | 1 semana | ⭐⭐ Conveniencia |

---

## 🚀 PLAN DE ROADMAP SUGERIDO

### **Fase 1: Competitividad (Mes 1-2)**
1. ✅ Sistema de Ranking (ya implementado parcialmente)
2. 🆕 PvP 1v1
3. 🆕 Ranking PvP separado
4. 🆕 Premios mensuales de ranking

### **Fase 2: Engagement Diario (Mes 3)**
1. 🆕 Misiones Diarias
2. 🆕 Sistema de Logros
3. 🆕 Eventos temporales básicos (Drop x2, VAL x2)

### **Fase 3: Social (Mes 4-5)**
1. 🆕 Sistema de Gremios
2. 🆕 Chat de gremio
3. 🆕 Guerra de gremios
4. 🆕 Lista de amigos

### **Fase 4: Competitivo Avanzado (Mes 6)**
1. 🆕 Arena y Torneos
2. 🆕 PvP 3v3
3. 🆕 Ranking de gremios

### **Fase 5: Monetización (Mes 7-8)**
1. 🆕 Battle Pass
2. 🆕 Skins y personalización
3. 🆕 Paquetes premium

---

## 💡 RECOMENDACIÓN FINAL

### **Empezar por: PvP 1v1 + Misiones Diarias**

**Razones:**
1. **PvP** = Contenido infinito sin crear nuevas mazmorras
2. **Misiones** = Incentivo para login diario (retención)
3. **Implementación rápida** = 2-3 semanas para ambos
4. **Alto impacto** = Aumenta tiempo de juego promedio

**Siguiente paso natural:**
- Sistema de Logros (aprovecha datos de PvP y misiones)
- Premios mensuales de ranking (incentivo competitivo)

---

**Última actualización:** 3 de noviembre de 2025  
**Documento vivo:** Se actualizará según prioridades del equipo
