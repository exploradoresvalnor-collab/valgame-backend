# 📜 Guion Detallado para el Frontend: Escenario "Fortaleza del Caballero Negro"

## 🎬 Storyboard Narrativo: Cómo Pasa Todo (Entrada de Héroes y Exploración)

Imagina una cinemática inicial (o texto descriptivo con imágenes 3D) que sumerge al jugador. La cámara sigue al equipo en primera persona/third-person, con música épica y sonidos ambientales.

### Escena 1: La Llegada (Fade-in desde el Menú)
**Cámara:** Wide shot, amanecer gris. El equipo de héroes aparece en un camino empedrado, rodeado de bosques marchitos. Música: Vientos suaves, pasos ecoando.  
"Nuestros valientes exploradores de Valnor, liderados por [Nombre del Personaje Principal], emergen del bosque. El aire es frío, cargado de humedad. A lo lejos, el río murmura como un susurro antiguo. '¿Listos para enfrentar lo desconocido?', dice el líder, ajustando su armadura. El equipo asiente, espadas tintineando."

### Escena 2: Caminando por el Valle (Exploración Inicial)
**Cámara:** Seguimiento suave, tercera persona. Los héroes caminan en formación: tanque adelante, healer atrás. Partículas de niebla flotan, árboles con ramas como garras.  
"Avanzan por el Valle de los Ecos. El suelo cruje bajo sus botas, hojas secas susurran. Un cuervo grazna desde un árbol retorcido, alertando al grupo. 'Siento una presencia oscura', murmura el healer, mirando alrededor. La niebla se espesa, ocultando sombras movedizas. De repente, una rama se rompe – ¡crack! – y todos se detienen, manos en armas."

### Escena 3: La Fortaleza a lo Lejos (Descubrimiento)
**Cámara:** Zoom-out lento, revelando la vista. La fortaleza emerge de la bruma: torres agrietadas, puente colgante con cadenas oxidadas, bandera negra ondeando. Luz tenue ilumina grietas verdes de musgo.  
"A lo lejos, majestuosa y ominosa, se alza la Fortaleza del Caballero Negro. Sus muros de piedra gris, cubiertos de enredaderas negras, parecen vivos. El puente de piedra arqueado cruza un abismo profundo, con agua turbia reflejando el cielo nublado. 'Allí está', susurra el líder. 'El puente maldito. ¿Cruzamos?' El equipo se acerca cautelosamente, corazones latiendo. La música acelera: tambores lejanos, como un corazón gigante."

### Escena 4: Acercamiento y Tensión (Transición a Combate)
**Cámara:** Primera persona, enfoque en el puente. Sombras se mueven; el Caballero aparece: armadura negra, espada goteando oscuridad.  
"Al pisar el puente, el viento cesa. Cadenas chirrían, agua gotea. De las sombras emerge el Caballero Corrupto, su armadura rezumando bruma roja. '¡Intrusos!', ruge con voz metálica. Los héroes desenvainan: espadas brillan, healer prepara pociones. La batalla es inminente. '¡Por Valnor!', grita el líder. La cámara congela en el choque de espadas – ¡clang! – y el combate comienza."

### Escena 5: Durante la Pelea (Acción Dinámica)
**Cámara:** Cambios rápidos: close-ups en ataques, wide shots en explosiones. Sangre virtual, chispas.  
"El Caballero carga, su espada un borrón negro. El tanque bloquea, recibiendo el golpe con un gruñido. '¡Cúrame!', pide. El healer lanza una poción verde. Los DPS contraatacan con fuego, llamas azules iluminando la niebla. Golpes se reparten: tanque 80 daño, DPS 20. '¡No cedan!', anima el líder."

### Escena 6: Resultado (Clímax y Resolución)
**Cámara:** Slow-motion en la victoria. Caballero cae, cenizas vuelan. Equipo herido cojea, pero sanación los revive.  
"Con un último golpe de fuego, el Caballero explota en sombras. Oro cae del cielo. '¡Victoria!', celebran. Pero algunos están heridos: sangre en armaduras, pasos lentos. 'Sanemos y sigamos', dice el healer. EXP fluye: +200 por héroe. La fortaleza se ilumina, revelando un portal adelante."

## 🎨 UI/UX Integrada con la Narrativa
- **Texto Overlay:** Durante escenas, subtítulos narrativos aparecen (ej. "A lo lejos se ve la fortaleza...").
- **Cinemáticas:** Usa Three.js para animaciones de cámara (orbit, zoom).
- **Sonido:** Diálogos opcionales, efectos 3D (eco en puente).

## ⚔️ Mecánicas Detalladas (Con Narrativa)
- **Reparto de Golpes:** "El Caballero ataca: tanque recibe 90, DPS 30 – ¡siente el impacto!"
- **EXP:** "Después de la victoria, EXP se asigna: +250 al líder, +200 a los demás."

## 📋 Flujo Antes del Combate (Preparación Detallada)
- **Paso 1: Selección de Mazmorra**.
  - UI: Lista scrollable con cards 3D (preview del castillo). Cada card muestra: Nombre ("Fortaleza del Caballero Negro"), Descripción ("Un puente maldito custodiado por un caballero corrupto"), Nivel Mínimo (10), Recompensas Preview ("+300 EXP, Items Épicos").
  - Endpoint: `GET /api/dungeons` → Respuesta: `[{ id: "fortaleza-id", name: "Fortaleza del Caballero Negro", levelMin: 10, rewards: { exp: 300, items: ["Espada Legendaria"] } }]`.
  - Validación: Si personaje < nivel 10, tooltip rojo "Requisito no cumplido".

- **Paso 2: Formación de Equipo**.
  - UI: Grid de 9 slots. Drag personajes desde inventario. Roles asignables: Tanque (escudo icono), DPS (espada), Healer (cruz verde).
  - Endpoint: `GET /api/user-characters` → Lista personajes con stats (vida, ataque, rol). `POST /api/teams` → Body: `{ name: "Equipo Castillo", characters: ["char1-id", "char2-id"] }` → Respuesta: Equipo creado con ID.
  - Lógica: Máx. 9 personajes; si <3, warning "Equipo pequeño, riesgo alto".

- **Paso 3: Entrada a la Mazmorra**.
  - UI: Botón "Entrar" con loading spinner. Transición: Fade to black, luego carga 3D.
  - Endpoint: `POST /api/dungeons/fortaleza-id/start` → Body: `{ teamId: "team-id" }` → Respuesta: `{ sessionId: "combat-session-123", mapData: { enemy: "Caballero Negro", position: [x,y,z] } }`.
  - Error Handling: Si BD offline, mensaje "Error de conexión, intenta de nuevo".

## ⚔️ Durante el Combate (Reparto de Golpes y Mecánicas Detalladas)
- **Reparto de Golpes/Daño (Lógica por Rol)**:
  - **Base**: Daño enemigo = 150 (fijo por ataque). Se reparte según rol y tamaño equipo.
  - **Fórmula Detallada**:
    - Tanque: 60% del daño (ej. Equipo de 3: Tanque recibe 90, DPS1 30, Healer 30).
    - DPS: 20% (menos vulnerable, enfocado en output).
    - Healer: 10% (protegido, pero puede curar).
    - Si equipo de 1: 100% al personaje.
    - Multiplicadores: Debilidad (fuego x2), buffs (+20% si healer activo).
  - UI: Al recibir daño, barras de vida bajan con animación (shake). Texto flotante: "-90 (Tanque)", "-30 (DPS)".
  - Endpoint: `POST /api/combat/action` → Body: `{ action: "enemyAttack", damage: 150 }` → Respuesta: `{ damageDistributed: { "char1": 90, "char2": 30, "char3": 30 }, healthRemaining: { "char1": 210/300 } }`.

- **Acciones del Jugador**:
  - Atacar: POST `/api/combat/action` → Daño calculado, animación de espada.
  - Esquivar: Reduce daño entrante en 50%, cuesta stamina.
  - Sanar: Healer usa habilidad → Glow verde, +50 HP a todos.

## 📊 Después del Combate (Resultados, Reacciones y Asignación de EXP Detallada)
- **Asignación de EXP**:
  - **Un Personaje Solo**: EXP total = 500 → Personaje gana 500. UI: Popup "+500 EXP".
  - **Equipo de 2**: EXP total = 500 → Cada uno +250 (50/50). Bonus: +10% si sobrevivieron ambos (+25 extra).
  - **Equipo de 3**: EXP total = 500 → Cada uno +167 (33/33/33). Bonus: +20% por healer (+33 extra).
  - Lógica: `totalExp = baseExp * dungeonMultiplier; perMember = totalExp / teamSize * (1 + bonus)`.
  - Endpoint: `POST /api/combat/end` → Body: `{ sessionId: "combat-session-123" }` → Respuesta: `{ expAssigned: { "char1": 250, "char2": 250 }, levelUps: ["char1"] }`.

- **Reacciones a Resultados**:
  - **Heridos (Victoria con Daño)**: UI: Avatares con iconos de sangre (rojo), animación de cojera. Mensaje: "Equipo herido. Sana para continuar." Sanación: POST `/api/characters/heal` → Body: `{ characterId: "char1", itemId: "potion-id" }` → Restaura HP, cuesta VAL.
  - **Sanación a Todos**: Opción post-combate: Botón "Curar Equipo" → POST `/api/teams/heal` → Aplica +100% HP a todos, costo 50 VAL. Animación: Partículas verdes, barras llenas.
  - **Victoria Total**: Confeti, loot drops. Endpoint: `GET /api/combat/results` → Stats completas.
  - **Derrota**: UI oscura, botón "Revivir" → POST `/api/characters/revive` → Pierde 20% EXP, costo 100 VAL.

- **Flujo Post-Combate**:
  - Pantalla resumen (5s): Stats, EXP, loot. Luego fade-out a mapa.
  - Persistencia: Inventario actualizado via `POST /api/inventory/add`.

## 🎨 UI/UX Detallada (Enfocada en Reacciones)
- HUD: Barras por personaje con colores (verde: full, amarillo: herido, rojo: crítico).
- Reacciones: Heridos → Vibración en barras; Sanación → Glow y sonido de campanillas.

---

**Notas para Implementación en Frontend:**
- Usa React + Three.js para cinemáticas.
- Endpoints basados en el backend de Valgame.
- Ajusta nombres/variables según tu código.</content>
<parameter name="filePath">c:\Users\Usuario\Desktop\trabajo\Valnor-full\gui a de ejempli\valgame-backend\docs\guion-escenario-fortaleza-caballero-negro.md