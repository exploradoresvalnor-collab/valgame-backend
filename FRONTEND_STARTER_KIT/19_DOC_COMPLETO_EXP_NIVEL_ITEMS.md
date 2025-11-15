# Guía completa: Experiencia, Nivel y Manejo de Ítems en el Frontend

## 1. Experiencia y Nivel de Usuario
- El usuario tiene campos como `nivel` (level) y `exp` (experiencia actual).
- Al realizar acciones (misiones, combates, abrir paquetes, etc.), el backend suma experiencia.
- Cuando la experiencia supera el umbral, el usuario sube de nivel.
- Ejemplo de estructura:
  ```json
  {
    "nivel": 5,
    "exp": 1200,
    "expToNextLevel": 2000
  }
  ```
- El backend puede enviar estos datos en el login, en `/api/user/profile` o en endpoints de progreso.

### Mostrar en el frontend
- Muestra el nivel (`Nivel 5`) y una barra de progreso:
  ```ts
  const porcentaje = (exp / expToNextLevel) * 100;
  ```
- Puedes mostrar el progreso con una barra y el número de experiencia actual/siguiente nivel.

## 2. Endpoints clave para usuario y experiencia
- `POST /api/auth/register` — registro (usa cookies httpOnly)
- `POST /api/auth/login` — login (usa cookies httpOnly)
- `GET /api/user/profile` — perfil del usuario (nivel, exp, etc.)
- Otros endpoints pueden retornar nivel/exp tras acciones (abrir paquete, combate, etc.)

## 3. Manejo de Ítems (Equipamiento y Consumibles)
- Todos los ítems son del modelo `Item`.
- Distingue el tipo con el campo `tipoItem`:
  - `"Equipment"` → equipamiento
  - `"Consumable"` → consumible
  - `"Special"` → especial

### Inventarios
- `user.inventarioEquipamiento`: array de IDs de `Item` tipo `Equipment`.
- `user.inventarioConsumibles`: array de IDs de `Item` tipo `Consumable`.
- `character.equipamiento`: array de IDs de `Item` actualmente equipados.

### Endpoints para ítems
- `GET /api/user/inventario` — retorna arrays de IDs de ítems
- `GET /api/items/:id` — detalle de un ítem
- `POST /api/characters/:characterId/equip` — equipar item `{ itemId }`
- `POST /api/characters/:characterId/unequip` — desequipar item `{ itemId }`
- `POST /api/consumables/use` — usar consumible `{ itemId }`

### Ejemplo de normalización para la vista
```ts
// character.equipamiento = [id1, id2, id3]
const items = await getItemsByIds(character.equipamiento);
const slots = {};
for (const item of items) {
  slots[item.slot] = item; // slot puede ser 'arma', 'armadura', etc.
}
// slots = { arma: {...}, armadura: {...}, accesorio: {...} }
```

## 4. Consejos para autenticación y cookies
- Usa `withCredentials: true` en fetch/axios para que se envíen las cookies.
- No necesitas token en header, todo va por cookie httpOnly.
- Si tienes problemas de CORS, revisa que el backend acepte `credentials: 'include'` y el frontend esté en la whitelist.

## 5. Flujo recomendado para mostrar inventario, equipamiento y nivel
1. Login → cookie de sesión
2. Obtener perfil del usuario (`/api/user/profile`) para nivel y exp
3. Obtener inventario del usuario (`/api/user/inventario`)
4. Obtener detalles de los ítems
5. Mostrar en la vista agrupando por tipo y slot
6. Para equipar/desequipar/usar, llama al endpoint y refresca el inventario

---

Esta guía resume lo esencial para implementar experiencia, nivel e ítems en el frontend con el backend actual (noviembre 2025). Si necesitas ejemplos de servicios Angular/TS, pídelo y te los agrego.