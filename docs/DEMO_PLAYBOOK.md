# DEMO PLAYBOOK — Mazmorras (Dungeons) y Survival

Objetivo: Documento técnico para integrar un demo jugable del RPG (modo Mazmorras) y del modo Survival. Incluye endpoints, payloads de ejemplo, eventos WebSocket, datos seed, flujos UI recomendados, casos de prueba y notas de implementación backend.

---

## Índice
- Resumen ejecutivo
- Dungeons (Mazmorras)
  - Mecánica resumida
  - Endpoints y ejemplos
  - WebSocket / eventos en tiempo real
  - Respuesta / formato de `startDungeon`
  - UI: cómo presentar el combate (replay) y recompensas
  - Casos de prueba y checks anti-cheat
  - Seed data mínimo
- Survival
  - Mecánica resumida
  - Endpoints y ejemplos
  - WebSocket / eventos en tiempo real (recomendados)
  - UI: experiencia por oleadas y final de run
  - Casos de prueba y anti-cheat
  - Seed data mínimo
- Recomendaciones de integración y scripts útiles

---

## Resumen ejecutivo
Este playbook está pensado para que el frontend implemente un demo mínimo operativo que muestre: elección de mazmorra, selección de equipo, ejecución de combate server-side, recepción del `combatLog` y visualización de recompensas; y para Survival: iniciar sesión, completar oleadas, usar consumibles, recoger drops y finalizar run con leaderboard.

Prioridad para demo: mostrar flujo completo de `start -> log -> rewards -> estado personaje/inventario` en Mazmorras y flujos `start -> complete-wave -> end` en Survival.

---

# Mazmorras (Dungeons)

### Mecánica (resumen técnico)
- Turnos alternados (equipo vs mazmorra). Cada turno aplica acierto/fallo basado en probabilidades de la mazmorra.
- Stats: vida (HP), ataque (ATK) y defensa (DEF). Equipo suma stats por items equipados y buffs activos.
- Reward scaling: EXP y VAL escalan según nivel de mazmorra (multiplicadores configurables). Drops según `dropTable` con `multiplicador_drop_por_nivel`.
- Progresión de mazmorra: `user.dungeon_progress` almacena `nivel_actual`, `puntos_acumulados`, `racha`, y puede subir de nivel la mazmorra para aumentar stats y drops.
- Boletos: para entrar se consume `user.boletos`.
- Persistencia: cambios en `User` (salud, inventario, boletos, stats) se guardan con `user.save()`.

### Endpoints relevantes (imprescindibles)
- `GET /api/dungeons` — Listado de mazmorras.
- `GET /api/dungeons/:id` — Detalle de la mazmorra (stats, probabilidades, recompensas base, multiplicadores).
- `POST /api/dungeons/:dungeonId/start` — Inicia combate en server y devuelve `combatLog` y resultado.
- `GET /api/dungeons/:dungeonId/progress` — Progreso del usuario en esa mazmorra.
- Alias: `POST /api/dungeons/enter/:dungeonId` (compatibilidad) y `GET /api/dungeons/:dungeonId/session/:sessionId`.

### Ejemplo: request para iniciar mazmorra
POST /api/dungeons/645f.../start
Headers: cookie JWT (autenticado)
Body:
{
  "team": ["char-1-id","char-2-id","char-3-id"]
}

### Ejemplo: respuesta (esquema resumido)
{
  "resultado": "victoria" | "derrota",
  "log": ["líneas de texto del combate"],
  "recompensas": {
    "expGanada": 420,
    "valGanado": 15,
    "botinObtenido": [ { "itemId": "..", "nombre": "Espada X" } ]
  },
  "progresionMazmorra": {
    "puntosGanados": 120,
    "nivelActual": 3,
    "puntosActuales": 230,
    "puntosRequeridos": 400,
    "subiDeNivel": true,
    "nivelesSubidos": 1
  },
  "rachaActual": 4,
  "tiempoCombate": 12,
  "estadoEquipo": [ { "personajeId":"char-1-id","saludFinal":80, "nivelFinal":12, "estado":"saludable" } ]
}

> Nota: el campo `log` es un replay textual que el frontend puede reproducir paso a paso.

### Eventos WebSocket importantes
- `dungeon:entered` — al entrar (sessionId opcional/presente)
- `dungeon:progress` — actualizaciones de progreso en mazmorra (payload: dungeonId + progreso parcial)
- `character:level-up` — para animar subidas de nivel
- `notifications:new` — notificaciones relacionadas
- `rankings:update` — actualizar leaderboards en vivo

Payloads ejemplo:
- `character:level-up`:
  { "userId": "uid", "personajeId": "char-1-id", "nuevoNivel": 13, "nivelesGanados": 1, "statsDelta": {"atk":2,"vida":10}}

- `dungeon:progress`:
  { "dungeonId":"...", "progreso": { "puntos_acumulados":230, "nivel_actual":3 } }

### UI — presentación recomendada
- Pantalla de selección: mostrar `GET /api/dungeons` y requerimientos por nivel.
- Modal de equipo: seleccionar personajes desde la lista del usuario, mostrar equipamiento y consumibles.
- Botón `Entrar` llama `POST /start` y deshabilita UI hasta respuesta.
- Replay: mostrar `combatLog` como feed paso a paso (auto-play con velocidad configurable). Añadir botones "siguiente" y "saltar".
- Final: pantalla de recompensa con EXP, VAL, items (botón "Añadir a inventario" o mostrar ya añadidos) y cambios de estado de personajes.

### Demo: Qué mostrar exactamente (RPG - Mazmorras)
- Tipo de pelea: combate por turnos entre "Equipo" (tus personajes) y "Mazmorra" (enemigo único o jefe).
- Representación: reproducir `combatLog` como una secuencia de eventos (líneas de texto) y, opcionalmente, animar daño y reducción de barras de vida.
- Elementos imprescindibles en la UI por cada paso:
  - Encabezado: nombre de la mazmorra, nivel recomendado, requisitos.
  - Equipo: lista de personajes seleccionados con `nivel`, `saludActual/vidaMax`, `atk`, `defensa`, `equipamiento` y `consumibles` (mostrar `usos_restantes`).
  - Turno actual: destacar quién actúa y mostrar acción (attack/defend/use_item).
  - Evento de daño: mostrar daño infligido y vida restante del objetivo.
  - Resultado por oleada/turno: actualizar `estadoEquipo` y mostrar cuando un personaje queda `herido`.
  - Final de combate: mostrar `resultado` (victoria/derrota), `recompensas` (EXP, VAL, botín) y `progresionMazmorra` (puntos y posible subida de nivel).
- Formato de resultado a mostrar (ejemplo resumido):
```
{
  "resultado": "victoria",
  "log": ["..."],
  "recompensas": { "expGanada": 120, "valGanado": 8, "botinObtenido": [{"itemId":"i1","nombre":"Casco"}] },
  "estadoEquipo": [{ "personajeId":"char-1-id","saludFinal":80,"estado":"saludable" }]
}
```
- Consumo de items (visual y efectos):
  - Cuando el player elige usar un consumible, mostrar animación/feedback y reducir `usos_restantes` en la UI.
  - Si el consumible es aplicado en combate, mostrar efecto inmediato en `combatLog` (por ejemplo: "Player usa Pocion: +50 HP").
  - Al finalizar combate, reflejar la reducción de inventario en `inventarioConsumibles` (si `usos_restantes` llega a 0, ocultar o marcar como agotado).
  - Ejemplo de payload/backend al usar consumible (interno):
  ```json
  { "consumableId": "cons1", "target": "player", "effect": { "heal": 50 }, "usos_restantes": 1 }
  ```

### Casos de prueba (QA)
- Entrar con personaje por debajo del nivel mínimo → 400 con mensaje claro.
- Inventario lleno → recibir mensaje y no añadir item.
- Personaje herido no puede entrar → 400.
- Racha e incremento de ranking: validar incremento en DB (`Ranking` actualizado).
- Simular subida de nivel y recepción del evento `character:level-up`.

### Seed data mínimo para demo (Mongo insert / script)
- 1 `User` con 3 `personajes` (niveles 10–12), `boletos` >= 3, `val` moderado.
- 2 `Dungeon`:
  - `dungeon_easy`: nivel_requerido_minimo: 1, recompensas.expBase: 50, recompensas.valBase: 5, probabilidades.fallo_ataque_jugador:0.05, fallo_ataque_propio:0.10, dropTable con 3 items.
  - `dungeon_hard`: nivel_requerido_minimo: 20, recompensas.expBase: 200, etc.

---

# Survival

### Mecánica (resumen técnico)
- Modo por oleadas: el jugador inicia una `SurvivalSession` y progresa por `waves`.
- El jugador puede equipar items y llevar consumibles (opcionales). Cada wave reporta `enemiesDefeated`, `damageDealt`.
- Drops: enemigos pueden soltar equipment/consumables/points (usar `pickup-drop`).
- Runs históricas (`SurvivalRun`) almacenan `finalWave`, `totalPoints` y `rewards`.
- Leaderboard: `SurvivalLeaderboard` actualizado con la mejor ola o puntos.

### Endpoints relevantes (según `src/routes/survival.routes.ts`)
- `POST /api/survival/start` — Iniciar sesión de survival
- `POST /api/survival/:sessionId/complete-wave` — Marcar oleada completada
- `POST /api/survival/:sessionId/use-consumable` — Usar un consumible
- `POST /api/survival/:sessionId/pickup-drop` — Recoger drop
- `POST /api/survival/:sessionId/end` — Finalizar sesión exitosamente (gana rewards)
- `POST /api/survival/:sessionId/death` — Reportar muerte (run con derrota)
- `POST /api/survival/exchange-points/exp` — Canjear puntos por EXP
- `POST /api/survival/exchange-points/item` — Canjear puntos por item (si implementado)

### Ejemplo: iniciar sesión (request)
POST /api/survival/start
Body:
{
  "characterId": "char-1-id",
  "equipmentIds": ["eq1","eq2","eq3","eq4" ], // opcional
  "consumableIds": ["cons1","cons2"] // opcional
}

Respuesta (resumen):
{
  "sessionId": "sess-abc",
  "message": "Survival session started",
  "session": { /* objeto `SurvivalSession` */ }
}

### Flujo de oleada (ejemplo)
1. Frontend recibe `session` con `sessionId`.
2. Cada vez que el jugador completa una ola, hace `POST /api/survival/:sessionId/complete-wave` con `waveNumber`, `enemiesDefeated`, `damageDealt`.
3. Backend valida y actualiza `SurvivalSession` y devuelve `session` actualizado.
4. Si aparece drop, frontend hace `POST /pickup-drop` para recogerlo.
5. Cuando el jugador muere, `POST /death` (genera run con derrota). Si completa, `POST /end` genera `SurvivalRun` con rewards.

### WebSocket (recomendado)
Aunque `survival` funciona por HTTP, es recomendable emitir eventos WS para mejor UX:
- `survival:session_started` { sessionId, characterId, initialState }
- `survival:wave_completed` { sessionId, waveNumber, pointsGained, sessionState }
- `survival:drop_spawned` { sessionId, itemId, itemType }
- `survival:session_ended` { sessionId, run }
- `survival:player_death` { sessionId, run }

### UI — presentación recomendada
- Modo oleadas: mostrar contador de ola, barra de progreso de enemigos, consumibles en slots.
- Historial de run: mostrar puntos por ola y total acumulado.
- Interfaz de pickup: notificar drop y mostrar botones para recoger o ignorar.
- Pantalla final: mostrar `Run` con `finalWave`, `totalPoints`, `rewards` y botón `Share` o `Submit score`.

### Demo: Qué mostrar exactamente (Survival)
- Tipo de experiencia: run por oleadas con acumulación de puntos y drops por ola (no es un combate por turnos, es progresivo por oleadas).
- Elementos imprescindibles en la UI por cada paso:
  - Estado de sesión: `sessionId`, `currentWave`, `currentPoints`, `state` (active/ended).
  - Panel de personaje: `vida`, `atk`, `defensa`, `equipamiento` y `consumibles` (con `usos_restantes`).
  - Resumen de ola: al completar una ola mostrar `enemiesDefeated`, `damageDealt`, `pointsGained` y `drops`.
  - Pickups: notificar drop con opción "Recoger" que añade item a inventario visualmente.
  - Final de run: mostrar `SurvivalRun` con `finalWave`, `totalPoints`, `rewards` y la actualización del leaderboard.
- Formato de resultado a mostrar (ejemplo resumido):
```
{
  "session": { "sessionId":"sess-demo-1","currentWave":3,"currentPoints":420 },
  "lastWaveResult": { "waveNumber":3, "enemiesDefeated":12, "pointsGained":120, "drops":[{"itemId":"c1","name":"Pocion"}] }
}
```
- Consumo de items (visual y efectos):
  - Mostrar uso de consumible con reducción de `usos_restantes` y efectos (por ejemplo curación o buff temporal) reflejados inmediatamente en la vista de estadísticas.
  - Resaltar en UI cuando un consumible se queda sin usos (marcar como agotado).
  - Ejemplo de payload al usar consumible:
  ```json
  { "consumableId": "cons1", "targetSlot": "player", "effect": { "pointsBonus": 30 }, "usos_restantes": 0 }
  ```

### Demo: Qué mostrar exactamente (RPG / Mazmorras)
- Tipo de experiencia: combate por turnos dentro de una mazmorra con fases y objetivos por sala.
- Elementos imprescindibles en la UI por cada turno:
  - Turno actual: `turnNumber`, `activeEntity` (player/enemy), `phase` (start/action/end).
  - Registro de eventos por turno: lista ordenada de acciones (ataque, defensa, habilidad, uso de consumible) con `source`, `target`, `value`, `effect`.
  - Estado de cada entidad: `saludActual`, `buffs`, `debuffs`, `isAlive`.
  - Visualización de daño: animar cambio de `saludActual` y mostrar números flotantes por daño/curación.
  - Loot por sala: al limpiar la sala mostrar `drops` con opción `Pick up`.
- Formato de resultado a mostrar al terminar un combate (ejemplo resumido):
```
{
  "dungeonRun": { "runId":"dmg-123","room":5,"result":"victory" },
  "combatLog": [ {"turn":1, "events":[{"source":"player","action":"attack","target":"goblin","value":25}] } ],
  "rewards": { "xpGained":240, "drops":[{"itemId":"eq1","name":"Casco de hierro"}] }
}
```
- Consumo de items en combate:
  - Uso instantáneo: aplicar efecto en `saludActual`/`buffs` y decrementar `usos_restantes` en la UI.
  - Efectos temporales: mostrar barra o contador de duración para buffs/debuffs.
  - Ejemplo de evento en el `combatLog` por uso de consumible:
  ```json
  { "turn":2, "events": [ { "source":"player","action":"use_consumable","consumableId":"c2","effect":{"heal":50},"usos_restantes":2 } ] }
  ```

### Casos de prueba (QA)
- Start con equipamiento incompleto → backend debe usar equipamiento del personaje por defecto.
- Uso de consumible fuera de sesión activa → 400.
- Reportar muerte y verificar `SurvivalRun` con derrota (sin rewards) y `currentSurvivalSession` limpiado.
- Canje de puntos por EXP: validar que `survivalPoints` decrementan y `User` recibe EXP.
- Leaderboard update: verificar que `SurvivalLeaderboard` registra la run y se muestra en `GET` (si existe endpoint).

### Seed data mínimo para demo (Survival)
- `User` con 1 personaje con stats básicos, algunos consumibles (pociones) y equipamiento.
- `SurvivalSession` no necesaria, la crea `POST /start`.
- Leaderboard vacío o con 2 runs fake para mostrar UI.

---

## Recomendaciones de integración y scripts útiles

### Scripts útiles (comandos)
- Para seed local (si hay `seed` scripts):
```bash
npm run seed           # si el repo incluye scripts de seed (ver carpeta scripts/)
# o usar scrips typescript específicos
node dist/scripts/seed-minimal.js
```

- Para ejecutar tests unitarios rápidos (sin E2E/BD):
```bash
npm run test:unit      # usa jest.unit.cjs
```

- Para ejecutar demo local (si el servidor requiere compilación):
```bash
npm run dev            # arranca servidor en modo desarrollo (ver package.json)
```

### Mock / Fallback (si no quieres tocar DB)
- Crear un endpoint demo temporal (solo para el entorno local) que devuelva un `combatLog` precomputado para la UI. Ejemplo:
```js
// ruta temporal GET /api/demo/dungeon-sample
res.json(require('./dev-samples/dungeon-sample.json'))
```

### Datos de ejemplo (combatLog simplificado)
```json
{
  "resultado":"victoria",
  "log":[
    "🏰 Mazmorra Nivel 2",
    "--- Turno del Equipo ---",
    "Equipo causa 45 de daño. Vida mazmorra: 55",
    "--- Turno de la Mazmorra ---",
    "La mazmorra ataca y causa 20 de daño. Player1 recibe 10",
    "¡VICTORIA!"
  ],
  "recompensas":{ "expGanada":120, "valGanado":8, "botinObtenido":[{"itemId":"i1","nombre":"Casco de hierro"}] }
}
```

### Next steps sugeridos (rápidos)
- Genero un archivo `dev-samples/dungeon-sample.json` y `dev-samples/survival-sample.json` si quieres probar UI sin DB.
- Si quieres, preparo un `demo-route.ts` que sirva esos samples y un pequeño README con instrucciones para correr el demo localmente.

---

## Anexos
- Revisar `src/controllers/dungeons.controller.ts` para la lógica completa de `startDungeon` y `src/routes/survival.routes.ts` para el flujo de survival.
- Eventos WS documentados en `docs/02_frontend/WEBSOCKET_LISTENERS_GUIDE.md` (usar para integrar subscripciones).

---

Fin del playbook. Si quieres, lo adapto a formato más reducido para implementar en 1 día (MVP) o genero los archivos `dev-samples` y la ruta demo ahora.