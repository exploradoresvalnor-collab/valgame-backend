# 🎯 Flujo Completo de Registro y Verificación

**Fecha**: 3 de diciembre de 2025  
**Para**: Desarrollador Frontend  
**Backend**: https://valgame-backend.onrender.com

---

## 📋 Resumen Ejecutivo

Este documento explica **paso a paso** cómo implementar el registro de usuarios con verificación por email en el frontend.

**Tiempo de lectura**: 10 minutos  
**Dificultad**: Media

---

## 🔄 Flujo Visual Completo

```
┌─────────────────────────────────────────────────────────────┐
│                    PASO 1: REGISTRO                         │
├─────────────────────────────────────────────────────────────┤
│  1. Usuario llena formulario (email, username, password)    │
│  2. Click en "Registrarse"                                  │
│  3. Frontend → POST /auth/register                          │
│  4. Backend → Crea usuario (estado: NO verificado)          │
│  5. Backend → Genera token único                            │
│  6. Backend → Envía email con link de verificación          │
│  7. Backend → Responde 201 "Revisa tu email"               │
│  8. Frontend → Muestra mensaje + redirige a /check-email   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   PASO 2: EMAIL                             │
├─────────────────────────────────────────────────────────────┤
│  1. Usuario recibe email de romerolivo1234@gmail.com        │
│  2. Asunto: "✨ Verifica tu cuenta de Valgame"              │
│  3. Email contiene botón "VERIFICAR CUENTA"                 │
│  4. Link: https://valgame-backend.onrender.com/auth/verify/TOKEN │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  PASO 3: VERIFICACIÓN                       │
├─────────────────────────────────────────────────────────────┤
│  1. Usuario hace click en "VERIFICAR CUENTA"                │
│  2. Abre navegador → GET /auth/verify/:token                │
│  3. Backend busca token en base de datos                    │
│  4. Backend verifica que no haya expirado (1 hora límite)   │
│  5. Backend marca usuario como VERIFICADO                   │
│  6. Backend muestra página HTML: "✅ Cuenta Verificada"     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    PASO 4: LOGIN                            │
├─────────────────────────────────────────────────────────────┤
│  1. Usuario cierra la ventana de verificación               │
│  2. Usuario vuelve al frontend                              │
│  3. Usuario va a /login                                     │
│  4. Ingresa email y password                                │
│  5. Frontend → POST /auth/login                             │
│  6. Backend valida credenciales + verificación              │
│  7. Backend responde con JWT token                          │
│  8. Frontend guarda token y redirige a /dashboard           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 PASO 1: Formulario de Registro

### HTML (register.component.html)

```html
<div class="register-container">
  <h1>Crear Cuenta</h1>
  
  <form [formGroup]="registerForm" (ngSubmit)="onRegister()">
    <!-- Email -->
    <div class="form-group">
      <label>Email</label>
      <input 
        type="email" 
        formControlName="email" 
        placeholder="tu@email.com"
        required
      />
      <span class="error" *ngIf="registerForm.get('email')?.errors?.['email']">
        Email inválido
      </span>
    </div>

    <!-- Username -->
    <div class="form-group">
      <label>Username</label>
      <input 
        type="text" 
        formControlName="username" 
        placeholder="jugador123"
        required
      />
      <span class="error" *ngIf="registerForm.get('username')?.errors?.['minlength']">
        Mínimo 3 caracteres
      </span>
    </div>

    <!-- Password -->
    <div class="form-group">
      <label>Contraseña</label>
      <input 
        type="password" 
        formControlName="password" 
        placeholder="••••••••"
        required
      />
      <span class="error" *ngIf="registerForm.get('password')?.errors?.['minlength']">
        Mínimo 6 caracteres
      </span>
    </div>

    <!-- Botón Submit -->
    <button 
      type="submit" 
      [disabled]="registerForm.invalid || isLoading"
    >
      {{ isLoading ? 'Registrando...' : 'Crear Cuenta' }}
    </button>
  </form>

  <!-- Link a Login -->
  <p class="footer-text">
    ¿Ya tienes cuenta? 
    <a routerLink="/login">Inicia sesión</a>
  </p>
</div>
```

---

### TypeScript (register.component.ts)

```typescript
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;
  errorMessage = '';

  // URL del backend
  private apiUrl = 'https://valgame-backend.onrender.com';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onRegister(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const body = {
      email: this.registerForm.value.email,
      username: this.registerForm.value.username,
      password: this.registerForm.value.password
    };

    // ⚠️ IMPORTANTE: withCredentials: true para cookies
    this.http.post(`${this.apiUrl}/auth/register`, body, {
      withCredentials: true
    }).subscribe({
      next: (response: any) => {
        // ✅ Registro exitoso
        console.log('✅ Registro exitoso:', response);
        
        this.isLoading = false;
        
        // Guardar email para mostrar en la página de verificación
        sessionStorage.setItem('pendingEmail', body.email);
        
        // Redirigir a página "Revisa tu email"
        this.router.navigate(['/check-email']);
      },
      error: (error: HttpErrorResponse) => {
        // ❌ Error en registro
        console.error('❌ Error en registro:', error);
        
        this.isLoading = false;
        
        // Manejar errores específicos
        if (error.status === 409) {
          this.errorMessage = 'Email o username ya existe';
        } else if (error.status === 400) {
          this.errorMessage = error.error?.error || 'Datos inválidos';
        } else {
          this.errorMessage = 'Error al registrar. Intenta de nuevo.';
        }
        
        // Mostrar error en pantalla
        alert(this.errorMessage);
      }
    });
  }
}
```

---

## 📧 PASO 2: Página "Revisa tu Email"

### HTML (check-email.component.html)

```html
<div class="check-email-container">
  <div class="icon">📧</div>
  
  <h1>Revisa tu correo</h1>
  
  <p class="main-text">
    Te enviamos un email a <strong>{{ email }}</strong>
  </p>
  
  <p class="instructions">
    Haz click en el link que te enviamos para verificar tu cuenta.
  </p>
  
  <div class="warning">
    ⚠️ El link expira en <strong>1 hora</strong>
  </div>
  
  <!-- Botón para reenviar email -->
  <button 
    (click)="resendEmail()" 
    [disabled]="isResending || countdown > 0"
    class="secondary-btn"
  >
    {{ countdown > 0 ? `Reenviar en ${countdown}s` : 'Reenviar email' }}
  </button>
  
  <!-- Link para volver al login -->
  <p class="footer-text">
    ¿Ya verificaste tu cuenta? 
    <a routerLink="/login">Ir al login</a>
  </p>
</div>
```

---

### TypeScript (check-email.component.ts)

```typescript
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-check-email',
  templateUrl: './check-email.component.html',
  styleUrls: ['./check-email.component.scss']
})
export class CheckEmailComponent implements OnInit {
  email = '';
  isResending = false;
  countdown = 0;
  
  private apiUrl = 'https://valgame-backend.onrender.com';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Obtener email del sessionStorage
    this.email = sessionStorage.getItem('pendingEmail') || 'tu correo';
  }

  resendEmail(): void {
    if (this.countdown > 0) return;

    this.isResending = true;

    this.http.post(`${this.apiUrl}/auth/resend-verification`, {
      email: this.email
    }, {
      withCredentials: true
    }).subscribe({
      next: () => {
        alert('✅ Email reenviado. Revisa tu bandeja.');
        this.isResending = false;
        
        // Iniciar countdown de 60 segundos
        this.countdown = 60;
        const interval = setInterval(() => {
          this.countdown--;
          if (this.countdown === 0) {
            clearInterval(interval);
          }
        }, 1000);
      },
      error: (error) => {
        console.error('Error al reenviar email:', error);
        alert('Error al reenviar. Intenta de nuevo.');
        this.isResending = false;
      }
    });
  }
}
```

---

## ✅ PASO 3: Verificación (Backend maneja esto)

**El usuario NO interactúa con el frontend aquí.**

### Lo que sucede:

1. Usuario hace click en el botón del email
2. Se abre: `https://valgame-backend.onrender.com/auth/verify/abc123token...`
3. Backend procesa la verificación
4. Backend muestra página HTML de confirmación:

```html
<!DOCTYPE html>
<html>
<head>
  <title>✅ Cuenta Verificada</title>
</head>
<body>
  <div style="text-align: center; padding: 50px;">
    <h1 style="color: #27ae60;">✅ ¡Cuenta Verificada!</h1>
    <p>Tu cuenta ha sido verificada exitosamente.</p>
    <p>Ya puedes cerrar esta ventana y hacer login.</p>
    <a href="http://localhost:4200/login" style="
      display: inline-block;
      padding: 12px 24px;
      background: #667eea;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      margin-top: 20px;
    ">
      Ir al Login
    </a>
  </div>
</body>
</html>
```

---

## 🔐 PASO 4: Login

### HTML (login.component.html)

```html
<div class="login-container">
  <h1>Iniciar Sesión</h1>
  
  <form [formGroup]="loginForm" (ngSubmit)="onLogin()">
    <!-- Email -->
    <div class="form-group">
      <label>Email</label>
      <input 
        type="email" 
        formControlName="email" 
        placeholder="tu@email.com"
        required
      />
    </div>

    <!-- Password -->
    <div class="form-group">
      <label>Contraseña</label>
      <input 
        type="password" 
        formControlName="password" 
        placeholder="••••••••"
        required
      />
    </div>

    <!-- Botón Submit -->
    <button 
      type="submit" 
      [disabled]="loginForm.invalid || isLoading"
    >
      {{ isLoading ? 'Entrando...' : 'Iniciar Sesión' }}
    </button>
  </form>

  <!-- Links -->
  <div class="footer-links">
    <a routerLink="/forgot-password">¿Olvidaste tu contraseña?</a>
    <br>
    <a routerLink="/register">¿No tienes cuenta? Regístrate</a>
  </div>
</div>
```

---

### TypeScript (login.component.ts)

```typescript
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';

  private apiUrl = 'https://valgame-backend.onrender.com';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const body = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    // ⚠️ IMPORTANTE: withCredentials: true para cookies
    this.http.post(`${this.apiUrl}/auth/login`, body, {
      withCredentials: true
    }).subscribe({
      next: (response: any) => {
        // ✅ Login exitoso
        console.log('✅ Login exitoso:', response);
        
        this.isLoading = false;
        
        // Guardar token y usuario en localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Redirigir al dashboard
        this.router.navigate(['/dashboard']);
      },
      error: (error: HttpErrorResponse) => {
        // ❌ Error en login
        console.error('❌ Error en login:', error);
        
        this.isLoading = false;
        
        // Manejar errores específicos
        if (error.status === 403) {
          this.errorMessage = '⚠️ Cuenta no verificada. Revisa tu email.';
        } else if (error.status === 401) {
          this.errorMessage = '❌ Email o contraseña incorrectos';
        } else {
          this.errorMessage = '❌ Error al iniciar sesión. Intenta de nuevo.';
        }
        
        // Mostrar error
        alert(this.errorMessage);
      }
    });
  }
}
```

---

## 📊 Respuestas del Backend

### POST /auth/register

#### ✅ Éxito (201)
```json
{
  "message": "Registro exitoso. Por favor, revisa tu correo para verificar tu cuenta."
}
```

#### ❌ Email/Username Duplicado (409)
```json
{
  "error": "Email o username ya existe"
}
```

#### ⚠️ Registro OK pero Email NO enviado (201)
```json
{
  "message": "Registro exitoso pero hubo un problema al enviar el correo...",
  "warning": "Email no enviado"
}
```

---

### GET /auth/verify/:token

#### ✅ Verificación Exitosa
**Responde con página HTML** (no JSON)

#### ❌ Token Inválido o Expirado
**Responde con página HTML de error**

---

### POST /auth/login

#### ✅ Login Exitoso (200)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "674abc123...",
    "email": "usuario@gmail.com",
    "username": "jugador123",
    "verified": true
  }
}
```

#### ❌ Cuenta No Verificada (403)
```json
{
  "error": "Por favor verifica tu cuenta antes de hacer login"
}
```

#### ❌ Credenciales Incorrectas (401)
```json
{
  "error": "Email o contraseña incorrectos"
}
```

---

## 🔄 POST /auth/resend-verification

Para reenviar el email de verificación.

### Request
```typescript
POST https://valgame-backend.onrender.com/auth/resend-verification
Body: {
  "email": "usuario@gmail.com"
}
```

### Response ✅ (200)
```json
{
  "message": "Correo de verificación reenviado"
}
```

### Response ❌ (400)
```json
{
  "error": "Usuario no encontrado o ya verificado"
}
```

---

## ⚠️ IMPORTANTE: withCredentials

**Todas las peticiones HTTP deben incluir `withCredentials: true`:**

```typescript
this.http.post(url, body, {
  withCredentials: true  // ⚠️ CRÍTICO para que funcionen las cookies
}).subscribe(...);
```

Sin esto, las cookies `httpOnly` del backend NO funcionarán.

---

## 🧪 Checklist de Prueba

- [ ] Formulario de registro valida campos
- [ ] POST /auth/register devuelve 201
- [ ] Mensaje "Revisa tu email" se muestra
- [ ] Email llega a la bandeja (o spam)
- [ ] Link del email funciona
- [ ] Página de verificación se muestra correctamente
- [ ] Login con cuenta verificada funciona
- [ ] Login con cuenta NO verificada muestra error 403
- [ ] Token se guarda en localStorage
- [ ] Redirige a /dashboard después del login
- [ ] Botón "Reenviar email" funciona
- [ ] Countdown de 60 segundos funciona

---

## 🚨 Errores Comunes

### 1. "Email o username ya existe"
**Causa**: Usuario ya registrado  
**Solución**: Usar otro email/username o hacer login

### 2. "Email no enviado"
**Causa**: Problema con SMTP de Gmail  
**Solución**: Contactar soporte o usar endpoint de reenvío

### 3. "Token inválido o expirado"
**Causa**: Link usado después de 1 hora  
**Solución**: Solicitar nuevo email con "Reenviar"

### 4. "Cuenta no verificada"
**Causa**: Usuario no hizo click en el email  
**Solución**: Revisar email y verificar cuenta

### 5. "CORS error"
**Causa**: Falta `withCredentials: true`  
**Solución**: Agregar a todas las peticiones HTTP

---

## 📱 Email Que Recibirá el Usuario

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            🎮 VALGAME
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

¡Bienvenido a Valgame!

Tu cuenta ha sido creada exitosamente con el
email: usuario@gmail.com

Para activar tu cuenta, haz click en el botón:

┌───────────────────────────────┐
│     VERIFICAR MI CUENTA       │
└───────────────────────────────┘

O copia este link en tu navegador:
https://valgame-backend.onrender.com/auth/verify/abc123...

⚠️ Este link expira en 1 hora.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Si no solicitaste esta cuenta, ignora este email.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🔑 PASO 5: Recuperación de Contraseña (Forgot Password)

### Flujo Visual Completo

```
┌─────────────────────────────────────────────────────────────┐
│              PASO 5A: Olvidé mi Contraseña                  │
│                  (Solicitar Recuperación)                   │
├─────────────────────────────────────────────────────────────┤
│  1. Usuario hace click en "¿Olvidaste tu contraseña?"      │
│     desde la pantalla de Login                              │
│  2. Frontend navega a /forgot-password                      │
│  3. Usuario ingresa SOLO su email                           │
│  4. Frontend → POST /auth/forgot-password { email }         │
│  5. Backend → Genera token (32 bytes hex)                   │
│  6. Backend → Guarda token + expiración (1 hora)            │
│  7. Backend → Envía email con link                          │
│  8. Backend → Responde "Revisa tu email"                    │
│  9. Frontend → Navega a /check-email-reset                  │
│ 10. Usuario ve mensaje de confirmación                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              PASO 5B: Email de Recuperación                 │
├─────────────────────────────────────────────────────────────┤
│  1. Usuario recibe email                                    │
│  2. Email contiene link:                                    │
│     http://localhost:4200/reset-password/:token             │
│  3. Link expira en 1 hora                                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│          PASO 5C: Resetear Contraseña                       │
│             (Formulario de Nueva Contraseña)                │
├─────────────────────────────────────────────────────────────┤
│  1. Usuario hace click en el link del email                 │
│  2. Frontend carga /reset-password/:token                   │
│  3. Frontend extrae token de la URL                         │
│  4. Usuario ve formulario con 3 campos:                     │
│     - Email (opcional: readonly para verificación)          │
│     - Nueva Contraseña (mínimo 6 caracteres)                │
│     - Confirmar Contraseña (debe coincidir)                 │
│  5. Usuario llena el formulario                             │
│  6. Frontend valida que las contraseñas coincidan           │
│  7. Frontend → POST /auth/reset-password/:token             │
│     Body: { password: "nuevaContraseña" }                   │
│  8. Backend → Valida token no expirado                      │
│  9. Backend → Hashea nueva contraseña (bcrypt)              │
│ 10. Backend → Actualiza passwordHash en User                │
│ 11. Backend → Limpia resetPasswordToken                     │
│ 12. Backend → Responde "Contraseña actualizada"             │
│ 13. Frontend → Muestra alerta de éxito                      │
│ 14. Frontend → Redirige a /login                            │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Opciones de Implementación

### Opción A: Solo Contraseñas (Más Simple)
**Formulario pide:**
- Nueva Contraseña
- Confirmar Contraseña

**Ventajas:**
- Más simple para el usuario
- Menos campos

**Desventajas:**
- Usuario no ve para qué cuenta está cambiando la contraseña

---

### Opción B: Email + Contraseñas (Recomendado)
**Formulario pide:**
- Email (readonly - mostrado del token)
- Nueva Contraseña
- Confirmar Contraseña

**Ventajas:**
- Usuario confirma que está en la cuenta correcta
- Más seguro (doble verificación)
- Mejor UX

**Desventajas:**
- Campo extra (pero readonly)

---

## 📋 Formulario Recomendado (Opción B)

La documentación abajo muestra **Opción B** que incluye email para verificación visual

---

### HTML (forgot-password.component.html)

```html
<div class="forgot-password-container">
  <h1>¿Olvidaste tu contraseña?</h1>
  
  <p class="instructions">
    Ingresa tu email y te enviaremos un link para recuperar tu contraseña.
  </p>
  
  <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()">
    <!-- Email -->
    <div class="form-group">
      <label>Email</label>
      <input 
        type="email" 
        formControlName="email" 
        placeholder="tu@email.com"
        required
      />
      <span class="error" *ngIf="forgotForm.get('email')?.errors?.['email']">
        Email inválido
      </span>
    </div>

    <!-- Botón Submit -->
    <button 
      type="submit" 
      [disabled]="forgotForm.invalid || isLoading"
    >
      {{ isLoading ? 'Enviando...' : 'Enviar link de recuperación' }}
    </button>
  </form>

  <!-- Link para volver al login -->
  <p class="footer-text">
    <a routerLink="/login">← Volver al login</a>
  </p>
</div>
```

---

### TypeScript (forgot-password.component.ts)

```typescript
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  forgotForm!: FormGroup;
  isLoading = false;
  
  private apiUrl = 'https://valgame-backend.onrender.com';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotForm.invalid) {
      return;
    }

    this.isLoading = true;

    const body = {
      email: this.forgotForm.value.email
    };

    this.http.post(`${this.apiUrl}/auth/forgot-password`, body, {
      withCredentials: true
    }).subscribe({
      next: (response: any) => {
        // ✅ Solicitud procesada
        console.log('✅ Email de recuperación enviado');
        
        this.isLoading = false;
        
        // Guardar email para mostrar en la siguiente pantalla
        sessionStorage.setItem('resetEmail', body.email);
        
        // Mostrar mensaje
        alert('✅ ' + response.message);
        
        // Redirigir a página de confirmación
        this.router.navigate(['/check-email-reset']);
      },
      error: (error: HttpErrorResponse) => {
        console.error('❌ Error:', error);
        
        this.isLoading = false;
        
        // Mostrar error genérico por seguridad
        alert('Error al procesar solicitud. Intenta de nuevo.');
      }
    });
  }
}
```

---

### HTML (reset-password.component.html)

```html
<div class="reset-password-container">
  <h1>Crear Nueva Contraseña</h1>
  
  <p class="instructions">
    Ingresa tu nueva contraseña para <strong>{{ userEmail }}</strong>
  </p>
  
  <form [formGroup]="resetForm" (ngSubmit)="onSubmit()">
    <!-- Email (Solo para verificación visual) -->
    <div class="form-group">
      <label>Email de la Cuenta</label>
      <input 
        type="email" 
        formControlName="email" 
        readonly
        class="readonly-field"
      />
      <small class="help-text">
        ℹ️ Verificación: Estás cambiando la contraseña de esta cuenta
      </small>
    </div>

    <!-- Nueva Contraseña -->
    <div class="form-group">
      <label>Nueva Contraseña *</label>
      <input 
        type="password" 
        formControlName="password" 
        placeholder="••••••••"
        required
      />
      <span class="error" *ngIf="resetForm.get('password')?.touched && resetForm.get('password')?.errors?.['required']">
        Campo obligatorio
      </span>
      <span class="error" *ngIf="resetForm.get('password')?.errors?.['minlength']">
        Mínimo 6 caracteres
      </span>
    </div>

    <!-- Confirmar Contraseña -->
    <div class="form-group">
      <label>Confirmar Contraseña *</label>
      <input 
        type="password" 
        formControlName="confirmPassword" 
        placeholder="••••••••"
        required
      />
      <span class="error" *ngIf="resetForm.get('confirmPassword')?.touched && resetForm.get('confirmPassword')?.errors?.['required']">
        Campo obligatorio
      </span>
      <span class="error" *ngIf="resetForm.get('confirmPassword')?.touched && resetForm.errors?.['mismatch']">
        Las contraseñas no coinciden
      </span>
    </div>

    <!-- Botón Submit -->
    <button 
      type="submit" 
      [disabled]="resetForm.invalid || isLoading"
      class="btn-primary"
    >
      {{ isLoading ? 'Actualizando...' : 'Actualizar Contraseña' }}
    </button>
  </form>

  <!-- Footer -->
  <p class="footer-text">
    <a routerLink="/login">← Volver al login</a>
  </p>
</div>

<!-- CSS Adicional -->
<style>
  .readonly-field {
    background-color: #f5f5f5;
    cursor: not-allowed;
    color: #666;
  }
  
  .help-text {
    display: block;
    margin-top: 4px;
    color: #666;
    font-size: 12px;
  }
</style>
```

---

### TypeScript (reset-password.component.ts)

```typescript
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  resetForm!: FormGroup;
  isLoading = false;
  token = '';
  userEmail = '';
  
  private apiUrl = 'https://valgame-backend.onrender.com';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Obtener token de la URL
    this.token = this.route.snapshot.params['token'];
    
    if (!this.token) {
      alert('❌ Token inválido');
      this.router.navigate(['/login']);
      return;
    }

    // Crear formulario
    this.resetForm = this.fb.group({
      email: [{ value: '', disabled: true }], // Readonly
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });

    // Validar token y obtener email
    this.validateToken();
  }

  // Validar token y obtener email del usuario
  validateToken(): void {
    this.isLoading = true;

    this.http.get<any>(
      `${this.apiUrl}/auth/reset-password/validate/${this.token}`,
      { withCredentials: true }
    ).subscribe({
      next: (response) => {
        // ✅ Token válido
        console.log('✅ Token válido');
        console.log(`Expira en: ${response.expiresIn} segundos`);
        
        this.userEmail = response.email;
        
        // Mostrar email en el formulario
        this.resetForm.patchValue({
          email: this.userEmail
        });
        
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error('❌ Token inválido:', error);
        
        this.isLoading = false;
        
        // Manejar errores específicos
        if (error.error?.code === 'INVALID_TOKEN') {
          alert('❌ Link inválido o expirado. Solicita uno nuevo.');
        } else {
          alert('❌ Error al validar token.');
        }
        
        this.router.navigate(['/forgot-password']);
      }
    });
  }

  // Validador personalizado para confirmar contraseñas
  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    
    if (password && confirmPassword && password !== confirmPassword) {
      return { mismatch: true };
    }
    
    return null;
  }

  onSubmit(): void {
    if (this.resetForm.invalid) {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.resetForm.controls).forEach(key => {
        this.resetForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;

    const body = {
      password: this.resetForm.value.password
    };

    this.http.post(
      `${this.apiUrl}/auth/reset-password/${this.token}`,
      body,
      { withCredentials: true }
    ).subscribe({
      next: (response: any) => {
        // ✅ Contraseña actualizada
        console.log('✅ Contraseña actualizada');
        
        this.isLoading = false;
        
        // Mostrar mensaje de éxito
        alert(`✅ ${response.message}\n\nYa puedes iniciar sesión con tu nueva contraseña.`);
        
        // Redirigir al login
        this.router.navigate(['/login']);
      },
      error: (error: HttpErrorResponse) => {
        console.error('❌ Error:', error);
        
        this.isLoading = false;
        
        // Manejar errores específicos
        if (error.status === 400) {
          alert('❌ Token inválido o expirado. Solicita un nuevo link de recuperación.');
          this.router.navigate(['/forgot-password']);
        } else if (error.status === 422) {
          alert('❌ Contraseña inválida. Debe tener al menos 6 caracteres.');
        } else {
          alert('❌ Error al actualizar contraseña. Intenta de nuevo.');
        }
      }
    });
  }
}
```

---

## 🔧 Endpoint Adicional en Backend (Validación de Token)

Para obtener el email antes de mostrar el formulario, el backend ya tiene este endpoint implementado:

**Archivo**: `src/routes/auth.routes.ts`

### GET /auth/reset-password/validate/:token

**Request:**
```http
GET /auth/reset-password/validate/abc123...
```

**Respuesta Exitosa (200):**
```json
{
  "ok": true,
  "email": "usuario@example.com",
  "expiresIn": 2847  // Segundos restantes de validez
}
```

**Respuesta de Error (400):**
```json
{
  "ok": false,
  "error": "Token de recuperación inválido o expirado",
  "code": "INVALID_TOKEN"
}
```

**Uso en Frontend:**
Este endpoint se llama automáticamente cuando el usuario abre el link del email, ANTES de mostrar el formulario. Permite:
- ✅ Validar que el token es válido
- ✅ Obtener el email del usuario para mostrarlo (readonly)
- ✅ Mostrar cuánto tiempo queda antes de expirar (opcional: countdown)

---

**Código del Backend:**

```typescript
router.get('/reset-password/validate/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Buscar usuario con el token válido y no expirado
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        ok: false,
        error: 'Token de recuperación inválido o expirado',
        code: 'INVALID_TOKEN'
      });
    }

    // Calcular segundos restantes
    const expiresIn = Math.floor(
      (user.resetPasswordTokenExpires.getTime() - Date.now()) / 1000
    );

    // ✅ Token válido
    res.json({
      ok: true,
      email: user.email,
      expiresIn
    });

  } catch (error) {
    console.error('Error validando token:', error);
    res.status(500).json({
      ok: false,
      error: 'Error al validar token'
    });
  }
});
```

---

### Página de Confirmación (check-email-reset.component.html)

```html
<div class="check-email-container">
  <div class="icon">📧</div>
  
  <h1>Revisa tu correo</h1>
  
  <p class="main-text">
    Si el email <strong>{{ email }}</strong> está registrado,
    recibirás un link para recuperar tu contraseña.
  </p>
  
  <p class="instructions">
    Haz click en el link que te enviamos para crear una nueva contraseña.
  </p>
  
  <div class="warning">
    ⚠️ El link expira en <strong>1 hora</strong>
  </div>
  
  <!-- Link para volver al login -->
  <p class="footer-text">
    <a routerLink="/login">← Volver al login</a>
  </p>
</div>
```

---

### TypeScript (check-email-reset.component.ts)

```typescript
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-check-email-reset',
  templateUrl: './check-email-reset.component.html',
  styleUrls: ['./check-email-reset.component.scss']
})
export class CheckEmailResetComponent implements OnInit {
  email = '';

  ngOnInit(): void {
    // Obtener email del sessionStorage
    this.email = sessionStorage.getItem('resetEmail') || 'tu correo';
  }
}
```

---

### Rutas en app-routing.module.ts

```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { CheckEmailResetComponent } from './components/check-email-reset/check-email-reset.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password/:token', component: ResetPasswordComponent },
  { path: 'check-email-reset', component: CheckEmailResetComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

---

## 📧 Email de Recuperación

El usuario recibe un email así:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            🎮 VALGAME
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Recuperación de Contraseña

Recibimos una solicitud para recuperar tu contraseña.

Haz click en el botón para crear una nueva contraseña:

┌───────────────────────────────┐
│   RECUPERAR CONTRASEÑA        │
└───────────────────────────────┘

O copia este link en tu navegador:
http://localhost:4200/reset-password/abc123...

⚠️ Este link expira en 1 hora.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Si no solicitaste este cambio, ignora este email.
Tu contraseña permanecerá sin cambios.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 📊 Respuestas del Backend - Recuperación

### POST /auth/forgot-password

#### ✅ Solicitud Procesada (200)
```json
{
  "message": "Si el correo existe, se enviará un email con instrucciones para recuperar tu contraseña."
}
```

**Nota**: Por seguridad, siempre responde lo mismo, exista o no el email.

---

### POST /auth/reset-password/:token

#### ✅ Contraseña Actualizada (200)
```json
{
  "message": "Contraseña actualizada exitosamente. Ya puedes iniciar sesión."
}
```

#### ❌ Token Inválido o Expirado (400)
```json
{
  "error": "Token de recuperación inválido o expirado"
}
```

---

## 📊 Flujo de Datos Paso a Paso

### Paso 1: Usuario olvida su contraseña

**Formulario muestra:**
```
┌──────────────────────────────┐
│ ¿Olvidaste tu contraseña?    │
├──────────────────────────────┤
│                              │
│ Email: [ tu@email.com    ]   │
│                              │
│    [Enviar Link]             │
└──────────────────────────────┘
```

**Datos enviados al backend:**
```json
POST /auth/forgot-password
{
  "email": "usuario@example.com"
}
```

**Backend guarda en MongoDB:**
```javascript
User.updateOne(
  { email: "usuario@example.com" },
  {
    resetPasswordToken: "abc123...",
    resetPasswordTokenExpires: Date.now() + 3600000 // 1 hora
  }
)
```

---

### Paso 2: Usuario recibe email

**Email contiene:**
```
Haz click aquí para recuperar tu contraseña:
http://localhost:4200/reset-password/abc123...

Este link expira en 1 hora.
```

---

### Paso 3: Usuario hace click en el link

**URL abierta:**
```
http://localhost:4200/reset-password/abc123...
                                     └─ Este es el token
```

**Frontend extrae token:**
```typescript
this.token = this.route.snapshot.params['token']; // "abc123..."
```

---

### Paso 4: Frontend valida token y obtiene email

**Request al backend:**
```json
GET /auth/reset-password/validate/abc123...
```

**Backend busca en MongoDB:**
```javascript
User.findOne({
  resetPasswordToken: "abc123...",
  resetPasswordTokenExpires: { $gt: Date.now() } // No expirado
})
```

**Backend responde:**
```json
{
  "valid": true,
  "email": "usuario@example.com"
}
```

**Frontend muestra formulario:**
```
┌──────────────────────────────────┐
│ Crear Nueva Contraseña           │
├──────────────────────────────────┤
│                                  │
│ Cuenta: usuario@example.com      │
│         (readonly - no editable) │
│                                  │
│ Nueva Contraseña:                │
│ [ ••••••••          ]            │
│                                  │
│ Confirmar Contraseña:            │
│ [ ••••••••          ]            │
│                                  │
│    [Actualizar Contraseña]       │
└──────────────────────────────────┘
```

---

### Paso 5: Usuario envía nueva contraseña

**Datos del formulario:**
```typescript
{
  email: "usuario@example.com",      // Solo visual (readonly)
  password: "nuevaPassword123",       // Lo que ingresó
  confirmPassword: "nuevaPassword123" // Confirmación
}
```

**Frontend valida:**
```typescript
✅ password.length >= 6
✅ password === confirmPassword
```

**Datos enviados al backend:**
```json
POST /auth/reset-password/abc123...
{
  "password": "nuevaPassword123"
}

⚠️ NOTA: Solo se envía la nueva contraseña
         El email NO se envía porque el token
         ya identifica al usuario
```

---

### Paso 6: Backend actualiza la contraseña

**Backend busca usuario por token:**
```javascript
const user = await User.findOne({
  resetPasswordToken: "abc123...",
  resetPasswordTokenExpires: { $gt: Date.now() }
});
```

**Backend hashea la nueva contraseña:**
```javascript
const hashedPassword = await bcrypt.hash("nuevaPassword123", 10);
// Resultado: "$2b$10$xYz..."
```

**Backend actualiza en MongoDB:**
```javascript
user.passwordHash = "$2b$10$xYz...";
user.resetPasswordToken = undefined;      // Limpia token
user.resetPasswordTokenExpires = undefined; // Limpia expiración
await user.save();
```

**Backend responde:**
```json
{
  "message": "Contraseña actualizada exitosamente. Ya puedes iniciar sesión."
}
```

---

### Paso 7: Usuario puede hacer login

**Ahora el usuario puede:**
```
Login con:
- Email: usuario@example.com
- Password: nuevaPassword123 (la nueva)
```

---

## 🔑 Resumen de Datos en Cada Paso

| Paso | Formulario Muestra | Datos Enviados | Backend Guarda |
|------|-------------------|----------------|----------------|
| **1. Forgot Password** | Email | `{ email }` | `resetPasswordToken` + expiration |
| **2. Email** | - | - | - |
| **3. Click Link** | - | - | - |
| **4. Validar Token** | Email (readonly) | Token en URL | - |
| **5. Reset Password** | Email + Password + Confirm | `{ password }` | `passwordHash` (bcrypt) |
| **6. Login** | Email + Password | `{ email, password }` | JWT token en cookie |

---

## ❓ Preguntas Frecuentes

### ¿Por qué pedir el email dos veces?

**Respuesta**: El email se pide UNA sola vez (en forgot-password).

En el formulario de reset, el email se **muestra** (readonly) para que el usuario confirme visualmente que está cambiando la contraseña de la cuenta correcta, pero **NO se envía** al backend porque el token ya identifica al usuario.

### ¿Qué pasa si el usuario cambia el email en DevTools?

**Respuesta**: No importa porque el campo es **readonly** y el backend **NO usa el email del formulario**. Solo usa el token de la URL para identificar al usuario.

### ¿Por qué pedir confirmar contraseña?

**Respuesta**: Para evitar errores de tipeo. Si el usuario escribe mal la contraseña y no hay confirmación, quedará bloqueado de su cuenta.

### ¿El backend valida que las contraseñas coincidan?

**Respuesta**: No, esa validación se hace en el **frontend**. El backend solo recibe una contraseña ya validada.

### ¿Qué pasa si el token expira?

**Respuesta**: 
- Si expira ANTES de abrir el link → Error 400 al validar token
- Si expira DESPUÉS de abrir pero ANTES de enviar → Error 400 al actualizar
- Solución: Usuario debe solicitar un nuevo link desde /forgot-password

---

## 🧪 Checklist de Prueba - Recuperación

- [ ] Formulario de "Olvidé mi contraseña" valida email
- [ ] POST /auth/forgot-password responde siempre igual (seguridad)
- [ ] Email de recuperación llega a la bandeja
- [ ] Link del email es correcto (frontend URL)
- [ ] Link expira después de 1 hora
- [ ] Formulario de reset valida contraseñas (mínimo 6 caracteres)
- [ ] Validación de "confirmar contraseña" funciona
- [ ] POST /auth/reset-password actualiza contraseña
- [ ] Usuario puede hacer login con nueva contraseña
- [ ] Token se limpia después del reset
- [ ] No se puede reutilizar el mismo link

---

## 🚨 Errores Comunes - Recuperación

### 1. "Link inválido o expirado"
**Causa**: Token usado después de 1 hora  
**Solución**: Solicitar nuevo link desde /forgot-password

### 2. "Las contraseñas no coinciden"
**Causa**: password !== confirmPassword  
**Solución**: Verificar validador personalizado

### 3. Email no llega
**Causa**: Email no registrado o problema SMTP  
**Solución**: Verificar que el email esté registrado

### 4. "FRONTEND_URL not defined"
**Causa**: Falta variable de entorno en backend  
**Solución**: Agregar `FRONTEND_URL=http://localhost:4200` en `.env`

---

## 🎯 Resumen Rápido

1. **Registro**: POST /auth/register → Email enviado
2. **Email**: Usuario recibe email con link
3. **Verificación**: GET /auth/verify/:token → Cuenta activada
4. **Login**: POST /auth/login → Token JWT recibido
5. **Olvidé Contraseña**: POST /auth/forgot-password → Email de recuperación
6. **Reset**: POST /auth/reset-password/:token → Nueva contraseña

**Tiempo total**: ~2 minutos desde registro hasta login  
**Recuperación**: ~1 minuto desde solicitud hasta nueva contraseña

---

**Última Actualización**: 3 de diciembre de 2025  
**Backend URL**: https://valgame-backend.onrender.com  
**Email SMTP**: romerolivo1234@gmail.com  
**Frontend URL**: http://localhost:4200
