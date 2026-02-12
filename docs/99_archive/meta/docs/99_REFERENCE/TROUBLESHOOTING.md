# 🔧 TROUBLESHOOTING - SOLUCIONES A PROBLEMAS COMUNES

**Guía para resolver problemas típicos del backend**

---

## 📊 ÍNDICE

1. [Autenticación](#autenticación)
2. [Base de Datos](#base-de-datos)
3. [Endpoints/API](#endpointsapi)
4. [Rendering/Performance](#renderingperformance)
5. [WebSocket/Real-time](#websocketreal-time)
6. [Deployment/DevOps](#deploymentdevops)
7. [Seguridad](#seguridad)

---

## 🔑 Autenticación

### Problema: "401 Unauthorized - No token provided"

**Síntomas:**
```
GET /api/profile → 401
{
  "error": "UNAUTHORIZED",
  "message": "No token provided",
  "code": "NO_TOKEN"
}
```

**Causas posibles:**
1. No incluiste el header `Authorization`
2. El header está mal formado
3. Token está vacío

**Solución:**

```javascript
// ❌ INCORRECTO
fetch('/api/profile');

// ❌ INCORRECTO (header mal)
fetch('/api/profile', {
  headers: { 'Authorization': 'Bearer' } // Falta el token
});

// ✅ CORRECTO
const token = localStorage.getItem('token');
fetch('/api/profile', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**Checklist:**
- [ ] ¿Guardaste el token después de login?
- [ ] ¿El token tiene contenido?
- [ ] ¿El formato es `Bearer <token>`?
- [ ] ¿Hay un espacio después de Bearer?

---

### Problema: "401 Unauthorized - Invalid token"

**Síntomas:**
```
GET /api/profile → 401
{
  "error": "UNAUTHORIZED",
  "message": "Invalid or expired token"
}
```

**Causas:**
1. Token expirado (>7 días)
2. Token corrompido/modificado
3. JWT_SECRET cambió en backend

**Solución:**

```typescript
// En el frontend: Implementa refresh automático
async function apiCall(url) {
  const token = localStorage.getItem('token');
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (res.status === 401) {
    // Intenta refrescar
    const refreshRes = await fetch('/api/auth/refresh-token', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (refreshRes.ok) {
      const { token: newToken } = await refreshRes.json();
      localStorage.setItem('token', newToken);
      // Reintentar con nuevo token
      return apiCall(url);
    } else {
      // Redirect a login
      window.location.href = '/login';
    }
  }

  return res;
}
```

**Checklist:**
- [ ] ¿Pasaron más de 7 días? → Haz login nuevamente
- [ ] ¿El token se ve extraño? → Limpia localStorage y login
- [ ] ¿El servidor se reinició? → Necesitas login nuevamente

---

### Problema: "Cannot read token from httpOnly cookie"

**Síntomas:**
- No ves el token en `document.cookie`
- Pero funciona la autenticación

**Causa:**
- Por seguridad, httpOnly cookies no son accesibles desde JavaScript

**Solución (NO HAY PROBLEMA):**

```javascript
// ❌ Esto no funciona (ni debe)
console.log(document.cookie); // ← Cookie httpOnly no aparece

// ✅ El backend automáticamente usa la cookie en cada request
fetch('/api/profile'); // ← Cookie se envía automáticamente
```

**Explícación:**
- Cookies httpOnly son automáticas (navegador las envía)
- No necesitas código especial
- Son más seguras contra XSS

---

## 💾 Base de Datos

### Problema: "ECONNREFUSED - Connection refused"

**Síntomas:**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
Cannot connect to MongoDB
```

**Causas:**
1. MongoDB no está corriendo
2. URL de conexión incorrecta en `.env`
3. Firewall bloqueando puerto 27017

**Soluciones:**

**Si usas MongoDB local:**
```bash
# Inicia MongoDB
mongod

# O si usas MongoDB Atlas (en .env):
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/database
```

**Si usas MongoDB Atlas:**
```bash
# Verifica en .env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/DB_NAME

# Checklist:
# [ ] ¿USERNAME es correcto?
# [ ] ¿PASSWORD es correcto? (URL-encoded si tiene caracteres especiales)
# [ ] ¿cluster es correcto?
# [ ] ¿DB_NAME es correcto?
# [ ] ¿Tu IP está en la whitelist de MongoDB Atlas?
```

**Whitelist en MongoDB Atlas:**
1. Login a atlas.mongodb.com
2. Network Access → IP Whitelist
3. Añade tu IP actual (o `0.0.0.0/0` en desarrollo)

---

### Problema: "Schema validation error"

**Síntomas:**
```
ValidationError: Validation failed: email: Email format invalid
```

**Causa:**
- El documento no cumple el schema de MongoDB

**Solución:**

1. Revisa qué validación falla
2. Lee el mensaje de error
3. Asegúrate de enviár el formato correcto

```typescript
// Validaciones comunes:

// Email
❌ "notanemail"
✅ "user@example.com"

// Phone
❌ "123"
✅ "+34912345678"

// URL
❌ "not a url"
✅ "https://example.com"

// Número positivo
❌ -100
✅ 100

// Enum
❌ "unknown_status"
✅ "ACTIVE" | "INACTIVE"
```

---

### Problema: "Duplicate key error"

**Síntomas:**
```
E11000 duplicate key error collection: db.users index: email_1 dup key: { email: "user@example.com" }
```

**Causa:**
- Intentas crear user con email que ya existe
- Índice único en ese campo

**Solución:**

```typescript
// Verifica antes de crear
async function registerUser(email) {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new Error('Email already in use');
  }
  return User.create({ email, ... });
}

// O captura el error
try {
  await User.create({ email });
} catch (err) {
  if (err.code === 11000) {
    // Email duplicado
    res.status(409).json({ error: 'Email already registered' });
  } else {
    throw err;
  }
}
```

**Checklist:**
- [ ] ¿El email ya está registrado?
- [ ] ¿El nombre de usuario ya existe?
- [ ] ¿El item ya está listado?

---

### Problema: N+1 Query Problem (Lento)

**Síntomas:**
```
// Cargar 10 usuarios
const users = await User.find(); // 1 query

// Para cada usuario, cargar su personaje
for (let user of users) {
  user.character = await Character.findById(user.characterId); // 10 queries
}

// Total: 1 + 10 = 11 queries (LENTO)
```

**Solución (populate):**

```typescript
// ✅ CORRECTO: 1 query
const users = await User.find().populate('characterId');

// Alternativa si populate no funciona:
// ✅ CORRECTO: 2 queries (mucho mejor)
const users = await User.find();
const charIds = users.map(u => u.characterId);
const characters = await Character.find({ _id: { $in: charIds } });
const charMap = Object.fromEntries(characters.map(c => [c._id, c]));
users.forEach(u => u.character = charMap[u.characterId]);
```

**Checklist (si está lento):**
- [ ] ¿Haces queries en loops?
- [ ] ¿Usas `populate()` para relaciones?
- [ ] ¿Los índices están creados?

```bash
npm run create-indexes  # Crea índices recomendados
```

---

## 🌐 Endpoints/API

### Problema: "400 Bad Request - Validation Error"

**Síntomas:**
```
POST /api/characters/create → 400
{
  "error": "VALIDATION_ERROR",
  "details": [
    { "field": "name", "message": "String must contain at most 50 characters" }
  ]
}
```

**Solución:**

1. Lee el field que falla
2. Revisa las constraints
3. Envía el dato correcto

**Constraints comunes:**

```typescript
// Length
name: "A", // ❌ Min 2
name: "A".repeat(100), // ❌ Max 50
name: "Hero", // ✅

// Type
level: "abc", // ❌ Debe ser número
level: 10, // ✅

// Pattern (email, phone)
email: "not-email", // ❌
email: "user@example.com", // ✅

// Enum
status: "unknown", // ❌
status: "active", // ✅

// Range
price: -100, // ❌ Debe ser positivo
price: 100, // ✅

// URL
website: "not a url", // ❌
website: "https://example.com", // ✅
```

---

### Problema: "404 Not Found"

**Síntomas:**
```
GET /api/characters/xyz123 → 404
{
  "error": "NOT_FOUND",
  "message": "Character not found"
}
```

**Causas:**
1. El ID es incorrecto
2. El recurso fue eliminado
3. La ruta del endpoint está mal

**Soluciones:**

```javascript
// 1. Verifica el ID
const characterId = "603c2f..."; // ← Copia el ID correctamente
fetch(`/api/characters/${characterId}`);

// 2. Verifica que el recurso exista
const characters = await fetch('/api/characters').then(r => r.json());
console.log(characters); // ← Ve qué IDs tienes

// 3. Verifica la ruta
fetch('/api/characters');  // ✅ Correcto
fetch('/api/character');   // ❌ Incorrecto (sin plural)
```

---

### Problema: "409 Conflict - Already in combat"

**Síntomas:**
```
POST /api/characters/123/evolve → 409
{
  "error": "CONFLICT",
  "message": "Character is already in combat"
}
```

**Causa:**
- No puedes hacer eso porque el personaje tiene otro estado incompatible

**Solución:**

```javascript
// 1. Verifica el estado actual
const char = await fetch('/api/characters/123').then(r => r.json());
console.log(char.state); // ← "COMBAT", "DEAD", etc

// 2. Termina el estado anterior
if (char.state === 'COMBAT') {
  await fetch('/api/combat/123/surrender', { method: 'POST' });
}

// 3. Intenta nuevamente
await fetch('/api/characters/123/evolve', { method: 'POST' });
```

---

### Problema: "422 Insufficient Resources"

**Síntomas:**
```
POST /api/characters/123/evolve → 422
{
  "error": "INSUFFICIENT_RESOURCES",
  "message": "Not enough VAL",
  "required": 5000,
  "available": 2000
}
```

**Solución:**

```javascript
// 1. Verifica tus recursos
const profile = await fetch('/api/users/profile').then(r => r.json());
console.log(profile.valBalance); // 2000

// 2. Obtén más recursos
// Opción A: Vender items
await fetch('/api/marketplace/list', {
  method: 'POST',
  body: JSON.stringify({ itemId: '...', price: 3000 })
});

// Opción B: Hacer combates
await fetch('/api/combat/start', { method: 'POST' });

// Opción C: Comprar (dinero real)
await fetch('/api/payments/stripe/initiate', { method: 'POST' });

// 3. Intenta nuevamente
await fetch('/api/characters/123/evolve', { method: 'POST' });
```

---

### Problema: "429 Too Many Requests"

**Síntomas:**
```
GET /api/something → 429
{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests",
  "retry_after": 45
}

Headers:
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1702503245
```

**Causa:**
- Enviaste demasiadas solicitudes en poco tiempo

**Solución (Frontend):**

```javascript
// ❌ MAL: Loop sin espera
for (let i = 0; i < 100; i++) {
  await fetch('/api/characters');
}

// ✅ BIEN: Respeta rate limit
const delay = (ms) => new Promise(r => setTimeout(r, ms));
for (let i = 0; i < 100; i++) {
  await fetch('/api/characters');
  await delay(500);
}

// ✅ MEJOR: Implementa backoff exponencial
async function retryWithBackoff(fn, maxRetries = 5) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (err.status === 429 && i < maxRetries - 1) {
        const backoff = Math.pow(2, i) * 1000;
        console.log(`Rate limited. Retrying in ${backoff}ms...`);
        await delay(backoff);
      } else {
        throw err;
      }
    }
  }
}

// Uso:
await retryWithBackoff(() => fetch('/api/characters'));
```

---

## ⚡ Rendering/Performance

### Problema: "Página muy lenta"

**Checklist de debugging:**

```javascript
// 1. Mide tiempo de API
const start = performance.now();
const data = await fetch('/api/characters').then(r => r.json());
const time = performance.now() - start;
console.log(`API tardó ${time}ms`); // Si > 1000ms, es el problema

// 2. Mide requests en red
// DevTools → Network → Filtra por XHR
// ¿Hay muchos requests? ¿Uno muy lento?

// 3. Mide rendering
// DevTools → Performance → Record
// ¿Qué está tomando tiempo?

// 4. Busca N+1 queries
// Backend logs → ¿Cuántas queries por request?
```

**Soluciones:**

```typescript
// Si es API:
// 1. Usa populate() para relaciones
const users = await User.find().populate('characterId');

// 2. Selecciona solo los fields que necesitas
const users = await User.find().select('name email');

// 3. Usa índices (npm run create-indexes)

// Si es frontend rendering:
// 1. Usa React.memo() para components
// 2. Usa useMemo() para cálculos pesados
// 3. Virtualiza listas largas
// 4. Code split lazy load
```

---

## 🔌 WebSocket/Real-time

### Problema: "Cannot connect to WebSocket"

**Síntomas:**
```
WebSocket connection to 'ws://localhost:8080/socket.io' failed
Error: WebSocket is closed before the connection is established
```

**Causas:**
1. Backend no está corriendo
2. Puerto incorrecto
3. CORS WebSocket no configurado

**Solución:**

```javascript
// Verifica que backend está corriendo
// Terminal: npm run dev

// Verifica que puerto es correcto
// Por defecto: ws://localhost:8080

// Conecta correctamente
import io from 'socket.io-client';

const token = localStorage.getItem('token');
const socket = io('http://localhost:8080', {
  auth: { token },
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});

socket.on('connect', () => {
  console.log('Connected!');
});

socket.on('disconnect', () => {
  console.log('Disconnected. Reconnecting...');
});

socket.on('error', (error) => {
  console.error('WebSocket error:', error);
});
```

---

### Problema: "Message no se recibe en tiempo real"

**Síntomas:**
- Envías un mensaje pero no lo ves instantáneamente
- Solo aparece cuando recargas

**Causa:**
- WebSocket no está conectado o se desconectó

**Solución:**

```javascript
// 1. Verifica que estés connected
socket.on('connect', () => {
  console.log('Connected');
  socket.emit('message:send', { content: 'Hola' });
});

socket.on('disconnect', () => {
  console.log('Desconectado, intentando reconectar...');
});

// 2. Manejo de errores
socket.on('error', (error) => {
  console.error(error);
  // Puede ser issue de auth
  if (error.includes('auth')) {
    // Token expirado, hacer login
  }
});

// 3. Event listener
socket.on('message:new', (msg) => {
  console.log('Mensaje nuevo:', msg);
  updateChatUI(msg);
});
```

---

## 🚀 Deployment/DevOps

### Problema: "Cannot deploy a producción"

**Síntomas:**
```
npm run build → Error
Error: TypeScript compilation failed
```

**Causa:**
- Errores de TypeScript/linting

**Solución:**

```bash
# 1. Revisa el error
npm run build

# 2. Arregla los errores
# Generalmente: imports no usados, tipos incorrectos

# 3. Valida todo
npm run validate

# Si todo pasa:
npm run deploy
```

---

### Problema: "Variable de entorno no encontrada"

**Síntomas:**
```
Error: process.env.JWT_SECRET is undefined
```

**Causa:**
- `.env` no tiene la variable o el servidor no la leyó

**Solución:**

```bash
# 1. Verifica .env
cat .env | grep JWT_SECRET

# 2. Si no está, añádela
echo "JWT_SECRET=tu_secreto_aqui" >> .env

# 3. Reinicia el servidor
npm run dev

# En Docker:
# Asegúrate que passing envs: docker run -e JWT_SECRET=...
```

---

### Problema: "Database no es accesible desde deployement"

**Síntomas:**
```
ECONNREFUSED MongoDB connection fails en AWS
Pero funciona en desarrollo
```

**Causa:**
- Firewall/Security groups bloqueando puerto 27017
- O MongoDB solo escucha localhost

**Solución (MongoDB Atlas):**

```bash
# 1. Whitelist la IP de AWS
# atlas.mongodb.com → Network Access → Add IP Address
# Añade la IP de tu servidor AWS (o 0.0.0.0/0 en desarrollo)

# 2. Verifica connection string
# MONGODB_URI en AWS debe ser idéntico al desarrollo
# mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/DB

# 3. Reinicia servidor
npm run dev
```

---

## 🔒 Seguridad

### Problema: "JWT_SECRET expuesto"

**Síntomas:**
```
Tu JWT_SECRET está en GitHub
Alguien puede falsificar tokens
```

**Solución:**

```bash
# 1. NUNCA commits .env
echo ".env" >> .gitignore

# 2. Usa variables de entorno en producción
# AWS Secrets Manager / Parameter Store
# Heroku Config Vars
# GitHub Secrets

# 3. Si fue expuesto:
# Cambia el JWT_SECRET inmediatamente
# Invalida todos los tokens actuales
```

---

### Problema: "CORS Error"

**Síntomas:**
```
CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource
```

**Causa:**
- Frontend y backend en dominios diferentes
- CORS no configurado

**Solución:**

```typescript
// En src/app.ts o index.ts
import cors from 'cors';

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true, // ← Importante para cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

### Problema: "Password no está encriptado"

**Síntomas:**
```
Password guardado en BD como texto plano
Alguien puede ver las contraseñas
```

**Solución:**

```typescript
// SIEMPRE usa bcrypt
import bcryptjs from 'bcryptjs';

// Crear usuario
const hashedPassword = bcryptjs.hashSync(password, 10);
await User.create({ email, password: hashedPassword });

// Validar password
const isValid = bcryptjs.compareSync(passwordProvided, user.password);
```

---

## 📞 ¿Aún tienes problemas?

### Recopila información útil:

```typescript
// 1. Logs del backend
npm run dev 2>&1 | grep -i error

// 2. Status de API
curl -H "Authorization: Bearer <token>" http://localhost:8080/api/health

// 3. Database check
npm run validate:db

// 4. Environment variables
npm run check-env
```

### Contacta a equipo con:
- [ ] Status code del error (200, 400, 500, etc)
- [ ] Mensaje de error completo
- [ ] Endpoint exacto
- [ ] Pasos para reproducir
- [ ] Logs del servidor
- [ ] Screenshots

---

**Última actualización:** 24 de noviembre, 2025
