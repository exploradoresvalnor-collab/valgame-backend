# 🛠️ COMANDOS ÚTILES - REFERENCIA RÁPIDA

## 🚀 Setup Inicial

```bash
# Instalar Angular CLI globalmente
npm install -g @angular/cli@17

# Crear nuevo proyecto
ng new valgame-frontend --routing --style=scss --ssr=false

# Entrar al proyecto
cd valgame-frontend

# Instalar Angular Material
ng add @angular/material

# Instalar TailwindCSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init

# Instalar dependencias adicionales
npm install socket.io-client ethers date-fns

# Iniciar servidor de desarrollo
ng serve
```

---

## 📦 Generar Componentes

```bash
# Generar módulo
ng generate module features/auth

# Generar componente
ng generate component features/auth/pages/login

# Generar componente standalone
ng generate component shared/components/header --standalone

# Generar servicio
ng generate service core/services/api

# Generar guard
ng generate guard core/guards/auth

# Generar interceptor
ng generate interceptor core/interceptors/auth

# Generar pipe
ng generate pipe shared/pipes/rarity-color

# Generar directiva
ng generate directive shared/directives/swipe
```

---

## 🏗️ Build y Deploy

```bash
# Build de desarrollo
ng build

# Build de producción
ng build --configuration production

# Build con análisis de bundle
ng build --configuration production --stats-json
npx webpack-bundle-analyzer dist/stats.json

# Servir build de producción localmente
npx http-server dist/valgame-frontend -p 8080
```

---

## 🧪 Testing

```bash
# Ejecutar tests unitarios
ng test

# Ejecutar tests con coverage
ng test --code-coverage

# Ejecutar tests en modo headless
ng test --watch=false --browsers=ChromeHeadless

# Ejecutar tests E2E
ng e2e
```

---

## 🔍 Linting y Formato

```bash
# Ejecutar linter
ng lint

# Corregir problemas automáticamente
ng lint --fix

# Formatear código con Prettier (si está instalado)
npx prettier --write "src/**/*.{ts,html,scss}"
```

---

## 📊 Análisis y Optimización

```bash
# Analizar tamaño del bundle
ng build --configuration production --stats-json
npx webpack-bundle-analyzer dist/stats.json

# Ver árbol de dependencias
npm list --depth=0

# Encontrar paquetes desactualizados
npm outdated

# Actualizar paquetes
npm update

# Limpiar caché de npm
npm cache clean --force

# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

---

## 🔧 Desarrollo

```bash
# Iniciar con puerto específico
ng serve --port 4201

# Iniciar con host específico
ng serve --host 0.0.0.0

# Iniciar con SSL
ng serve --ssl

# Iniciar con configuración de producción
ng serve --configuration production

# Abrir automáticamente en navegador
ng serve --open

# Ver cambios en tiempo real
ng serve --watch
```

---

## 📱 PWA

```bash
# Agregar PWA al proyecto
ng add @angular/pwa

# Build PWA
ng build --configuration production

# Servir PWA localmente
npx http-server dist/valgame-frontend -p 8080 -c-1
```

---

## 🌐 Deploy

### Vercel
```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel

# Deploy a producción
vercel --prod
```

### Netlify
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy

# Deploy a producción
netlify deploy --prod
```

### Firebase
```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Inicializar
firebase init

# Deploy
firebase deploy
```

---

## 🐛 Debugging

```bash
# Iniciar con source maps
ng serve --source-map

# Ver configuración de Angular
ng config

# Ver versión de Angular
ng version

# Limpiar caché de Angular
ng cache clean

# Ver información del proyecto
ng analytics info
```

---

## 📚 Información

```bash
# Ver ayuda de Angular CLI
ng help

# Ver ayuda de un comando específico
ng generate --help

# Ver versión de Angular y dependencias
ng version

# Ver configuración actual
ng config
```

---

## 🔄 Git (Comandos frecuentes)

```bash
# Inicializar repositorio
git init

# Agregar todos los archivos
git add .

# Commit
git commit -m "feat: implementar login"

# Push
git push origin main

# Crear nueva rama
git checkout -b feature/marketplace

# Ver estado
git status

# Ver diferencias
git diff

# Ver historial
git log --oneline
```

---

## 📦 npm (Comandos frecuentes)

```bash
# Instalar dependencia
npm install package-name

# Instalar dependencia de desarrollo
npm install -D package-name

# Desinstalar dependencia
npm uninstall package-name

# Actualizar dependencia
npm update package-name

# Ver dependencias instaladas
npm list

# Ver dependencias desactualizadas
npm outdated

# Auditar seguridad
npm audit

# Corregir vulnerabilidades
npm audit fix
```

---

## 🎨 Tailwind (Comandos útiles)

```bash
# Inicializar Tailwind
npx tailwindcss init

# Inicializar con configuración completa
npx tailwindcss init --full

# Build de Tailwind
npx tailwindcss -i ./src/styles.scss -o ./dist/output.css

# Watch mode
npx tailwindcss -i ./src/styles.scss -o ./dist/output.css --watch
```

---

## 🔐 Variables de Entorno

```bash
# Usar variable de entorno en build
ng build --configuration=staging

# Ver configuraciones disponibles
ng config projects.valgame-frontend.architect.build.configurations
```

---

## 📊 Performance

```bash
# Analizar performance con Lighthouse
npx lighthouse http://localhost:4200 --view

# Analizar bundle size
npx source-map-explorer dist/**/*.js
```

---

## 🆘 Solución de Problemas

```bash
# Limpiar todo y reinstalar
rm -rf node_modules package-lock.json dist .angular
npm install

# Limpiar caché de Angular
ng cache clean

# Verificar integridad de paquetes
npm audit

# Reinstalar Angular CLI
npm uninstall -g @angular/cli
npm install -g @angular/cli@17

# Verificar versión de Node
node --version

# Verificar versión de npm
npm --version
```

---

## 📝 Scripts Personalizados (package.json)

Agregar estos scripts útiles en `package.json`:

```json
{
  "scripts": {
    "start": "ng serve",
    "start:prod": "ng serve --configuration production",
    "build": "ng build",
    "build:prod": "ng build --configuration production",
    "build:analyze": "ng build --configuration production --stats-json && npx webpack-bundle-analyzer dist/stats.json",
    "test": "ng test",
    "test:ci": "ng test --watch=false --browsers=ChromeHeadless --code-coverage",
    "lint": "ng lint",
    "lint:fix": "ng lint --fix",
    "format": "prettier --write \"src/**/*.{ts,html,scss}\"",
    "clean": "rm -rf node_modules package-lock.json dist .angular",
    "reinstall": "npm run clean && npm install",
    "deploy:vercel": "vercel --prod",
    "deploy:netlify": "netlify deploy --prod"
  }
}
```

Uso:
```bash
npm run start
npm run build:prod
npm run test:ci
npm run lint:fix
npm run format
npm run clean
npm run reinstall
```

---

## ✅ CHECKLIST DIARIO

```bash
# Al comenzar el día
git pull
npm install  # Si hay cambios en package.json
ng serve

# Durante el desarrollo
git status
git add .
git commit -m "feat: descripción del cambio"
ng lint
ng test

# Al finalizar el día
git push origin tu-rama
```

---

## 🎯 ATAJOS DE TECLADO (VS Code)

```
Ctrl + P          - Buscar archivo
Ctrl + Shift + P  - Paleta de comandos
Ctrl + `          - Abrir terminal
Ctrl + B          - Toggle sidebar
Ctrl + /          - Comentar línea
Alt + Shift + F   - Formatear documento
F12               - Ir a definición
Ctrl + Space      - Autocompletado
```

---

**¡Guarda este archivo como referencia rápida!** 📌
