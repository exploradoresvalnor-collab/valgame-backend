# 🏰 DISEÑO VISUAL: MAZMORRAS Y COMBATE

> Diseño completo del sistema de mazmorras con niveles progresivos, combate por turnos y sistema de recompensas

---

## 📋 Contenido

1. [Pantalla de Selección de Mazmorra](#pantalla-de-selección-de-mazmorra)
2. [Pantalla de Preparación (Pre-Combate)](#pantalla-de-preparación-pre-combate)
3. [Pantalla de Combate (Durante Batalla)](#pantalla-de-combate-durante-batalla)
4. [Pantalla de Resultados (Post-Combate)](#pantalla-de-resultados-post-combate)
5. [Sistema de Progresión Visual](#sistema-de-progresión-visual)
6. [Flujo Completo de Usuario](#flujo-completo-de-usuario)

---

## 🎮 PANTALLA DE SELECCIÓN DE MAZMORRA

### Layout Principal

```
┌─────────────────────────────────────────────────────────────────┐
│  [← Volver]              🏰 MAZMORRAS                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📊 TUS ESTADÍSTICAS GLOBALES                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 🔥 Racha actual: 5 victorias  │  ⭐ Mejor racha: 12      │  │
│  │ ✅ Total victorias: 45         │  ❌ Total derrotas: 8   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                  │
│  MAZMORRAS DISPONIBLES                                          │
│                                                                  │
│  ┌─────────────────────────────┐  ┌──────────────────────────┐ │
│  │  🏰 GUARIDA DEL SAPO        │  │  🌋 VOLCÁN OSCURO        │ │
│  │  ════════════════════════    │  │  ═══════════════════     │ │
│  │                              │  │                          │ │
│  │  [Imagen de la mazmorra]    │  │  [Imagen volcán]         │ │
│  │                              │  │                          │ │
│  │  📝 "Primera mazmorra..."   │  │  📝 "Calor extremo..."   │ │
│  │                              │  │                          │ │
│  │  ┌──────────────────────┐   │  │  ┌──────────────────┐   │ │
│  │  │ 🎯 TU PROGRESO       │   │  │  │ 🔒 BLOQUEADA     │   │ │
│  │  │ ▓▓▓▓▓▓▓░░░ Nv 12    │   │  │  │                  │   │ │
│  │  │ 450/500 pts          │   │  │  │ Nivel 10 req.    │   │ │
│  │  │ 23 victorias         │   │  │  │                  │   │ │
│  │  │ 3 derrotas           │   │  │  │ Tu nivel: 8      │   │ │
│  │  └──────────────────────┘   │  │  └──────────────────┘   │ │
│  │                              │  │                          │ │
│  │  📊 STATS BASE (Nivel 12)   │  │  📊 STATS BASE (Nv 1)   │ │
│  │  💪 Vida: 1200              │  │  💪 Vida: ???           │ │
│  │  ⚔️ Ataque: 180             │  │  ⚔️ Ataque: ???         │ │
│  │  🛡️ Defensa: 140            │  │  🛡️ Defensa: ???        │ │
│  │                              │  │                          │ │
│  │  🎁 RECOMPENSAS (Nv 12)     │  │  🎁 RECOMPENSAS         │ │
│  │  💎 VAL: 120-180            │  │  🔒 Desbloqueadas       │ │
│  │  ⭐ EXP: 550                │  │     al alcanzar nivel   │ │
│  │  📦 Drop rate: 18%          │  │                          │ │
│  │                              │  │                          │ │
│  │  🏆 DROPS EXCLUSIVOS        │  │  [Ver Requisitos]       │ │
│  │  Desbloqueados (Nv 20+)     │  │                          │ │
│  │  🗡️ Espada del Sapo (2%)   │  │                          │ │
│  │  🛡️ Escudo Pantano (1.5%)  │  │                          │ │
│  │                              │  │                          │ │
│  │  ⏱️ Mejor tiempo: 38s       │  │                          │ │
│  │                              │  │                          │ │
│  │  [⚔️ ENTRAR A COMBATE]     │  │  [🔒 BLOQUEADA]         │ │
│  └─────────────────────────────┘  └──────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────┐  ┌──────────────────────────┐ │
│  │  ⛰️ CUEVA CRISTALINA        │  │  🏛️ TEMPLO ANTIGUO      │ │
│  │  [Más mazmorras...]         │  │  [Próximamente...]       │ │
│  └─────────────────────────────┘  └──────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Componentes de la Tarjeta de Mazmorra

#### 1. Header con Nombre e Imagen
```typescript
// Datos desde API
GET /api/dungeons

interface DungeonCard {
  _id: string;
  nombre: string;
  descripcion: string;
  nivel_requerido_minimo: number;
  imagen: string; // URL de la imagen
}
```

#### 2. Panel de Progreso Personal
```typescript
// Datos desde API
GET /api/dungeons/:id/progress

interface UserProgress {
  progreso: {
    victorias: number;
    derrotas: number;
    nivel_actual: number; // 🔥 IMPORTANTE: Nivel del usuario en esta mazmorra
    puntos_acumulados: number;
    puntos_requeridos_siguiente_nivel: number;
    mejor_tiempo: number; // en segundos
    ultima_victoria: Date;
  };
  estadisticas_globales: {
    racha_actual: number;
    racha_maxima: number;
    total_victorias: number;
    total_derrotas: number;
  };
}
```

#### 3. Stats Escaladas por Nivel
```typescript
// Los stats cambian según el nivel del usuario en esta mazmorra
// Fórmula: stat_base * (1 + nivel_actual * multiplicador)

Ejemplo con nivel_actual = 12:
- Vida base: 500 → 500 * (1 + 12 * 0.15) = 1,400 HP
- Ataque base: 80 → 80 * (1 + 12 * 0.15) = 224 ATK
- Defensa base: 60 → 60 * (1 + 12 * 0.15) = 168 DEF

Mostrar:
"Stats de Mazmorra (Nivel 12)"
💪 Vida: 1,400
⚔️ Ataque: 224
🛡️ Defensa: 168
```

#### 4. Recompensas Escaladas
```typescript
// Las recompensas también escalan con el nivel
Ejemplo con nivel_actual = 12:
- VAL base: 50 → 50 * (1 + 12 * 0.10) = 110 VAL
- EXP base: 300 → 300 * (1 + 12 * 0.10) = 660 EXP
- Drop rate: 10% → 10% * (1 + 12 * 0.05) = 16% (cap 20%)

Mostrar:
"Recompensas (Nivel 12)"
💎 VAL: ~110 (varía por desempeño)
⭐ EXP: 660
📦 Drop rate: 16%
```

#### 5. Drops Exclusivos (Nivel 20+)
```typescript
// Solo se muestran si nivel_actual >= nivel_minimo_para_exclusivos (default 20)

if (nivel_actual >= 20) {
  mostrar_seccion_exclusivos: true;
  items: [
    { nombre: "Espada del Sapo", probabilidad: 2%, tipo: "Equipment" },
    { nombre: "Escudo Pantano", probabilidad: 1.5%, tipo: "Equipment" }
  ]
}

Mostrar:
"🏆 DROPS EXCLUSIVOS DESBLOQUEADOS"
🗡️ Espada del Sapo (2%)
🛡️ Escudo Pantano (1.5%)
💊 Poción Venenosa (3%)
```

### Estados Visuales de Mazmorras

#### Mazmorra Desbloqueada y Disponible
```
┌─────────────────────────────┐
│  🏰 GUARIDA DEL SAPO        │
│  ════════════════════════    │
│  [Imagen brillante]          │
│  🟢 DISPONIBLE               │
│  [⚔️ ENTRAR A COMBATE]      │
└─────────────────────────────┘
```

#### Mazmorra Bloqueada
```
┌─────────────────────────────┐
│  🌋 VOLCÁN OSCURO            │
│  ════════════════════════    │
│  [Imagen en escala de grises]│
│  🔒 NIVEL 10 REQUERIDO       │
│  Tu mejor personaje: Nv 8    │
│  [Ver Requisitos]            │
└─────────────────────────────┘
```

#### Mazmorra en Racha
```
┌─────────────────────────────┐
│  🏰 GUARIDA DEL SAPO        │
│  🔥🔥🔥 RACHA: 5 VICTORIAS   │
│  [Borde dorado animado]      │
│  +25% bonus pts siguiente!   │
│  [⚔️ CONTINUAR RACHA]       │
└─────────────────────────────┘
```

---

## ⚔️ PANTALLA DE PREPARACIÓN (PRE-COMBATE)

### Layout de Preparación

```
┌─────────────────────────────────────────────────────────────────┐
│  [← Volver]         PREPARACIÓN: GUARIDA DEL SAPO               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────┐  ┌──────────────────────────┐  │
│  │  📊 DESAFÍO                │  │  👥 TU EQUIPO            │  │
│  │  ══════════════            │  │  ════════════            │  │
│  │                            │  │                          │  │
│  │  🏰 Nivel Mazmorra: 12    │  │  Selecciona hasta 3      │  │
│  │                            │  │  personajes:             │  │
│  │  💪 Vida: 1,400           │  │                          │  │
│  │  ⚔️ Ataque: 224           │  │  ┌────────────────────┐ │  │
│  │  🛡️ Defensa: 168          │  │  │ SLOT 1             │ │  │
│  │                            │  │  │ ┌──────────────┐   │ │  │
│  │  ⚠️ Probabilidades:       │  │  │ │ [IMG]        │   │ │  │
│  │  • Fallo ataque: 15%      │  │  │ │ Héroe Épico  │   │ │  │
│  │  • Fallo defensa: 25%     │  │  │ │ Nv 25 | S    │   │ │  │
│  │                            │  │  │ │ ❤️ 100% HP   │   │ │  │
│  │  🎁 Recompensas:          │  │  │ │ ATK: 250     │   │ │  │
│  │  • VAL: ~110              │  │  │ │ DEF: 180     │   │ │  │
│  │  • EXP: 660               │  │  │ └──────────────┘   │ │  │
│  │  • Drop: 16%              │  │  │                    │ │  │
│  │                            │  │  │ [⚡ Buffs: +20% ATK]│  │
│  │  ⏱️ Tiempo estimado: 45s  │  │  │ [Cambiar]          │ │  │
│  │                            │  │  └────────────────────┘ │  │
│  │  🏆 Drops exclusivos:     │  │                          │  │
│  │  🗡️ Espada Sapo (2%)     │  │  ┌────────────────────┐ │  │
│  │  🛡️ Escudo (1.5%)        │  │  │ SLOT 2             │ │  │
│  │                            │  │  │ [Personaje 2]      │ │  │
│  └────────────────────────────┘  │  └────────────────────┘ │  │
│                                   │                          │  │
│  ┌────────────────────────────┐  │  ┌────────────────────┐ │  │
│  │  📈 PREDICCIÓN             │  │  │ SLOT 3             │ │  │
│  │  ══════════════            │  │  │ [+ Agregar]        │ │  │
│  │                            │  │  └────────────────────┘ │  │
│  │  Tu poder total:          │  │                          │  │
│  │  ⚔️ ATK: 520 (3 chars)   │  │  Estadísticas equipo:    │  │
│  │  🛡️ DEF: 380 (3 chars)   │  │  ⚔️ ATK total: 520      │  │
│  │                            │  │  🛡️ DEF total: 380      │  │
│  │  ⚖️ Balance: FAVORABLE    │  │  ❤️ HP total: 3,200     │  │
│  │  💚💚💚💚💚 85% Victoria │  │                          │  │
│  │                            │  │  💡 Recomendación:       │  │
│  │  ⏱️ Duración estimada:    │  │  ✅ Equipo balanceado   │  │
│  │     ~38-52 segundos       │  │  ✅ Buen nivel          │  │
│  │                            │  │                          │  │
│  │  💰 Potencial ganancia:   │  │                          │  │
│  │     +120 VAL              │  │                          │  │
│  │     +660 EXP por char     │  │                          │  │
│  │                            │  │                          │  │
│  └────────────────────────────┘  └──────────────────────────┘  │
│                                                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                  │
│  ⚠️ ADVERTENCIA: Si tus personajes son derrotados, quedarán    │
│     HERIDOS por 24 horas. Usa pociones o paga VAL para curar.  │
│                                                                  │
│  [❌ Cancelar]                              [⚔️ INICIAR COMBATE]│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Selección de Personajes

#### Buscador de Personajes
```
┌──────────────────────────────────────────────┐
│  🔍 Buscar personaje...                      │
│                                              │
│  Filtros: [Rango ▼] [Nivel ▼] [Estado ▼]   │
│                                              │
│  ┌────────┐ ┌────────┐ ┌────────┐           │
│  │ [IMG]  │ │ [IMG]  │ │ [IMG]  │           │
│  │ Héroe A│ │ Mago B │ │ Tank C │           │
│  │ Nv 25  │ │ Nv 18  │ │ Nv 15  │           │
│  │ S      │ │ A      │ │ B      │           │
│  │ ❤️ 100%│ │ ❤️ 80% │ │ ❤️ 100%│           │
│  │        │ │        │ │        │           │
│  │[Agregar]│ │[Agregar]│ │[Agregar]│         │
│  └────────┘ └────────┘ └────────┘           │
└──────────────────────────────────────────────┘
```

#### Personaje No Disponible
```
┌────────┐
│ [IMG]  │
│ Héroe D│
│ Nv 10  │
│ C      │
│ ❤️ 0%  │ ← HERIDO
│ 🚫     │
│ 8h     │ ← Tiempo restante
└────────┘
```

### Predicción de Combate

```typescript
// Cálculo de probabilidad de victoria
function calcularPrediccion(equipoStats, mazmorraStats) {
  const atkRatio = equipoStats.atk / mazmorraStats.defensa;
  const defRatio = equipoStats.def / mazmorraStats.ataque;
  const hpRatio = equipoStats.hp / mazmorraStats.vida;
  
  const score = (atkRatio * 0.4 + defRatio * 0.3 + hpRatio * 0.3) * 100;
  
  return {
    probabilidad: Math.min(95, Math.max(5, score)),
    categoria: score > 70 ? 'FAVORABLE' : score > 40 ? 'EQUILIBRADO' : 'DIFÍCIL',
    color: score > 70 ? 'verde' : score > 40 ? 'amarillo' : 'rojo'
  };
}

// Mostrar:
⚖️ Balance: FAVORABLE
💚💚💚💚💚 85% Victoria
```

---

## 💥 PANTALLA DE COMBATE (DURANTE BATALLA)

### Vista de Combate Principal

```
┌─────────────────────────────────────────────────────────────────┐
│                    🏰 GUARIDA DEL SAPO - NIVEL 12               │
│                         Turno 4 de combate                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    🏰 MAZMORRA                              │ │
│  │                                                              │ │
│  │              [IMAGEN ANIMADA DE LA MAZMORRA]                │ │
│  │                                                              │ │
│  │           💀 NIVEL 12 - GUARIDA DEL SAPO 💀                 │ │
│  │                                                              │ │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │ │
│  │  ❤️ VIDA: ▓▓▓▓▓▓▓▓▓░░░░░░░░░░ 850 / 1,400 (61%)          │ │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │ │
│  │                                                              │ │
│  │  ⚔️ ATK: 224  │  🛡️ DEF: 168  │  💥 Último daño: 95       │ │
│  │                                                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                            VS                                    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    👥 TU EQUIPO                             │ │
│  │                                                              │ │
│  │  ┌────────────┐    ┌────────────┐    ┌────────────┐        │ │
│  │  │ [IMG]      │    │ [IMG]      │    │ [IMG]      │        │ │
│  │  │ Héroe A    │    │ Mago B     │    │ Tank C     │        │ │
│  │  │            │    │            │    │            │        │ │
│  │  │ Nv 25 │ S  │    │ Nv 18 │ A  │    │ Nv 15 │ B  │        │ │
│  │  │            │    │            │    │            │        │ │
│  │  │ ❤️ HP      │    │ ❤️ HP      │    │ ❤️ HP      │        │ │
│  │  │ ▓▓▓▓▓▓▓▓░░ │    │ ▓▓▓▓▓▓░░░░ │    │ ▓▓▓▓▓▓▓▓▓▓ │        │ │
│  │  │ 900/1000   │    │ 600/900    │    │ 1300/1300  │        │ │
│  │  │ (90%)      │    │ (67%)      │    │ (100%)     │        │ │
│  │  │            │    │            │    │            │        │ │
│  │  │ ⚡ +20% ATK│    │ 🔥 Atacando│    │ 🛡️ Defendió│        │ │
│  │  └────────────┘    └────────────┘    └────────────┘        │ │
│  │                                                              │ │
│  │  ⚔️ ATK Total: 520  │  🛡️ DEF Total: 380                   │ │
│  │                                                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                  │
│  📜 LOG DE COMBATE (últimos 5 eventos):                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ ⚔️ Turno 4: Tu equipo ataca y causa 95 de daño             │ │
│  │ 🛡️ Turno 3: La mazmorra ataca por 45 de daño (repartido)  │ │
│  │ ⚔️ Turno 2: Tu equipo ataca y causa 102 de daño            │ │
│  │ ❌ Turno 1: ¡La mazmorra falló su ataque!                  │ │
│  │ ⚔️ Turno 0: ¡Combate iniciado!                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ⏱️ Tiempo: 00:38  │  🎯 Turnos: 4  │  🔥 Racha: 5 victorias   │
│                                                                  │
│  [⏸️ Pausar] [⏩ Acelerar 2x]                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Animaciones de Combate

#### Turno del Jugador - Ataque Exitoso
```
┌────────────────────────────────────┐
│  ⚔️ TU EQUIPO ATACA                │
│                                     │
│  [Animación: Personajes brillan]   │
│  [Efecto: Líneas de ataque →→→]   │
│                                     │
│  💥 ¡HIT! 95 de daño                │
│  Vida mazmorra: 1400 → 1305         │
│                                     │
│  [Sonido: slash.mp3]                │
└────────────────────────────────────┘
```

#### Turno del Jugador - Fallo
```
┌────────────────────────────────────┐
│  ⚔️ TU EQUIPO ATACA                │
│                                     │
│  [Animación: Movimiento de ataque] │
│                                     │
│  ❌ ¡FALLO! (15% probabilidad)      │
│  El ataque no conectó               │
│                                     │
│  [Sonido: miss.mp3]                 │
└────────────────────────────────────┘
```

#### Turno de la Mazmorra - Ataque
```
┌────────────────────────────────────┐
│  🏰 LA MAZMORRA CONTRAATACA         │
│                                     │
│  [Animación: Mazmorra tiembla]     │
│  [Efecto: Onda de choque]          │
│                                     │
│  💥 45 de daño repartido:           │
│  • Héroe A: -15 HP (900 → 885)     │
│  • Mago B: -15 HP (600 → 585)      │
│  • Tank C: -15 HP (1300 → 1285)    │
│                                     │
│  [Sonido: impact.mp3]               │
└────────────────────────────────────┘
```

### Estados de Personajes Durante Combate

#### Personaje Sano (>70% HP)
```
┌────────────┐
│ [IMG]      │
│ Héroe A    │
│ ❤️ HP      │
│ ▓▓▓▓▓▓▓▓░░ │ ← Barra verde
│ 900/1000   │
│ 🟢 (90%)   │
└────────────┘
```

#### Personaje Herido (30-70% HP)
```
┌────────────┐
│ [IMG]      │
│ Mago B     │
│ ❤️ HP      │
│ ▓▓▓▓░░░░░░ │ ← Barra amarilla
│ 400/900    │
│ 🟡 (44%)   │
└────────────┘
```

#### Personaje Crítico (<30% HP)
```
┌────────────┐
│ [IMG]      │ ← Borde rojo parpadeante
│ Tank C     │
│ ❤️ HP      │
│ ▓░░░░░░░░░ │ ← Barra roja
│ 120/1300   │
│ 🔴 (9%)    │ ← Número rojo
└────────────┘
```

#### Personaje Derrotado
```
┌────────────┐
│ [IMG B&N]  │ ← Imagen en blanco y negro
│ Héroe A    │
│ 💀 KO      │
│ ░░░░░░░░░░ │ ← Barra vacía gris
│ 0/1000     │
│ ⚰️ CAÍDO   │
└────────────┘
```

---

## 🏆 PANTALLA DE RESULTADOS (POST-COMBATE)

### Victoria

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│                    ✨ ¡¡¡ VICTORIA !!! ✨                       │
│                                                                  │
│              ⭐⭐⭐⭐⭐ PERFECTA ⭐⭐⭐⭐⭐                        │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  📊 ESTADÍSTICAS DE COMBATE                                │ │
│  │  ══════════════════════════════                            │ │
│  │                                                              │ │
│  │  ⏱️ Tiempo total: 38 segundos (⚡ ¡Rápido!)                │ │
│  │  🎯 Turnos: 6                                               │ │
│  │  💪 Salud equipo final: 85% (¡Excelente!)                  │ │
│  │  ⚔️ Daño total causado: 1,400                              │ │
│  │  🛡️ Daño total recibido: 450                               │ │
│  │                                                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  💰 RECOMPENSAS OBTENIDAS                                  │ │
│  │  ════════════════════════                                  │ │
│  │                                                              │ │
│  │  💎 VAL ganado:         +120                               │ │
│  │     • Base (nivel 12):   110                               │ │
│  │     • Bonus tiempo:      +5                                │ │
│  │     • Bonus salud:       +5                                │ │
│  │                                                              │ │
│  │  ⭐ EXPERIENCIA (por personaje):                           │ │
│  │                                                              │ │
│  │     Héroe A (Nv 25):    +660 XP                            │ │
│  │     ━━━━━━━━━━░░░░░░░░  2,500/3,000 → ¡3 más niveles!     │ │
│  │                                                              │ │
│  │     Mago B (Nv 18):     +660 XP  (+20% buff = 792)        │ │
│  │     ━━━━━━━━━━━━━░░░░  1,992/2,200 → ¡1 nivel más!        │ │
│  │                                                              │ │
│  │     Tank C (Nv 15):     +660 XP                            │ │
│  │     ━━━━━━━░░░░░░░░░░  1,360/2,000                        │ │
│  │                                                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  📦 BOTÍN OBTENIDO (Drop rate: 16%)                        │ │
│  │  ════════════════════════════                              │ │
│  │                                                              │ │
│  │  🎉 ¡Conseguiste 2 items!                                   │ │
│  │                                                              │ │
│  │  ┌──────────────────┐    ┌──────────────────┐              │ │
│  │  │ 🗡️               │    │ 💊               │              │ │
│  │  │ Espada del Sapo  │    │ Poción de Vida   │              │ │
│  │  │                  │    │                  │              │ │
│  │  │ ⭐ EXCLUSIVO      │    │ 🟢 Común         │              │ │
│  │  │ ATK +80          │    │ +50 HP           │              │ │
│  │  │                  │    │ 3 usos           │              │ │
│  │  │ [Ver detalles]   │    │ [Ver detalles]   │              │ │
│  │  └──────────────────┘    └──────────────────┘              │ │
│  │                                                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  🎯 PROGRESIÓN DE MAZMORRA                                 │ │
│  │  ══════════════════════════                                │ │
│  │                                                              │ │
│  │  📊 Puntos ganados: +150 pts                               │ │
│  │     • Base (victoria):        100                          │ │
│  │     • Bonus tiempo (38s):     +25                          │ │
│  │     • Bonus salud (85%):      +15                          │ │
│  │     • Bonus racha (5x):       +10                          │ │
│  │                                                              │ │
│  │  🎉 ¡SUBISTE DE NIVEL!                                      │ │
│  │                                                              │ │
│  │  Nivel mazmorra: 12 → 13                                   │ │
│  │  Progreso: ▓▓▓▓▓▓▓▓▓░ 50/550 pts (siguiente nivel)         │ │
│  │                                                              │ │
│  │  ⚡ Próximo desafío:                                        │ │
│  │  • Stats mazmorra +15% más fuertes                         │ │
│  │  • Recompensas +10% mejores                                │ │
│  │  • Drop rate aumenta a 17%                                 │ │
│  │                                                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  🔥 SISTEMA DE RACHA                                       │ │
│  │  ══════════════════                                        │ │
│  │                                                              │ │
│  │  Racha actual: 5 → 6 victorias consecutivas ¡INCREÍBLE!    │ │
│  │  🔥🔥🔥🔥🔥🔥                                              │ │
│  │                                                              │ │
│  │  Mejor racha histórica: 12 victorias                       │ │
│  │                                                              │ │
│  │  💡 Bonus próxima victoria: +15% puntos                    │ │
│  │                                                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  📈 ESTADÍSTICAS GENERALES                                 │ │
│  │  ══════════════════════                                    │ │
│  │                                                              │ │
│  │  Total victorias: 23 → 24                                  │ │
│  │  Total derrotas: 3                                         │ │
│  │  Ratio victoria: 89%                                       │ │
│  │  ⏱️ Mejor tiempo: 35s (🆕 Nuevo récord: 38s)              │ │
│  │                                                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  [🏠 Volver a Mazmorras]         [⚔️ COMBATIR DE NUEVO]       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Derrota

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│                    💀 DERROTA 💀                                │
│                                                                  │
│                Tu equipo ha sido vencido                         │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  ⚰️ ESTADO DE TU EQUIPO                                    │ │
│  │  ═══════════════════════                                   │ │
│  │                                                              │ │
│  │  ┌────────────┐    ┌────────────┐    ┌────────────┐        │ │
│  │  │ [IMG B&N]  │    │ [IMG B&N]  │    │ [IMG B&N]  │        │ │
│  │  │ Héroe A    │    │ Mago B     │    │ Tank C     │        │ │
│  │  │ 💀 HERIDO  │    │ 💀 HERIDO  │    │ 💀 HERIDO  │        │ │
│  │  │            │    │            │    │            │        │ │
│  │  │ ⏱️ 24h     │    │ ⏱️ 24h     │    │ ⏱️ 24h     │        │ │
│  │  │            │    │            │    │            │        │ │
│  │  │ [💊 Curar] │    │ [💊 Curar] │    │ [💊 Curar] │        │ │
│  │  │ 50 VAL     │    │ 50 VAL     │    │ 50 VAL     │        │ │
│  │  └────────────┘    └────────────┘    └────────────┘        │ │
│  │                                                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  ⚠️ CONSECUENCIAS                                          │ │
│  │  ═══════════════                                           │ │
│  │                                                              │ │
│  │  • Tus personajes están HERIDOS por 24 horas               │ │
│  │  • No pueden combatir hasta recuperarse                    │ │
│  │  • Puedes curarlos con pociones o VAL                      │ │
│  │  • Si no se curan en 24h... ⚰️ PERMADEATH ⚰️              │ │
│  │                                                              │ │
│  │  🔥 Racha perdida: 6 → 0 victorias                         │ │
│  │                                                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  💡 RECOMENDACIONES                                        │ │
│  │  ══════════════════                                        │ │
│  │                                                              │ │
│  │  • Mejora tus personajes antes de reintentar               │ │
│  │  • Equipa mejor gear                                       │ │
│  │  • Usa buffs de consumibles                                │ │
│  │  • Intenta con una mazmorra de nivel más bajo              │ │
│  │                                                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  📊 ESTADÍSTICAS                                           │ │
│  │  ═══════════════                                           │ │
│  │                                                              │ │
│  │  ⏱️ Duración: 52 segundos                                  │ │
│  │  🎯 Turnos: 8                                               │ │
│  │  ⚔️ Daño causado: 860                                      │ │
│  │  🛡️ Daño recibido: 3,200 (fatal)                           │ │
│  │                                                              │ │
│  │  Total victorias: 24                                       │ │
│  │  Total derrotas: 3 → 4                                     │ │
│  │  Ratio victoria: 86%                                       │ │
│  │                                                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  [🏠 Volver]  [💊 Curar Equipo (150 VAL)]  [🔄 Ver Repetición] │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 SISTEMA DE PROGRESIÓN VISUAL

### Barra de Progreso de Mazmorra

```
┌────────────────────────────────────────────────────────┐
│  🏰 GUARIDA DEL SAPO - NIVEL 12                        │
│  ══════════════════════════════════                    │
│                                                         │
│  Progreso al siguiente nivel:                          │
│  ▓▓▓▓▓▓▓▓▓░░░░░░░░░░ 450 / 500 pts (90%)             │
│                                                         │
│  🎯 Necesitas 50 pts más para nivel 13                 │
│                                                         │
│  Última victoria: +150 pts                             │
│                                                         │
└────────────────────────────────────────────────────────┘
```

### Escalado de Dificultad Visual

```
NIVEL 1                  NIVEL 10                 NIVEL 20
┌──────────┐            ┌──────────┐            ┌──────────┐
│ 💪 500   │            │ 💪 1,250 │            │ 💪 2,000 │
│ ⚔️ 80    │     →      │ ⚔️ 200   │     →      │ ⚔️ 320   │
│ 🛡️ 60    │            │ 🛡️ 150   │            │ 🛡️ 240   │
│          │            │          │            │          │
│ 💰 50    │            │ 💰 100   │            │ 💰 150   │
│ ⭐ 300   │            │ ⭐ 600   │            │ ⭐ 900   │
│ 📦 10%   │            │ 📦 15%   │            │ 📦 20%   │
└──────────┘            └──────────┘            └──────────┘
  🟢 Fácil                🟡 Normal               🔴 Difícil
```

### Indicador de Drops Exclusivos

```
┌─────────────────────────────────────────────────┐
│  🏆 DROPS EXCLUSIVOS                            │
│  ═════════════════════                          │
│                                                  │
│  ✅ Desbloqueados (Nivel 20+)                   │
│                                                  │
│  ┌────────────┐  ┌────────────┐  ┌───────────┐ │
│  │ 🗡️         │  │ 🛡️         │  │ 💊        │ │
│  │ Espada     │  │ Escudo     │  │ Poción    │ │
│  │ del Sapo   │  │ Pantano    │  │ Venenosa  │ │
│  │            │  │            │  │           │ │
│  │ ATK +80    │  │ DEF +60    │  │ ATK +30%  │ │
│  │            │  │            │  │ 30 min    │ │
│  │ 📊 2%      │  │ 📊 1.5%    │  │ 📊 3%     │ │
│  │ Drop       │  │ Drop       │  │ Drop      │ │
│  └────────────┘  └────────────┘  └───────────┘ │
│                                                  │
│  💡 Probabilidades aumentan con nivel mazmorra  │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## 🎯 FLUJO COMPLETO DE USUARIO

### Paso a Paso con APIs

```
1️⃣ SELECCIÓN DE MAZMORRA
   ┌─────────────────────────────────────┐
   │ GET /api/dungeons                   │
   │ → Lista de mazmorras disponibles    │
   │                                     │
   │ GET /api/dungeons/:id/progress      │
   │ → Progreso personal en cada una     │
   └─────────────────────────────────────┘
   ↓
   Usuario ve tarjetas con:
   • Nivel actual de mazmorra
   • Stats escaladas
   • Recompensas calculadas
   • Drops exclusivos (si nivel 20+)
   • Progreso personal
   
2️⃣ PREPARACIÓN
   ┌─────────────────────────────────────┐
   │ GET /api/users/me                   │
   │ → Personajes disponibles            │
   │                                     │
   │ Filtrar por estado !== 'herido'    │
   └─────────────────────────────────────┘
   ↓
   Usuario selecciona equipo (max 3)
   Frontend calcula:
   • ATK total = Σ(char.stats.atk + equipment + buffs)
   • DEF total = Σ(char.stats.defensa + equipment + buffs)
   • Predicción de victoria

3️⃣ INICIAR COMBATE
   ┌─────────────────────────────────────┐
   │ POST /api/dungeons/:id/start        │
   │ Body: {                             │
   │   team: ['char1', 'char2', 'char3'] │
   │ }                                   │
   └─────────────────────────────────────┘
   ↓
   Backend procesa combate automático
   Devuelve:
   • Resultado (victoria/derrota)
   • Log de combate completo
   • Recompensas obtenidas
   • Progresión de mazmorra
   • Estado final de personajes

4️⃣ MOSTRAR RESULTADOS
   ┌─────────────────────────────────────┐
   │ Response del POST anterior          │
   │ {                                   │
   │   resultado: 'victoria',            │
   │   log: [...],                       │
   │   recompensas: {                    │
   │     expGanada: 1980,                │
   │     valGanado: 120,                 │
   │     botinObtenido: [...]            │
   │   },                                │
   │   progresionMazmorra: {             │
   │     puntosGanados: 150,             │
   │     nivelActual: 13,                │
   │     subiDeNivel: true                │
   │   },                                │
   │   rachaActual: 6,                   │
   │   tiempoCombate: 38                 │
   │ }                                   │
   └─────────────────────────────────────┘
   ↓
   Frontend muestra:
   • Pantalla de victoria/derrota
   • Animación de recompensas
   • Items obtenidos (con animación)
   • Nivel up de personajes
   • Nivel up de mazmorra
   • Actualización de racha

5️⃣ POST-COMBATE
   Si victoria:
   • Usuario puede combatir de nuevo
   • Stats de mazmorra aumentan
   • Mejores recompensas
   
   Si derrota:
   • Personajes HERIDOS por 24h
   • Racha resetea a 0
   • Opción de curar con VAL/pociones
```

---

## 🎨 PALETA DE COLORES PARA MAZMORRAS

```scss
// Niveles de dificultad
$nivel-facil: #4caf50;      // Verde
$nivel-medio: #ff9800;      // Naranja
$nivel-dificil: #f44336;    // Rojo
$nivel-extremo: #9c27b0;    // Púrpura

// Estados de salud
$hp-alto: #4caf50;          // >70% HP verde
$hp-medio: #ff9800;         // 30-70% HP amarillo
$hp-bajo: #f44336;          // <30% HP rojo
$hp-ko: #616161;            // 0% HP gris

// Racha
$racha-1-5: #2196f3;        // Azul
$racha-6-10: #ff9800;       // Naranja
$racha-11-plus: #ffd700;    // Dorado

// Recompensas
$drop-comun: #9e9e9e;       // Gris
$drop-raro: #2196f3;        // Azul
$drop-epico: #9c27b0;       // Púrpura
$drop-exclusivo: #ffd700;   // Dorado

// Resultados
$victoria: #4caf50;
$derrota: #f44336;
```

---

## 💻 COMPONENTES ANGULAR SUGERIDOS

```typescript
// 1. Listado de mazmorras
<app-dungeon-list></app-dungeon-list>

// 2. Tarjeta individual de mazmorra
<app-dungeon-card 
  [dungeon]="dungeon"
  [progress]="userProgress"
  (onEnter)="prepararCombate()">
</app-dungeon-card>

// 3. Pantalla de preparación
<app-dungeon-preparation
  [dungeon]="selectedDungeon"
  [characters]="availableCharacters"
  (onStartCombat)="iniciarCombate($event)">
</app-dungeon-preparation>

// 4. Vista de combate
<app-combat-view
  [combatLog]="log"
  [dungeonStats]="dungeonStats"
  [teamStats]="teamStats">
</app-combat-view>

// 5. Resultados de combate
<app-combat-results
  [result]="combatResult"
  (onContinue)="volverAMazmorras()"
  (onRetry)="reiniciarCombate()">
</app-combat-results>

// 6. Componente de progreso de mazmorra
<app-dungeon-progress-bar
  [currentPoints]="450"
  [requiredPoints]="500"
  [level]="12">
</app-dungeon-progress-bar>

// 7. Indicador de racha
<app-streak-indicator
  [currentStreak]="6"
  [maxStreak]="12">
</app-streak-indicator>
```

---

## 🎮 EXPERIENCIA DE USUARIO

### Momento Épico 1: Subir Nivel de Mazmorra
```
[Animación]
🎉 ¡NIVEL UP! 🎉

MAZMORRA: GUARIDA DEL SAPO
Nivel 12 → 13

[Efecto de luz dorada]
[Sonido: level_up.mp3]

Nuevas stats:
💪 Vida: 1,400 → 1,610 (+15%)
⚔️ Ataque: 224 → 257 (+15%)
🛡️ Defensa: 168 → 193 (+15%)

Mejores recompensas:
💎 VAL: +10%
⭐ EXP: +10%
📦 Drop: 16% → 17%

[Botón: ¡Entendido!]
```

### Momento Épico 2: Drop Exclusivo
```
[Animación de cofre brillante]
🏆 ¡ITEM EXCLUSIVO! 🏆

[Cofre se abre lentamente]
[Luz dorada sale del cofre]
[Zoom a item]

🗡️ ESPADA DEL SAPO
⭐ EXCLUSIVO ⭐

Este item SOLO se obtiene aquí
Probabilidad: 2%

ATK +80
Efecto especial: Veneno al atacar

[Botón: ¡Increíble!]
```

### Momento Épico 3: Racha Legendaria
```
🔥🔥🔥 RACHA LEGENDARIA 🔥🔥🔥

10 VICTORIAS CONSECUTIVAS

[Efecto de fuego animado]
[Pantalla tiembla]

Bonus activos:
• +30% puntos de progreso
• +20% probabilidad de drop
• +15% VAL ganado

¡Sigue así, eres imparable!

[Botón: ¡A por más!]
```

---

**¡Sistema de mazmorras completo y listo para implementar!** ⚔️🏰

Este diseño aprovecha al máximo tu backend con niveles progresivos, sistema de puntos, rachas y drops exclusivos.
