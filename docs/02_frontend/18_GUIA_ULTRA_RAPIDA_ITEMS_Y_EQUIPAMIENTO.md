# Guía ultra rápida: Ítems, Equipamiento y Consumibles en el Frontend

## 1. Modelo unificado: `Item`
- **Todos los objetos del inventario** (equipamiento, consumibles, especiales) son del modelo `Item`.
- Distingue el tipo usando el campo `tipoItem`:
  - `"Equipment"` → equipamiento (arma, armadura, accesorio, etc.)
  - `"Consumable"` → consumible (pociones, tickets, etc.)
  - `"Special"` → objetos especiales

## 2. Inventarios en el backend
- `user.inventarioEquipamiento`: array de IDs de `Item` tipo `Equipment`.
- `user.inventarioConsumibles`: array de IDs de `Item` tipo `Consumable`.
- `character.equipamiento`: array de IDs de `Item` actualmente equipados en el personaje.

## 3. Endpoints clave
- **Registro:**
  - `POST /api/auth/register` (usa cookies httpOnly, no token en header)
- **Login:**
  - `POST /api/auth/login` (usa cookies httpOnly)
- **Obtener inventario:**
  - `GET /api/user/inventario` → retorna arrays de IDs y puedes pedir detalles de cada item por ID
- **Obtener detalles de items:**
  - `GET /api/items/:id` (o usa endpoint de batch si existe)
- **Equipar item:**
  - `POST /api/characters/:characterId/equip` `{ itemId }`
- **Desequipar item:**
  - `POST /api/characters/:characterId/unequip` `{ itemId }`
- **Usar consumible:**
  - `POST /api/consumables/use` `{ itemId }`

## 4. Normalización recomendada en el frontend
- Cuando recibas arrays de IDs, haz una petición para obtener los detalles de cada item.
- Para mostrar el equipamiento de un personaje como objeto con slots:
  1. Obtén los detalles de cada item en `character.equipamiento`.
  2. Clasifica por slot usando el campo `slot` o `tipo` del item (ej: arma, armadura, accesorio).
  3. Construye un objeto `{ arma, armadura, accesorio }` para la vista.

### Ejemplo:
```ts
// character.equipamiento = [id1, id2, id3]
const items = await getItemsByIds(character.equipamiento);
const slots = {};
for (const item of items) {
  slots[item.slot] = item; // slot puede ser 'arma', 'armadura', etc.
}
// slots = { arma: {...}, armadura: {...}, accesorio: {...} }
```

## 5. Consejos para autenticación y cookies
- Usa `withCredentials: true` en fetch/axios para que se envíen las cookies.
- No necesitas token en header, todo va por cookie httpOnly.
- Si tienes problemas de CORS, revisa que el backend acepte `credentials: 'include'` y el frontend esté en la whitelist.

## 6. Resumen de endpoints útiles
- `/api/auth/register` y `/api/auth/login` (autenticación por cookie)
- `/api/user/inventario` (IDs de items)
- `/api/items/:id` (detalle de item)
- `/api/characters/:characterId/equip` y `/unequip` (equipar/desequipar)
- `/api/consumables/use` (usar consumible)

## 7. Flujo recomendado para mostrar inventario y equipamiento
1. Login → cookie de sesión
2. Obtener inventario del usuario (IDs)
3. Obtener detalles de los items
4. Mostrar en la vista agrupando por tipo y slot
5. Para equipar/desequipar/usar, llama al endpoint y refresca el inventario

---

¿Dudas? Consulta este archivo o busca en la carpeta `FRONTEND_STARTER_KIT` los ejemplos de servicios y modelos.

> Esta guía resume lo esencial para implementar el manejo de ítems y equipamiento en el frontend con el backend actual (noviembre 2025).