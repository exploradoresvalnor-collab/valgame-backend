# 🚨 ERRORES - CÓDIGOS HTTP Y SOLUCIONES

**Referencia completa de códigos de error HTTP y cómo manejarlos**

---

## 📊 ÍNDICE POR CÓDIGO

- [2xx - Éxito](#2xx--éxito)
- [4xx - Cliente](#4xx--cliente-errores-del-usuario)
- [5xx - Servidor](#5xx--servidor-errores-nuestros)

---

## 2xx - Éxito

### **200 OK**
Solicitud exitosa, respuesta en el body.

```json
{
  "success": true,
  "data": { /* respuesta */ }
}
```

### **201 Created**
Recurso creado exitosamente.

```json
{
  "success": true,
  "message": "Character created successfully",
  "data": { "id": "..." }
}
```

### **204 No Content**
Solicitud exitosa pero sin respuesta.
- Ejemplos: `DELETE /inventory/item/:id`, algunos endpoints de actualización

---

## 4xx - Cliente (Errores del usuario)

### **400 Bad Request**
Parámetros inválidos o body malformado.

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid input",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

**Soluciones:**
- ✅ Revisa el formato JSON
- ✅ Valida tipos de datos (string, number, boolean)
- ✅ Verifica que todos los campos requeridos estén presentes
- ✅ Lee el detalle de cada error

---

### **401 Unauthorized**
Token JWT faltante, inválido o expirado.

```json
{
  "error": "UNAUTHORIZED",
  "message": "No token provided",
  "code": "NO_TOKEN"
}
```

**Causas:**
- ❌ No enviaste el header `Authorization: Bearer <token>`
- ❌ El token está expirado (>7 días)
- ❌ El token es inválido o corrompido

**Soluciones:**
1. Verifica que el header sea: `Authorization: Bearer <token>`
2. Obtén un nuevo token con `POST /api/auth/refresh-token`
3. Si falló, haz login nuevamente con `/api/auth/login`

```bash
# ✅ Correcto
curl -H "Authorization: Bearer eyJ..." http://localhost/api/profile

# ❌ Error
curl http://localhost/api/profile
```

---

### **403 Forbidden**
Acceso denegado (tienes token pero no permisos).

```json
{
  "error": "FORBIDDEN",
  "message": "You don't have permission to perform this action",
  "resource": "character_123"
}
```

**Causas:**
- ❌ Intentas acceder a un personaje de otro usuario
- ❌ Intentas editar datos que no son tuyos
- ❌ Tu rol no tiene permisos para esto

**Soluciones:**
1. Verifica que uses IDs correctos (tus propios recursos)
2. Verifica tu rol/permisos
3. Lee el campo `resource` para entender qué no puedes hacer

---

### **404 Not Found**
Recurso no existe.

```json
{
  "error": "NOT_FOUND",
  "message": "Character not found",
  "resource": "character_123"
}
```

**Causas:**
- ❌ El ID del recurso es incorrecto
- ❌ El recurso fue eliminado
- ❌ La ruta del endpoint es incorrecta

**Soluciones:**
1. Verifica que el ID exista (ej: `GET /api/characters` para ver tus personajes)
2. Revisa la ruta del endpoint en la documentación
3. Comprueba la ortografía exacta

---

### **409 Conflict**
Conflicto - no puedes hacer eso ahora.

```json
{
  "error": "CONFLICT",
  "message": "Character is already in combat",
  "current_state": "COMBAT"
}
```

**Causas comunes:**
- ❌ Intentas evolucionar pero aún estás en combate
- ❌ Intentas listar un item que ya está listado
- ❌ Intentas comprar pero el item ya fue vendido

**Soluciones:**
1. Termina el combate primero
2. Espera a que la operación anterior termine
3. Recarga el estado del recurso

---

### **422 Unprocessable Entity**
Solicitud válida pero no se puede procesar.

```json
{
  "error": "INSUFFICIENT_RESOURCES",
  "message": "Not enough VAL to purchase",
  "required": 5000,
  "available": 2000
}
```

**Causas comunes:**
- ❌ No tienes suficientes recursos (VAL, EVO tokens)
- ❌ No cumples requisitos (nivel bajo para evolucionar)
- ❌ Inventory lleno

**Soluciones:**
1. Obtén recursos (marketplace, shop, misiones)
2. Sube de nivel si es requerido
3. Limpia inventory si está lleno

---

### **429 Too Many Requests**
Rate limit excedido. Estás haciendo demasiadas solicitudes.

```json
{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests",
  "retry_after": 45
}
```

**Headers HTTP:**
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1702503245
```

**Causa:**
- ❌ Enviaste más solicitudes de las permitidas en el período

**Soluciones:**
```javascript
// ❌ MAL: Loop sin espera
for (let i = 0; i < 100; i++) {
  await api.getCharacter();
}

// ✅ BIEN: Respeta rate limit
const delay = (ms) => new Promise(r => setTimeout(r, ms));
for (let i = 0; i < 100; i++) {
  await api.getCharacter();
  if (i < 99) await delay(500);
}

// ✅ MEJOR: Implementa backoff exponencial
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (err.status === 429) {
        const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
        console.log(`Rate limited. Retrying in ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
      } else {
        throw err;
      }
    }
  }
}
```

**Rate Limits por endpoint:**

| Límite | Endpoints | Límite |
|--------|-----------|--------|
| Muy alto | Rankings, Health check | 50+/min |
| Alto | GET general | 30-50/min |
| Medio | POST, PUT general | 10-20/min |
| Bajo | Auth, Payments, Delete | 1-5/min |

---

## 5xx - Servidor (Errores nuestros)

### **500 Internal Server Error**
Error no especificado en el servidor.

```json
{
  "error": "INTERNAL_ERROR",
  "message": "Internal server error",
  "error_id": "err_123456"
}
```

**No es tu culpa.** Reporta el `error_id` al equipo.

```
❌ Error ID: err_123456
📧 Email: support@valgame.com
📝 Incluye: error_id, endpoint, hora, qué intentaste hacer
```

---

### **501 Not Implemented**
Endpoint existe pero aún no está implementado.

```json
{
  "error": "NOT_IMPLEMENTED",
  "message": "This feature is coming soon"
}
```

**Qué hacer:**
- ✅ Espera a que se implemente
- ✅ Pregunta al equipo cuándo estará disponible

---

### **502 Bad Gateway**
MongoDB o base de datos no responde.

```json
{
  "error": "DATABASE_ERROR",
  "message": "Database connection failed"
}
```

**Causas:**
- ❌ Base de datos caída
- ❌ Problema de conectividad de red
- ❌ Servidor está rebooteando

**Soluciones:**
1. Espera unos segundos e intenta de nuevo
2. Implementa reintentos con backoff
3. Si persiste, reporta al equipo

---

### **503 Service Unavailable**
Servidor está en mantenimiento o sobrecargado.

```json
{
  "error": "SERVICE_UNAVAILABLE",
  "message": "Server is currently unavailable"
}
```

**Qué hacer:**
- ✅ Espera (mantenimiento generalmente < 1 hora)
- ✅ Reintentar después

---

## 🛠️ GUÍA DE DEBUGGING

### Paso 1: Revisa el Status Code

```javascript
fetch('/api/something')
  .then(res => {
    console.log('Status:', res.status); // 200, 400, 401, etc
    return res.json();
  })
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

### Paso 2: Lee el Error JSON

```javascript
{
  "error": "INSUFFICIENT_RESOURCES",  // ← Código de error específico
  "message": "Not enough VAL",         // ← Mensaje legible
  "details": { /* contexto */ }        // ← Información adicional
}
```

### Paso 3: Implementa Manejo Específico

```javascript
async function apiCall(endpoint) {
  try {
    const res = await fetch(endpoint, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) {
      const error = await res.json();
      
      if (res.status === 401) {
        // Token expirado
        redirectToLogin();
      } else if (res.status === 429) {
        // Rate limited
        showMessage('Espera un momento antes de reintentar');
        setTimeout(() => apiCall(endpoint), 5000);
      } else if (res.status === 422) {
        // Lógica de negocio fallida
        showMessage(error.message);
      } else {
        // Error genérico
        console.error(error);
      }
    }
    
    return await res.json();
  } catch (err) {
    console.error('Network error:', err);
  }
}
```

---

## 📋 CHECKLIST DE DEBUGGING

Cuando recibas un error:

- [ ] ¿Cuál es el status code? (200, 400, 401, etc)
- [ ] ¿Cuál es el error `code`? (VALIDATION_ERROR, UNAUTHORIZED, etc)
- [ ] ¿Qué dice el `message`?
- [ ] ¿Hay más detalles en `details`?
- [ ] ¿Estoy enviando los headers correctos?
- [ ] ¿Es un error de cliente (4xx) o servidor (5xx)?
- [ ] ¿He reintentado?
- [ ] ¿Está el servidor caído?

---

## 🔗 ERRORES ESPECÍFICOS POR SISTEMA

### **Auth**
- `NO_TOKEN` → Falta header Authorization
- `INVALID_TOKEN` → Token malformado o expirado
- `INVALID_CREDENTIALS` → Email o contraseña incorrectos
- `EMAIL_ALREADY_EXISTS` → Email ya registrado
- `EMAIL_NOT_VERIFIED` → Debes verificar email primero

### **Characters**
- `CHARACTER_NOT_FOUND` → ID incorrecto
- `CHARACTER_IN_COMBAT` → No puedes evolucionar mientras combates
- `INSUFFICIENT_RESOURCES` → No tienes VAL o EVO suficiente
- `LEVEL_REQUIREMENT_NOT_MET` → Nivel muy bajo

### **Marketplace**
- `ITEM_NOT_FOUND` → El item fue vendido
- `INSUFFICIENT_FUNDS` → No tienes suficiente VAL
- `ITEM_ALREADY_LISTED` → Ya está listado

### **Energy**
- `ENERGY_DEPLETED` → Sin energía. Espera regeneración o cómprala
- `REFILL_ON_COOLDOWN` → Acabas de recargar, espera

---

**Última actualización:** 24 de noviembre, 2025
