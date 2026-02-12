# 🔐 SEGURIDAD - GUÍA COMPLETA

**Documentación completa de seguridad en Valgame Backend**

---

## 📋 TABLA DE CONTENIDOS

1. [Autenticación](#autenticación)
2. [Rate Limiting](#rate-limiting)
3. [CORS](#cors)
4. [Validación de Input](#validación)
5. [Headers de Seguridad](#headers)
6. [Protección de Datos](#protección)
7. [Secrets Management](#secrets)
8. [Auditoría](#auditoría)

---

## 🔐 AUTENTICACIÓN {#autenticación}

Ver: `/docs/01_BACKEND/SUBSYSTEMS/auth.md` (completo)

**Resumen:**
- JWT tokens (7 días expiracion)
- HttpOnly cookies
- Token blacklist en logout
- Password hashing: bcryptjs (10 rounds)
- Email verification requerida

---

## ⏱️ RATE LIMITING {#rate-limiting}

### **5 Tiers de limitación**

```javascript
// Tier 1: Auth endpoints (más restrictivo)
Auth: {
  login: "5 req / 15 min",
  register: "5 req / 15 min",
  forgot_password: "3 req / 15 min"
}

// Tier 2: Gameplay actions
Gameplay: {
  combat: "30 req / 15 min",
  survival: "30 req / 15 min",
  character_action: "30 req / 15 min"
}

// Tier 3: Marketplace
Marketplace: {
  list: "20 req / 15 min",
  buy: "20 req / 15 min",
  cancel: "20 req / 15 min"
}

// Tier 4: General endpoints
General: {
  default: "100 req / 15 min"
}

// Tier 5: Public read
Public: {
  get_rankings: "Sin límite",
  get_items: "Sin límite"
}
```

### **Implementación**
```javascript
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutos
  max: 5,
  message: "Demasiados intentos, intenta luego",
  standardHeaders: true,  // Retorna info en RateLimit-* headers
  legacyHeaders: false
});

app.post('/api/auth/login', authLimiter, loginHandler);
```

---

## 🌐 CORS {#cors}

### **Configuración segura**
```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.FRONTEND_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,  // Permite cookies
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### **Headers enviados**
```
Access-Control-Allow-Origin: https://game.valgame.com
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Max-Age: 86400
```

---

## ✅ VALIDACIÓN DE INPUT {#validación}

### **Capas de validación**

```
1. TIPO: TypeScript - Compile time
2. SCHEMA: Zod - Runtime input validation
3. SANITIZATION: DOMPurify for HTML
4. MONGODB: Mongoose schema validation
```

### **Ejemplo completo**
```typescript
// 1. TypeScript type
interface LoginRequest {
  email: string;
  password: string;
}

// 2. Zod schema
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

// 3. Middleware validation
router.post('/login', 
  validateBody(LoginSchema),  // Aplica Zod
  loginHandler
);

// 4. En handler
const { email, password } = req.body;  // Ya validado
const user = await User.findOne({ email });  // Mongoose valida
```

---

## 🛡️ HEADERS DE SEGURIDAD {#headers}

### **Helmet.js**
```javascript
const helmet = require('helmet');

app.use(helmet());

// Establece:
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
Referrer-Policy: strict-origin-when-cross-origin
```

### **Custom headers**
```javascript
app.use((req, res, next) => {
  res.setHeader('X-API-Version', '2.1.0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
});
```

---

## 🔒 PROTECCIÓN DE DATOS {#protección}

### **Datos sensibles**
```
❌ NUNCA guardar/enviar:
├─ Contraseñas (hash siempre)
├─ Tokens completos en logs
├─ API keys en código
├─ Email users en publicidad
└─ Datos de pago

✅ HACER:
├─ Hashear contraseñas (bcryptjs)
├─ Truncar tokens en logs
├─ Usar environment variables
├─ Anonimizar datos
└─ Encriptar datos sensibles
```

### **Encriptación**
```javascript
const crypto = require('crypto');

// Encriptar data sensible
function encrypt(data) {
  const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

// Desencriptar
function decrypt(encrypted) {
  const decipher = crypto.createDecipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

---

## 🔑 SECRETS MANAGEMENT {#secrets}

### **Environment Variables**
```bash
# .env (nunca en git)
JWT_SECRET=your_very_long_secret_key_min_32_chars
DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/db
STRIPE_SECRET_KEY=sk_live_51234567890...
ENCRYPTION_KEY=your_encryption_key

# .env.example (versionado)
JWT_SECRET=CHANGE_ME
DATABASE_URL=CHANGE_ME
STRIPE_SECRET_KEY=CHANGE_ME
ENCRYPTION_KEY=CHANGE_ME
```

### **CI/CD Secrets** (GitHub)
```
Settings → Secrets and variables → Actions

Añadir:
- JWT_SECRET
- DATABASE_URL
- STRIPE_SECRET_KEY
- ENCRYPTION_KEY
```

### **Lectura segura**
```javascript
// ✅ BIEN
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) throw new Error('JWT_SECRET no definido');

// ❌ MAL
const jwtSecret = 'hardcoded_secret';
console.log('Secret:', process.env.JWT_SECRET);  // NUNCA loguear
```

---

## 📊 AUDITORÍA {#auditoría}

### **Logging**
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Log eventos importantes
logger.info('User login', { userId, timestamp });
logger.warn('Failed login attempt', { email, attempts });
logger.error('Database error', { error, query });
```

### **Qué loguer**
```
✅ Loguear:
├─ Login/logout
├─ Cambios de permisos
├─ Transacciones
├─ Acceso a datos sensibles
├─ Errores
└─ Cambios de configuración

❌ NO loguear:
├─ Contraseñas
├─ Tokens completos
├─ API keys
├─ Números de tarjeta
└─ Información personal
```

---

## 🔒 PROTECCIÓN MONGODB

### **Inyección**
```javascript
// ❌ VULNERABLE
db.collection('users').find({ email: userEmail });

// ✅ SEGURO (Mongoose + Zod)
const schema = z.object({ email: z.string().email() });
const { email } = schema.parse(userInput);
await User.findOne({ email });
```

### **Índices para performance**
```javascript
// Índices críticos
User.collection.createIndex({ email: 1 }, { unique: true });
User.collection.createIndex({ username: 1 }, { unique: true });
Listing.collection.createIndex({ sellerId: 1 });
ChatMessage.collection.createIndex({ createdAt: -1 });
```

---

## 🔄 TRANSACCIONES ATÓMICAS

Para operaciones críticas (marketplace, combat):

```javascript
const session = await mongoose.startSession();
session.startTransaction();

try {
  // Operaciones
  await Listing.findByIdAndUpdate(..., { session });
  await User.findByIdAndUpdate(..., { session });
  
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

---

## 🧪 TESTING DE SEGURIDAD

```javascript
// Test: Rate limiting funciona
test('Rate limit: 5 logins en 15 min', async () => {
  for (let i = 0; i < 5; i++) {
    const res = await request(app).post('/api/auth/login');
    expect(res.status).toBe(401 or 200);
  }
  // 6to intento debe ser 429
  const res = await request(app).post('/api/auth/login');
  expect(res.status).toBe(429);
});

// Test: CORS bloqueado en origen incorrecto
test('CORS blocked for unauthorized origins', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .set('Origin', 'https://evil.com');
  expect(res.headers['access-control-allow-origin']).toBeUndefined();
});

// Test: Password hasheado
test('Passwords are hashed in DB', async () => {
  const user = await User.findById(userId);
  expect(user.password).not.toBe('plaintext');
  expect(user.password).toMatch(/^\$2b\$/);  // bcryptjs
});
```

---

## ⚠️ CHECKLIST DE SEGURIDAD

### **Antes de producción**

- [ ] JWT_SECRET es >= 32 caracteres
- [ ] HTTPS/TLS habilitado
- [ ] CORS configurado (no *)
- [ ] Rate limiting activado
- [ ] Helmet.js activo
- [ ] Passwords hasheados (bcryptjs)
- [ ] Input validado (Zod)
- [ ] Secrets en env vars
- [ ] Logs sin información sensible
- [ ] CSRF tokens en cookies
- [ ] HttpOnly cookies habilitadas
- [ ] SameSite=Strict en cookies
- [ ] Database backups
- [ ] Error messages genéricos
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] DDOS protection (CloudFlare)
- [ ] Security headers
- [ ] API versioning
- [ ] Access control implementado

---

## 🚨 RESPUESTA A INCIDENTES

### **Si JWT está comprometido**
```
1. Generar nuevo JWT_SECRET
2. Invalidar todos tokens activos (clear TokenBlacklist)
3. Forzar re-login de todos los usuarios
4. Notificar usuarios
5. Revisar logs
```

### **Si database fue breached**
```
1. Parar servicios
2. Cambiar todas las credenciales
3. Rotar API keys
4. Revisar acceso
5. Notificar usuarios
```

---

**Última actualización:** 24 de noviembre, 2025  
**Status:** ✅ Completo  
**Compliance:** OWASP Top 10 covered
