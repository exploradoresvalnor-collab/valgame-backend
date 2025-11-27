const fs = require('fs');
const path = 'c:/Users/Haustman/Desktop/valgame-backend/docs_reorganizada/02_FRONTEND_INTEGRATION/Valnor-guia.md';

// Leer archivo
let content = fs.readFileSync(path, 'utf8');

// Encontrar el inicio de la sección 6
const section6Start = content.indexOf('### 6. Recuperar Contraseña');
const section7Start = content.indexOf('### 7. ');

if (section6Start === -1) {
  console.log('❌ No se encontró la sección 6');
  process.exit(1);
}

// Determinar dónde termina la sección 6
let endSection6 = content.length;
if (section7Start !== -1) {
  endSection6 = section7Start;
}

// Extraer todo lo que hay antes y después
const before = content.substring(0, section6Start);
const after = content.substring(endSection6);

// Nuevo contenido para la sección Recuperar Contraseña
const newSection = `### 6. Recuperar Contraseña

**Flujo de Dos Pasos:**
1. Usuario solicita recuperación con email
2. Backend envía link con token temporal
3. Usuario abre link y ingresa nueva contraseña
4. Backend valida y actualiza contraseña

**Componentes Requeridos:**
- \`ForgotPasswordComponent\` (solicitar email)
- \`ResetPasswordComponent\` (ingresar nueva contraseña)
- \`AuthService\` (solicitar reset y confirmar nueva contraseña)

**PASO 1: Solicitar Recuperación**

\`\`\`typescript
// forgot-password.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {
  form!: FormGroup;
  loading = false;
  submitted = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

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
    if (this.form.invalid) return;

    this.loading = true;
    const { email } = this.form.value;

    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Si el email existe, recibirás instrucciones de recuperación';
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Error al solicitar recuperación. Intenta más tarde.';
      }
    });
  }
}
\`\`\`

**Endpoint Backend - Paso 1:**

\`\`\`
POST /api/auth/forgot-password
Content-Type: application/json

{ "email": "user@example.com" }
\`\`\`

**Respuesta (200):**
\`\`\`json
{ 
  "ok": true, 
  "message": "Si el email existe, recibirás instrucciones" 
}
\`\`\`

**PASO 2: Reset Contraseña**

\`\`\`typescript
// reset-password.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  submitted = false;
  token: string = '';
  email: string = '';
  errorMessage: string | null = null;
  successMessage: string | null = null;
  tokenValid = true;

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
        this.tokenValid = false;
      }
    });

    this.route.queryParams.subscribe(queryParams => {
      this.email = queryParams['email'];
    });

    this.initializeForm();
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

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = null;

    if (this.form.invalid || !this.token) {
      return;
    }

    this.loading = true;
    const { password } = this.form.value;

    this.authService.resetPassword(this.token, password).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = '✅ Contraseña actualizada exitosamente';
        
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
      },
      error: (error) => {
        this.loading = false;
        
        if (error.status === 400) {
          this.errorMessage = 'Token inválido o expirado';
          this.tokenValid = false;
        } else {
          this.errorMessage = 'Error al actualizar contraseña. Intenta más tarde.';
        }
      }
    });
  }
}
\`\`\`

**Endpoint Backend - Paso 2:**

\`\`\`
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_here",
  "password": "newpassword123"
}
\`\`\`

**Respuesta Exitosa (200):**
\`\`\`json
{
  "ok": true,
  "message": "Contraseña actualizada exitosamente"
}
\`\`\`

**Respuesta Error (400):**
\`\`\`json
{
  "ok": false,
  "error": "Token inválido o expirado",
  "code": "INVALID_RESET_TOKEN"
}
\`\`\`

**Validaciones del Backend:**
- Email existe
- Token no expirado (válido 1 hora)
- Token no ha sido usado antes (idempotencia)
- Contraseña cumple requisitos mínimos

**Manejo de Errores:**

| Código HTTP | Error | Acción |
|-------------|-------|--------|
| **200** (Paso 1) | N/A | Mostrar mensaje genérico (no revelar si email existe) |
| **200** (Paso 2) | N/A | Mostrar éxito y redirigir a login |
| **400** | Token inválido | Mostrar error y link a nueva solicitud |
| **429** | Rate limit | "Demasiados intentos. Espera 15 minutos" |
| **500** | Error servidor | Mensaje genérico |

**Seguridad:**
- Token válido solo 1 hora
- Respuesta genérica en Paso 1 (no revela si email existe)
- Tokens de un solo uso (no reutilizar después de cambiar contraseña)
- Rate limit: máximo 3 solicitudes por email por hora
- Enviar email de confirmación después de cambiar contraseña

**WebSocket Events:** Ninguno en esta fase

**Notas Técnicas:**
- El email del reset no necesita verificación adicional (ya fue verificado en registro)
- Después de resetear, usuario debe iniciar sesión nuevamente
- Se recomienda enviar email notificando cambio de contraseña

`;

// Guardar nuevo archivo
const newContent = before + newSection + after;
fs.writeFileSync(path, newContent, 'utf8');

console.log('✅ Sección 6 (Recuperar Contraseña) reemplazada exitosamente');
console.log(`Section 6 starts at char: ${section6Start}`);
console.log(`End of section at char: ${endSection6}`);
