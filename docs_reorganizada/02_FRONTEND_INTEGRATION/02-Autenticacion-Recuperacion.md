# 🔑 Recuperación de Contraseña - Guía Completa

**Versión:** 2.0  
**Última actualización:** 24 de noviembre de 2025  
**Módulos incluidos:** Forgot Password, Reset Password con validaciones de seguridad

---

## 📋 Tabla de Contenidos

1. [Flujo General](#flujo-general)
2. [Paso 1: Solicitar Recuperación](#paso-1-solicitar-recuperación)
3. [Paso 2: Reset de Contraseña](#paso-2-reset-de-contraseña)
4. [Servicios Requeridos](#servicios-requeridos)
5. [Seguridad](#seguridad)
6. [Endpoints Backend](#endpoints-backend)
7. [Manejo de Errores](#manejo-de-errores)

---

## 🔄 Flujo General

```
┌──────────────────────────────────────┐
│ 1. Usuario hace clic en              │
│    "¿Olvidaste tu contraseña?"       │
└──────────────────────────────────────┘
            ↓
┌──────────────────────────────────────┐
│ 2. Ingresa su email                  │
│    POST /api/auth/forgot-password    │
└──────────────────────────────────────┘
            ↓
┌──────────────────────────────────────┐
│ 3. Backend envía email con link      │
│    Link válido por 1 hora            │
└──────────────────────────────────────┘
            ↓
┌──────────────────────────────────────┐
│ 4. Usuario hace clic en link         │
│    Se abre formulario de reset       │
└──────────────────────────────────────┘
            ↓
┌──────────────────────────────────────┐
│ 5. Ingresa nueva contraseña          │
│    POST /api/auth/reset-password     │
└──────────────────────────────────────┘
            ↓
┌──────────────────────────────────────┐
│ 6. Contraseña actualizada            │
│    Redirige a login                  │
└──────────────────────────────────────┘
```

---

## Paso 1: Solicitar Recuperación

### 1.1 ForgotPasswordComponent - TypeScript

```typescript
// forgot-password.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

interface ForgotPasswordState {
  step: 'form' | 'success' | 'error';
  message: string;
  email: string;
  canResend: boolean;
  resendCountdown: number;
}

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  form!: FormGroup;
  loading = false;
  submitted = false;
  
  state: ForgotPasswordState = {
    step: 'form',
    message: '',
    email: '',
    canResend: true,
    resendCountdown: 0
  };

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get f() {
    return this.form.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    const { email } = this.form.value;

    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.loading = false;
        
        // Mostrar mensaje de éxito genérico (no revelar si email existe)
        this.state.step = 'success';
        this.state.email = email;
        this.state.message = 'Si el email existe en nuestro sistema, recibirás instrucciones de recuperación.';
        
        // Iniciar cooldown de 60 segundos
        this.startCooldown(60);
      },
      error: (error) => {
        this.loading = false;
        
        if (error.status === 429) {
          this.state.step = 'error';
          this.state.message = 'Demasiados intentos. Intenta en 15 minutos.';
          this.startCooldown(900);
        } else {
          this.state.step = 'error';
          this.state.message = 'Error al procesar la solicitud. Intenta más tarde.';
        }
      }
    });
  }

  onResend(): void {
    if (!this.state.canResend) {
      return;
    }

    this.loading = true;
    this.authService.forgotPassword(this.state.email).subscribe({
      next: () => {
        this.loading = false;
        this.state.message = 'Email reenviado. Revisa tu bandeja de entrada.';
        this.startCooldown(60);
      },
      error: () => {
        this.loading = false;
        this.state.message = 'Error al reenviar. Intenta más tarde.';
      }
    });
  }

  private startCooldown(seconds: number): void {
    this.state.canResend = false;
    this.state.resendCountdown = seconds;

    const interval = setInterval(() => {
      this.state.resendCountdown--;
      if (this.state.resendCountdown <= 0) {
        clearInterval(interval);
        this.state.canResend = true;
      }
    }, 1000);
  }

  goBack(): void {
    this.state.step = 'form';
    this.form.reset();
    this.submitted = false;
  }

  goToLogin(): void {
    // Navegar a login
    window.location.href = '/auth/login';
  }
}
```

### 1.2 ForgotPasswordComponent - HTML Template

```html
<!-- forgot-password.component.html -->
<div class="auth-container">
  <div class="auth-card">
    
    <!-- PASO 1: FORMULARIO -->
    <ng-container *ngIf="state.step === 'form'">
      <h1>🔐 Recuperar Contraseña</h1>
      <p class="subtitle">Ingresa tu email y te enviaremos instrucciones</p>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
        <!-- Email -->
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            type="email"
            formControlName="email"
            class="form-control"
            [class.is-invalid]="submitted && f['email'].errors"
            placeholder="tu@email.com"
            autocomplete="email"
          />
          <div *ngIf="submitted && f['email'].errors" class="error-text">
            <span *ngIf="f['email'].errors['required']">Email es requerido</span>
            <span *ngIf="f['email'].errors['email']">Email inválido</span>
          </div>
        </div>

        <!-- Botón Submit -->
        <button
          type="submit"
          class="btn btn-primary btn-block"
          [disabled]="loading"
        >
          <ng-container *ngIf="!loading">🔍 Buscar Cuenta</ng-container>
          <ng-container *ngIf="loading">
            <span class="spinner-border spinner-border-sm"></span> Buscando...
          </ng-container>
        </button>
      </form>

      <!-- Volver a Login -->
      <p class="text-center mt-3">
        <button type="button" class="text-link" (click)="goToLogin()">
          ← Volver a Iniciar Sesión
        </button>
      </p>
    </ng-container>

    <!-- ÉXITO -->
    <ng-container *ngIf="state.step === 'success'">
      <div class="success-section">
        <div class="success-icon">📧</div>
        <h1>¡Revisa tu Email!</h1>
        <p class="message">{{ state.message }}</p>
        
        <div class="info-box">
          <p><strong>Pasos siguientes:</strong></p>
          <ol>
            <li>Abre tu email ({{ state.email }})</li>
            <li>Busca el email de Valgame</li>
            <li>Haz clic en el link de recuperación</li>
            <li>Ingresa tu nueva contraseña</li>
          </ol>
        </div>

        <p class="note">
          ⏰ <strong>El link es válido por 1 hora</strong>
        </p>

        <!-- No recibí el email -->
        <div class="resend-section">
          <p>¿No recibiste el email?</p>
          <button
            type="button"
            class="btn btn-secondary"
            (click)="onResend()"
            [disabled]="!state.canResend || loading"
          >
            {{ state.canResend ? 'Reenviar Email' : `Espera ${state.resendCountdown}s` }}
          </button>
        </div>

        <!-- Volver -->
        <button
          type="button"
          class="btn btn-outline mt-3"
          (click)="goBack()"
        >
          ← Atrás
        </button>
      </div>
    </ng-container>

    <!-- ERROR -->
    <ng-container *ngIf="state.step === 'error'">
      <div class="error-section">
        <div class="error-icon">❌</div>
        <h1>Error</h1>
        <p class="error-message">{{ state.message }}</p>

        <!-- Reintentar -->
        <button
          type="button"
          class="btn btn-secondary mt-3"
          (click)="goBack()"
        >
          🔄 Intentar de Nuevo
        </button>

        <!-- Contacto de soporte -->
        <p class="text-center mt-3">
          ¿Problemas? <a href="/support" class="text-link">Contáctanos</a>
        </p>
      </div>
    </ng-container>

  </div>
</div>
```

---

## Paso 2: Reset de Contraseña

### 2.1 ResetPasswordComponent - TypeScript

```typescript
// reset-password.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface ResetPasswordState {
  status: 'loading' | 'form' | 'success' | 'error';
  message: string;
  errorCode?: string;
  tokenValid: boolean;
  email: string;
}

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  submitted = false;
  showPassword = false;
  showPasswordConfirm = false;

  state: ResetPasswordState = {
    status: 'loading',
    message: 'Validando token...',
    tokenValid: true,
    email: ''
  };

  private token: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Obtener token de URL
    this.route.params.subscribe(params => {
      this.token = params['token'];
      if (!this.token) {
        this.state.status = 'error';
        this.state.tokenValid = false;
        this.state.message = 'Token de recuperación no encontrado.';
      }
    });

    // Obtener email de query params (opcional)
    this.route.queryParams.subscribe(queryParams => {
      this.state.email = queryParams['email'] || '';
    });

    this.initializeForm();

    // Validar token con el backend
    if (this.token) {
      this.validateToken();
    }
  }

  private validateToken(): void {
    // Llamada al backend para validar token
    this.authService.validateResetToken(this.token).subscribe({
      next: (response) => {
        this.state.status = 'form';
        this.state.tokenValid = true;
        this.state.email = response.email;
      },
      error: (error) => {
        this.state.status = 'error';
        this.state.tokenValid = false;
        
        if (error.status === 400) {
          this.state.errorCode = 'INVALID_TOKEN';
          this.state.message = 'Token inválido o expirado.';
        } else {
          this.state.message = 'Error al validar token.';
        }
      }
    });
  }

  private initializeForm(): void {
    this.form = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      passwordConfirm: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const passwordConfirm = control.get('passwordConfirm');

    if (!password || !passwordConfirm) {
      return null;
    }

    return password.value === passwordConfirm.value ? null : { passwordMismatch: true };
  }

  get f() {
    return this.form.controls;
  }

  togglePasswordVisibility(field: 'password' | 'confirm'): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showPasswordConfirm = !this.showPasswordConfirm;
    }
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.form.invalid || !this.token) {
      return;
    }

    this.loading = true;
    const { password } = this.form.value;

    this.authService.resetPassword(this.token, password).subscribe({
      next: (response) => {
        this.loading = false;
        this.state.status = 'success';
        this.state.message = '✅ Contraseña actualizada exitosamente';

        // Redirigir a login en 2 segundos
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
      },
      error: (error) => {
        this.loading = false;
        this.state.status = 'error';

        if (error.status === 400) {
          this.state.errorCode = 'INVALID_TOKEN';
          this.state.message = 'Token inválido o expirado. Solicita un nuevo reset.';
        } else if (error.status === 409) {
          this.state.message = 'Este token ya fue utilizado. Solicita un nuevo reset.';
        } else {
          this.state.message = 'Error al actualizar contraseña. Intenta más tarde.';
        }
      }
    });
  }

  goToForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
```

### 2.2 ResetPasswordComponent - HTML Template

```html
<!-- reset-password.component.html -->
<div class="auth-container">
  <div class="auth-card">
    
    <!-- VALIDANDO TOKEN -->
    <ng-container *ngIf="state.status === 'loading'">
      <div class="loading-section">
        <div class="spinner"></div>
        <p>{{ state.message }}</p>
      </div>
    </ng-container>

    <!-- FORMULARIO DE RESET -->
    <ng-container *ngIf="state.status === 'form' && state.tokenValid">
      <h1>🔐 Nueva Contraseña</h1>
      <p class="subtitle">Ingresa tu nueva contraseña</p>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
        
        <!-- Nueva Contraseña -->
        <div class="form-group">
          <label for="password">Nueva Contraseña</label>
          <div class="password-input-group">
            <input
              id="password"
              [type]="showPassword ? 'text' : 'password'"
              formControlName="password"
              class="form-control"
              [class.is-invalid]="submitted && f['password'].errors"
              placeholder="Mínimo 6 caracteres"
              autocomplete="new-password"
            />
            <button
              type="button"
              class="password-toggle"
              (click)="togglePasswordVisibility('password')"
              title="Mostrar/Ocultar"
            >
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
          <small class="form-text">Mínimo 6 caracteres, usa combinaciones de letras, números y símbolos</small>
          <div *ngIf="submitted && f['password'].errors" class="error-text">
            <span *ngIf="f['password'].errors['required']">Contraseña es requerida</span>
            <span *ngIf="f['password'].errors['minlength']">Mínimo 6 caracteres</span>
          </div>
        </div>

        <!-- Confirmar Contraseña -->
        <div class="form-group">
          <label for="passwordConfirm">Confirmar Contraseña</label>
          <div class="password-input-group">
            <input
              id="passwordConfirm"
              [type]="showPasswordConfirm ? 'text' : 'password'"
              formControlName="passwordConfirm"
              class="form-control"
              [class.is-invalid]="submitted && (f['passwordConfirm'].errors || form.errors)"
              placeholder="Confirma tu nueva contraseña"
              autocomplete="new-password"
            />
            <button
              type="button"
              class="password-toggle"
              (click)="togglePasswordVisibility('confirm')"
              title="Mostrar/Ocultar"
            >
              {{ showPasswordConfirm ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
          <div *ngIf="submitted && form.errors?.['passwordMismatch']" class="error-text">
            Las contraseñas no coinciden
          </div>
        </div>

        <!-- Botón Submit -->
        <button
          type="submit"
          class="btn btn-primary btn-block"
          [disabled]="loading || !state.tokenValid"
        >
          <ng-container *ngIf="!loading">✅ Actualizar Contraseña</ng-container>
          <ng-container *ngIf="loading">
            <span class="spinner-border spinner-border-sm"></span> Actualizando...
          </ng-container>
        </button>
      </form>

      <!-- Volver -->
      <p class="text-center mt-3">
        <button type="button" class="text-link" (click)="goToLogin()">
          ← Volver a Iniciar Sesión
        </button>
      </p>
    </ng-container>

    <!-- ÉXITO -->
    <ng-container *ngIf="state.status === 'success'">
      <div class="success-section">
        <div class="success-icon">✅</div>
        <h1>¡Éxito!</h1>
        <p class="success-message">{{ state.message }}</p>
        <p class="redirect-msg">Redirigiendo a login...</p>
        <button
          type="button"
          class="btn btn-primary"
          (click)="goToLogin()"
        >
          🚀 Ir a Iniciar Sesión
        </button>
      </div>
    </ng-container>

    <!-- ERROR -->
    <ng-container *ngIf="state.status === 'error'">
      <div class="error-section">
        <div class="error-icon">❌</div>
        <h1>Error</h1>
        <p class="error-message">{{ state.message }}</p>

        <!-- Opciones de error -->
        <div class="error-options">
          <button
            type="button"
            class="btn btn-secondary"
            (click)="goToForgotPassword()"
          >
            🔄 Solicitar Nuevo Reset
          </button>
          <button
            type="button"
            class="btn btn-outline"
            (click)="goToLogin()"
          >
            🔑 Ir a Login
          </button>
        </div>

        <!-- Contacto de soporte -->
        <p class="text-center mt-3">
          ¿Necesitas ayuda? <a href="/support" class="text-link">Contáctanos</a>
        </p>
      </div>
    </ng-container>

  </div>
</div>
```

---

## 🛠️ Servicios Requeridos

### AuthService - Métodos Adicionales

```typescript
// Agregar a auth.service.ts

// Solicitar recuperación de contraseña
forgotPassword(email: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/forgot-password`, 
    { email },
    { withCredentials: true }
  );
}

// Validar token de recuperación
validateResetToken(token: string): Observable<any> {
  return this.http.get(`${this.apiUrl}/reset-password/validate/${token}`, {
    withCredentials: true
  });
}

// Reset contraseña con token
resetPassword(token: string, password: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/reset-password`, 
    { token, password },
    { withCredentials: true }
  );
}
```

---

## 🔐 Seguridad

### Principios Implementados

1. **Respuesta Genérica en Paso 1:**
   - Backend responde igual si email existe o no
   - Evita enumeración de usuarios
   - Mensaje: "Si el email existe, recibirás instrucciones"

2. **Tokens de Un Solo Uso:**
   - Token válido solo una vez
   - Una vez utilizado, no se puede reutilizar
   - Solicitar nuevo reset si necesita cambiar de nuevo

3. **Expiración de Token:**
   - Token válido por 1 hora
   - Después de 1 hora, debe solicitar nuevo reset
   - Timestamp almacenado en backend

4. **Rate Limiting:**
   - Máximo 3 solicitudes de reset por email por hora
   - Respuesta 429 Too Many Requests
   - Cooldown de 15 minutos entre solicitudes

5. **Email de Confirmación:**
   - Después de cambiar contraseña, enviar email de confirmación
   - Notificar al usuario que se cambió
   - Proporcionar link para reportar acceso no autorizado

### Validaciones Backend

```typescript
// Pseudocódigo de validaciones backend

// 1. Validar email existe
if (!user || !user.email) {
  return genericSuccess(); // No revelar si existe
}

// 2. Generar token único
const resetToken = generateSecureToken();
const tokenExpiry = now + 1 * 60 * 60 * 1000; // 1 hora

// 3. Guardar token
user.resetPasswordToken = resetToken;
user.resetPasswordExpiry = tokenExpiry;
user.resetPasswordUsed = false;

// 4. Enviar email con link
sendEmail(user.email, resetToken);

// 5. En reset: validar token no expirado y no usado
if (tokenExpiry < now) {
  return error(400, 'Token expirado');
}

if (resetPasswordUsed) {
  return error(409, 'Token ya fue utilizado');
}

// 6. Actualizar contraseña y marcar token como usado
user.password = hashPassword(newPassword);
user.resetPasswordUsed = true;
user.resetPasswordToken = null;

// 7. Enviar email de confirmación
sendConfirmationEmail(user.email);
```

---

## 📡 Endpoints Backend

### Forgot Password

```
POST /api/auth/forgot-password
Content-Type: application/json
CORS: Habilitado

{
  "email": "user@example.com"
}
```

**Respuesta (200) - Genérica:**
```json
{
  "ok": true,
  "message": "Si el email existe, recibirás instrucciones de recuperación"
}
```

**Error (429):**
```json
{
  "ok": false,
  "error": "Demasiados intentos. Espera 15 minutos",
  "code": "RATE_LIMITED",
  "retryAfter": 900
}
```

### Validar Token

```
GET /api/auth/reset-password/validate/:token
CORS: Habilitado
```

**Respuesta (200):**
```json
{
  "ok": true,
  "email": "user@example.com",
  "expiresIn": 1800
}
```

**Error (400):**
```json
{
  "ok": false,
  "error": "Token inválido o expirado",
  "code": "INVALID_TOKEN"
}
```

### Reset Password

```
POST /api/auth/reset-password
Content-Type: application/json
CORS: Habilitado

{
  "token": "reset_token_here",
  "password": "newpassword123"
}
```

**Respuesta (200):**
```json
{
  "ok": true,
  "message": "Contraseña actualizada exitosamente",
  "email": "user@example.com"
}
```

**Error (400):**
```json
{
  "ok": false,
  "error": "Token inválido o expirado",
  "code": "INVALID_TOKEN"
}
```

**Error (409):**
```json
{
  "ok": false,
  "error": "Este token ya fue utilizado",
  "code": "TOKEN_ALREADY_USED"
}
```

---

## 📊 Manejo de Errores

| Escenario | Código HTTP | Mensajea Frontend | Acción |
|-----------|-------------|-----------------|--------|
| Email válido existe | 200 | Genérico | Enviar email |
| Email válido no existe | 200 | Genérico | (No hacer nada) |
| Email inválido | 400 | Validación local | Mostrar error |
| Rate limit | 429 | "Espera 15 min" | Mostrar cooldown |
| Token válido | 200 | - | Mostrar formulario |
| Token expirado | 400 | "Solicita nuevo" | Link a forgot-password |
| Token usado | 409 | "Ya fue usado" | Link a forgot-password |
| Contraseña débil | 400 | "No cumple req" | Validación local |
| Passwords no coinciden | 400 | "No coinciden" | Validación local |
| Éxito reset | 200 | "Éxito" | Redirigir a login |

---

## 🎯 Flujo de Correos

### Email 1: Solicitud de Recuperación

```
De: noreply@valgame.com
Asunto: Recupera tu contraseña en Valgame

Hola [USERNAME],

Recibimos una solicitud para recuperar tu contraseña.

Haz clic en el siguiente link para continuar:
[LINK CON TOKEN]

Este link es válido por 1 hora.

Si no solicitaste esto, puedes ignorar este email.

Saludos,
Equipo Valgame
```

### Email 2: Confirmación de Cambio

```
De: noreply@valgame.com
Asunto: Tu contraseña ha sido cambiada

Hola [USERNAME],

Tu contraseña fue actualizada exitosamente.

Si no fuiste tú, haz clic aquí:
[LINK PARA REPORTAR ACCESO NO AUTORIZADO]

Saludos,
Equipo Valgame
```

---

## 🗺️ Rutas Frontend

```typescript
// app-routing.module.ts

{
  path: 'auth',
  children: [
    // ... otras rutas
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

## 🔄 Integración con Documento 1

Esta guía funciona en conjunto con **01-Autenticacion-Login.md**:

- Si usuario está en login y olvidó contraseña → Link a `forgot-password`
- Después de recuperación → Redirecciona a `login`
- Flujo completo de autenticación incluye esta recuperación

---

## 📚 Próximos Documentos

- **03-Perfil-Dashboard.md** - Panel principal del usuario
- **04-Inventario-Equipamiento.md** - Gestión de items

---

**¿Preguntas o cambios?**  
Contacta al equipo de desarrollo de Valgame.
