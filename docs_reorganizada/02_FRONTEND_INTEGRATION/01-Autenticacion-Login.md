# 🔐 Autenticación y Login - Guía Completa de Implementación

**Versión:** 2.0  
**Última actualización:** 24 de noviembre de 2025  
**Módulos incluidos:** Registro, Verificación de Email, Login, Paquete Pionero

---

## 📋 Tabla de Contenidos

1. [Arquitectura General](#arquitectura-general)
2. [Fase 1: Registro](#fase-1-registro)
3. [Fase 2: Verificación de Email + Paquete Pionero](#fase-2-verificación-de-email--paquete-pionero)
4. [Fase 3: Login](#fase-3-login)
5. [Servicios Requeridos](#servicios-requeridos)
6. [Rutas y Endpoints](#rutas-y-endpoints)
7. [Protección de Rutas](#protección-de-rutas)
8. [Flujo Completo del Usuario](#flujo-completo-del-usuario)

---

## 🏗️ Arquitectura General

### Stack Recomendado
- **Framework:** Angular 15+ con TypeScript
- **Autenticación:** JWT en httpOnly cookie
- **Validación:** Zod + Angular Reactive Forms
- **HTTP Client:** Angular HttpClient con Interceptors
- **Estado:** BehaviorSubject (local) o NgRx (escalable)

### Componentes Necesarios
```
src/
  features/
    auth/
      components/
        register/
          register.component.ts
          register.component.html
          register.component.scss
        login/
          login.component.ts
          login.component.html
          login.component.scss
        verify-email/
          verify-email.component.ts
          verify-email.component.html
          verify-email.component.scss
      services/
        auth.service.ts
        auth.guard.ts
      interceptors/
        auth.interceptor.ts
      models/
        auth.models.ts
```

---

## Fase 1: Registro

### 1.1 RegisterComponent - TypeScript

```typescript
// register.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  submitted = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(20),
          Validators.pattern(/^[a-zA-Z0-9-_]+$/)
        ]
      ],
      password: ['', [Validators.required, Validators.minLength(6)]],
      passwordConfirm: ['', Validators.required],
      terms: [false, Validators.requiredTrue]
    ], {
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
    return this.registerForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = null;
    this.successMessage = null;

    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    const { email, username, password } = this.registerForm.value;

    this.authService.register(email, username, password).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = `✅ Cuenta creada. Verifica tu correo en ${email}`;
        
        setTimeout(() => {
          this.router.navigate(['/auth/verify-email'], {
            queryParams: { email }
          });
        }, 2000);
      },
      error: (error) => {
        this.loading = false;
        
        if (error.status === 409) {
          this.errorMessage = error.error?.message || 'Email o usuario ya existen';
          if (error.error?.field === 'email') {
            this.f['email'].setErrors({ 'emailTaken': true });
          } else if (error.error?.field === 'username') {
            this.f['username'].setErrors({ 'usernameTaken': true });
          }
        } else if (error.status === 400) {
          this.errorMessage = error.error?.message || 'Validación fallida';
        } else if (error.status === 429) {
          this.errorMessage = 'Demasiados intentos. Espera 5 minutos.';
        } else {
          this.errorMessage = 'Error al registrarse. Intenta más tarde.';
        }
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
```

### 1.2 RegisterComponent - HTML Template

```html
<!-- register.component.html -->
<div class="auth-container">
  <div class="auth-card">
    <h1>🎮 Crear Cuenta en Valgame</h1>
    <p class="subtitle">Únete a la aventura RPG</p>

    <!-- Mensaje de éxito -->
    <ng-container *ngIf="successMessage">
      <div class="alert alert-success">
        {{ successMessage }}
      </div>
    </ng-container>

    <!-- Mensaje de error -->
    <ng-container *ngIf="errorMessage">
      <div class="alert alert-error">
        ❌ {{ errorMessage }}
      </div>
    </ng-container>

    <!-- Formulario de registro -->
    <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" novalidate>
      
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
          <span *ngIf="f['email'].errors['emailTaken']">Este email ya está registrado</span>
        </div>
      </div>

      <!-- Username -->
      <div class="form-group">
        <label for="username">Usuario</label>
        <input
          id="username"
          type="text"
          formControlName="username"
          class="form-control"
          [class.is-invalid]="submitted && f['username'].errors"
          placeholder="tu-usuario"
          autocomplete="username"
        />
        <small class="form-text">3-20 caracteres, alfanuméricos, guión y guión bajo</small>
        <div *ngIf="submitted && f['username'].errors" class="error-text">
          <span *ngIf="f['username'].errors['required']">Usuario es requerido</span>
          <span *ngIf="f['username'].errors['minlength']">Mínimo 3 caracteres</span>
          <span *ngIf="f['username'].errors['maxlength']">Máximo 20 caracteres</span>
          <span *ngIf="f['username'].errors['pattern']">Solo alfanuméricos, guión y guión bajo</span>
          <span *ngIf="f['username'].errors['usernameTaken']">Este usuario ya existe</span>
        </div>
      </div>

      <!-- Password -->
      <div class="form-group">
        <label for="password">Contraseña</label>
        <input
          id="password"
          type="password"
          formControlName="password"
          class="form-control"
          [class.is-invalid]="submitted && f['password'].errors"
          placeholder="Mínimo 6 caracteres"
          autocomplete="new-password"
        />
        <div *ngIf="submitted && f['password'].errors" class="error-text">
          <span *ngIf="f['password'].errors['required']">Contraseña es requerida</span>
          <span *ngIf="f['password'].errors['minlength']">Mínimo 6 caracteres</span>
        </div>
      </div>

      <!-- Confirmar Contraseña -->
      <div class="form-group">
        <label for="passwordConfirm">Confirmar Contraseña</label>
        <input
          id="passwordConfirm"
          type="password"
          formControlName="passwordConfirm"
          class="form-control"
          [class.is-invalid]="submitted && (f['passwordConfirm'].errors || registerForm.errors)"
          placeholder="Confirma tu contraseña"
          autocomplete="new-password"
        />
        <div *ngIf="submitted && registerForm.errors?.['passwordMismatch']" class="error-text">
          Las contraseñas no coinciden
        </div>
      </div>

      <!-- Términos y Condiciones -->
      <div class="form-check">
        <input
          id="terms"
          type="checkbox"
          formControlName="terms"
          class="form-check-input"
          [class.is-invalid]="submitted && f['terms'].errors"
        />
        <label for="terms" class="form-check-label">
          Acepto los <a href="/terms" target="_blank">Términos y Condiciones</a>
        </label>
        <div *ngIf="submitted && f['terms'].errors" class="error-text">
          Debes aceptar los términos para continuar
        </div>
      </div>

      <!-- Botón Submit -->
      <button
        type="submit"
        class="btn btn-primary btn-block"
        [disabled]="loading || submitted && registerForm.invalid"
      >
        <ng-container *ngIf="!loading">🚀 Registrarse</ng-container>
        <ng-container *ngIf="loading">
          <span class="spinner-border spinner-border-sm"></span> Registrando...
        </ng-container>
      </button>
    </form>

    <!-- Link a Login -->
    <p class="text-center mt-3">
      ¿Ya tienes cuenta? 
      <button type="button" class="text-link" (click)="goToLogin()">
        Iniciar Sesión
      </button>
    </p>
  </div>
</div>
```

### 1.3 Endpoint Backend - Registro

```
POST /api/auth/register
Content-Type: application/json
CORS: Habilitado

{
  "email": "user@example.com",
  "username": "player1",
  "password": "secret123"
}
```

**Respuesta Exitosa (201):**
```json
{
  "ok": true,
  "message": "Usuario creado. Verifica tu correo.",
  "email": "user@example.com",
  "verificationTokenSent": true
}
```

**Respuesta Error (409 Conflict):**
```json
{
  "ok": false,
  "error": "Email ya registrado",
  "code": "EMAIL_EXISTS",
  "field": "email"
}
```

**Respuesta Error (400 Bad Request):**
```json
{
  "ok": false,
  "error": "Username debe tener 3-20 caracteres",
  "code": "INVALID_USERNAME",
  "field": "username"
}
```

---

## Fase 2: Verificación de Email + Paquete Pionero

### 2.1 ¿Qué es el Paquete Pionero?

El **Paquete Pionero** es un conjunto de recompensas que se entrega **automáticamente** cuando el usuario verifica su email. Es el punto de inicio del juego.

**Contenido del Paquete:**
- 💰 **100 VAL** - Moneda in-game
- 🎫 **10 Boletos** - Para comprar en tienda
- ⚡ **2 EVO** - Tokens para evolución de personajes
- 📦 **3 Pociones de Vida** - Item consumible
- ⚔️ **1 Espada de Principiante** - Equipo básico
- 👤 **1 Personaje Base** - Creado automáticamente

**Entrega:** Se entrega en el momento exacto en que el usuario hace clic en el link del email de verificación.

### 2.2 VerifyEmailComponent - TypeScript

```typescript
// verify-email.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface VerificationState {
  status: 'pending' | 'loading' | 'success' | 'error';
  message: string;
  errorCode?: string;
  pioneerPackage?: {
    val: number;
    boletos: number;
    evo: number;
    baseCharacter: {
      name: string;
      level: number;
      health: number;
    };
    items: Array<{ name: string; quantity: number; type: 'consumable' | 'equipment' }>;
  };
}

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss']
})
export class VerifyEmailComponent implements OnInit {
  state: VerificationState = {
    status: 'pending',
    message: 'Iniciando verificación...'
  };
  
  resendCountdown = 0;
  email: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Obtener token de parámetros
    this.route.params.subscribe(params => {
      if (params['token']) {
        this.verifyToken(params['token']);
      }
    });

    // Obtener email de query params
    this.route.queryParams.subscribe(queryParams => {
      if (queryParams['email']) {
        this.email = queryParams['email'];
      }
      if (queryParams['token']) {
        this.verifyToken(queryParams['token']);
      }
    });
  }

  private verifyToken(token: string): void {
    this.state.status = 'loading';
    this.state.message = '🔄 Verificando tu correo...';

    this.authService.verifyEmail(token).subscribe({
      next: (response: any) => {
        console.log('✅ Email verificado. Paquete pionero recibido:', response.pioneerPackage);

        // Guardar paquete pionero para mostrar
        if (response.pioneerPackage) {
          this.state.pioneerPackage = {
            val: response.pioneerPackage.val || 100,
            boletos: response.pioneerPackage.boletos || 10,
            evo: response.pioneerPackage.evo || 2,
            baseCharacter: response.pioneerPackage.baseCharacter || {
              name: 'Personaje Base',
              level: 1,
              health: 100
            },
            items: response.pioneerPackage.items || []
          };
        }

        this.state.status = 'success';
        this.state.message = '✅ ¡Email verificado! Tu cuenta está activa.';

        // Redirigir al dashboard en 3 segundos
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 3000);
      },
      error: (error) => {
        console.error('❌ Error de verificación:', error);
        this.state.status = 'error';

        if (error.status === 400) {
          this.state.errorCode = 'INVALID_TOKEN';
          this.state.message = 'El link de verificación no es válido o expiró.';
        } else if (error.status === 409) {
          this.state.errorCode = 'ALREADY_VERIFIED';
          this.state.message = 'Este correo ya ha sido verificado. Puedes iniciar sesión.';
        } else if (error.status === 429) {
          this.state.errorCode = 'RATE_LIMITED';
          this.state.message = 'Demasiados intentos. Intenta en 15 minutos.';
          this.startResendCountdown(900);
        } else {
          this.state.errorCode = 'UNKNOWN_ERROR';
          this.state.message = 'Error al verificar. Intenta de nuevo o solicita reenvío.';
        }
      }
    });
  }

  onResendEmail(): void {
    if (!this.email) {
      this.state.message = 'Por favor ingresa tu correo.';
      return;
    }

    this.authService.resendVerificationEmail(this.email).subscribe({
      next: () => {
        this.state.message = '📧 Email de verificación reenviado. Revisa tu bandeja (incluyendo SPAM).';
        this.startResendCountdown(300); // 5 minutos de cooldown
      },
      error: (error) => {
        if (error.status === 429) {
          this.state.message = 'Espera antes de reenviar. Intenta en 5 minutos.';
          this.startResendCountdown(300);
        } else if (error.status === 404) {
          this.state.message = 'Correo no encontrado.';
        } else {
          this.state.message = 'Error al reenviar. Intenta más tarde.';
        }
      }
    });
  }

  private startResendCountdown(seconds: number): void {
    this.resendCountdown = seconds;
    const interval = setInterval(() => {
      this.resendCountdown--;
      if (this.resendCountdown <= 0) {
        clearInterval(interval);
      }
    }, 1000);
  }

  get resendButtonText(): string {
    if (this.resendCountdown > 0) {
      return `Reenviar en ${this.resendCountdown}s`;
    }
    return 'Reenviar Verificación';
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
```

### 2.3 VerifyEmailComponent - HTML Template

```html
<!-- verify-email.component.html -->
<div class="verify-container">
  <div class="verify-card">
    
    <!-- ESTADO: PENDIENTE -->
    <ng-container *ngIf="state.status === 'pending'">
      <div class="spinner-container">
        <div class="spinner"></div>
      </div>
      <p>{{ state.message }}</p>
    </ng-container>

    <!-- ESTADO: CARGANDO -->
    <ng-container *ngIf="state.status === 'loading'">
      <div class="spinner-container">
        <div class="spinner loading"></div>
      </div>
      <p>{{ state.message }}</p>
    </ng-container>

    <!-- ESTADO: ÉXITO -->
    <ng-container *ngIf="state.status === 'success'">
      <div class="success-section">
        <div class="success-icon">✅</div>
        <h1>¡Verificación Exitosa!</h1>
        <p class="success-message">{{ state.message }}</p>

        <!-- Mostrar Paquete Pionero -->
        <ng-container *ngIf="state.pioneerPackage">
          <div class="pioneer-package">
            <h2>🎁 Paquete Pionero Recibido</h2>
            <p class="package-description">¡Felicidades! Recibes recursos iniciales para comenzar tu aventura.</p>
            
            <div class="package-grid">
              <!-- VAL -->
              <div class="package-item val">
                <span class="icon">💰</span>
                <span class="label">VAL</span>
                <span class="value">{{ state.pioneerPackage.val }}</span>
              </div>

              <!-- Boletos -->
              <div class="package-item boletos">
                <span class="icon">🎫</span>
                <span class="label">Boletos</span>
                <span class="value">{{ state.pioneerPackage.boletos }}</span>
              </div>

              <!-- EVO -->
              <div class="package-item evo">
                <span class="icon">⚡</span>
                <span class="label">EVO</span>
                <span class="value">{{ state.pioneerPackage.evo }}</span>
              </div>

              <!-- Personaje Base -->
              <div class="package-item character" *ngIf="state.pioneerPackage.baseCharacter">
                <span class="icon">👤</span>
                <span class="label">Personaje</span>
                <span class="value">{{ state.pioneerPackage.baseCharacter.name }} Lvl 1</span>
              </div>
            </div>

            <!-- Items -->
            <div class="items-list" *ngIf="state.pioneerPackage.items && state.pioneerPackage.items.length">
              <h3>📦 Items Adicionales</h3>
              <div class="item-row" *ngFor="let item of state.pioneerPackage.items">
                <span class="item-name">{{ item.name }}</span>
                <span class="item-type" [class]="item.type">{{ item.type === 'consumable' ? '🧪' : '⚔️' }}</span>
                <span class="item-quantity">x{{ item.quantity }}</span>
              </div>
            </div>
          </div>
        </ng-container>

        <p class="redirect-msg">Redirigiendo al dashboard en 3 segundos...</p>
        <button class="btn btn-primary" (click)="goToLogin()">
          ⚡ Ir al Dashboard Ahora
        </button>
      </div>
    </ng-container>

    <!-- ESTADO: ERROR -->
    <ng-container *ngIf="state.status === 'error'">
      <div class="error-section">
        <div class="error-icon">❌</div>
        <h1>Error de Verificación</h1>
        <p class="error-message">{{ state.message }}</p>

        <!-- Error específico: Token inválido -->
        <ng-container *ngIf="state.errorCode === 'INVALID_TOKEN'">
          <p class="help-text">
            El link de verificación puede haber expirado (válido por 1 hora).
          </p>
        </ng-container>

        <!-- Error específico: Ya verificado -->
        <ng-container *ngIf="state.errorCode === 'ALREADY_VERIFIED'">
          <p class="help-text">
            Puedes iniciar sesión directamente con tu cuenta.
          </p>
          <button class="btn btn-primary" (click)="goToLogin()">
            🔑 Ir a Iniciar Sesión
          </button>
        </ng-container>

        <!-- Opción: Reenviar Email -->
        <ng-container *ngIf="state.errorCode !== 'ALREADY_VERIFIED'">
          <div class="resend-section">
            <p class="resend-label">¿No recibiste el email?</p>
            <div class="email-input-group">
              <input
                type="email"
                [(ngModel)]="email"
                placeholder="tu@email.com"
                class="form-control"
              />
            </div>
            <button
              class="btn btn-secondary"
              (click)="onResendEmail()"
              [disabled]="resendCountdown > 0"
            >
              {{ resendButtonText }}
            </button>
          </div>
        </ng-container>

        <a href="/auth/register" class="text-link">← Volver a Registrarse</a>
      </div>
    </ng-container>

  </div>
</div>
```

### 2.4 Endpoint Backend - Verificar Email

```
GET /api/auth/verify/:token
CORS: Habilitado

Nota: NO requiere autenticación (el usuario aún no ha iniciado sesión)
```

**Respuesta Exitosa (200):**
```json
{
  "ok": true,
  "message": "Email verificado exitosamente",
  "user": {
    "id": "user_id_here",
    "username": "player1",
    "email": "user@example.com",
    "isVerified": true,
    "val": 100,
    "evo": 2,
    "boletos": 10
  },
  "pioneerPackage": {
    "val": 100,
    "boletos": 10,
    "evo": 2,
    "baseCharacter": {
      "id": "char_id",
      "name": "Personaje Base",
      "level": 1,
      "health": 100,
      "maxHealth": 100
    },
    "items": [
      { "name": "Poción de Vida", "quantity": 3, "type": "consumable" },
      { "name": "Espada de Principiante", "quantity": 1, "type": "equipment" }
    ]
  }
}
```

**Respuesta Error (400):**
```json
{
  "ok": false,
  "error": "Token inválido o expirado",
  "code": "INVALID_TOKEN"
}
```

**Respuesta Error (409):**
```json
{
  "ok": false,
  "error": "Este email ya fue verificado",
  "code": "ALREADY_VERIFIED"
}
```

---

## Fase 3: Login

### 3.1 LoginComponent - TypeScript

```typescript
// login.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  errorMessage: string | null = null;
  returnUrl: string = '/dashboard';
  showPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    
    // Obtener URL de retorno si existe
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    
    // Si ya está autenticado, redirigir
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }

    // Cargar email recordado si existe
    const rememberedEmail = localStorage.getItem('rememberEmail');
    if (rememberedEmail) {
      this.loginForm.patchValue({
        email: rememberedEmail,
        rememberMe: true
      });
    }
  }

  private initializeForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = null;

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    const { email, password, rememberMe } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (response) => {
        this.loading = false;
        
        // Guardar preferencia "Recuérdame"
        if (rememberMe) {
          localStorage.setItem('rememberEmail', email);
        } else {
          localStorage.removeItem('rememberEmail');
        }

        // Redirigir al dashboard o URL de retorno
        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        this.loading = false;

        if (error.status === 401) {
          this.errorMessage = '❌ Email o contraseña incorrectos';
        } else if (error.status === 403) {
          this.errorMessage = '⚠️ Tu cuenta no ha sido verificada. Verifica tu email primero.';
        } else if (error.status === 429) {
          this.errorMessage = '🔒 Demasiados intentos fallidos. Intenta más tarde.';
        } else {
          this.errorMessage = 'Error al iniciar sesión. Intenta más tarde.';
        }
      }
    });
  }

  goToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  goToForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }
}
```

### 3.2 LoginComponent - HTML Template

```html
<!-- login.component.html -->
<div class="auth-container">
  <div class="auth-card">
    <h1>🎮 Iniciar Sesión en Valgame</h1>
    <p class="subtitle">Continúa tu aventura</p>

    <!-- Mensaje de error -->
    <ng-container *ngIf="errorMessage">
      <div class="alert alert-error">
        {{ errorMessage }}
      </div>
    </ng-container>

    <!-- Formulario de login -->
    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" novalidate>
      
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

      <!-- Password -->
      <div class="form-group">
        <label for="password">Contraseña</label>
        <div class="password-input-group">
          <input
            id="password"
            [type]="showPassword ? 'text' : 'password'"
            formControlName="password"
            class="form-control"
            [class.is-invalid]="submitted && f['password'].errors"
            placeholder="Tu contraseña"
            autocomplete="current-password"
          />
          <button
            type="button"
            class="password-toggle"
            (click)="togglePasswordVisibility()"
            title="Mostrar/Ocultar contraseña"
          >
            {{ showPassword ? '👁️' : '👁️‍🗨️' }}
          </button>
        </div>
        <div *ngIf="submitted && f['password'].errors" class="error-text">
          <span *ngIf="f['password'].errors['required']">Contraseña es requerida</span>
          <span *ngIf="f['password'].errors['minlength']">Mínimo 6 caracteres</span>
        </div>
      </div>

      <!-- Remember Me & Forgot Password -->
      <div class="form-row form-controls">
        <div class="form-check">
          <input
            id="rememberMe"
            type="checkbox"
            formControlName="rememberMe"
            class="form-check-input"
          />
          <label for="rememberMe" class="form-check-label">Recuérdame</label>
        </div>
        <button
          type="button"
          class="text-link"
          (click)="goToForgotPassword()"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        class="btn btn-primary btn-block"
        [disabled]="loading"
      >
        <ng-container *ngIf="!loading">🚀 Iniciar Sesión</ng-container>
        <ng-container *ngIf="loading">
          <span class="spinner-border spinner-border-sm"></span> Iniciando...
        </ng-container>
      </button>
    </form>

    <!-- Link a Registro -->
    <p class="text-center mt-3">
      ¿No tienes cuenta? 
      <button type="button" class="text-link" (click)="goToRegister()">
        Registrarse
      </button>
    </p>

    <!-- Divider -->
    <div class="divider">o</div>

    <!-- Opciones adicionales -->
    <div class="additional-options">
      <p class="option-text">¿Necesitas ayuda?</p>
      <a href="/support" class="link-support">📞 Contáctanos</a>
    </div>
  </div>
</div>
```

### 3.3 Endpoint Backend - Login

```
POST /api/auth/login
Content-Type: application/json
CORS: Habilitado
Set-Cookie: token=JWT_HERE; HttpOnly; Secure; SameSite=Strict; Path=/

{
  "email": "user@example.com",
  "password": "secret123"
}
```

**Respuesta Exitosa (200):**
```json
{
  "ok": true,
  "message": "Sesión iniciada",
  "user": {
    "id": "64ab...",
    "email": "user@example.com",
    "username": "player1",
    "isVerified": true,
    "val": 100,
    "evo": 2,
    "boletos": 10,
    "personajes": 1,
    "ultimoLogin": "2025-11-24T10:30:00Z"
  }
}
```

**Respuesta Error (401):**
```json
{
  "ok": false,
  "error": "Credenciales inválidas",
  "code": "INVALID_CREDENTIALS"
}
```

**Respuesta Error (403):**
```json
{
  "ok": false,
  "error": "Tu cuenta no ha sido verificada",
  "code": "NOT_VERIFIED",
  "message": "Verifica tu email antes de iniciar sesión",
  "resendEmailEndpoint": "/api/auth/resend-verification"
}
```

---

## 🛠️ Servicios Requeridos

### AuthService - Métodos Principales

```typescript
// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface User {
  id: string;
  email: string;
  username: string;
  isVerified: boolean;
  val: number;
  evo: number;
  boletos: number;
  personajes: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/auth';
  
  private currentUser$ = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    this.checkAuthentication();
  }

  // Registro
  register(email: string, username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, 
      { email, username, password },
      { withCredentials: true }
    );
  }

  // Verificar email
  verifyEmail(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/verify/${token}`, {
      withCredentials: true
    }).pipe(
      tap((response) => {
        this.currentUser$.next(response.user);
        this.isAuthenticatedSubject.next(true);
      })
    );
  }

  // Reenviar verificación
  resendVerificationEmail(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/resend-verification`, 
      { email },
      { withCredentials: true }
    );
  }

  // Login
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`,
      { email, password },
      { withCredentials: true }
    ).pipe(
      tap((response) => {
        this.currentUser$.next(response.user);
        this.isAuthenticatedSubject.next(true);
      })
    );
  }

  // Logout
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, 
      { withCredentials: true }
    ).pipe(
      tap(() => {
        this.currentUser$.next(null);
        this.isAuthenticatedSubject.next(false);
      })
    );
  }

  // Obtener usuario actual
  getCurrentUser(): Observable<User | null> {
    return this.currentUser$.asObservable();
  }

  // Verificar si está autenticado
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  // Obtener estado de autenticación como Observable
  isAuthenticated$(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  // Verificar autenticación (llamar al inicio de la app)
  private checkAuthentication(): void {
    this.http.get(`${this.apiUrl}/me`, { withCredentials: true }).subscribe({
      next: (user: any) => {
        this.currentUser$.next(user);
        this.isAuthenticatedSubject.next(true);
      },
      error: () => {
        this.currentUser$.next(null);
        this.isAuthenticatedSubject.next(false);
      }
    });
  }
}
```

### AuthGuard - Proteger Rutas

```typescript
// auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }

    // No autenticado, redirigir a login con URL de retorno
    this.router.navigate(['/auth/login'], { 
      queryParams: { returnUrl: state.url } 
    });
    return false;
  }
}
```

### AuthInterceptor - Manejar Cookies

```typescript
// auth.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Las cookies httpOnly se envían automáticamente
    // con withCredentials: true en los requests HTTP
    
    // Si es necesario agregar headers adicionales:
    const authReq = req.clone({
      setHeaders: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    return next.handle(authReq);
  }
}
```

---

## 🗺️ Rutas y Endpoints

| Método | Ruta | Descripción | Autenticado |
|--------|------|-------------|-------------|
| `POST` | `/api/auth/register` | Crear nueva cuenta | No |
| `GET` | `/api/auth/verify/:token` | Verificar email y entregar paquete pionero | No |
| `POST` | `/api/auth/resend-verification` | Reenviar email de verificación | No |
| `POST` | `/api/auth/login` | Iniciar sesión | No |
| `POST` | `/api/auth/logout` | Cerrar sesión | Sí |
| `GET` | `/api/auth/me` | Obtener datos del usuario actual | Sí |

---

## 🔒 Protección de Rutas

```typescript
// app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './features/auth/services/auth.guard';

const routes: Routes = [
  {
    path: 'auth',
    children: [
      { path: 'register', component: RegisterComponent },
      { path: 'login', component: LoginComponent },
      { path: 'verify-email', component: VerifyEmailComponent }
    ]
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]  // ← Protegida
  },
  {
    path: 'marketplace',
    component: MarketplaceComponent,
    canActivate: [AuthGuard]  // ← Protegida
  },
  // ... más rutas protegidas
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

---

## 🎯 Flujo Completo del Usuario

```
┌─────────────────────────────────────────────────────────┐
│ 1. REGISTRO                                              │
├─────────────────────────────────────────────────────────┤
│ • Usuario llena formulario (email, username, password)   │
│ • Frontend valida localmente (email, formato, longitud)  │
│ • POST /api/auth/register                                │
│ • Backend valida, crea usuario, envía email              │
│ • Frontend redirige a pantalla "Verifica tu email"       │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 2. VERIFICACIÓN DE EMAIL + PAQUETE PIONERO              │
├─────────────────────────────────────────────────────────┤
│ • Usuario hace clic en link del email                    │
│ • Frontend extrae token de URL                           │
│ • GET /api/auth/verify/:token                            │
│ • Backend valida token, activa usuario                   │
│ • Backend entrega Paquete Pionero:                       │
│   - 100 VAL                                              │
│   - 10 Boletos                                           │
│   - 2 EVO                                                │
│   - 1 Personaje Base                                     │
│   - 3 Pociones de Vida                                   │
│   - 1 Espada de Principiante                             │
│ • Frontend muestra confirmación con items recibidos      │
│ • Frontend redirige a dashboard tras 3 segundos          │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 3. LOGIN                                                 │
├─────────────────────────────────────────────────────────┤
│ • Usuario llena email y contraseña                       │
│ • Frontend valida localmente                             │
│ • POST /api/auth/login                                   │
│ • Backend verifica credenciales y isVerified             │
│ • Backend genera JWT en httpOnly cookie                  │
│ • Frontend recibe datos del usuario                      │
│ • AuthService actualiza BehaviorSubject con usuario      │
│ • Frontend redirige a /dashboard                         │
│ • Rutas protegidas con AuthGuard están disponibles       │
└─────────────────────────────────────────────────────────┘
                         ↓
                   ✅ LISTO PARA JUGAR
```

---

## 📊 Tabla de Errores y Manejo

| Error | Código HTTP | Causa | Acción Recomendada |
|-------|-------------|-------|-------------------|
| Email inválido | 400 | Formato email incorrecto | Validar en frontend |
| Email existente | 409 | Email ya registrado | Mostrar error, sugerir login |
| Username inválido | 400 | Formato incorrecto | Validar patrón |
| Username existente | 409 | Username ya tomado | Sugerir otro |
| Contraseña débil | 400 | No cumple requisitos | Mostrar requerimientos |
| Token expirado | 400 | Verificación > 1 hora | Ofertar reenvío |
| Ya verificado | 409 | Email ya activado | Redirigir a login |
| Rate limit | 429 | Demasiados intentos | Mostrar cooldown |
| No verificado | 403 | Email sin verificar | Ofertar reenvío |
| Credenciales inválidas | 401 | Email o password falso | Mostrar error genérico |

---

## 🚀 Próximos Pasos

- Continuar con **02-Autenticacion-Recuperacion.md** para Recuperar contraseña y Reset
- Luego **03-Perfil-Dashboard.md** para Panel principal
- Seguir con módulos de inventario, tienda, marketplace, etc.

---

**¿Preguntas o cambios necesarios en esta guía?**  
Contacta al equipo de desarrollo de Valgame.
