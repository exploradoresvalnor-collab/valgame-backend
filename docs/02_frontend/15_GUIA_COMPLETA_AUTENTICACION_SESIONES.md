# 🔐 GUÍA COMPLETA: AUTENTICACIÓN Y GESTIÓN DE SESIONES

**Fecha de actualización:** 3 de noviembre de 2025  
**Última revisión:** Sistema de cookies httpOnly implementado y probado

---

## 📚 ÍNDICE

1. [Sistema de Autenticación](#sistema-de-autenticación)
2. [Registro de Usuario](#registro-de-usuario)
3. [Verificación de Email](#verificación-de-email)
4. [Login y Sesiones](#login-y-sesiones)
5. [Gestión de Cookies](#gestión-de-cookies)
6. [Logout](#logout)
7. [Recuperación de Contraseña](#recuperación-de-contraseña)
8. [Implementación Frontend](#implementación-frontend)
9. [Manejo de Errores](#manejo-de-errores)

---

## 🎯 SISTEMA DE AUTENTICACIÓN

### Tecnologías Utilizadas
- **JWT** (JSON Web Tokens) - Tokens de 7 días
- **Cookies httpOnly** - Almacenamiento seguro
- **bcrypt** - Hash de contraseñas
- **NodeMailer + Gmail SMTP** - Envío de emails

### Flujo Completo
```
1. Usuario se registra → Email de verificación
2. Usuario verifica email → Recibe Paquete del Pionero
3. Usuario hace login → Recibe cookie httpOnly (7 días)
4. Cookie se envía automáticamente en cada petición
5. Usuario puede cerrar navegador y volver → Sesión persiste
6. Usuario hace logout → Cookie se borra + token a blacklist
```

---

## 📝 REGISTRO DE USUARIO

### Endpoint
```typescript
POST /auth/register
Content-Type: application/json
```

### Request Body
```json
{
  "email": "usuario@example.com",
  "username": "Usuario123",
  "password": "MiPassword123!"
}
```

### Validaciones
- **Email**: Debe ser válido y único
- **Username**: 3-20 caracteres, sin espacios, único
- **Password**: Mínimo 6 caracteres

### Response Exitoso (201)
```json
{
  "message": "Usuario registrado. Revisa tu correo para verificar tu cuenta.",
  "userId": "673123abc456def789012345"
}
```

### Response Error (400)
```json
{
  "error": "El email ya está registrado"
}
// O
{
  "error": "El username ya está en uso"
}
```

### ⚡ Flujo Después del Registro
1. **Email enviado** a la dirección registrada
2. Email contiene **link de verificación** válido por tiempo limitado
3. Usuario debe hacer clic en el link para activar cuenta
4. **NO puede hacer login** hasta verificar email

### 📧 Email de Verificación
- **Asunto**: "Verifica tu cuenta - Exploradores de Valnor"
- **Remitente**: romerolivo1234@gmail.com
- **Contenido**: Link de verificación + instrucciones
- **Diseño**: HTML moderno con gradientes y animaciones
- **⚠️ IMPORTANTE**: Puede llegar a SPAM la primera vez

---

## ✅ VERIFICACIÓN DE EMAIL

### Endpoint
```typescript
GET /auth/verify/:token
```

### Ejemplo de URL
```
https://tu-backend.com/auth/verify/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Flujo
1. Usuario hace clic en el link del email
2. Backend verifica el token
3. Si es válido:
   - Marca cuenta como verificada
   - Entrega **Paquete del Pionero**
   - Muestra página de éxito con animaciones
4. Si es inválido/expirado:
   - Muestra página de error
   - Ofrece reenviar verificación

### 🎁 Paquete del Pionero
Al verificar el email, el usuario recibe automáticamente:

```json
{
  "val": 100,              // Moneda del juego
  "boletos": 5,            // Para invocar personajes
  "evo": 2,                // Para evolucionar personajes
  "consumibles": [
    {
      "nombre": "Poción de Vida Menor",
      "usos_restantes": 1
    },
    {
      "nombre": "Poción de Vida Menor",
      "usos_restantes": 1
    },
    {
      "nombre": "Poción de Vida Menor",
      "usos_restantes": 1
    }
  ],
  "equipamiento": [
    {
      "nombre": "Espada de Madera",
      "tipo": "arma",
      "rareza": "comun"
    }
  ],
  "personajes": [
    {
      "baseCharacterId": "ID_DEL_PERSONAJE_BASE",
      "nivel": 1
    }
  ]
}
```

### Response Exitoso (HTML)
```html
<!DOCTYPE html>
<html>
<head>
  <title>¡Cuenta Verificada!</title>
  <!-- Estilos con gradientes y animaciones -->
</head>
<body>
  <div class="container">
    <div class="success-icon">✅</div>
    <h1>¡Cuenta Verificada Exitosamente!</h1>
    <p>Tu cuenta ha sido activada</p>
    
    <div class="rewards">
      <h2>🎁 Has recibido el Paquete del Pionero:</h2>
      <ul>
        <li>💰 100 VAL</li>
        <li>🎟️ 5 Boletos de Invocación</li>
        <li>⭐ 2 Cristales EVO</li>
        <li>🧪 3 Pociones de Vida</li>
        <li>⚔️ 1 Espada Básica</li>
        <li>👤 1 Personaje Inicial</li>
      </ul>
    </div>
    
    <button onclick="window.location.href='TU_FRONTEND_URL/login'">
      Iniciar Sesión
    </button>
  </div>
</body>
</html>
```

---

## 🔑 LOGIN Y SESIONES

### Endpoint
```typescript
POST /auth/login
Content-Type: application/json
```

### Request Body
```json
{
  "email": "usuario@example.com",
  "password": "MiPassword123!"
}
```

### Response Exitoso (200)
```json
{
  "message": "Login exitoso",
  "user": {
    "id": "673123abc456def789012345",
    "email": "usuario@example.com",
    "username": "Usuario123",
    "isVerified": true,
    "tutorialCompleted": false,
    
    "val": 100,
    "boletos": 5,
    "evo": 2,
    "invocaciones": 0,
    "evoluciones": 0,
    "boletosDiarios": 0,
    
    "personajes": [
      {
        "_id": "673456def789012345678901",
        "baseCharacterId": "672abc123def456789012345",
        "nivel": 1,
        "experiencia": 0,
        "estado": "saludable",
        "hp_actual": 100,
        "hp_maximo": 100,
        "equipamiento": {
          "arma": null,
          "armadura": null,
          "accesorio": null
        }
      }
    ],
    
    "inventarioEquipamiento": [
      {
        "_id": "673789012345678901234567",
        "tipo": "arma",
        "nombre": "Espada de Madera",
        "rareza": "comun",
        "ataque": 5,
        "defensa": 0
      }
    ],
    
    "inventarioConsumibles": [
      {
        "_id": "673890123456789012345678",
        "nombre": "Poción de Vida Menor",
        "usos_restantes": 1,
        "efecto": {
          "tipo": "curacion",
          "valor": 50
        }
      }
    ],
    
    "limiteInventarioEquipamiento": 50,
    "limiteInventarioConsumibles": 50,
    "limiteInventarioPersonajes": 30,
    
    "personajeActivoId": "673456def789012345678901",
    "receivedPioneerPackage": true
  }
}
```

### 🍪 Cookie httpOnly (Automática)
El backend automáticamente establece una cookie:

```typescript
Set-Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; 
            HttpOnly; 
            Secure; 
            SameSite=Strict; 
            Max-Age=604800
```

**Características:**
- **HttpOnly**: JavaScript NO puede acceder (protección XSS)
- **Secure**: Solo HTTPS en producción
- **SameSite=Strict**: Previene CSRF
- **Max-Age=604800**: 7 días (604,800 segundos)

### Response Error (401)
```json
{
  "error": "Credenciales inválidas"
}
// O
{
  "error": "Debes verificar tu email antes de iniciar sesión"
}
```

---

## 🍪 GESTIÓN DE COOKIES

### ¿Cómo Funcionan las Cookies httpOnly?

#### En el Backend (ya implementado)
```typescript
// Al hacer login
res.cookie('token', token, {
  httpOnly: true,           // NO accesible desde JavaScript
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000  // 7 días
});
```

#### En el Frontend (lo que debes hacer)

**1. Configurar fetch/axios para enviar cookies:**

```typescript
// Con fetch
fetch('http://localhost:3000/api/users/me', {
  credentials: 'include'  // ⚠️ IMPORTANTE: Envía cookies
});

// Con axios
axios.get('http://localhost:3000/api/users/me', {
  withCredentials: true  // ⚠️ IMPORTANTE: Envía cookies
});
```

**2. Configurar CORS en el backend (ya está):**
```typescript
// En src/index.ts
app.use(cors({
  origin: 'http://localhost:4200',  // Tu frontend
  credentials: true  // Permite cookies
}));
```

### ✅ Ventajas de Cookies httpOnly

1. **Seguridad Máxima**
   - JavaScript no puede leer el token
   - Protección contra XSS (Cross-Site Scripting)
   - No se puede robar con `document.cookie`

2. **Automáticas**
   - El navegador las envía automáticamente
   - No necesitas manejarlas manualmente
   - No necesitas guardarlas en localStorage

3. **Persistentes**
   - Duran 7 días
   - Sobreviven al cierre del navegador
   - Se borran automáticamente al expirar

4. **CSRF Protection**
   - SameSite=Strict previene ataques CSRF
   - Solo se envían a tu dominio

### 🔄 Verificar Sesión al Cargar App

```typescript
// En el componente principal de tu app
async checkSession() {
  try {
    const response = await fetch('http://localhost:3000/api/users/me', {
      credentials: 'include'  // Envía cookie
    });
    
    if (response.ok) {
      const userData = await response.json();
      // Usuario logueado, mostrar dashboard
      this.currentUser = userData;
      this.isAuthenticated = true;
      return userData;
    } else {
      // Sin sesión válida
      this.isAuthenticated = false;
      // Redirigir a login
      this.router.navigate(['/login']);
    }
  } catch (error) {
    console.error('Error verificando sesión:', error);
    this.isAuthenticated = false;
    this.router.navigate(['/login']);
  }
}
```

### 📱 Flujo Completo de Sesión

```
┌─────────────────┐
│ Usuario abre app│
└────────┬────────┘
         │
         ▼
┌──────────────────────────┐
│ App hace GET /users/me   │
│ con credentials: include │
└────────┬─────────────────┘
         │
         ▼
  ¿Cookie existe y válida?
         │
    ┌────┴────┐
    │         │
   SÍ        NO
    │         │
    ▼         ▼
┌─────────┐ ┌──────────┐
│Dashboard│ │  Login   │
└─────────┘ └──────────┘
```

---

## 🚪 LOGOUT

### Endpoint
```typescript
POST /auth/logout
Authorization: Bearer <token>  (opcional)
Cookie: token=<token>          (automático)
```

### Request
No requiere body. La cookie se envía automáticamente.

```typescript
// Frontend
fetch('http://localhost:3000/auth/logout', {
  method: 'POST',
  credentials: 'include'  // Envía cookie para identificar sesión
});
```

### Response Exitoso (200)
```json
{
  "message": "Sesión cerrada correctamente"
}
```

### ⚡ ¿Qué hace el logout?

1. **Agrega el token a la blacklist** (invalida el token)
2. **Borra la cookie** del navegador
3. **Previene reuso** del token incluso si fue copiado

```typescript
// Backend (ya implementado)
router.post('/logout', auth, async (req, res) => {
  // 1. Agregar token a blacklist
  await TokenBlacklist.create({
    token,
    expiresAt: new Date(decoded.exp * 1000)
  });
  
  // 2. Borrar cookie
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  
  // 3. Confirmar
  res.json({ message: 'Sesión cerrada correctamente' });
});
```

### 🎯 Frontend después del logout

```typescript
async logout() {
  try {
    await fetch('http://localhost:3000/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
    
    // Limpiar estado local
    this.currentUser = null;
    this.isAuthenticated = false;
    
    // Redirigir a login
    this.router.navigate(['/login']);
    
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    // Incluso si hay error, limpiar estado local
    this.currentUser = null;
    this.isAuthenticated = false;
    this.router.navigate(['/login']);
  }
}
```

---

## 🔄 RECUPERACIÓN DE CONTRASEÑA

### Paso 1: Solicitar Reset

#### Endpoint
```typescript
POST /auth/forgot-password
Content-Type: application/json
```

#### Request Body
```json
{
  "email": "usuario@example.com"
}
```

#### Response Exitoso (200)
```json
{
  "message": "Si el email existe, recibirás un enlace de recuperación"
}
```

**Nota:** Siempre responde igual (exista o no el email) por seguridad.

### Paso 2: Resetear Password

#### Endpoint
```typescript
POST /auth/reset-password/:token
Content-Type: application/json
```

#### Request Body
```json
{
  "newPassword": "NuevoPassword123!"
}
```

#### Response Exitoso (200)
```json
{
  "message": "Contraseña actualizada exitosamente"
}
```

#### Response Error (400)
```json
{
  "error": "Token inválido o expirado"
}
```

---

## 💻 IMPLEMENTACIÓN FRONTEND

### 💻 Servicios y Componentes Completos

**📚 Código completo listo para copiar y pegar:**

Ver **`04_SERVICIOS_BASE.md`** para:
- ✅ `AuthService` completo con todas las funciones
- ✅ `CharacterService` para equipamiento y progresión
- ✅ `MarketplaceService` para compra/venta
- ✅ `DungeonService` para mazmorras
- ✅ `SocketService` para WebSocket
- ✅ `NotificationService` para mensajes
- ✅ Interceptors y Guards
- ✅ Configuración completa de HttpClient

### Ejemplo Mínimo de Login

```typescript
// auth.service.ts (versión mínima)
@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post('/auth/login', { email, password }, {
      withCredentials: true  // ⚠️ OBLIGATORIO
    });
  }

  logout() {
    return this.http.post('/auth/logout', {}, {
      withCredentials: true
    });
  }

  getProfile() {
    return this.http.get('/api/users/me', {
      withCredentials: true
    });
  }
}
```

```typescript
// login.component.ts (versión mínima)
export class LoginComponent {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login(email: string, password: string) {
    this.authService.login(email, password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => alert(err.error?.error)
    });
  }
}
```

---

## ⚠️ MANEJO DE ERRORES

### Códigos de Estado HTTP

| Código | Significado | Acción Frontend |
|--------|-------------|-----------------|
| 200 | OK | Mostrar éxito |
| 201 | Creado | Mostrar éxito + redireccionar |
| 400 | Bad Request | Mostrar error al usuario |
| 401 | No autorizado | Redirigir a login |
| 403 | Prohibido | Mostrar "No tienes permiso" |
| 404 | No encontrado | Mostrar "No existe" |
| 500 | Error servidor | Mostrar "Error del servidor" |

### Interceptor para Manejo Global

**📚 Ver `04_SERVICIOS_BASE.md`** para interceptor completo que:
- ✅ Agrega `withCredentials: true` automáticamente
- ✅ Maneja errores 401 (redirect a login)
- ✅ Maneja errores globales
- ✅ Configuración de providers

---

## 🎯 CHECKLIST DE IMPLEMENTACIÓN

### Backend (✅ YA ESTÁ LISTO)
- [x] Sistema de registro con validaciones
- [x] Envío de emails de verificación (Gmail SMTP)
- [x] Verificación de email con token
- [x] Entrega de Paquete del Pionero
- [x] Login con cookies httpOnly
- [x] Logout con blacklist de tokens
- [x] Recuperación de contraseña
- [x] Middleware de autenticación
- [x] CORS configurado con credentials

### Frontend (LO QUE DEBES HACER)
- [ ] Instalar HttpClientModule
- [ ] Crear AuthService con todas las funciones
- [ ] Configurar `withCredentials: true` en todas las peticiones
- [ ] Crear componentes de Login y Registro
- [ ] Crear Auth Guard para proteger rutas
- [ ] Implementar verificación de sesión al cargar app
- [ ] Crear componente de Dashboard
- [ ] Manejar errores 401 (redirigir a login)
- [ ] Implementar logout (botón + lógica)
- [ ] Crear componente de recuperación de contraseña

---

## 🔒 SEGURIDAD

### Implementado
✅ **Cookies httpOnly** - JavaScript no puede acceder  
✅ **HTTPS en producción** - Cookies solo por SSL  
✅ **SameSite=Strict** - Previene CSRF  
✅ **Tokens en blacklist** - Logout real  
✅ **Passwords hasheados** - bcrypt con salt  
✅ **Validación de email** - Usuarios verificados  
✅ **Tokens con expiración** - 7 días máximo  

### Recomendaciones
⚠️ **Siempre usa HTTPS en producción**  
⚠️ **Nunca guardes tokens en localStorage** (ya no es necesario)  
⚠️ **Valida datos en backend** (nunca confíes en frontend)  
⚠️ **Rate limiting** (limitar intentos de login)  
⚠️ **2FA opcional** (autenticación de dos factores)  

---

## 📞 SOPORTE

**Documentación relacionada:**
- `00_BACKEND_API_REFERENCE.md` - Referencia completa de API
- `02_API_REFERENCE.md` - Endpoints básicos
- `03_MODELOS_TYPESCRIPT.md` - Interfaces TypeScript
- `04_SERVICIOS_BASE.md` - Servicios para copiar

**Configuración SMTP actual:**
- Host: smtp.gmail.com
- Port: 587
- Email: romerolivo1234@gmail.com
- Remitente: romerolivo1234@gmail.com

---

**✅ SISTEMA COMPLETAMENTE FUNCIONAL Y PROBADO**
