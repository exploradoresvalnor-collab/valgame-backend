# Referencia rápida: Cómo llamar a los endpoints desde el frontend

## 1. Autenticación (registro y login)

### Registro
```ts
await fetch('/api/auth/register', {
  method: 'POST',
  credentials: 'include', // importante para cookies
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password, username })
});
```

### Login
```ts
await fetch('/api/auth/login', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```

## 2. Perfil y progreso de usuario

### Obtener perfil
```ts
const res = await fetch('/api/user/profile', { credentials: 'include' });
const data = await res.json();
// data: { nivel, exp, ... }
```

## 3. Inventario y detalles de ítems

### Obtener inventario
```ts
const res = await fetch('/api/user/inventario', { credentials: 'include' });
const data = await res.json();
// data: { inventarioEquipamiento: [id...], inventarioConsumibles: [id...], ... }
```

### Obtener detalles de un ítem
```ts
const res = await fetch(`/api/items/${itemId}`, { credentials: 'include' });
const item = await res.json();
```

## 4. Equipar y desequipar ítems

### Equipar
```ts
await fetch(`/api/characters/${characterId}/equip`, {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ itemId })
});
```

### Desequipar
```ts
await fetch(`/api/characters/${characterId}/unequip`, {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ itemId })
});
```

## 5. Usar consumible
```ts
await fetch('/api/consumables/use', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ itemId })
});
```

## 6. Paquetes (gacha)

### Listar paquetes disponibles
```ts
const res = await fetch('/api/packages', { credentials: 'include' });
const data = await res.json();
```

### Listar paquetes del usuario
```ts
const res = await fetch('/api/user-packages/por-correo', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email })
});
const data = await res.json();
```

### Abrir paquete
```ts
await fetch('/api/user-packages/open', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userPackageId })
});
```

## 7. Consejos generales
- Siempre usa `credentials: 'include'` para que se envíen las cookies.
- Maneja errores con try/catch y revisa el status de la respuesta.
- Si el backend responde 401/403, redirige a login.
- Consulta la guía de modelos para saber cómo mapear los datos en la vista.

---

Esta referencia cubre los endpoints más usados para usuario, ítems y paquetes. Si necesitas ejemplos para otros endpoints (misiones, marketplace, ranking, etc.), pídelo y los agrego.