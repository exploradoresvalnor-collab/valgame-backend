# ⚙️ CONFIGURACIÓN - COPIAR Y PEGAR

## 📁 Archivos de Configuración

---

## 1️⃣ environment.ts

```typescript
// src/environments/environment.ts

export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
  wsUrl: 'ws://localhost:8080'
};
```

---

## 2️⃣ environment.prod.ts

```typescript
// src/environments/environment.prod.ts

export const environment = {
  production: true,
  apiUrl: 'https://valgame-backend.onrender.com',
  wsUrl: 'wss://valgame-backend.onrender.com'
};
```

**✅ BACKEND DESPLEGADO EN PRODUCCIÓN:**
- 🌐 **URL:** https://valgame-backend.onrender.com
- ✅ **Estado:** 🟢 LIVE y funcional
- 📅 **Fecha despliegue:** 15 de enero de 2025
- 🗄️ **MongoDB Atlas:** ✅ Conectado al cluster "Valnor"
- ⚙️ **Runtime:** Node.js 22.16.0
- 🔒 **Seguridad:** JWT + Zod validation + Rate limiting
- ⚠️ **Free tier:** Cold start ~30-60s después de 15min inactividad
- 📊 **Health check:** https://valgame-backend.onrender.com/health

**Recomendación para Cold Start:**
```typescript
// En tu AppComponent (ngOnInit)
this.http.get(`${environment.apiUrl}/health`).subscribe({
  next: () => console.log('Backend despierto'),
  error: () => console.log('Esperando backend...')
});
```

---

## 3️⃣ tailwind.config.js

```javascript
// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1976d2',
          dark: '#1565c0',
          light: '#42a5f5',
        },
        secondary: {
          DEFAULT: '#dc004e',
          dark: '#c51162',
          light: '#f50057',
        },
        success: '#4caf50',
        warning: '#ff9800',
        danger: '#f44336',
        'rarity-common': '#9e9e9e',
        'rarity-rare': '#2196f3',
        'rarity-epic': '#9c27b0',
        'rarity-legendary': '#ff9800',
      }
    },
  },
  plugins: [],
}
```

---

## 4️⃣ styles.scss

```scss
// src/styles.scss

@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

/* Angular Material Theme */
@import '@angular/material/prebuilt-themes/indigo-pink.css';

/* Estilos globales */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Roboto, "Helvetica Neue", sans-serif;
  background-color: #f5f5f5;
}

/* Snackbar personalizado */
.success-snackbar {
  background-color: #4caf50 !important;
  color: white !important;
}

.error-snackbar {
  background-color: #f44336 !important;
  color: white !important;
}

.info-snackbar {
  background-color: #2196f3 !important;
  color: white !important;
}

.warning-snackbar {
  background-color: #ff9800 !important;
  color: white !important;
}

/* Scrollbar personalizado */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Animaciones */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
```

---

## 5️⃣ tsconfig.json (Path Aliases)

```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@models/*": ["src/app/models/*"],
      "@core/*": ["src/app/core/*"],
      "@shared/*": ["src/app/shared/*"],
      "@features/*": ["src/app/features/*"],
      "@environments/*": ["src/environments/*"]
    }
  }
}
```

---

## 6️⃣ app.config.ts

```typescript
// src/app/app.config.ts

import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor])
    ),
    provideAnimations()
  ]
};
```

---

## 7️⃣ auth.interceptor.ts

```typescript
// src/app/core/interceptors/auth.interceptor.ts

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token && !req.url.includes('/auth/')) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  return next(req);
};
```

---

## 8️⃣ error.interceptor.ts

```typescript
// src/app/core/interceptors/error.interceptor.ts

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const notification = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        notification.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        router.navigate(['/auth/login']);
      } else if (error.status === 403) {
        notification.error('No tienes permisos para realizar esta acción.');
      } else if (error.status === 404) {
        notification.error('Recurso no encontrado.');
      } else if (error.status >= 500) {
        notification.error('Error del servidor. Intenta nuevamente más tarde.');
      }

      return throwError(() => error);
    })
  );
};
```

---

## 9️⃣ auth.guard.ts

```typescript
// src/app/core/guards/auth.guard.ts

import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/auth/login'], {
    queryParams: { returnUrl: state.url }
  });
  return false;
};
```

---

## 🔟 app.routes.ts

```typescript
// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
  },
  {
    path: 'characters',
    canActivate: [authGuard],
    loadChildren: () => import('./features/characters/characters.routes').then(m => m.CHARACTER_ROUTES)
  },
  {
    path: 'inventory',
    canActivate: [authGuard],
    loadChildren: () => import('./features/inventory/inventory.routes').then(m => m.INVENTORY_ROUTES)
  },
  {
    path: 'marketplace',
    canActivate: [authGuard],
    loadChildren: () => import('./features/marketplace/marketplace.routes').then(m => m.MARKETPLACE_ROUTES)
  },
  {
    path: 'dungeons',
    canActivate: [authGuard],
    loadChildren: () => import('./features/dungeons/dungeons.routes').then(m => m.DUNGEON_ROUTES)
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
```

---

## 1️⃣1️⃣ angular.json (Configuración de estilos)

Agregar en `angular.json` dentro de `projects > your-app > architect > build > options`:

```json
{
  "styles": [
    "@angular/material/prebuilt-themes/indigo-pink.css",
    "src/styles.scss"
  ],
  "scripts": []
}
```

---

## 1️⃣2️⃣ package.json (Scripts útiles)

```json
{
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
    "build:prod": "ng build --configuration production",
    "watch": "ng build --watch --configuration development",
    "test": "ng test",
    "lint": "ng lint",
    "serve:prod": "ng serve --configuration production"
  }
}
```

---

## ✅ CHECKLIST DE CONFIGURACIÓN

- [ ] Environments configurados (development y production)
- [ ] TailwindCSS configurado
- [ ] Estilos globales aplicados
- [ ] Path aliases configurados en tsconfig.json
- [ ] Interceptores creados (auth y error)
- [ ] Guard de autenticación creado
- [ ] Rutas principales configuradas
- [ ] Angular Material configurado

---

## 🚀 VERIFICAR CONFIGURACIÓN

Después de copiar todos los archivos, ejecuta:

```bash
# Verificar que no hay errores de TypeScript
ng build --configuration development

# Si todo está bien, iniciar servidor
ng serve
```

---

**Siguiente paso:** Ve a `07_CHECKLIST_DESARROLLO.md`
