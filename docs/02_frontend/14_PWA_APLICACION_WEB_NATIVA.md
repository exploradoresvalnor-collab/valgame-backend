# 📱 GUÍA COMPLETA: PWA - APLICACIÓN WEB NATIVA

> **Valgame RPG** como aplicación instalable en móviles y computadoras  
> **Modo horizontal (landscape)** para máxima experiencia de juego  
> **Funciona offline** con Service Worker  

---

## 📋 TABLA DE CONTENIDOS

1. [¿Qué es una PWA?](#qué-es-una-pwa)
2. [Ventajas para Valgame](#ventajas-para-valgame)
3. [Configuración Paso a Paso](#configuración-paso-a-paso)
4. [Manifest.json Completo](#manifestjson-completo)
5. [Service Worker Strategy](#service-worker-strategy)
6. [Prompt de Instalación](#prompt-de-instalación)
7. [Modo Landscape Obligatorio](#modo-landscape-obligatorio)
8. [Caché Offline](#caché-offline)
9. [Testing PWA](#testing-pwa)
10. [Deploy y Certificado SSL](#deploy-y-certificado-ssl)

---

## 🎯 ¿QUÉ ES UNA PWA?

**Progressive Web App (PWA)** = Aplicación web que funciona como app nativa:

### ✅ **LO QUE TENDRÁS:**
- ✅ **Icono en pantalla principal** (como cualquier app)
- ✅ **Funciona SIN navegador** (fullscreen, sin barra de direcciones)
- ✅ **Modo offline** (caché de assets y datos)
- ✅ **Notificaciones push** (cuando implementes)
- ✅ **Actualización automática** (Service Worker)
- ✅ **Instala en Windows/Mac/Linux/Android/iOS**
- ✅ **NO necesitas App Store ni Google Play**
- ✅ **Actualizaciones instantáneas** (sin esperar aprobación)

### ❌ **LO QUE NO ES:**
- ❌ NO es app nativa (Unity, React Native, Flutter)
- ❌ NO accede a 100% de APIs nativas (pero 95% sí)
- ❌ NO funciona sin HTTPS (requiere SSL en producción)

---

## 🚀 VENTAJAS PARA VALGAME

### **1. Experiencia de Usuario**
- Usuario abre la app desde icono (sin abrir Chrome/Safari)
- **Pantalla completa** en modo horizontal
- Carga instantánea (caché)
- Funciona offline (puede jugar en metro sin internet)

### **2. Desarrollo**
- **1 código base** → Funciona en TODO (móvil, tablet, desktop)
- NO necesitas aprender Unity, React Native, Flutter
- Angular 17 + PWA = Listo
- Actualizas código → Usuarios lo ven en segundos

### **3. Distribución**
- NO necesitas publicar en App Store ($99/año)
- NO necesitas publicar en Google Play ($25 lifetime)
- NO esperas 1-2 semanas de aprobación
- Usuario instala desde tu web con 1 click

### **4. Monetización**
- Puedes integrar pagos web (Stripe, PayPal)
- NO pagas comisión 30% de Apple/Google
- Actualizas precios sin esperar aprobación

---

## 🛠️ CONFIGURACIÓN PASO A PASO

### **PASO 1: Crear Proyecto Angular 17**

```bash
# Crear proyecto
ng new valgame-frontend --routing --style=scss

# Entrar al proyecto
cd valgame-frontend

# Agregar PWA (automático)
ng add @angular/pwa
```

**Esto automáticamente crea:**
- ✅ `manifest.webmanifest` → Configuración de la app
- ✅ `ngsw-config.json` → Estrategia de caché
- ✅ Service Worker → Funcionalidad offline
- ✅ Iconos por defecto → Los reemplazaremos

---

### **PASO 2: Verificar archivos creados**

```
valgame-frontend/
├── src/
│   ├── manifest.webmanifest  ← Configuración PWA
│   ├── ngsw-config.json      ← Caché strategy
│   ├── assets/
│   │   └── icons/            ← Iconos de la app
│   │       ├── icon-72x72.png
│   │       ├── icon-96x96.png
│   │       ├── icon-128x128.png
│   │       ├── icon-144x144.png
│   │       ├── icon-152x152.png
│   │       ├── icon-192x192.png
│   │       ├── icon-384x384.png
│   │       └── icon-512x512.png
│   └── index.html            ← Link al manifest
└── angular.json              ← Build config actualizado
```

---

## 📄 MANIFEST.JSON COMPLETO

Edita `src/manifest.webmanifest`:

```json
{
  "name": "Valgame - Medieval Cyberpunk RPG",
  "short_name": "Valgame",
  "description": "RPG Medieval Cyberpunk con mazmorras, personajes coleccionables y marketplace",
  "theme_color": "#1a0033",
  "background_color": "#0a0015",
  "display": "standalone",
  "scope": "/",
  "start_url": "/dashboard",
  "orientation": "landscape-primary",
  "categories": ["games", "entertainment"],
  "icons": [
    {
      "src": "assets/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "assets/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "assets/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "assets/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "assets/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "assets/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "assets/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "assets/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ],
  "screenshots": [
    {
      "src": "assets/screenshots/dungeon-combat.png",
      "sizes": "1920x1080",
      "type": "image/png",
      "form_factor": "wide",
      "label": "Combate en mazmorra"
    },
    {
      "src": "assets/screenshots/character-collection.png",
      "sizes": "1920x1080",
      "type": "image/png",
      "form_factor": "wide",
      "label": "Colección de personajes"
    },
    {
      "src": "assets/screenshots/marketplace.png",
      "sizes": "1920x1080",
      "type": "image/png",
      "form_factor": "wide",
      "label": "Marketplace"
    }
  ],
  "share_target": {
    "action": "/share",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url"
    }
  },
  "shortcuts": [
    {
      "name": "Mazmorras",
      "short_name": "Dungeons",
      "description": "Ir a mazmorras",
      "url": "/dungeons",
      "icons": [{ "src": "assets/icons/dungeon-shortcut.png", "sizes": "192x192" }]
    },
    {
      "name": "Marketplace",
      "short_name": "Shop",
      "description": "Comprar personajes",
      "url": "/marketplace",
      "icons": [{ "src": "assets/icons/marketplace-shortcut.png", "sizes": "192x192" }]
    }
  ]
}
```

### **🔑 EXPLICACIÓN DE CAMPOS IMPORTANTES:**

| Campo | Valor | Por qué |
|-------|-------|---------|
| `display` | `standalone` | App fullscreen SIN barra de navegador |
| `orientation` | `landscape-primary` | **OBLIGA modo horizontal** |
| `start_url` | `/dashboard` | Abre directo al dashboard (NO landing) |
| `scope` | `/` | Toda la app está dentro de PWA |
| `theme_color` | `#1a0033` | Color morado oscuro (Medieval Cyberpunk) |
| `background_color` | `#0a0015` | Splash screen al abrir |

---

## ⚙️ SERVICE WORKER STRATEGY

Edita `src/ngsw-config.json`:

```json
{
  "$schema": "./node_modules/@angular/service-worker/config/schema.json",
  "index": "/index.html",
  "assetGroups": [
    {
      "name": "app",
      "installMode": "prefetch",
      "resources": {
        "files": [
          "/favicon.ico",
          "/index.html",
          "/manifest.webmanifest",
          "/*.css",
          "/*.js"
        ]
      }
    },
    {
      "name": "assets",
      "installMode": "lazy",
      "updateMode": "prefetch",
      "resources": {
        "files": [
          "/assets/**",
          "/*.(eot|svg|cur|jpg|jpeg|png|webp|gif|otf|ttf|woff|woff2|ani)"
        ]
      }
    },
    {
      "name": "fonts",
      "resources": {
        "urls": [
          "https://fonts.googleapis.com/**",
          "https://fonts.gstatic.com/**"
        ]
      }
    }
  ],
  "dataGroups": [
    {
      "name": "api-fresh",
      "urls": [
        "https://valgame-backend.onrender.com/api/users/me",
        "https://valgame-backend.onrender.com/api/users/dashboard",
        "https://valgame-backend.onrender.com/api/notifications"
      ],
      "cacheConfig": {
        "strategy": "freshness",
        "maxSize": 100,
        "maxAge": "5m",
        "timeout": "10s"
      }
    },
    {
      "name": "api-performance",
      "urls": [
        "https://valgame-backend.onrender.com/api/dungeons",
        "https://valgame-backend.onrender.com/api/base-characters",
        "https://valgame-backend.onrender.com/api/marketplace/listings"
      ],
      "cacheConfig": {
        "strategy": "performance",
        "maxSize": 100,
        "maxAge": "1h",
        "timeout": "5s"
      }
    }
  ],
  "navigationUrls": [
    "/**",
    "!/**/*.*",
    "!/**/*__*",
    "!/**/*__*/**"
  ]
}
```

### **📊 ESTRATEGIAS DE CACHÉ:**

**1. `freshness` (Network First):**
- Intenta obtener datos frescos de la red
- Si falla, usa caché
- **Usado para:** Recursos del usuario, notificaciones

**2. `performance` (Cache First):**
- Primero busca en caché
- Si no existe, va a la red
- **Usado para:** Mazmorras, personajes base (no cambian mucho)

**3. `prefetch` (Install Mode):**
- Descarga TODO al instalar la app
- **Usado para:** HTML, CSS, JS críticos

**4. `lazy` (Install Mode):**
- Descarga cuando se necesita
- **Usado para:** Imágenes, assets pesados

---

## 🎮 PROMPT DE INSTALACIÓN

### **Componente: InstallPromptComponent**

`src/app/components/install-prompt/install-prompt.component.ts`:

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-install-prompt',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      *ngIf="showPrompt" 
      class="install-banner"
      [@slideIn]
    >
      <div class="banner-content">
        <img src="assets/icons/icon-96x96.png" alt="Valgame Icon">
        <div class="banner-text">
          <h3>¡Instala Valgame!</h3>
          <p>Juega en modo horizontal para mejor experiencia</p>
        </div>
        <div class="banner-actions">
          <button class="btn-install" (click)="installApp()">
            📲 Instalar
          </button>
          <button class="btn-dismiss" (click)="dismissPrompt()">
            ✕
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .install-banner {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #1a0033 0%, #330066 100%);
      border: 2px solid #ff00ff;
      border-radius: 16px;
      padding: 16px 24px;
      box-shadow: 0 8px 32px rgba(255, 0, 255, 0.3);
      z-index: 9999;
      max-width: 90%;
      animation: glow 2s infinite;
    }

    @keyframes glow {
      0%, 100% { box-shadow: 0 8px 32px rgba(255, 0, 255, 0.3); }
      50% { box-shadow: 0 8px 48px rgba(255, 0, 255, 0.6); }
    }

    .banner-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .banner-content img {
      width: 48px;
      height: 48px;
      border-radius: 12px;
    }

    .banner-text h3 {
      margin: 0;
      color: #fff;
      font-size: 18px;
      font-weight: 700;
    }

    .banner-text p {
      margin: 4px 0 0;
      color: #ccc;
      font-size: 14px;
    }

    .banner-actions {
      display: flex;
      gap: 12px;
    }

    .btn-install {
      background: linear-gradient(135deg, #ff00ff 0%, #00ffff 100%);
      color: #000;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .btn-install:hover {
      transform: scale(1.05);
    }

    .btn-dismiss {
      background: transparent;
      color: #fff;
      border: 1px solid #fff;
      padding: 10px 16px;
      border-radius: 8px;
      cursor: pointer;
    }

    @media (max-width: 768px) {
      .banner-content {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class InstallPromptComponent implements OnInit {
  showPrompt = false;
  private deferredPrompt: any;

  ngOnInit() {
    // Escuchar evento de instalación
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      
      // Esperar 3 segundos antes de mostrar (no molestar inmediato)
      setTimeout(() => {
        this.showPrompt = true;
      }, 3000);
    });

    // Detectar si ya está instalada
    window.addEventListener('appinstalled', () => {
      console.log('PWA instalada exitosamente');
      this.showPrompt = false;
      
      // Analytics (opcional)
      if (typeof gtag !== 'undefined') {
        gtag('event', 'pwa_installed');
      }
    });
  }

  async installApp() {
    if (!this.deferredPrompt) {
      console.log('No hay prompt disponible');
      return;
    }

    // Mostrar prompt nativo
    this.deferredPrompt.prompt();

    // Esperar respuesta del usuario
    const { outcome } = await this.deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('Usuario aceptó instalar');
    } else {
      console.log('Usuario rechazó instalar');
    }

    // Limpiar prompt
    this.deferredPrompt = null;
    this.showPrompt = false;
  }

  dismissPrompt() {
    this.showPrompt = false;
    
    // Guardar en localStorage para no molestar por 7 días
    localStorage.setItem('install-prompt-dismissed', Date.now().toString());
  }
}
```

### **Usar en AppComponent:**

```typescript
// app.component.html
<app-install-prompt></app-install-prompt>
<router-outlet></router-outlet>
```

---

## 📐 MODO LANDSCAPE OBLIGATORIO

### **Detección de Orientación:**

`src/app/services/orientation.service.ts`:

```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrientationService {
  private isLandscape$ = new BehaviorSubject<boolean>(this.checkOrientation());

  constructor() {
    // Escuchar cambios de orientación
    window.addEventListener('orientationchange', () => {
      this.isLandscape$.next(this.checkOrientation());
    });

    // Escuchar resize (para desktop)
    window.addEventListener('resize', () => {
      this.isLandscape$.next(this.checkOrientation());
    });
  }

  private checkOrientation(): boolean {
    return window.matchMedia('(orientation: landscape)').matches;
  }

  get landscape$() {
    return this.isLandscape$.asObservable();
  }

  get isLandscape(): boolean {
    return this.isLandscape$.value;
  }
}
```

### **Componente de Alerta:**

`src/app/components/rotate-device/rotate-device.component.ts`:

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrientationService } from '@services/orientation.service';

@Component({
  selector: 'app-rotate-device',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      *ngIf="!(orientationService.landscape$ | async)" 
      class="rotate-overlay"
    >
      <div class="rotate-content">
        <div class="phone-icon">📱</div>
        <div class="rotate-arrow">↻</div>
        <h2>Rota tu dispositivo</h2>
        <p>Valgame se disfruta mejor en modo horizontal</p>
      </div>
    </div>
  `,
  styles: [`
    .rotate-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: #0a0015;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
    }

    .rotate-content {
      text-align: center;
      color: #fff;
      animation: pulse 2s infinite;
    }

    .phone-icon {
      font-size: 80px;
      margin-bottom: 20px;
      animation: rotate 2s infinite;
    }

    @keyframes rotate {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(90deg); }
    }

    .rotate-arrow {
      font-size: 60px;
      color: #ff00ff;
      margin-bottom: 20px;
    }

    h2 {
      font-size: 28px;
      margin-bottom: 12px;
      background: linear-gradient(135deg, #ff00ff 0%, #00ffff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    p {
      font-size: 16px;
      color: #ccc;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
  `]
})
export class RotateDeviceComponent {
  constructor(public orientationService: OrientationService) {}
}
```

### **CSS Global para Landscape:**

`src/styles.scss`:

```scss
// Forzar landscape en toda la app
@media (orientation: portrait) {
  body {
    // Ocultar contenido principal
    > *:not(app-rotate-device) {
      display: none;
    }
  }
}

@media (orientation: landscape) {
  body {
    width: 100vw;
    height: 100vh;
    overflow: hidden; // No scroll
  }

  // Layout optimizado para 16:9
  .game-container {
    display: grid;
    grid-template-columns: 200px 1fr 200px; // Sidebars laterales
    grid-template-rows: 60px 1fr 60px; // Header y footer
    height: 100vh;
  }

  // Área de juego central
  .game-area {
    grid-column: 2;
    grid-row: 2;
    overflow-y: auto;
  }
}
```

---

## 💾 CACHÉ OFFLINE

### **Detectar Estado de Conexión:**

`src/app/services/network.service.ts`:

```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  private online$ = new BehaviorSubject<boolean>(navigator.onLine);

  constructor() {
    window.addEventListener('online', () => this.online$.next(true));
    window.addEventListener('offline', () => this.online$.next(false));
  }

  get isOnline$() {
    return this.online$.asObservable();
  }

  get isOnline(): boolean {
    return this.online$.value;
  }
}
```

### **Banner de Offline:**

```typescript
// offline-banner.component.ts
@Component({
  selector: 'app-offline-banner',
  template: `
    <div *ngIf="!(networkService.isOnline$ | async)" class="offline-banner">
      <span>📡 Sin conexión - Modo offline activo</span>
    </div>
  `,
  styles: [`
    .offline-banner {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #ff9800;
      color: #000;
      padding: 8px;
      text-align: center;
      z-index: 9998;
      font-weight: 700;
    }
  `]
})
export class OfflineBannerComponent {
  constructor(public networkService: NetworkService) {}
}
```

---

## 🧪 TESTING PWA

### **1. Testing Local:**

```bash
# Build en modo producción (Service Worker solo funciona en prod)
ng build --configuration production

# Servir build con HTTP server
npx http-server -p 8080 -c-1 dist/valgame-frontend/browser

# Abrir http://localhost:8080
```

### **2. Chrome DevTools:**

1. **Abrir DevTools** → Tab `Application`
2. **Manifest:** Ver configuración de PWA
3. **Service Workers:** Ver estado del worker
4. **Cache Storage:** Ver archivos cacheados
5. **Lighthouse:** Correr audit de PWA

### **3. Checklist de PWA:**

```
✅ HTTPS habilitado (requerido en producción)
✅ manifest.webmanifest válido
✅ Service Worker registrado
✅ Iconos 192x192 y 512x512
✅ start_url responde con 200
✅ Orientación landscape configurada
✅ Funciona offline (caché)
✅ Splash screen personalizado
✅ Theme color configurado
```

### **4. Lighthouse Score:**

Objetivo: **90+** en PWA

```bash
# Instalar Lighthouse CLI
npm install -g lighthouse

# Correr audit
lighthouse https://tu-dominio.com --view
```

---

## 🚀 DEPLOY Y CERTIFICADO SSL

### **Opción 1: Netlify (RECOMENDADO)**

```bash
# 1. Build producción
ng build --configuration production

# 2. Instalar Netlify CLI
npm install -g netlify-cli

# 3. Deploy
netlify deploy --prod --dir=dist/valgame-frontend/browser
```

**Configuración `netlify.toml`:**

```toml
[build]
  publish = "dist/valgame-frontend/browser"
  command = "ng build --configuration production"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/manifest.webmanifest"
  [headers.values]
    Content-Type = "application/manifest+json"
    
[[headers]]
  for = "/ngsw.json"
  [headers.values]
    Content-Type = "application/json"
    Cache-Control = "no-cache"
```

### **Opción 2: Vercel**

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Deploy
vercel --prod
```

**Configuración `vercel.json`:**

```json
{
  "buildCommand": "ng build --configuration production",
  "outputDirectory": "dist/valgame-frontend/browser",
  "framework": "angular",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/manifest.webmanifest",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/manifest+json"
        }
      ]
    }
  ]
}
```

### **Opción 3: Firebase Hosting**

```bash
# 1. Instalar Firebase CLI
npm install -g firebase-tools

# 2. Login
firebase login

# 3. Inicializar
firebase init hosting

# 4. Deploy
firebase deploy --only hosting
```

**Configuración `firebase.json`:**

```json
{
  "hosting": {
    "public": "dist/valgame-frontend/browser",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "/manifest.webmanifest",
        "headers": [
          {
            "key": "Content-Type",
            "value": "application/manifest+json"
          }
        ]
      }
    ]
  }
}
```

---

## 📱 TESTING EN DISPOSITIVOS REALES

### **Android:**

1. Abre Chrome en Android
2. Ve a tu URL (https://tu-dominio.com)
3. Chrome mostrará banner: **"Agregar Valgame a pantalla de inicio"**
4. Click "Instalar"
5. Icono aparece en drawer de apps
6. Abre la app → Modo horizontal automático

### **iOS (Safari):**

1. Abre Safari en iPhone/iPad
2. Ve a tu URL
3. Click botón "Compartir" (cuadrado con flecha)
4. Scroll y click **"Agregar a pantalla de inicio"**
5. Click "Agregar"
6. Icono aparece en home screen
7. Abre la app → Modo horizontal si es iPhone en landscape

**⚠️ NOTA iOS:**
- iOS NO soporta `beforeinstallprompt`
- Usuarios deben agregar manualmente
- Muestra instrucciones en pantalla

### **Windows/Mac/Linux (Desktop):**

1. Abre Chrome/Edge
2. Ve a tu URL
3. En barra de direcciones verás icono de instalación (➕)
4. Click "Instalar Valgame"
5. App se abre en ventana separada
6. Aparece en menú de aplicaciones

---

## 🎯 FLUJO COMPLETO DE USUARIO

```
┌─────────────────────────────────────────────┐
│  1. Usuario visita landing page            │
│     https://valgame.com                     │
│     (Página pública, NO es PWA)             │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  2. Click "REGISTRARSE"                     │
│     → /register                             │
│     → Completa formulario                   │
│     → POST /auth/register                   │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  3. Verifica email                          │
│     → Recibe correo                         │
│     → Click link verificación               │
│     → GET /auth/verify/:token               │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  4. Login                                   │
│     → /login                                │
│     → POST /auth/login                      │
│     → Recibe JWT token                      │
│     → Redirect a /dashboard                 │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  5. PROMPT DE INSTALACIÓN (móvil)           │
│     Banner: "Instala Valgame para mejor     │
│     experiencia en modo horizontal"         │
│                                             │
│     [📲 Instalar]  [✕ Ahora no]            │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  6. Usuario instala PWA                     │
│     → Icono aparece en pantalla             │
│     → Cierra navegador                      │
│     → Abre app desde icono                  │
│     → App abre en landscape                 │
│     → Fullscreen (sin barra navegador)      │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  7. Si dispositivo en portrait:             │
│     Pantalla: "Rota tu dispositivo 📱↻"    │
│     Usuario rota → Juego se muestra         │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  8. Gameplay normal                         │
│     → Dashboard                             │
│     → Mazmorras (combate horizontal)        │
│     → Personajes                            │
│     → Marketplace                           │
│     → Settings                              │
│                                             │
│     TODO en modo LANDSCAPE                  │
└─────────────────────────────────────────────┘
```

---

## 📊 COMPARACIÓN: LANDING vs PWA

| Aspecto | Landing Page | PWA (App Instalada) |
|---------|-------------|---------------------|
| **URL** | `https://valgame.com` | `https://valgame.com/dashboard` |
| **Autenticación** | ❌ NO requerida | ✅ JWT token requerido |
| **Service Worker** | ❌ NO activo | ✅ Activo (caché offline) |
| **Orientación** | 📱 Vertical OK | 📱 **Solo horizontal** |
| **Navegador visible** | ✅ Sí (Chrome barra) | ❌ Fullscreen |
| **Icono en home** | ❌ NO | ✅ Sí |
| **Funciona offline** | ❌ NO | ✅ Sí (caché) |
| **Notificaciones push** | ❌ NO | ✅ Sí (futuro) |
| **Objetivo** | Marketing | Gameplay |

---

## 🛡️ SEGURIDAD Y MEJORES PRÁCTICAS

### **1. HTTPS Obligatorio**

PWA **SOLO funciona con HTTPS**:

```
✅ https://valgame.com  → PWA funciona
❌ http://valgame.com   → PWA NO funciona
✅ localhost            → PWA funciona (solo desarrollo)
```

### **2. Caché Sensible**

**NO cachear:**
- Tokens JWT
- Datos de usuario sensibles
- Respuestas de API con datos privados

**SÍ cachear:**
- Assets estáticos (imágenes, CSS, JS)
- Datos públicos (mazmorras, personajes base)
- Respuestas de API que no cambian frecuentemente

### **3. Versionado de Service Worker**

El Service Worker se actualiza automáticamente cuando cambias código:

```typescript
// Detectar actualizaciones
import { SwUpdate } from '@angular/service-worker';

@Injectable({ providedIn: 'root' })
export class UpdateService {
  constructor(private swUpdate: SwUpdate) {
    this.swUpdate.available.subscribe(() => {
      if (confirm('Nueva versión disponible. ¿Actualizar?')) {
        window.location.reload();
      }
    });
  }
}
```

---

## ✅ CHECKLIST FINAL

### **Antes de Deploy:**

- [ ] `ng add @angular/pwa` ejecutado
- [ ] `manifest.webmanifest` editado con datos de Valgame
- [ ] `orientation: "landscape-primary"` configurado
- [ ] Iconos 512x512 creados y agregados
- [ ] `ngsw-config.json` configurado con URLs backend
- [ ] Componente `InstallPromptComponent` creado
- [ ] Componente `RotateDeviceComponent` creado
- [ ] OrientationService implementado
- [ ] NetworkService implementado
- [ ] Build de producción testeado localmente
- [ ] Lighthouse score > 90
- [ ] Testing en móvil real (Android/iOS)
- [ ] HTTPS configurado en hosting
- [ ] Backend acepta peticiones desde dominio frontend (CORS)

### **Post-Deploy:**

- [ ] Verificar que PWA se instala correctamente
- [ ] Modo landscape forzado funciona
- [ ] Service Worker cachea correctamente
- [ ] Modo offline funciona
- [ ] Updates automáticos funcionan
- [ ] Analytics instaladas (opcional)

---

## 🎉 RESULTADO FINAL

**Tendrás una aplicación que:**

✅ Se instala como app nativa en móviles y desktop  
✅ Funciona **SOLO en modo horizontal** (landscape)  
✅ NO requiere App Store ni Google Play  
✅ Se actualiza automáticamente  
✅ Funciona offline con caché inteligente  
✅ Pantalla completa sin barra del navegador  
✅ Landing page queda separada (pública)  
✅ Todo construido con Angular 17  

---

## 📚 RECURSOS ADICIONALES

- **PWA Builder:** https://www.pwabuilder.com/
- **Angular PWA:** https://angular.io/guide/service-worker-intro
- **Web.dev PWA Guide:** https://web.dev/progressive-web-apps/
- **Lighthouse:** https://developers.google.com/web/tools/lighthouse
- **Can I Use PWA:** https://caniuse.com/?search=service%20worker

---

**🎮 ¡Listo para crear tu PWA de Valgame en modo horizontal!**
