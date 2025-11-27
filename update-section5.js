const fs = require('fs');
const path = 'c:/Users/Haustman/Desktop/valgame-backend/docs_reorganizada/02_FRONTEND_INTEGRATION/Valnor-guia.md';

// Leer archivo
let content = fs.readFileSync(path, 'utf8');

// Encontrar el inicio de la sección 5
const section5Start = content.indexOf('### 5. Login (Inicio de Sesión)');
const section6Start = content.indexOf('### 6. Recuperar Contraseña');

if (section5Start === -1 || section6Start === -1) {
  console.log('❌ No se encontraron las secciones');
  console.log(`Section 5 found: ${section5Start !== -1}`);
  console.log(`Section 6 found: ${section6Start !== -1}`);
  process.exit(1);
}

// Extraer todo lo que hay antes y después
const before = content.substring(0, section5Start);
const after = content.substring(section6Start);

// Nuevo contenido para la sección Login
const newSection = `### 5. Login (Inicio de Sesión)

**Componentes Requeridos:**
- \`LoginComponent\` (página principal)
- \`LoginFormComponent\` (formulario reutilizable)
- \`AuthService\` (lógica de autenticación)
- \`AuthGuard\` (proteger rutas autenticadas)
- \`HttpInterceptor\` (adjuntar JWT a requests)

**Servicios Requeridos:**
- \`AuthService.login()\`
- \`AuthService.getCurrentUser()\`
- \`AuthService.logout()\`

**Campos:** \`email\`, \`password\`

**Validaciones Locales (Frontend):**
- Email: formato válido
- Password: no vacío, mínimo 6 caracteres

**Código Angular Completo:**

\`\`\`typescript
// login.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

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
        }

        // Redirigir al dashboard o URL de retorno
        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        this.loading = false;

        if (error.status === 401) {
          this.errorMessage = 'Email o contraseña incorrectos';
        } else if (error.status === 403) {
          this.errorMessage = 'Tu cuenta no ha sido verificada. Verifica tu email primero.';
        } else if (error.status === 429) {
          this.errorMessage = 'Demasiados intentos fallidos. Intenta más tarde.';
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
\`\`\`

\`\`\`html
<!-- login.component.html -->
<div class="login-container">
  <div class="login-card">
    <h1>🎮 Iniciar Sesión en Valgame</h1>

    <ng-container *ngIf="errorMessage">
      <div class="alert alert-error">
        ❌ {{ errorMessage }}
      </div>
    </ng-container>

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
        <input
          id="password"
          type="password"
          formControlName="password"
          class="form-control"
          [class.is-invalid]="submitted && f['password'].errors"
          placeholder="Tu contraseña"
          autocomplete="current-password"
        />
        <div *ngIf="submitted && f['password'].errors" class="error-text">
          <span *ngIf="f['password'].errors['required']">Contraseña es requerida</span>
          <span *ngIf="f['password'].errors['minlength']">Mínimo 6 caracteres</span>
        </div>
      </div>

      <!-- Remember Me & Forgot Password -->
      <div class="form-row">
        <div class="form-check">
          <input
            id="rememberMe"
            type="checkbox"
            formControlName="rememberMe"
            class="form-check-input"
          />
          <label for="rememberMe" class="form-check-label">Recuérdame</label>
        </div>
        <a href="/auth/forgot-password" class="text-link">¿Olvidaste tu contraseña?</a>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        class="btn btn-primary btn-block"
        [disabled]="loading"
      >
        <ng-container *ngIf="!loading">🚀 Iniciar Sesión</ng-container>
        <ng-container *ngIf="loading">
          <span class="spinner-border spinner-border-sm mr-2"></span>Iniciando...
        </ng-container>
      </button>
    </form>

    <p class="text-center mt-3">
      ¿No tienes cuenta? <a href="/auth/register">Registrarse</a>
    </p>
  </div>
</div>
\`\`\`

\`\`\`typescript
// auth.service.ts - Métodos de Login
export class AuthService {
  private currentUser$ = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    this.checkAuthentication();
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post('/api/auth/login',
      { email, password },
      { withCredentials: true }
    ).pipe(
      tap((response) => {
        this.currentUser$.next(response.user);
        this.isAuthenticatedSubject.next(true);
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post('/api/auth/logout', {}, 
      { withCredentials: true }
    ).pipe(
      tap(() => {
        this.currentUser$.next(null);
        this.isAuthenticatedSubject.next(false);
      })
    );
  }

  getCurrentUser(): Observable<User> {
    return this.currentUser$.asObservable();
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  private checkAuthentication(): void {
    // Verificar si hay token en cookie (automático con withCredentials)
    // O intentar obtener usuario actual del backend
    this.http.get('/api/auth/me', { withCredentials: true }).subscribe({
      next: (user) => {
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
\`\`\`

\`\`\`typescript
// auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

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
\`\`\`

\`\`\`typescript
// auth.interceptor.ts - Adjuntar JWT a cada request
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Usar withCredentials=true en auth.service para enviar cookies automáticamente
    // No necesitamos agregar header Authorization porque usamos httpOnly cookies
    return next.handle(req);
  }
}
\`\`\`

**Endpoint Backend:**

\`\`\`
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secret123"
}
\`\`\`

**Respuesta Exitosa (200):**
\`\`\`json
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
    "boletos": 10
  }
}
\`\`\`

**Respuesta Error (401):**
\`\`\`json
{
  "ok": false,
  "error": "Credenciales inválidas",
  "code": "INVALID_CREDENTIALS"
}
\`\`\`

**Respuesta Error (403):**
\`\`\`json
{
  "ok": false,
  "error": "Tu cuenta no ha sido verificada",
  "code": "NOT_VERIFIED",
  "message": "Verifica tu email antes de iniciar sesión"
}
\`\`\`

**Manejo de Errores:**

| Código HTTP | Mensaje | Acción |
|-------------|---------|--------|
| **200** | Éxito | Guardar usuario y redirigir a dashboard |
| **401** | Credenciales inválidas | Mostrar error genérico |
| **403** | Cuenta no verificada | Mostrar mensaje + link a reenvío |
| **429** | Rate limit excedido | Mostrar mensaje de espera |
| **500** | Error servidor | Mensaje genérico + soporte |

**WebSocket Events:**
- Conectar socket.io con JWT automáticamente tras login

**Rutas Protegidas:**
\`\`\`typescript
// app-routing.module.ts
const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]  // Proteger con AuthGuard
  },
  {
    path: 'marketplace',
    component: MarketplaceComponent,
    canActivate: [AuthGuard]
  },
  // ... más rutas protegidas
];
\`\`\`

**Notas Técnicas:**
- Cookie httpOnly se envía automáticamente con \`withCredentials: true\`
- No necesitas agregar header Authorization manualmente
- El header Set-Cookie tiene flags: HttpOnly, Secure, SameSite=Strict
- Si hay fallo de CORS, revisa que frontend URL esté en \`FRONTEND_ORIGIN\` del backend
- Implementar "Recuérdame" guardando email en localStorage (opcional)

---

`;

// Guardar nuevo archivo
const newContent = before + newSection + after;
fs.writeFileSync(path, newContent, 'utf8');

console.log('✅ Sección 5 (Login) reemplazada exitosamente');
console.log(`Section 5 starts at char: ${section5Start}`);
console.log(`Section 6 starts at char: ${section6Start}`);
