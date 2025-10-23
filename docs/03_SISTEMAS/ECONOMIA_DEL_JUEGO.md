# 💰 ECONOMÍA DEL JUEGO - DISEÑO Y BALANCE

## 🎯 FILOSOFÍA PRINCIPAL

**VAL y items son ESCASOS y DIFÍCILES de obtener.**

El juego debe premiar:
- ⏰ Tiempo invertido (minado constante)
- 🎮 Skill (ganar mazmorras difíciles)
- 💰 Inversión real (comprar paquetes con USDT)

**NO debe haber:**
- ❌ VAL gratis ilimitado
- ❌ Items legendarios fáciles
- ❌ Progresión sin esfuerzo

---

## 💎 FUENTES DE VAL (De menor a mayor)

### 1. MINADO (Principal - Constante pero lento)
```javascript
VAL por hora = nivel × multiplicador_base × multiplicador_rango × val_por_nivel_etapa

Ejemplo personaje C nivel 50 etapa 2:
= 50 × 2.0 × 1.2 × 25 = 3000 VAL/hora
```

**Características:**
- ✅ Fuente principal de VAL
- ✅ Requiere personajes evolucionados
- ✅ Escalable con nivel y rango
- ⏰ Requiere TIEMPO real (horas activas)

### 2. MAZMORRAS (Riesgo-Recompensa)
```javascript
VAL por victoria = val_base × multiplicador_nivel_mazmorra

Cueva Goblins Nivel 1: 10 VAL (fácil)
Cueva Goblins Nivel 20: 50 VAL (muy difícil)
Abismo Caos Nivel 1: 100 VAL (difícil)
Abismo Caos Nivel 20: 500 VAL (extremo)
```

**Características:**
- ⚔️ Requiere combate (riesgo de perder)
- 📈 Escalable con dificultad
- 🎯 Recompensa el skill
- ❌ NO infinito (cuesta boletos: 50 VAL)

### 3. PAQUETES CON USDT (Monetización)
```javascript
Paquetes NO dan VAL directamente, solo personajes e items.
Los personajes generan VAL mediante minado.

$2 Huevo Básico → 1 personaje (posible D-S) → genera VAL
$500 Reinos Eternos → 20 personajes (garantiza A,S,SS,SSS) → genera MUCHO VAL
```

**Características:**
- 💵 Requiere inversión real
- 🎲 Probabilístico (no garantiza VAL directo)
- 📈 Acelera progresión
- ⚖️ P2W balanceado (no rompe economía)

### 4. VENTA DE ITEMS (Reciclaje)
```javascript
Items se pueden vender por una FRACCIÓN de su costo:

Daga Oxidada (costo 50 VAL) → vende por 10 VAL (20%)
Espada Flamígera (costo 500 VAL) → vende por 100 VAL (20%)
Guadaña del Caos (costo 5000 VAL) → vende por 1000 VAL (20%)
```

**Características:**
- ♻️ Permite limpiar inventario
- 💸 Pérdida significativa (80%)
- 🚫 Evita acumulación infinita

---

## ⚔️ FUENTES DE ITEMS

### 1. DROPS DE MAZMORRAS (Principal)
```
Probabilidades BAJAS para mantener rareza:

Items D (comunes): 15-20% drop
Items C (poco comunes): 10-15% drop
Items B (raros): 5-10% drop
Items A (épicos): 2-5% drop
Items S (legendarios): 1-3% drop
Items SS (míticos): 0.5-1% drop
Items SSS (trascendentales): 0.1-0.5% drop
```

**Características:**
- 🎲 Probabilístico
- ⚔️ Requiere farmeo
- 📈 Mejores drops en niveles altos
- 🎯 Items exclusivos solo en mazmorras específicas

### 2. TIENDA (Compra con VAL)
```
Solo items básicos e intermedios:

Disponible en tienda:
- Todos los items D y C
- Algunos items B
- Items A muy caros
- Items S NO disponibles
- Items SS y SSS NUNCA en tienda
```

**Características:**
- 🛒 Acceso garantizado a básicos
- 💰 Precios altos
- 🚫 Items legendarios NO se compran

### 3. PAQUETES CON USDT
```
Paquete Pionero (Gratis): 2 items aleatorios D-C
Adventure ($10): Posibles items B
Rugido Bestial ($40): Posibles items A
Héroes de Leyenda ($100): Posibles items S
Reinos Eternos ($500): Posibles items SS-SSS
```

**Características:**
- 💵 Requiere inversión real
- 🎲 Probabilístico
- 🎁 Único al abrir

---

## 🎮 COSTOS DE GAMEPLAY

### COSTOS DE COMBATE
```
Ticket PvP: 50 VAL (costo fijo)
Revivir personaje: 50 VAL (costo fijo)
Entrada mazmorra: GRATIS (pero cuesta tiempo/riesgo)
```

### COSTOS DE EVOLUCIÓN
```javascript
Evolución Etapa 2 (nivel 40):
- Rango D: 500 VAL + 1 EVO
- Rango C: 600 VAL + 1 EVO
- Rango B: 750 VAL + 1 EVO
- Rango A: 1000 VAL + 1 EVO
- Rango S: 1500 VAL + 1 EVO
- Rango SS: 2500 VAL + 1 EVO
- Rango SSS: 5000 VAL + 1 EVO

Evolución Etapa 3 (nivel 100):
- Rango D: 2000 VAL + 1 EVO
- Rango C: 2500 VAL + 1 EVO
- Rango B: 3000 VAL + 1 EVO
- Rango A: 4000 VAL + 1 EVO
- Rango S: 5000 VAL + 1 EVO
- Rango SS: 8000 VAL + 1 EVO
- Rango SSS: 15000 VAL + 1 EVO
```

**Estos costos DEBEN ser significativos para:**
- ⚖️ Valorar las evoluciones
- 🎯 Forzar decisiones estratégicas
- ⏰ Requerir tiempo de farmeo

### COSTOS DE ITEMS
```
Daga Oxidada (D): 50 VAL
Espada de Acero (C): 200 VAL
Espada Flamígera (B): 500 VAL
Katana del Dragón (A): 1500 VAL
Guadaña del Caos (S): 5000 VAL
Escudo del Titán (S): 6000 VAL
Anillo del Fénix (SS): 15000 VAL
Items SSS: NO SE COMPRAN (solo drops)
```

---

## ⚖️ BALANCE MATEMÁTICO

### Tiempo de Farmeo Estimado (Jugador promedio)

**Obtener 1000 VAL:**
- Minado (personaje C nivel 30): ~30 minutos
- Mazmorras (nivel bajo): 10-20 victorias
- Compra directa: $5-10 USDT en paquetes

**Evolucionar 1 personaje a Etapa 2:**
- Tiempo: ~1-2 semanas (jugador casual)
- Tiempo: ~2-3 días (jugador dedicado)
- Inversión: $20-40 USDT (acelera)

**Conseguir item legendario (S):**
- Farmeo: ~50-100 mazmorras nivel medio-alto
- Compra: 5000-6000 VAL (semanas de farmeo)
- Paquete: Paquete Héroes de Leyenda ($100) con suerte

**Conseguir item mítico (SS-SSS):**
- Farmeo: ~500+ mazmorras nivel máximo (meses)
- Compra: NO DISPONIBLE
- Paquete: Reinos Eternos ($500) con mucha suerte
- Drop exclusivo: Mazmorra nivel 20+ (0.1-0.5%)

---

## 🚫 ANTI-INFLACIÓN

### Sumideros de VAL (VAL Sinks)
1. **Evoluciones** (500-15000 VAL)
2. **Tickets PvP** (50 VAL cada uno)
3. **Revivir personajes** (50 VAL)
4. **Compra de items** (50-15000 VAL)
5. **Marketplace** (comisiones del 10% - futuro)

### Control de Generación
1. **Minado tiene cooldown** (24h entre sesiones completas)
2. **Mazmorras requieren boletos** (limitados)
3. **Drops son probabilísticos** (no garantizados)
4. **Items legendarios NO farmeable fácilmente**

---

## 📊 ECUACIÓN DE VALOR

### ¿Cuánto VALE realmente 1000 VAL?

**En tiempo:**
- 30-60 minutos de minado activo
- 10-20 mazmorras completadas
- 1-2 días de progresión casual

**En dinero real:**
- ~$5-10 USDT (indirecto vía paquetes)

**En progresión:**
- 1/5 de una evolución etapa 2 rango bajo
- 2-3 items comunes (D-C)
- 20 tickets PvP

### ¿Cuánto VALE un item S?

**En tiempo:**
- 10-20 horas de farmeo de mazmorras
- 50-100 victorias en mazmorras nivel medio
- 2-4 semanas de progresión casual

**En dinero real:**
- ~$50-100 USDT (vía Paquete Héroes de Leyenda con suerte)

**En VAL:**
- 5000-6000 VAL (1-2 semanas de minado)

---

## ✅ REGLAS DE ORO

1. **VAL es escaso** - No regalar VAL arbitrariamente
2. **Items legendarios son RAROS** - Drops <1% es correcto
3. **Tiempo tiene valor** - El farmeo debe SENTIRSE valioso
4. **P2W balanceado** - Pagar acelera, NO garantiza
5. **Sumideros activos** - Siempre debe haber donde gastar VAL
6. **Progresión lenta** - Semanas para evolucionar es CORRECTO
7. **RNG controlado** - Probabilidades bajas pero justas
8. **Items exclusivos existen** - No todo se compra

---

## 🎯 OBJETIVO FINAL

**El jugador debe VALORAR cada:**
- ✅ 1000 VAL ganado
- ✅ Item legendario dropeado
- ✅ Personaje evolucionado
- ✅ Victoria en mazmorra difícil

**Si algo es FÁCIL de obtener, NO tiene valor.**

---

## 📈 PROYECCIÓN A 6 MESES

### Jugador Casual (1h/día):
- VAL total: ~50,000 VAL
- Personajes evolucionados: 3-5 en etapa 2
- Items legendarios: 1-2 items S
- Items míticos: 0-1 item SS (con mucha suerte)

### Jugador Dedicado (4h/día):
- VAL total: ~250,000 VAL
- Personajes evolucionados: 10-15 etapa 2, 2-3 etapa 3
- Items legendarios: 5-10 items S
- Items míticos: 2-3 items SS, posible 1 SSS

### Jugador P2W ($500 invertidos):
- VAL total: ~200,000 VAL (vía minado acelerado)
- Personajes: 20-30 de alto rango
- Items: Múltiples S, varios SS, posible SSS
- Ventaja: 3-6 meses adelante vs casual

---

**¿Este diseño de economía te parece correcto?**
**¿Ajustamos algo antes de implementar el sistema de niveles de mazmorras?**
