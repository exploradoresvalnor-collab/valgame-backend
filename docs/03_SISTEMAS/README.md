# ⚙️ SISTEMAS DEL JUEGO - DOCUMENTACIÓN TÉCNICA

Esta carpeta contiene la documentación técnica de **cómo funcionan los sistemas principales** del juego.

---

## 📄 Documentos en Esta Carpeta

### 1. SISTEMA_PROGRESION_IMPLEMENTADO.md ⭐ **SISTEMA DE MAZMORRAS**
**Lectura:** 20-25 minutos  
**Contenido:**
- 🏰 Sistema de progresión infinita implementado
- 📊 Escalado de dificultad por nivel
- 💎 Sistema de drops y recompensas
- 🎮 Mecánicas de combate en mazmorras
- 📈 Curvas de progresión balanceadas
- 🔄 Sistema de checkpoints y guardado

**Cuándo leer:**
- Para entender cómo funcionan las mazmorras
- Antes de modificar lógica de progresión
- Para balancear dificultad y recompensas
- Al crear nuevas features relacionadas con mazmorras

---

### 2. SISTEMA_MAZMORRAS_MEJORADO.md 🏗️ **ARQUITECTURA DE MAZMORRAS**
**Lectura:** 15-20 minutos  
**Contenido:**
- 🏗️ Arquitectura del sistema de mazmorras
- 📂 Estructura de datos (modelos, schemas)
- 🔧 Servicios y controladores
- 🌊 Flujo de requests
- 🎲 Generación procedural de niveles
- ⚡ Optimizaciones implementadas

**Cuándo leer:**
- Para entender la arquitectura técnica
- Antes de modificar código de mazmorras
- Para agregar nuevas features a mazmorras
- Al hacer refactoring

---

### 3. ECONOMIA_DEL_JUEGO.md 💰 **BALANCE ECONÓMICO**
**Lectura:** 15-20 minutos  
**Contenido:**
- 💎 Sistema de monedas (VAL)
- 🏪 Economía del marketplace
- 💰 Fuentes y sumideros de VAL
- 📊 Balance económico verificado
- 🎁 Recompensas por actividades
- 🛡️ Protección contra inflación

**Cuándo leer:**
- Antes de modificar precios o recompensas
- Para entender el balance económico
- Al agregar nuevas fuentes de VAL
- Para verificar que la economía funciona

---

## 🎯 Sistemas Principales Documentados

### 🏰 Sistema de Mazmorras
**Características:**
- ♾️ Progresión infinita
- 📈 Escalado exponencial de dificultad
- 💎 Drops escalan con nivel
- 🎲 Generación procedural
- 💾 Sistema de guardado automático
- 🏆 Leaderboards por nivel alcanzado

**Archivos clave:**
- `src/models/Dungeon.ts`
- `src/models/DungeonProgress.ts`
- `src/services/dungeon.service.ts`
- `src/controllers/dungeon.controller.ts`

---

### 💰 Sistema Económico (VAL)
**Características:**
- 💎 Moneda única: VAL
- 🏪 Marketplace peer-to-peer
- 🎁 Recompensas balanceadas
- 🛡️ Scarcity mantenida
- 📊 Balance verificado matemáticamente

**Fuentes de VAL:**
- Mazmorras (principal)
- Venta en marketplace
- Logros y misiones (futuro)

**Sumideros de VAL:**
- Compra de paquetes
- Compra en marketplace
- Upgrades (futuro)

---

### 🎮 Otros Sistemas (Referencia)

**Sistema de Personajes:**
- Ver: `../04_API/API_REFERENCE.md` (endpoints `/characters`)
- Modelos en: `src/models/Character.ts`

**Sistema de Inventario:**
- Ver: `../04_API/API_REFERENCE.md` (endpoints `/inventory`)
- Modelos en: `src/models/Inventory.ts`

**Sistema de Paquetes:**
- ⚠️ Ver: `../02_SEGURIDAD/` (tiene vulnerabilidades)
- Modelos en: `src/models/Package.ts`

---

## 🎯 Rutas Rápidas

### "¿Cómo funcionan las MAZMORRAS?"
→ `SISTEMA_PROGRESION_IMPLEMENTADO.md` (mecánicas)  
→ `SISTEMA_MAZMORRAS_MEJORADO.md` (arquitectura)

### "¿Cómo está balanceada la ECONOMÍA?"
→ `ECONOMIA_DEL_JUEGO.md`

### "Quiero modificar el ESCALADO de dificultad"
1. Leer: `SISTEMA_PROGRESION_IMPLEMENTADO.md` (entender actual)
2. Modificar: `src/services/dungeon.service.ts`
3. Testear: Balance de recompensas vs dificultad

### "Quiero agregar una NUEVA FUENTE de VAL"
1. Leer: `ECONOMIA_DEL_JUEGO.md` (balance actual)
2. Calcular: Impacto en economía
3. Implementar con cuidado para no romper balance

---

## 📊 Datos Técnicos Importantes

### Escalado de Mazmorras
```
Nivel 1:  HP enemigos = 100, ATK = 10, Drops VAL = 10-20
Nivel 10: HP enemigos = 500, ATK = 50, Drops VAL = 100-150
Nivel 50: HP enemigos = 5000, ATK = 500, Drops VAL = 1000+
```

### Balance Económico
```
Paquete Básico: 100 VAL (3-5 items comunes)
Paquete Premium: 500 VAL (5-7 items raros/épicos)
Mazmorras nivel 10: ~150 VAL promedio
Marketplace: Precios variables (jugadores deciden)
```

### Límites del Sistema
```
Personajes por usuario: 50 (recomendado)
Items en inventario: 200 (recomendado)
Niveles de mazmorra: ♾️ infinitos
Progreso guardado: Automático cada nivel
```

---

## 🔧 Modificaciones Comunes

### Cambiar Dificultad de Mazmorras
**Archivo:** `src/services/dungeon.service.ts`
**Variables:**
- `baseHP`: HP inicial de enemigos
- `hpScaling`: Multiplicador por nivel
- `baseAttack`: ATK inicial
- `attackScaling`: Multiplicador por nivel

### Cambiar Recompensas VAL
**Archivo:** `src/services/dungeon.service.ts`
**Variables:**
- `baseReward`: VAL mínimo nivel 1
- `rewardScaling`: Multiplicador por nivel
- `bonusMultiplier`: Bonus por rareza de enemigos

### Agregar Nuevo Paquete
**Pasos:**
1. Definir en: `src/models/Package.ts`
2. Agregar lógica en: `src/services/package.service.ts`
3. ⚠️ PRIMERO arreglar vulnerabilidades (`../02_SEGURIDAD/`)
4. Testear balance económico

---

## 🔗 Documentos Relacionados

**API Endpoints:**  
→ `../04_API/API_REFERENCE.md`

**Seguridad (IMPORTANTE):**  
→ `../02_SEGURIDAD/AUDITORIA_SEGURIDAD_PAQUETES.md`

**Estado del Proyecto:**  
→ `../01_ESTADO_PROYECTO/ESTADO_COMPLETO_Y_ROADMAP.md`

---

## 📈 Métricas a Monitorear

**Economía:**
- [ ] VAL en circulación (no debe crecer sin control)
- [ ] Transacciones en marketplace (actividad)
- [ ] Precio promedio de items

**Mazmorras:**
- [ ] Nivel promedio alcanzado por jugadores
- [ ] Tasa de abandono por nivel
- [ ] Tiempo promedio por nivel

**Engagement:**
- [ ] Sesiones por día
- [ ] Tiempo en mazmorras vs marketplace
- [ ] Retención de jugadores

---

**Última actualización:** 22 de octubre de 2025  
**Volver al índice:** `../00_INICIO/README.md`
