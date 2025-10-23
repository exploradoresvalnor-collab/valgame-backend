# 🎮 Exploradores de Valnor - Frontend

> **Nota:** Este README debe copiarse al proyecto frontend cuando se cree.

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Desarrollo
ng serve

# Build producción
ng build --configuration production

# Tests
ng test

# Linting
ng lint
```

La aplicación estará disponible en `http://localhost:4200`

---

## 📋 Requisitos

- Node.js 18+
- npm 9+
- Angular CLI 17+

---

## 🏗️ Estructura del Proyecto

```
src/
├── app/
│   ├── core/                    # Servicios singleton
│   │   ├── guards/             # Guards de rutas
│   │   ├── interceptors/       # HTTP Interceptors
│   │   └── services/           # Servicios globales
│   │
│   ├── shared/                  # Componentes reutilizables
│   │   ├── components/         # Componentes compartidos
│   │   ├── pipes/              # Pipes personalizados
│   │   └── directives/         # Directivas
│   │
│   ├── features/                # Módulos de características
│   │   ├── auth/               # Autenticación
│   │   ├── dashboard/          # Dashboard
│   │   ├── characters/         # Personajes
│   │   ├── inventory/          # Inventario
│   │   ├── marketplace/        # Marketplace
│   │   └── dungeons/           # Mazmorras
│   │
│   ├── models/                  # Interfaces TypeScript
│   ├── app.component.ts
│   ├── app.routes.ts
│   └── app.config.ts
│
├── assets/                      # Recursos estáticos
├── environments/                # Configuración de entornos
└── styles.scss                  # Estilos globales
```

---

## 🔧 Configuración

### Variables de Entorno

Crear archivo `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
  wsUrl: 'ws://localhost:8080'
};
```

Para producción (`src/environments/environment.prod.ts`):

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.valnor.com',
  wsUrl: 'wss://api.valnor.com'
};
```

---

## 📚 Documentación

### Guías Principales
- **[FRONTEND_GUIA_INICIO.md](../docs/arquitectura/FRONTEND_GUIA_INICIO.md)** - Guía completa de inicio
- **[API_REFERENCE.md](../docs/API_REFERENCE.md)** - Referencia de la API
- **[FRONTEND_ARQUITECTURA.md](../docs/arquitectura/FRONTEND_ARQUITECTURA.md)** - Arquitectura detallada

### Recursos Adicionales
- [Angular Docs](https://angular.io/docs)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [Angular Material](https://material.angular.io/)
- [RxJS Docs](https://rxjs.dev/)

---

## 🎯 Características Implementadas

### ✅ Autenticación
- Login
- Registro
- Verificación de email
- Logout

### ✅ Dashboard
- Resumen de recursos
- Personaje activo
- Accesos rápidos

### ✅ Personajes
- Lista de personajes
- Detalle de personaje
- Evolución
- Curación
- Usar consumibles

### ✅ Inventario
- Equipamiento
- Consumibles
- Equipar/desequipar

### ✅ Marketplace
- Listar items
- Comprar items
- Crear listings
- Cancelar listings

### ✅ Mazmorras
- Lista de mazmorras
- Detalle de mazmorra
- Sistema de combate

---

## 🧪 Testing

### Unit Tests
```bash
ng test
```

### E2E Tests
```bash
ng e2e
```

### Coverage
```bash
ng test --code-coverage
```

---

## 🚀 Deploy

### Build de Producción
```bash
ng build --configuration production
```

Los archivos compilados estarán en `dist/`.

### Deploy en Vercel
```bash
npm install -g vercel
vercel --prod
```

### Deploy en Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

---

## 📦 Dependencias Principales

```json
{
  "dependencies": {
    "@angular/core": "^17.x",
    "@angular/material": "^17.x",
    "tailwindcss": "^3.x",
    "socket.io-client": "^4.x",
    "ethers": "^6.x",
    "rxjs": "^7.x"
  }
}
```

---

## 🎨 Estilos

### TailwindCSS
El proyecto usa TailwindCSS para estilos. Configuración en `tailwind.config.js`.

### Angular Material
Componentes de Material Design disponibles. Tema configurado en `styles.scss`.

### Colores Personalizados
```scss
// Rareza de items
.rarity-common { color: #9e9e9e; }
.rarity-rare { color: #2196f3; }
.rarity-epic { color: #9c27b0; }
.rarity-legendary { color: #ff9800; }
```

---

## 🔒 Seguridad

### Autenticación
- JWT tokens almacenados en localStorage
- Interceptor automático para agregar token
- Guard para proteger rutas

### Validación
- Validación de formularios con Reactive Forms
- Sanitización de inputs
- Manejo de errores centralizado

---

## 🌐 API

### Base URL
```
Development: http://localhost:8080
Production: https://api.valnor.com
```

### Autenticación
Todas las peticiones protegidas requieren header:
```
Authorization: Bearer {token}
```

### Endpoints Principales
- `POST /auth/login` - Login
- `POST /auth/register` - Registro
- `GET /api/users/me` - Usuario actual
- `GET /api/characters` - Lista de personajes
- `GET /api/marketplace/listings` - Marketplace

Ver [API_REFERENCE.md](../docs/API_REFERENCE.md) para documentación completa.

---

## 🔄 WebSocket

### Conexión
```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:8080');
socket.emit('auth', token);
```

### Eventos
- `inventory:update` - Actualización de inventario
- `character:update` - Actualización de personaje
- `marketplace:update` - Actualización del marketplace
- `reward:received` - Recompensa recibida

---

## 📱 PWA

### Instalación
```bash
ng add @angular/pwa
```

### Configuración
- `manifest.webmanifest` - Configuración de la app
- `ngsw-config.json` - Configuración de Service Worker

### Probar PWA
```bash
ng build --configuration production
npx http-server dist/valgame-frontend -p 8080
```

---

## 🐛 Debugging

### Chrome DevTools
- Angular DevTools extension
- Redux DevTools (si usas NgRx)

### Logs
```typescript
// Habilitar logs en desarrollo
if (!environment.production) {
  console.log('Debug info:', data);
}
```

---

## 📊 Performance

### Optimizaciones Implementadas
- Lazy loading de módulos
- OnPush change detection
- TrackBy en ngFor
- Virtual scrolling
- Service Workers

### Lighthouse Score Target
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

---

## 🤝 Contribución

### Workflow
1. Crear branch desde `main`
2. Hacer cambios
3. Ejecutar tests
4. Crear Pull Request
5. Code review
6. Merge

### Commits
Usar conventional commits:
```
feat: nueva característica
fix: corrección de bug
docs: documentación
style: formato
refactor: refactorización
test: tests
chore: tareas de mantenimiento
```

---

## 📝 Scripts Útiles

```bash
# Desarrollo
npm start                    # ng serve
npm run build               # ng build
npm run build:prod          # ng build --configuration production

# Testing
npm test                    # ng test
npm run test:coverage       # ng test --code-coverage
npm run e2e                 # ng e2e

# Linting
npm run lint                # ng lint
npm run lint:fix            # ng lint --fix

# Generadores
npm run generate:component  # ng generate component
npm run generate:service    # ng generate service
```

---

## 🔧 Troubleshooting

### Error: Cannot find module
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: Port 4200 already in use
```bash
ng serve --port 4201
```

### Error: Build fails
```bash
ng build --configuration production --verbose
```

---

## 📞 Soporte

### Documentación
- Backend: `../docs/`
- API: `../docs/API_REFERENCE.md`
- Arquitectura: `../docs/arquitectura/`

### Issues
Reportar bugs o sugerencias en el repositorio.

---

## 📄 Licencia

[Especificar licencia]

---

## 👥 Equipo

- **Backend**: [Nombre]
- **Frontend**: [Nombre]
- **Design**: [Nombre]

---

## 🎯 Roadmap

### Fase 1: MVP (Actual)
- ✅ Autenticación
- ✅ Dashboard
- ✅ Personajes
- ✅ Inventario
- ✅ Marketplace
- ✅ Mazmorras

### Fase 2: Mejoras
- ⏳ Sistema de gremios
- ⏳ PvP
- ⏳ Eventos temporales
- ⏳ Logros y rankings

### Fase 3: Expansión
- ⏳ Más personajes
- ⏳ Más mazmorras
- ⏳ Nuevas mecánicas
- ⏳ Integración Web3

---

**Última actualización:** Enero 2024  
**Versión:** 1.0.0  
**Estado:** En desarrollo activo 🚀
