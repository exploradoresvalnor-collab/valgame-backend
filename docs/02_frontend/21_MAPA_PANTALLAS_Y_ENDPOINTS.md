# Mapa de pantallas y endpoints: ¿Dónde y cómo se usan en el juego?

## 1. Pantalla de Registro
- **Endpoint:** `POST /api/auth/register`
- **Dónde:** Pantalla de registro/inicio de sesión.
- **Cómo:** Al enviar el formulario de registro.
- **Qué mostrar:** Mensaje de éxito o error, redirigir a login o dashboard.

## 2. Pantalla de Login
- **Endpoint:** `POST /api/auth/login`
- **Dónde:** Pantalla de login.
- **Cómo:** Al enviar el formulario de login.
- **Qué mostrar:** Acceso al dashboard, guardar sesión (cookie).

## 3. Dashboard / Perfil de Usuario
- **Endpoint:** `GET /api/user/profile`
- **Dónde:** Al cargar el dashboard o perfil.
- **Cómo:** Llamada automática tras login.
- **Qué mostrar:** Nivel, experiencia, nombre, progreso, resumen de usuario.

## 4. Inventario
- **Endpoint:** `GET /api/user/inventario`
- **Dónde:** Pantalla de inventario.
- **Cómo:** Al entrar a la sección de inventario.
- **Qué mostrar:** Lista de ítems (equipamiento, consumibles, especiales).
- **Extra:** Llama a `GET /api/items/:id` para mostrar detalles de cada ítem.

## 5. Personajes (detalle y gestión)
- **Endpoint:**
  - `GET /api/characters/:id` (detalle de personaje)
  - `POST /api/characters/:characterId/equip` (equipar)
  - `POST /api/characters/:characterId/unequip` (desequipar)
- **Dónde:** Pantalla de detalle de personaje.
- **Cómo:** Al seleccionar un personaje y al equipar/desequipar.
- **Qué mostrar:** Stats, equipamiento actual, slots, botón para equipar/desequipar.

## 6. Paquetes (Gacha)
- **Endpoint:**
  - `GET /api/packages` (listar paquetes disponibles)
  - `POST /api/user-packages/por-correo` (listar paquetes del usuario)
  - `POST /api/user-packages/open` (abrir paquete)
- **Dónde:** Pantalla de tienda/gacha y pantalla de paquetes del usuario.
- **Cómo:**
  - Mostrar paquetes disponibles para comprar/abrir.
  - Listar paquetes del usuario.
  - Abrir paquete y mostrar recompensas.

## 7. Consumibles
- **Endpoint:** `POST /api/consumables/use`
- **Dónde:** Inventario o pantalla de combate.
- **Cómo:** Al hacer clic en "usar" sobre un consumible.
- **Qué mostrar:** Efecto aplicado, feedback visual, actualizar inventario.

## 8. Barra de navegación / Estado global
- **Endpoints:**
  - `GET /api/user/profile` (para mostrar nombre, nivel, etc. en la barra)
  - Otros endpoints según la sección activa.
- **Dónde:** Barra superior, menú lateral, etc.
- **Cómo:** Llamada al cargar la app o al cambiar de usuario.

---

## Consejos de integración
- Usa servicios centralizados para manejar las llamadas (ej: `UserService`, `ItemService`).
- Cada pantalla debe pedir solo los datos que necesita y actualizar la UI tras cada acción.
- Usa loading/spinners mientras esperas la respuesta.
- Maneja errores y muestra mensajes claros al usuario.

---

Esta guía te ayuda a ubicar cada endpoint en la pantalla correspondiente y a saber cómo y cuándo llamarlo desde el frontend. Si necesitas ejemplos de código para alguna pantalla específica, pídelo y te lo agrego.
---

# ��� SURVIVAL - PANTALLAS Y ENDPOINTS

## PANTALLA 1: Seleccionar Personaje (COMPARTIDA)

- **Endpoint:** `GET /api/users/me` (obtener personajes disponibles)
- **Dónde:** Menú principal de Survival
- **Cómo:** Al abrir el modo Survival, mostrar lista de personajes (1-9 máximo)
- **Qué mostrar:** Nombre, nivel, equipamiento actual ✓
- **Validación:** El personaje debe tener exactamente 4 items equipados

---

## PANTALLA 2: Pre-Sesión (EQUIPAMIENTO)

- **Endpoint:** `POST /api/survival/start`
- **Dónde:** Después de seleccionar personaje
- **Cómo:** Mostrar equipo automáticamente, permitir elegir consumibles
- **Qué mostrar:** 
  - 4 slots de equipamiento (head, body, hands, feet)
  - Bonificadores de stats por equipo
  - Consumibles disponibles (0-5, opcional)
- **Acción:** Clic en "INICIAR SURVIVAL"

---

## PANTALLA 3: En Combate (GAMEPLAY)

- **Endpoint:** `POST /api/survival/:sessionId/complete-wave`
- **Endpoint:** `POST /api/survival/:sessionId/use-consumable` (si aplica)
- **Endpoint:** `POST /api/survival/:sessionId/pickup-drop` (si aplica)
- **Dónde:** Pantalla de juego principal
- **Cómo:** Después de iniciar sesión, mostrar:
  - Barra de vida del personaje
  - Oleada actual (1-5)
  - Puntos acumulados
  - Enemigos en pantalla
  - Botones: ATACAR, USAR CONSUMIBLE, HUIR
- **Qué mostrar:** HUD con stats en tiempo real
- **Actualización:** Tras cada acción, llamar a `complete-wave`

---

## PANTALLA 4: Resultado (VICTORIA o DERROTA)

**Ruta Ganar:**
- **Endpoint:** `POST /api/survival/:sessionId/end`
- **Dónde:** Al completar oleada 5
- **Mostrar:**
  - ��� "¡GANASTE!" (o ☠️ "PERDISTE")
  - Oleadas completadas (x/5)
  - Puntos totales
  - Recompensas: EXP, VAL, Items
  - Posición en leaderboard

**Ruta Perder:**
- **Endpoint:** `POST /api/survival/:sessionId/report-death`
- **Dónde:** Al morir antes de oleada 5
- **Mostrar:**
  - ☠️ "PERDISTE"
  - Oleada donde murió
  - Enemigos derrotados
  - Puntos ganados (50% penalty)
  - Opción: Intentar de nuevo o volver

---

## PANTALLA 5: Canje de Puntos

- **Endpoint:** `POST /api/survival/exchange-points/exp`
- **Endpoint:** `POST /api/survival/exchange-points/val`
- **Endpoint:** `POST /api/survival/exchange-points/items`
- **Dónde:** Menú Survival o tras terminar sesión
- **Cómo:** Mostrar tres opciones de canje:
  1. **Canjear por EXP**: 1 punto = 1 EXP (para subir nivel)
  2. **Canjear por VAL**: 2 puntos = 1 VAL (moneda)
  3. **Canjear por Items**: Items de la tienda Survival
- **Qué mostrar:**
  - Puntos disponibles
  - Tasa de cambio
  - Preview de recompensa
  - Botón: CANJEAR

---

## PANTALLA 6: Leaderboard Global

- **Endpoint:** `GET /api/survival/leaderboard?limit=50&offset=0`
- **Dónde:** Sección de rankings
- **Cómo:** Llamar al cargar la pantalla
- **Qué mostrar:** Tabla con columnas:
  - Posición (1-50)
  - Nombre del jugador
  - Personaje usado
  - Puntos totales
  - Sesiones jugadas
  - Oleada promedio
- **Extra:** Mostrar "Tu posición: #127" si el usuario está en el leaderboard

---

## ESTADÍSTICAS PERSONALES (Pantalla bonus)

- **Endpoint:** `GET /api/survival/my-stats`
- **Dónde:** Perfil del usuario o sección Mis Stats
- **Qué mostrar:**
  - Total sesiones jugadas
  - Puntos acumulados
  - Oleada promedio alcanzada
  - Tu récord personal (oleada más alta)
  - Mejor sesión (más puntos)
  - Tu posición en leaderboard

---

## RESUMEN FLUJO COMPLETO

```
1. PANTALLA 1: Seleccionar personaje
   ↓ GET /api/users/me
   
2. PANTALLA 2: Validar + Pre-sesión
   ↓ POST /api/survival/start
   
3. PANTALLA 3: Jugar oleadas
   ↓ POST /api/survival/:sessionId/complete-wave (x5)
   ↓ POST /api/survival/:sessionId/use-consumable (opcional)
   
4. PANTALLA 4: Ver resultado
   ↓ POST /api/survival/:sessionId/end (ganar)
   ↓ POST /api/survival/:sessionId/report-death (perder)
   
5. PANTALLA 5: Canjear puntos
   ↓ POST /api/survival/exchange-points/{exp|val|items}
   
6. PANTALLA 6: Ver rankings
   ↓ GET /api/survival/leaderboard
   ↓ GET /api/survival/my-stats
```
