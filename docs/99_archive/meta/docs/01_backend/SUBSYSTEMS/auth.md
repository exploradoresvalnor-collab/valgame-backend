# 🔐 AUTENTICACIÓN Y SEGURIDAD

**Documentación completa del sistema de Auth (9 endpoints)**

---

## 📖 DESCRIPCIÓN

Sistema de autenticación robusto con JWT tokens, httpOnly cookies, email verification, password recovery y multi-factor support.

**Seguridad:** ✅ Siguiendo estándares OWASP

---

## 📡 ENDPOINTS (9)

### **1. Registrar cuenta**
```
POST /api/auth/register

Request:
{
  "email": "player@example.com",
  "username": "DragonSlayer",
  "password": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!"
}

Response (201):
{
  "success": true,
  "data": {
    "userId": "507f1f77bcf86cd799439001",
    "email": "player@example.com",
    "username": "DragonSlayer",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d"
  },
  "message": "Cuenta creada. Verifica tu email."
}

Error (409):
{
  "success": false,
  "error": "EMAIL_ALREADY_EXISTS",
  "message": "Este email ya está registrado"
}
```

---

### **2. Iniciar sesión**
```
POST /api/auth/login

Request:
{
  "email": "player@example.com",
  "password": "SecurePassword123!"
}

Response (200):
{
  "success": true,
  "data": {
    "userId": "507f1f77bcf86cd799439001",
    "username": "DragonSlayer",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d",
    "user": {
      "level": 85,
      "characters": 3
    }
  }
}

Headers:
  Set-Cookie: session=httpOnly_token; Path=/; HttpOnly; Secure; SameSite=Strict
```

---

### **3. Verificar email**
```
GET /api/auth/verify?token=verification_token

Response (200):
{
  "success": true,
  "data": {
    "verified": true,
    "message": "Email verificado correctamente"
  }
}
```

---

### **4. Cerrar sesión**
```
POST /api/auth/logout

Response (200):
{
  "success": true,
  "message": "Sesión cerrada"
}

Headers:
  Set-Cookie: session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0
```

---

### **5. Solicitar reset de contraseña**
```
POST /api/auth/forgot-password

Request:
{
  "email": "player@example.com"
}

Response (200):
{
  "success": true,
  "message": "Email de recuperación enviado a player@example.com"
}
```

---

### **6. Reset de contraseña**
```
POST /api/auth/reset-password

Request:
{
  "token": "reset_token",
  "newPassword": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}

Response (200):
{
  "success": true,
  "message": "Contraseña actualizada correctamente"
}
```

---

### **7. Renovar JWT token**
```
GET /api/auth/refresh-token

Headers:
  Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d"
  }
}
```

---

### **8. Eliminar cuenta**
```
DELETE /api/auth/account

Request:
{
  "password": "CurrentPassword123!"  // Confirmar contraseña
}

Response (200):
{
  "success": true,
  "message": "Cuenta eliminada. Tus datos se borrarán en 30 días."
}
```

---

### **9. Validar token**
```
POST /api/auth/check-token

Headers:
  Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": {
    "valid": true,
    "userId": "507f1f77bcf86cd799439001",
    "expiresAt": "2025-12-08T10:30:00Z"
  }
}
```

---

## 🔐 SEGURIDAD

### **JWT Token Structure**
```javascript
Header: {
  "alg": "HS256",
  "typ": "JWT"
}

Payload: {
  "userId": "507f1f77bcf86cd799439001",
  "email": "player@example.com",
  "role": "user",
  "iat": 1701340200,
  "exp": 1701945000  // 7 días
}

Signature: HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  JWT_SECRET
)
```

### **HttpOnly Cookies**
```
Set-Cookie: session=<token>; 
  Path=/; 
  HttpOnly;        // No accessible por JavaScript
  Secure;          // Solo HTTPS
  SameSite=Strict; // CSRF protection
  Max-Age=604800   // 7 días
```

### **Password Hashing**
```
Algoritmo: bcryptjs
Rounds: 10
Ejemplo: $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36gZvQOa
```

---

## 🔄 FLUJOS DE AUTENTICACIÓN

### **Registro**
```
1. Usuario llena formulario
2. Validar email único
3. Validar contraseña (fuerza)
4. Hash de contraseña (bcryptjs)
5. Crear User en MongoDB
6. Enviar email de verificación
7. Retornar JWT (provisional)
8. Frontend: Guardar token + cookie
9. Usuario clickea link en email
10. Email marcado como verificado
```

### **Login**
```
1. Usuario envía email + password
2. Buscar User en MongoDB
3. Comparar password con hash (bcryptjs)
4. Si incorrecto: Error 401
5. Si correcto: Generar JWT
6. Guardar en httpOnly cookie
7. Retornar token al frontend
8. Frontend: Guardar en localStorage
9. Próximas requests: JWT en Authorization header
```

### **Logout**
```
1. Recibir logout request
2. Obtener token del header
3. Añadir a TokenBlacklist (expires igual que token)
4. Borrar cookie (Set-Cookie con Max-Age=0)
5. Retornar success
6. Frontend: Limpiar localStorage
```

### **Recuperación de Contraseña**
```
1. Usuario solicita reset
2. Validar email existe
3. Generar token reset (aleatorio, válido 1h)
4. Guardar en BD (con hash)
5. Enviar email con link
6. Usuario clickea link
7. Frontend envía token + nueva contraseña
8. Backend: Validar token
9. Hash nueva contraseña
10. Actualizar User
11. Token reset se elimina
```

---

## 📊 MODELOS

### **User (Auth fields)**
```javascript
{
  _id: ObjectId,
  email: String,  // Unique
  username: String,  // Unique
  password: String,  // bcryptjs hash
  verified: Boolean,
  verificationToken: String,  // Expires 24h
  resetPasswordToken: String,  // Expires 1h
  resetPasswordExpires: Date,
  lastLogin: Date,
  loginAttempts: Number,
  lockUntil: Date,  // Si 5 intentos fallidos
  createdAt: Date,
  updatedAt: Date
}
```

### **TokenBlacklist**
```javascript
{
  _id: ObjectId,
  token: String,  // Hash del token
  userId: ObjectId,
  expiresAt: Date,  // Mismo que token JWT
  reason: "logout" | "password_change" | etc,
  createdAt: Date
}
```

---

## 🔓 RATE LIMITING POR ENDPOINT

```
POST /api/auth/register       → 5 req/15min (anti-spam)
POST /api/auth/login          → 5 req/15min (anti-bruteforce)
POST /api/auth/forgot-password → 3 req/15min (anti-enumeration)
POST /api/auth/reset-password → 10 req/15min
GET /api/auth/verify          → Sin límite
GET /api/auth/refresh-token   → 20 req/15min
DELETE /api/auth/account      → 1 req/24h
POST /api/auth/check-token    → Sin límite
POST /api/auth/logout         → Sin límite
```

---

## 🛡️ PROTECCIONES

### **Contra Ataques**
```
✅ CSRF: Token validation + SameSite cookie
✅ XSS: HttpOnly cookies (no acceso desde JS)
✅ Brute Force: Rate limiting + account lockout
✅ SQL Injection: Mongoose ODM + sanitization
✅ Timing Attack: Constante time password comparison
✅ Token Hijacking: Short expiration (7d) + refresh
✅ Password Spray: Rate limiting global
```

### **Validaciones**
```
Email:
├─ Formato válido
├─ Unique en BD
└─ Verificación requerida

Password:
├─ Min 8 caracteres
├─ Al menos 1 mayúscula
├─ Al menos 1 número
├─ Al menos 1 carácter especial
└─ No puede ser username/email
```

---

## 📋 VALIDACIONES ZOD

```typescript
RegisterSchema {
  email: z.string().email().toLowerCase(),
  username: z.string().min(3).max(30),
  password: z.string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[0-9]/)
    .regex(/[!@#$%^&*]/),
  confirmPassword: z.string()
}
.refine(data => data.password === data.confirmPassword)

LoginSchema {
  email: z.string().email(),
  password: z.string()
}

ResetPasswordSchema {
  token: z.string().min(1),
  newPassword: (como RegisterSchema)
}
```

---

## 📧 EMAILS ENVIADOS

### **Verification Email**
```
Subject: Verifica tu email - Valgame

Hola {username},

Haz click aquí para verificar tu email:
https://game.com/verify?token=verification_token

Link válido: 24 horas

¿No creaste esta cuenta? Ignora este email.
```

### **Password Reset Email**
```
Subject: Recuperar contraseña - Valgame

Hola {username},

Solicitud de reset de contraseña recibida.
Haz click aquí para resetear:
https://game.com/reset-password?token=reset_token

Link válido: 1 hora

¿No solicitaste esto? Ignora este email.
```

---

## 🔑 ENVIRONMENT VARIABLES REQUERIDAS

```bash
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_EXPIRES_IN=7d
TOKEN_BLACKLIST_EXPIRES=604800  # 7 días en segundos

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

VERIFICATION_TOKEN_EXPIRES=86400  # 24 horas
RESET_PASSWORD_TOKEN_EXPIRES=3600  # 1 hora
```

---

## ⚠️ ERRORES COMUNES

| Código | Causa | Solución |
|--------|-------|----------|
| 400 | Email inválido | Formato correcto |
| 400 | Password débil | Agregar mayús, números, símbolos |
| 409 | Email duplicado | Usar otro email o login |
| 401 | Contraseña incorrecta | Verificar caps lock |
| 401 | Token expirado | Refrescar token |
| 429 | Rate limit | Esperar 15 minutos |
| 500 | Email no enviado | Verificar SMTP config |

---

## ✅ CHECKLIST

- [ ] Registro con validación
- [ ] Verificación de email
- [ ] Login con JWT
- [ ] HttpOnly cookies
- [ ] Logout con blacklist
- [ ] Password recovery
- [ ] Token refresh
- [ ] Account deletion
- [ ] Rate limiting
- [ ] bcryptjs hashing
- [ ] Email templates
- [ ] Error handling
- [ ] Security headers

---

**Última actualización:** 1 de diciembre, 2025  
**Estado:** ✅ Documentado  
**Endpoints:** 9  
**Seguridad:** OWASP compliant
