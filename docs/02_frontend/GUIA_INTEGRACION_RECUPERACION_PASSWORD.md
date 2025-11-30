# 🔐 Guía de Integración - Recuperación de Contraseña

**Objetivo:** Integrar flujo de recuperación de contraseña en Angular  
**Estado:** ✅ Backend listo | ⏳ Frontend listo en docs/02_frontend/02-Autenticacion-Recuperacion.md

---

## 📡 Endpoints Backend Disponibles

### 1️⃣ Solicitar Recuperación
```
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}

✅ Respuesta (200):
{
  "ok": true,
  "message": "Si el email existe, recibirás instrucciones de recuperación"
}

⚠️ Error (429 - Rate Limited):
{
  "ok": false,
  "error": "Demasiados intentos. Espera 15 minutos",
  "code": "RATE_LIMITED"
}
```

---

### 2️⃣ Validar Token (NUEVO ✨)
```
GET /api/auth/reset-password/validate/:token
(Sin autenticación requerida)

✅ Respuesta (200):
{
  "ok": true,
  "email": "user@example.com",
  "expiresIn": 1800  // segundos hasta expiración
}

❌ Error (400):
{
  "ok": false,
  "error": "Token inválido o expirado",
  "code": "INVALID_TOKEN"
}
```

---

### 3️⃣ Actualizar Contraseña
```
POST /api/auth/reset-password/:token
Content-Type: application/json
(Sin autenticación requerida)

{
  "password": "newPassword123"
}

✅ Respuesta (200):
{
  "ok": true,
  "message": "Contraseña actualizada exitosamente"
}

❌ Error (400):
{
  "ok": false,
  "error": "Token inválido o expirado",
  "code": "INVALID_TOKEN"
}

❌ Error (409):
{
  "ok": false,
  "error": "Este token ya fue utilizado",
  "code": "TOKEN_ALREADY_USED"
}
```

---

## 🛠️ Implementación en AuthService

Agregar estos métodos a `src/services/auth.service.ts`:

```typescript
// Solicitar email de recuperación
forgotPassword(email: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/auth/forgot-password`, 
    { email },
    { withCredentials: true }
  );
}

// Validar que el token es válido (sin cambiar contraseña)
validateResetToken(token: string): Observable<any> {
  return this.http.get(`${this.apiUrl}/auth/reset-password/validate/${token}`, {
    withCredentials: true
  });
}

// Actualizar contraseña con token
resetPassword(token: string, password: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/auth/reset-password/${token}`, 
    { password },
    { withCredentials: true }
  );
}
```

---

## 🎨 Componentes Frontend Necesarios

### Estructura de carpetas:
```
src/app/pages/auth/
├── login/
├── register/
├── forgot-password/
│   ├── forgot-password.component.ts
│   ├── forgot-password.component.html
│   └── forgot-password.component.scss
├── reset-password/
│   ├── reset-password.component.ts
│   ├── reset-password.component.html
│   └── reset-password.component.scss
```

### Rutas necesarias en `app-routing.module.ts`:
```typescript
{
  path: 'auth',
  children: [
    // ... rutas existentes
    {
      path: 'forgot-password',
      component: ForgotPasswordComponent
    },
    {
      path: 'reset-password/:token',
      component: ResetPasswordComponent
    }
  ]
}
```

---

## 📋 Checklist de Integración

- [ ] Agregar métodos a `AuthService` (3 métodos)
- [ ] Crear `ForgotPasswordComponent`
- [ ] Crear `ResetPasswordComponent`
- [ ] Agregar rutas en routing module
- [ ] Agregar link "¿Olvidaste contraseña?" en LoginComponent
- [ ] Probar flujo completo:
  - [ ] Abrir forgot-password
  - [ ] Ingresar email
  - [ ] Recibir email (verificar en bandeja)
  - [ ] Hacer clic en link del email
  - [ ] Se abre reset-password con token en URL
  - [ ] Ingresar nueva contraseña
  - [ ] Confirmar password change
  - [ ] Redirige a login
  - [ ] Login con nueva contraseña ✅

---

## 🔗 Recursos

**Componentes completos:**
- Ir a: `docs/02_frontend/02-Autenticacion-Recuperacion.md`
- Copiar: `ForgotPasswordComponent` (TypeScript + HTML)
- Copiar: `ResetPasswordComponent` (TypeScript + HTML)
- Copiar: Estilos SCSS incluidos

**Validaciones Zod (si necesarias):**
```typescript
// src/validations/password.schemas.ts
export const ResetPasswordSchema = z.object({
  password: z.string()
    .min(6, 'Mínimo 6 caracteres')
    .regex(/[A-Z]/, 'Debe incluir mayúscula')
    .regex(/[0-9]/, 'Debe incluir número'),
  passwordConfirm: z.string()
}).refine(data => data.password === data.passwordConfirm, {
  message: "Las contraseñas no coinciden",
  path: ["passwordConfirm"]
});
```

---

## 🔒 Seguridad Implementada

✅ **Backend:**
- Tokens válidos solo 1 hora
- Tokens de un solo uso
- Rate limiting: 3 intentos por hora
- Respuesta genérica (no revela si email existe)
- Hashing bcrypt en password

✅ **Frontend:**
- Validación de contraseña en tiempo real
- Mostrar/ocultar password
- Confirmación de password match
- Límite de reintentos

---

## ⚡ Próximos Pasos

1. **Hoy:** Integración en Frontend
2. **Testing:** E2E flow completo
3. **Opcional:** 2FA (two-factor authentication)
4. **Opcional:** Email de confirmación al cambiar password

---

**Última actualización:** 27 de noviembre de 2025  
**Backend status:** ✅ Listo  
**Frontend status:** 📖 Documentado (listo para copiar)
