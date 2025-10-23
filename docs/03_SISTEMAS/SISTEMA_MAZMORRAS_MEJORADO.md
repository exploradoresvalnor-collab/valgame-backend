# 🏰 SISTEMA DE MAZMORRAS MEJORADO - PROPUESTAS

## 📊 DROPS ACTUALES POR MAZMORRA

### 🏰 Nivel 1: Cueva de los Goblins (150 HP, 50 XP)
- 🧪 Poción de Vida Menor (50%)
- 🧪 Pan de Campo (40%)
- ⚔️ Daga Oxidada (15%)
- ⚔️ Armadura de Cuero (15%)
- ⚔️ Escudo de Madera (10%)

### 🏰 Nivel 2: Bosque Maldito (400 HP, 150 XP)
- 🧪 Poción de Vida (60%)
- 🧪 Carne Asada (35%)
- 🧪 Pergamino de Sabiduría (20%)
- ⚔️ Espada de Acero (25%)
- ⚔️ Cota de Mallas (25%)
- ⚔️ Espada Flamígera (8%)

### 🏰 Nivel 3: Fortaleza del Caballero Negro (800 HP, 350 XP)
- 🧪 Poción de Vida Mayor (50%)
- 🧪 Festín del Guerrero (30%)
- 🧪 Pergamino de Maestría (15%)
- ⚔️ Armadura de Placas (30%)
- ⚔️ Anillo de Fuerza (20%)
- ⚔️ Katana del Dragón (5%)

### 🏰 Nivel 4: Templo del Dragón Ancestral (1500 HP, 750 XP)
- 🧪 Elixir de Resurrección (40%)
- 🧪 Tomo Ancestral (25%)
- ⚔️ Katana del Dragón (35%)
- ⚔️ Armadura del Guardián (30%)
- ⚔️ Guadaña del Caos (10%)
- 🧪 Fruto del Poder (8%)
- 🧪 Fruto de la Vitalidad (8%)

### 🏰 Nivel 5: Abismo del Caos Eterno (3000 HP, 2000 XP)
- 🧪 Elixir de Resurrección (60%)
- 🧪 Tomo Ancestral (40%)
- ⚔️ Guadaña del Caos (40%)
- ⚔️ Escudo del Titán (35%)
- ⚔️ Anillo del Fénix (20%)
- 🧪 Fruto del Poder (25%)
- 🧪 Fruto de la Vitalidad (25%)
- 🧪 Fruto Divino (3%)

---

## 🎮 PROPUESTAS DE MEJORAS

### 1️⃣ **SISTEMA DE DIFICULTAD PROGRESIVA**

#### Concepto:
Cada mazmorra tiene **niveles de dificultad** que aumentan según las veces que las completes.

#### Implementación:
```javascript
dungeon: {
  nombre: "Cueva de los Goblins",
  dificultades: [
    {
      nivel: 1,        // Normal
      multiplicador_stats: 1.0,
      multiplicador_xp: 1.0,
      multiplicador_val: 1.0,
      multiplicador_drops: 1.0
    },
    {
      nivel: 2,        // Difícil
      multiplicador_stats: 1.5,    // Boss 50% más fuerte
      multiplicador_xp: 1.5,       // +50% XP
      multiplicador_val: 1.5,      // +50% VAL
      multiplicador_drops: 1.2     // +20% probabilidad drops
    },
    {
      nivel: 3,        // Pesadilla
      multiplicador_stats: 2.0,    // Boss 2x más fuerte
      multiplicador_xp: 2.5,       // +150% XP
      multiplicador_val: 3.0,      // +200% VAL
      multiplicador_drops: 1.5     // +50% probabilidad drops
    },
    {
      nivel: 4,        // Infierno
      multiplicador_stats: 3.0,
      multiplicador_xp: 4.0,
      multiplicador_val: 5.0,
      multiplicador_drops: 2.0
    },
    {
      nivel: 5,        // Mítico (Desbloqueado tras 20 victorias)
      multiplicador_stats: 5.0,
      multiplicador_xp: 6.0,
      multiplicador_val: 10.0,
      multiplicador_drops: 3.0,
      items_exclusivos: true       // Drops únicos solo en este nivel
    }
  ]
}
```

#### Ejemplo práctico:
**Cueva de los Goblins - Nivel 1 (Normal):**
- Boss: 150 HP, 15 ATK, 10 DEF
- XP: 50
- VAL: 20

**Cueva de los Goblins - Nivel 5 (Mítico):**
- Boss: 750 HP (150 × 5), 75 ATK, 50 DEF
- XP: 300 (50 × 6)
- VAL: 200 (20 × 10)
- Drop exclusivo: "Colmillo de Goblin Rey" (SSS)

---

### 2️⃣ **RECOMPENSAS DE VAL AUTOMÁTICAS**

#### Concepto:
Cada mazmorra da VAL al completarla, escalando con dificultad.

#### Implementación:
```javascript
recompensas: {
  expBase: 50,
  valBase: 20,              // ← NUEVO: VAL garantizado
  valPorDificultad: 10,     // ← +10 VAL por cada nivel de dificultad
  dropTable: [...]
}
```

#### Tabla de VAL por Mazmorra:
| Mazmorra | Nivel 1 | Nivel 2 | Nivel 3 | Nivel 4 | Nivel 5 |
|----------|---------|---------|---------|---------|---------|
| Cueva Goblins | 20 VAL | 30 VAL | 60 VAL | 100 VAL | 200 VAL |
| Bosque Maldito | 50 VAL | 75 VAL | 150 VAL | 250 VAL | 500 VAL |
| Fortaleza | 100 VAL | 150 VAL | 300 VAL | 500 VAL | 1000 VAL |
| Templo Dragón | 200 VAL | 300 VAL | 600 VAL | 1000 VAL | 2000 VAL |
| Abismo Caos | 500 VAL | 750 VAL | 1500 VAL | 2500 VAL | 5000 VAL |

---

### 3️⃣ **PERSONAJES EXCLUSIVOS DE MAZMORRAS**

#### Concepto:
Algunos personajes **solo se pueden obtener** completando mazmorras específicas.

#### Propuesta de Personajes Únicos:

**🔥 "Rey Goblin" (Rango B)**
- Drop: Cueva de los Goblins (Nivel 5 - Mítico)
- Probabilidad: 5%
- Stats: ATK 20, VIDA 35, DEF 10
- Habilidad: "Horda Salvaje" (+20% daño cuando HP < 50%)

**🌲 "Espíritu del Bosque" (Rango A)**
- Drop: Bosque Maldito (Nivel 4-5)
- Probabilidad: 3%
- Stats: ATK 25, VIDA 40, DEF 15
- Habilidad: "Regeneración Natural" (Recupera 5% HP cada turno)

**⚔️ "Caballero Espectral" (Rango S)**
- Drop: Fortaleza del Caballero Negro (Nivel 5)
- Probabilidad: 2%
- Stats: ATK 35, VIDA 50, DEF 25
- Habilidad: "Última Resistencia" (Sobrevive con 1 HP a un golpe mortal, 1 vez por combate)

**🐉 "Wyvern Ancestral" (Rango SS)**
- Drop: Templo del Dragón Ancestral (Nivel 5)
- Probabilidad: 1%
- Stats: ATK 50, VIDA 70, DEF 35
- Habilidad: "Aliento de Dragón" (Daño en área a todo el equipo enemigo)

**💀 "Señor del Caos" (Rango SSS)**
- Drop: Abismo del Caos Eterno (Nivel 5)
- Probabilidad: 0.5% (Extremadamente raro)
- Stats: ATK 70, VIDA 100, DEF 50
- Habilidad: "Devastación Total" (Ignora 50% de la defensa enemiga)

---

### 4️⃣ **ITEMS EXCLUSIVOS DE MAZMORRAS**

#### Concepto:
Items únicos que **solo dropean** en mazmorras específicas de alto nivel.

#### Propuesta de Items Únicos:

**⚔️ "Colmillo del Rey Goblin" (Rango A - Arma)**
- Drop: Cueva Goblins (Nivel 5)
- Stats: ATK +35, DEF +5
- Habilidad: "Veneno mortal" (10% chance de envenenar por 3 turnos)
- Costo tienda: NO DISPONIBLE (solo drop)

**🛡️ "Corteza del Árbol Ancestral" (Rango S - Armadura)**
- Drop: Bosque Maldito (Nivel 5)
- Stats: DEF +60, VIDA +120
- Habilidad: "Espinas" (Refleja 15% del daño recibido)

**⚔️ "Espada del Caballero Caído" (Rango SS - Arma)**
- Drop: Fortaleza (Nivel 5)
- Stats: ATK +70, DEF +20, VIDA +50
- Habilidad: "Juramento Eterno" (+30% stats cuando HP < 30%)

**🔮 "Escama de Dragón Divino" (Rango SS - Armadura)**
- Drop: Templo Dragón (Nivel 5)
- Stats: ATK +20, DEF +80, VIDA +150
- Habilidad: "Piel de Dragón" (Inmunidad a quemaduras y veneno)

**💍 "Anillo del Vacío Eterno" (Rango SSS - Anillo)**
- Drop: Abismo Caos (Nivel 5)
- Stats: ATK +50, DEF +50, VIDA +200
- Habilidad: "Poder Absoluto" (+10% a todos los stats por cada enemigo derrotado en combate, acumulable)

---

### 5️⃣ **SISTEMA DE RACHAS Y BONIFICACIONES**

#### Concepto:
Completar mazmorras consecutivamente sin morir da bonus.

#### Implementación:
```javascript
user: {
  dungeon_streak: 0,           // Racha actual
  max_dungeon_streak: 0,       // Récord
  streak_bonus: {
    3: { val: 1.2, xp: 1.2 },   // +20% VAL/XP tras 3 victorias
    5: { val: 1.5, xp: 1.5 },   // +50% tras 5 victorias
    10: { val: 2.0, xp: 2.0 },  // +100% tras 10 victorias
    20: { val: 3.0, xp: 3.0 }   // +200% tras 20 victorias
  }
}
```

#### Logros por Rachas:
- **Racha de 5**: "Guerrero Imparable" - +500 VAL
- **Racha de 10**: "Leyenda Viviente" - +2000 VAL + Item A aleatorio
- **Racha de 20**: "Dios de la Guerra" - +10000 VAL + Item SS garantizado
- **Racha de 50**: "Inmortal" - Personaje SSS exclusivo

---

### 6️⃣ **SISTEMA DE FASES (MODOS DE JUEGO)**

#### Concepto:
Cada mazmorra puede tener variantes especiales.

#### Tipos de Fases:

**🌙 Fase Nocturna:**
- Boss +30% stats
- Drops +50% probabilidad
- Items oscuros exclusivos

**⚡ Fase Tormentosa:**
- Daño aleatorio ambiental (5-15 HP por turno)
- XP +100%
- Drops eléctricos exclusivos

**🔥 Fase Infernal:**
- Boss +50% ATK, -20% DEF
- VAL +200%
- Frutos míticos +10% drop rate

**❄️ Fase Gélida:**
- Velocidad de ataque -20%
- Boss +40% DEF
- Items de hielo exclusivos

**🌟 Fase Divina (Evento semanal):**
- Boss +100% stats
- XP, VAL, Drops × 5
- Personaje SSS garantizado tras 10 victorias

---

### 7️⃣ **RANKING DE MAZMORRAS**

#### Concepto:
Tabla de clasificación global y por mazmorra.

#### Métricas:
- Tiempo más rápido de completado
- Mayor racha sin morir
- Más victorias totales
- Mayor dificultad completada

#### Recompensas mensuales:
- Top 1: 50,000 VAL + Personaje SSS exclusivo
- Top 10: 20,000 VAL + Item SS
- Top 100: 5,000 VAL + Item S

---

## 📋 RESUMEN DE CAMPOS A AGREGAR AL MODELO

### Modelo Dungeon:
```javascript
{
  // ... campos existentes
  nivel_max_dificultad: 5,           // Máximo 5 niveles
  multiplicadores_por_nivel: [],     // Array de multiplicadores
  val_base: 20,                      // VAL garantizado por victoria
  personajes_exclusivos: [],         // IDs de personajes únicos
  items_exclusivos: [],              // IDs de items únicos
  fases_disponibles: [],             // Fases especiales
  requisito_nivel_minimo: 1,         // Nivel mínimo del personaje
  victorias_para_desbloqueo: 0       // Victorias previas necesarias
}
```

### Modelo User (agregar):
```javascript
{
  // ... campos existentes
  dungeon_progress: {
    cueva_goblins: { victorias: 10, nivel_actual: 2, mejor_tiempo: 45 },
    bosque_maldito: { victorias: 5, nivel_actual: 1, mejor_tiempo: 120 },
    // ...
  },
  dungeon_streak: 0,                 // Racha actual
  max_dungeon_streak: 0,             // Récord personal
  dungeon_stats: {
    total_victorias: 50,
    total_derrotas: 5,
    mejor_racha: 12
  }
}
```

---

## 💡 PRIORIDAD DE IMPLEMENTACIÓN

### ✅ Fase 1 (Crítico):
1. Sistema de dificultad progresiva (5 niveles)
2. Recompensas de VAL automáticas
3. Tracking de victorias por usuario

### ✅ Fase 2 (Importante):
4. Personajes exclusivos de mazmorras (5 nuevos)
5. Items exclusivos de mazmorras (5 nuevos)
6. Sistema de rachas

### ✅ Fase 3 (Mejoras):
7. Fases especiales (eventos)
8. Ranking global
9. Logros y recompensas especiales

---

## 🎯 BENEFICIOS DEL SISTEMA

✅ **Rejugabilidad infinita**: Siempre hay un nivel más difícil
✅ **Progresión constante**: Más fuerte = más recompensas
✅ **Contenido exclusivo**: Items/personajes únicos motivan farmeo
✅ **Competencia sana**: Rankings globales
✅ **Economía balanceada**: VAL escalado por dificultad
✅ **Eventos dinámicos**: Fases especiales mantienen frescura

---

¿Qué te parece? ¿Implementamos alguna de estas mejoras?
