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