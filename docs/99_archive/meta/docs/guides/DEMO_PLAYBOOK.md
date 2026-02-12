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

## Fases de implementación (MVP → Full)
Objetivo: dividir el demo en entregables por fases, cada fase con criterios de aceptación y endpoints mínimos.

- Fase 0 — Preparación (setup, proxy, samples)
  - Qué: Proxy dev configurado (`config/proxy.conf.json`), `.env` con `MONGODB_URI`, samples JSON disponibles en `dev-samples/` (opcional).
  - Endpoints mínimos: `GET /api/dungeons`, `GET /api/items`, `GET /api/users/:id/inventory`.
  - Criterio aceptación: Frontend puede cargar mazmorras, items e inventario sin errores; `withCredentials` funciona para login.

- Fase 1 — MVP Playable (Cueva de los Goblins)
  - Qué: Demo jugable corto: seleccionar party (1 o 3), equipar, entrar en `Cueva de los Goblins`, reproducir `combatLog`, mostrar recompensas y actualizar inventario.
  - Endpoints: `POST /api/dungeons/:dungeonId/start`, `GET /api/dungeons/:dungeonId`, `GET /api/users/:id/inventory`.
  - Criterio aceptación: Demo muestra selección de equipo, botón Entrar, replay del `combatLog`, y pantalla final con `recompensas` añadidas al inventario.

  - Checklist (MVP 1 día, tareas divididas)
   1. Preparación local (30-45 min)
     - Verificar `MONGODB_URI` y correr `node scripts/read-all-collections.js` para confirmar datos.
     - Confirmar proxy dev (`config/proxy.conf.json`) y reiniciar frontend.
     - Opcional: crear `dev-samples/dungeon-sample.json` si se quiere evitar DB.

   2. Pantalla de selección & carga (60 min)
     - Implementar vista `Seleccionar Mazmorra` que consulta `GET /api/dungeons` y muestra `Cueva de los Goblins` como opción principal.
     - Implementar `Seleccionar Party` (1 o 3 personajes) leyendo `GET /api/users/:id/inventory` para mostrar equipamiento y consumibles.
     - Mostrar loadout recomendado en un panel lateral (stats sumados por equip).

   3. Acción: Entrar y solicitar combate (30 min)
     - Botón `Entrar` que hace `POST /api/dungeons/:dungeonId/start` con body `{ team: [charIds] }`.
     - Mostrar loader/estado bloqueado mientras llega la respuesta.

   4. Replay del combate (60 min)
     - Consumir `combatLog` de la respuesta y reproducirlo como lista paso a paso (auto-play + botón "siguiente").
     - Soportar acción de usar consumible durante el combate (UI que hace POST a endpoint de uso, o simular efecto en el replay si no existe).

   5. Pantalla final y actualización (30 min)
     - Mostrar `recompensas` (EXP, VAL, items) y botón `Aceptar` que recoge y actualiza inventario local (refrescar `GET /api/users/:id/inventory`).
     - Ofrecer opción rápida `Vender` o `Listar` (si existe marketplace) o marcar como para listar más tarde.

   6. Tests rápidos & QA (30 min)
     - Validar flujo completo: seleccionar, entrar, replay, aceptar recompensas.
     - Comprobaciones: manejo de errores (400/401), `withCredentials` en llamadas auth, y visibilidad de `usos_restantes` para consumibles.

   7. Entrega (15 min)
     - Documentar pasos en `README.md` del demo (cómo arrancar frontend, endpoints usados y cómo probar).

  - Nota: priorizar experiencia fluida por encima de animaciones; usar dev-samples si la BD es inestable.

- Fase 2 — Exploración Ramificada (Bosque, Fortaleza)
  - Qué: Agregar `dungeonSession`/salas, decisiones de ruta, cofres y NPC básicos; checkpoints/`rest` y `choose` por sala.
  - Endpoints: `POST /api/dungeons/:dungeonId/enter`, `GET /api/dungeons/:dungeonId/session/:sessionId/room`, `POST /api/dungeons/:dungeonId/session/:sessionId/choose`, `POST /api/dungeons/:dungeonId/session/:sessionId/interact`, `POST /api/dungeons/:dungeonId/session/:sessionId/rest`.
  - Criterio aceptación: Frontend permite explorar salas, elegir rutas (riesgo vs recompensa), recoger cofres e interactuar con NPCs (simulados si backend no los soporta).

- Fase 3 — Survival & Leaderboards
  - Qué: Implementar run por oleadas con `start/complete-wave/pickup/end` y mostrar leaderboard en vivo mediante `rankings:update` WS.
  - Endpoints/Events: `POST /api/survival/start`, `POST /api/survival/:sessionId/complete-wave`, `POST /api/survival/:sessionId/pickup`, `POST /api/survival/:sessionId/end`, WS `rankings:update`.
  - Criterio aceptación: Frontend puede iniciar run, completar olas, recoger drops y ver leaderboard actualizado.

- Fase 4 — Comercio & Economy
  - Qué: Integrar marketplace demo: listar, comprar y vender (simulado con dev-samples si el backend no expone endpoints completos).
  - Endpoints: `GET /api/listings`, `POST /api/marketplace/buy` (o flow existente en `marketplace.service`).
  - Criterio aceptación: Usuario puede listar/sell items demo y ver VAL descontado/añadido.

- Fase 5 — Pulido, UX y QA
  - Qué: Animaciones, minimapa, barra de fuerza para contraseña, accessibility, tests unitarios y e2e para flows críticos.
  - Criterio aceptación: Experiencia fluida y estable, tests básicos verdes, documentación MVP lista.

Notas: cada fase debe usar datos reales extraídos de la BD (mazmorras e items ya presentes) o `dev-samples` si se necesita aislar la UI del backend.

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

### Rankings & Leaderboards (endpoints y flujo)
- `GET /api/rankings` — lista de leaderboards por modo (dungeons, survival, global).
- `GET /api/rankings/:mode` — leaderboard filtrado por modo (`dungeons` | `survival`).
- `POST /api/rankings/submit` — (opcional) submit explícito de score/run; normalmente el backend actualiza rankings al finalizar `dungeon` o `survival`.

Flujo recomendado para demo: al completar una `dungeon` o `survival` el backend emite `rankings:update` y actualiza la colección/tabla `Rankings`. El frontend debe suscribirse a `rankings:update` y refrescar `GET /api/rankings/:mode` para mostrar posiciones actualizadas.

Nota: verifica la ruta real en `src/routes/rankings.routes.ts` si existe (los nombres sugeridos son convencionales para el demo).

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

### Mejora: Diseño visual y microinteracciones (wireframe textual)
Objetivo: dejar claro lo que el jugador ve e interactúa, sin depender de assets gráficos.

- Encabezado (persistente): nombre del juego, botón Perfil (avatar), VAL disponible, acceso a Leaderboard.
- Panel izquierdo (sección selección/estado): minimapa / sala actual + lista de acciones (Explorar, Interactuar, Rest, Exit).
- Panel central (acción principal): descripción de sala + `combatLog` replay (lista con timestamps) y animación simple de barra HP para cada personaje/enemigo.
- Panel derecho (party & inventory): lista de personajes con avatar small, `saludActual/vidaMax`, `atk`, `def`, equipamiento (click para ver stats) y consumibles con `usos_restantes` y botón `Usar`.
- Footer (acciones rápidas): botón `Entrar` / `Continuar` / `Usar consumible` / `Aceptar Recompensas`.

Microinteracciones mínimas:
- Al usar consumible: animación de pulso en objetivo + badge decremental en `usos_restantes`.
- Cuando llega `combatLog` nuevo: desplazamiento automático al último evento y highlight breve.
- Confirmación modal al `Rest` mostrando costes (boletos/stamina) y efecto (HP recuperado).

Accesibilidad y performance:
- Evitar autoplay de sonidos; usar animaciones CSS ligeras; permitir pausa del replay.
- En party grande (>=5) colapsar vista detallada por rendimiento.

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

  ### Payloads de ejemplo (contractos mínimos que el frontend debe manejar)

  - `POST /api/dungeons/:dungeonId/start` (request)
    ```json
    { "team": ["char-1-id","char-2-id","char-3-id"] }
    ```

  - `POST /api/dungeons/:dungeonId/start` (response ejemplo)
    ```json
    {
      "resultado": "victoria",
      "log": ["Turno 1: Player1 ataca Goblin: -12 HP", "Turno 2: Goblin ataca Player2: -8 HP"],
      "recompensas": { "expGanada": 120, "valGanado": 8, "botinObtenido": [{ "itemId":"i1","nombre":"Casco" }] },
      "estadoEquipo": [{ "personajeId":"char-1-id","saludFinal":80 }]
    }
    ```

  - `dungeon session - room` (ejemplo de sala)
    ```json
    {
      "roomId":"r1",
      "description":"Sala con estatuas rotas. Hay dos salidas: norte y este.",
      "exits":[{"id":"north","label":"Pasillo oscuro"},{"id":"east","label":"Sala del cofre"}],
      "encounters":[],
      "interactables":[{"id":"chest-1","type":"cofre","label":"Cofre polvoriento"}]
    }
    ```

  - `inventory item` (formato para UI)
    ```json
    { "itemId":"cons1","nombre":"Poción de Vida","tipoItem":"Consumable","usos_restantes":1,"efectos":{"mejora_vida":150} }
    ```

  Estos ejemplos ayudan a adaptar la UI al contract real que el backend entrega.

### RPG — Flujo de exploración y toma de decisiones (más que "entrar y jugar")
Objetivo: convertir la mazmorra en una experiencia exploratoria con elecciones, checkpoints, NPCs y caminos ramificados.

- Evento inicial: `POST /api/dungeons/:dungeonId/enter` crea una `dungeonSession` y devuelve `sessionId` y primer `room`.
- Obtener sala actual: `GET /api/dungeons/:dungeonId/session/:sessionId/room` → payload con `roomId`, `description`, `exits`, `encounters`, `traps`, `interactables`.
- Elegir camino/puerta: `POST /api/dungeons/:dungeonId/session/:sessionId/choose` body `{ "exitId": "north" }` → resuelve encuentros o revela nueva sala.
- Interactuar NPC/objeto: `POST /api/dungeons/:dungeonId/session/:sessionId/interact` body `{ "targetId": "npc-1", "action": "talk" }` → diálogo, quest, comercio o pista para puzzle.
- Mini-eventos y puzzles: `POST /api/dungeons/:dungeonId/session/:sessionId/solve` body `{ "puzzleId":"p1","solution":"..." }` → recompensa o penalización.
- Descanso / checkpoint: `POST /api/dungeons/:dungeonId/session/:sessionId/rest` → guarda estado del `session` (checkpoint), recupera salud parcial y consume recursos (por ejemplo, `boletos` o `stamina`).
- Salir/guardar run: `POST /api/dungeons/:dungeonId/session/:sessionId/exit` → persistir progreso parcial y drops recogidos.

Estado y persistencia: la `dungeonSession` contiene `currentRoom`, `visitedRooms`, `inventoryGained`, `hpState`, `stamina`, `checkpoints`. El frontend debe mostrar mapa/minimapa con `visitedRooms` y permitir volver a un `checkpoint` si existe.

Consecuencias de decisiones:
- Ramas: elegir una ruta puede incrementar dificultad y drops (riesgo vs recompensa).
- Trampas: fallar un puzzle o evitar una trampa reduce `hp` o `stamina` y puede bloquear salidas.
- NPCs: ofrecen side-quests o ventas; completar side-quest otorga items únicos.

UI recomendada para exploración:
- Panel de descripción de sala con `description`, lista de `exits` (botones), `encounters` visibles/ocultos y `interactables` (NPC, cofres).
- Minimap: mostrar nodos visitados y rutas disponibles.
- Registro de exploración: feed de eventos (ej. "Abriste un cofre: +1 Pocion") que se concatena al `combatLog` historic.
- Botón `Rest/Checkpoint` y confirmación de costes (muestra recursos que se consumirán).
- Opciones de elección: botones de decisión con timeout opcional para demo (o modo manual con confirmación).

Ejemplo de flujo (resumido):
1. User abre dungeon → `POST /enter` → recibe `sessionId` + `room1`.
2. Explora `room1` → ve `exits: [north,east]` y un `chest` (interactuable).
3. Interactúa `chest` → `POST /interact` → recibe drop `{ itemId: 'cons1' }`.
4. Elige `north` → `POST /choose` → encuentra `enemy` → backend lanza `combatLog` y resuelve combate con posibles consumibles usados.
5. Tras victoria, obtiene recompensa y opción de `rest` o continuar.
6. Al completar una sección, backend emite `dungeon:progress` y opcionalmente `rankings:update`.

Endpoints opcionales de utilidad para demo:
- `GET /api/dungeons/:dungeonId/rooms/:roomId` — información detallada de la sala (para preload del mapa).
- `POST /api/dungeons/:dungeonId/session/:sessionId/pickup` — recoger item de sala.
- `GET /api/dungeons/:dungeonId/session/:sessionId/status` — estado completo de la sesión (para reconexión).

Notas para la demo: este flujo permite al frontend mostrar una experiencia más rica (decisiones, riesgo/recompensa, side-quests). Si el backend no implementa todas las rutas, usar endpoints demo (`/api/demo/*`) que devuelvan `dungeonSession` precomputadas para la UI.

### Equipamiento (endpoints y acciones)
- `POST /api/characters/:characterId/equip` — equipar un item en un personaje (body: `{ "itemId": "eq1" }`).
- `POST /api/characters/:characterId/unequip` — quitar un item del personaje (body: `{ "slot": "head" }`).
- `GET /api/users/:userId/inventory` — obtener inventario (equipables + consumibles) con `usos_restantes` por consumible.

Flujo recomendado: antes de `POST /api/dungeons/:dungeonId/start` el frontend debe enviar las elecciones de `equipmentIds` y `consumableIds` por personaje (o llamar a `equip` explícito). El backend aplicará los bonos de equipo en el cálculo del combate y decrementará usos de consumibles cuando se usen.

Nota: si las rutas exactas difieren en el proyecto, adapta los nombres anteriores al archivo de rutas correspondiente (`src/routes/*`).

### Casos de prueba (QA)
- Entrar con personaje por debajo del nivel mínimo → 400 con mensaje claro.
- Inventario lleno → recibir mensaje y no añadir item.
- Personaje herido no puede entrar → 400.
- Racha e incremento de ranking: validar incremento en DB (`Ranking` actualizado).
- Simular subida de nivel y recepción del evento `character:level-up`.

### Checklist QA rápida (demo)
- Login funciona y cookie `token` se mantiene (`withCredentials`).
- `GET /api/dungeons` muestra las 5 mazmorras.
- Flow completo Cueva de los Goblins: seleccionar party → Entrar → recibir `combatLog` → replay → aceptar recompensas → `GET /api/users/:id/inventory` refleja items nuevos.
- Usar consumible en combate actualiza `usos_restantes` en UI y backend (si endpoint implementado) o en el sample.
- Leaderboard se actualiza al finalizar run (si hay WS) o al refrescar `GET /api/rankings`.

---

Fin de mejoras visuales y contractuales para el demo. Implementa estas guías en la UI y dime si quieres que extraiga la checklist como `docs/MVP-1DAY-CHECKLIST.md` o que cree las rutas demo con `dev-samples` para simplificar integración.

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