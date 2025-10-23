# 🎨 FRONTEND - DOCUMENTACIÓN PARA DESARROLLADORES

Esta carpeta contiene toda la información necesaria para **desarrollar el frontend** del juego.

---

## 📄 Documentos en Esta Carpeta

### 1. FRONTEND_README.md ⭐ **GUÍA PRINCIPAL**
**Lectura:** 25-30 minutos  
**Contenido:**
- 🚀 Guía de inicio rápido
- 🏗️ Arquitectura del frontend
- 📦 Servicios y APIs disponibles
- 🎨 Componentes recomendados
- 🔧 Configuración del proyecto
- 📝 Ejemplos de código
- ✅ Checklist de desarrollo

**Cuándo leer:**
- Primer día trabajando en frontend
- Antes de iniciar desarrollo de UI
- Para entender estructura del proyecto
- Como referencia durante desarrollo

---

### 2. FRONTEND_ARQUITECTURA.md 🏗️ **ARQUITECTURA TÉCNICA**
**Lectura:** 15-20 minutos  
**Contenido:**
- 📂 Estructura de carpetas recomendada
- 🔄 Flujo de datos (state management)
- 🌐 Integración con API REST
- ⚡ WebSocket en tiempo real
- 🎨 Patrones de diseño
- 🧪 Estrategia de testing

**Cuándo leer:**
- Para entender arquitectura técnica
- Antes de definir estructura de proyecto
- Al elegir tecnologías (React, Vue, etc.)
- Para planning técnico

---

### 3. FRONTEND_GUIA_INICIO.md 🚀 **QUICK START**
**Lectura:** 10-15 minutos  
**Contenido:**
- ⚡ Setup rápido del proyecto
- 📝 Comandos básicos
- 🔑 Configuración de ambiente
- 🧪 Primer componente funcional
- 📡 Primera llamada a API
- 🎮 Primer feature completo

**Cuándo leer:**
- Para empezar el proyecto desde cero
- Si quieres un proyecto funcionando rápido
- Como template inicial

---

## 🎯 Stack Tecnológico Recomendado

### Frontend Framework
```
React + TypeScript    (Recomendado)
- Create React App o Vite
- TypeScript para type safety
- React Router para navegación
```

**Alternativas:**
- Vue 3 + TypeScript
- Next.js (si necesitas SSR)

---

### State Management
```
Zustand o Redux Toolkit
- Zustand: Más simple, menos boilerplate
- Redux Toolkit: Más robusto, DevTools
```

---

### HTTP Client
```
Axios
- Interceptors para tokens
- Manejo de errores centralizado
- TypeScript support
```

---

### WebSocket
```
Socket.io-client
- Conexión en tiempo real
- Reconnection automática
- Room/namespace support
```

---

### UI Library
```
Material-UI (MUI) o TailwindCSS
- MUI: Componentes pre-hechos
- Tailwind: Más customizable
```

---

## 🏗️ Estructura de Proyecto Recomendada

```
frontend/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── Character/
│   │   ├── Inventory/
│   │   ├── Marketplace/
│   │   └── Dungeon/
│   ├── pages/               # Páginas/vistas
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── CharacterList.tsx
│   │   └── DungeonView.tsx
│   ├── services/            # Llamadas a API
│   │   ├── api.ts          # Axios instance
│   │   ├── auth.service.ts
│   │   ├── character.service.ts
│   │   └── dungeon.service.ts
│   ├── store/               # State management
│   │   ├── authStore.ts
│   │   ├── characterStore.ts
│   │   └── dungeonStore.ts
│   ├── types/               # TypeScript types
│   │   ├── Character.ts
│   │   ├── Item.ts
│   │   └── Dungeon.ts
│   ├── hooks/               # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useWebSocket.ts
│   │   └── useCharacters.ts
│   └── utils/               # Utilidades
│       ├── validators.ts
│       └── formatters.ts
└── package.json
```

---

## 🎯 Rutas Rápidas

### "Quiero EMPEZAR un proyecto frontend"
1. `FRONTEND_GUIA_INICIO.md` (setup rápido)
2. Copiar estructura de carpetas (arriba)
3. `FRONTEND_README.md` (guía completa)

### "¿Qué ENDPOINTS usar?"
→ `../04_API/API_REFERENCE.md`

### "¿Cómo funciona el SISTEMA de mazmorras?"
→ `../03_SISTEMAS/SISTEMA_PROGRESION_IMPLEMENTADO.md`

### "Necesito MODELOS TypeScript"
→ `FRONTEND_README.md` → Sección "Modelos TypeScript"

---

## 📦 Servicios Base (Copiar/Pegar)

### API Service (Axios)
```typescript
// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 10000,
});

// Agregar token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Auth Service
```typescript
// src/services/auth.service.ts
import api from './api';

export const authService = {
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    return data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
  },
  
  getCurrentUser: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },
};
```

**Más ejemplos:** `FRONTEND_README.md`

---

## 🎮 Features Principales a Implementar

### 1. Autenticación ✅
```
Prioridad: ALTA
Tiempo: 1 día
Componentes:
- Login.tsx
- Register.tsx
- ProtectedRoute.tsx
```

### 2. Lista de Personajes ✅
```
Prioridad: ALTA
Tiempo: 2 días
Componentes:
- CharacterList.tsx
- CharacterCard.tsx
- CreateCharacter.tsx
```

### 3. Mazmorras 🏰
```
Prioridad: ALTA
Tiempo: 3-4 días
Componentes:
- DungeonList.tsx
- DungeonView.tsx (combate)
- DungeonProgress.tsx
WebSocket: dungeon events
```

### 4. Inventario 🎒
```
Prioridad: MEDIA
Tiempo: 2 días
Componentes:
- InventoryGrid.tsx
- ItemCard.tsx
- EquipModal.tsx
```

### 5. Marketplace 🏪
```
Prioridad: MEDIA
Tiempo: 2-3 días
Componentes:
- MarketplaceList.tsx
- ListItemModal.tsx
- PurchaseConfirm.tsx
```

### 6. Paquetes 📦
```
Prioridad: BAJA (arreglar seguridad primero)
Tiempo: 1-2 días
⚠️ Ver: ../02_SEGURIDAD/ (vulnerabilidades)
Componentes:
- PackageStore.tsx
- OpenPackageAnimation.tsx
```

---

## 🔌 Integración con Backend

### Variables de Ambiente
```bash
# .env.local
REACT_APP_API_URL=http://localhost:5000
REACT_APP_WS_URL=ws://localhost:5000
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_...
```

### CORS
El backend ya tiene CORS configurado para desarrollo.

**Producción:** Configurar origins permitidos en backend.

---

## ⚡ WebSocket (Tiempo Real)

### Conectar
```typescript
import io from 'socket.io-client';

const socket = io(process.env.REACT_APP_WS_URL, {
  auth: {
    token: localStorage.getItem('token'),
  },
});

// Escuchar eventos
socket.on('dungeon:update', (data) => {
  console.log('Dungeon update:', data);
});

// Emitir eventos
socket.emit('dungeon:action', { action: 'attack', targetId: '...' });
```

**Ver más:** `FRONTEND_README.md` → Sección "WebSocket"

---

## 🧪 Testing

### Unit Tests (Jest + React Testing Library)
```typescript
import { render, screen } from '@testing-library/react';
import CharacterCard from './CharacterCard';

test('renders character name', () => {
  const character = { name: 'Warrior', level: 5 };
  render(<CharacterCard character={character} />);
  expect(screen.getByText('Warrior')).toBeInTheDocument();
});
```

### E2E Tests (Cypress)
```typescript
describe('Login Flow', () => {
  it('should login successfully', () => {
    cy.visit('/login');
    cy.get('[data-testid="email"]').type('user@example.com');
    cy.get('[data-testid="password"]').type('password123');
    cy.get('[data-testid="login-btn"]').click();
    cy.url().should('include', '/dashboard');
  });
});
```

---

## 📱 Responsive Design

### Breakpoints Recomendados
```css
/* Mobile */
@media (max-width: 768px) { }

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) { }

/* Desktop */
@media (min-width: 1025px) { }
```

---

## 🎨 UI/UX Recomendaciones

### Paleta de Colores (Ejemplo)
```css
--primary: #6366f1;      /* Indigo */
--secondary: #ec4899;    /* Pink */
--success: #10b981;      /* Green */
--warning: #f59e0b;      /* Amber */
--danger: #ef4444;       /* Red */
--dark: #1f2937;         /* Gray-800 */
--light: #f3f4f6;        /* Gray-100 */
```

### Feedback Visual
- ✅ Loading spinners en requests
- ✅ Toast notifications para acciones
- ✅ Animaciones suaves en transiciones
- ✅ Estados de error claros

---

## 🔗 Documentos Relacionados

**API Endpoints:**  
→ `../04_API/API_REFERENCE.md`

**Sistemas del Juego:**  
→ `../03_SISTEMAS/` (lógica de mazmorras, economía, etc.)

**Seguridad:**  
→ `../02_SEGURIDAD/` (importante para paquetes)

**Starter Kit Completo:**  
→ `/FRONTEND_STARTER_KIT/` (en raíz del proyecto)

---

## 📦 Starter Kit

**Ubicación:** `/FRONTEND_STARTER_KIT/`

**Contenido:**
- Modelos TypeScript completos
- Servicios base (API, Auth, Characters, etc.)
- Componentes de ejemplo
- Configuración recomendada
- Checklist de desarrollo
- Comandos útiles

**Usar como:** Template para iniciar proyecto frontend

---

## ✅ Checklist de Desarrollo

### Setup Inicial
- [ ] Crear proyecto (React + TypeScript)
- [ ] Instalar dependencias (axios, socket.io-client, etc.)
- [ ] Configurar variables de ambiente
- [ ] Crear estructura de carpetas
- [ ] Configurar ESLint + Prettier

### Core Features
- [ ] Sistema de autenticación
- [ ] Navegación (React Router)
- [ ] State management (Zustand/Redux)
- [ ] HTTP client (Axios con interceptors)
- [ ] WebSocket connection
- [ ] Error handling global
- [ ] Loading states

### UI/UX
- [ ] Tema/diseño definido
- [ ] Componentes base (Button, Input, Card, etc.)
- [ ] Responsive design
- [ ] Animaciones y transiciones
- [ ] Toast notifications
- [ ] Modal system

### Testing
- [ ] Unit tests (componentes)
- [ ] Integration tests (servicios)
- [ ] E2E tests (flujos principales)

---

**Última actualización:** 22 de octubre de 2025  
**Volver al índice:** `../00_INICIO/README.md`
