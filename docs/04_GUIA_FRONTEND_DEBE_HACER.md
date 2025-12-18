# 🎯 GUÍA: Qué Necesita Hacer el Frontend

**Fecha:** 1 de diciembre, 2025  
**Basado en:** 128-135 endpoints reales del backend  
**Anterior:** Documentación incompleta al 31%  
**Actual:** 100% mapeado

---

## 📋 Resumen Ejecutivo

El **frontend debe soportar ~128-135 endpoints**, no los ~42 documentados antes.

**Esto significa:**
- 86+ endpoints faltaban en documentación anterior
- 15 módulos nuevos por implementar
- Algunos sistemas completos (Survival, Rankings) no estaban documentados

---

## 🗂️ MÓDULOS QUE NECESITA EL FRONTEND

### ✅ 1. AUTENTICACIÓN (9 endpoints)

**Estado:** Completamente documentado  
**Archivos a crear/actualizar:**

```
src/
  ├── services/
  │   └── auth.service.ts
  ├── components/
  │   ├── login.component.ts
  │   ├── register.component.ts
  │   ├── verify-email.component.ts
  │   ├── forgot-password.component.ts
  │   └── reset-password.component.ts
  └── guards/
      └── auth.guard.ts
```

**Endpoints:**
- POST /auth/register
- POST /auth/login
- POST /auth/logout
- GET /auth/verify/:token
- POST /auth/resend-verification
- POST /auth/forgot-password
- GET /auth/reset-form/:token
- GET /auth/reset-password/validate/:token
- POST /auth/reset-password/:token

---

### ✅ 2. DASHBOARD/PERFIL (12 endpoints en Users)

**Estado:** Parcialmente documentado  
**Faltaban:** dashboard, resources, energía

**Archivos a crear/actualizar:**

```
src/
  ├── services/
  │   ├── user.service.ts
  │   └── energy.service.ts
  ├── components/
  │   ├── dashboard.component.ts
  │   ├── profile.component.ts
  │   └── user-resources.component.ts
  └── interceptors/
      └── auth.interceptor.ts
```

**Endpoints:**
- GET /api/users/me
- GET /api/users/profile/:userId
- GET /api/users/dashboard ⚠️ NUEVO
- GET /api/users/resources ⚠️ NUEVO
- POST /api/users/energy/consume ⚠️ NUEVO
- GET /api/users/energy/status ⚠️ NUEVO
- PUT /api/users/tutorial/complete
- POST /api/users/characters/add
- PUT /api/users/set-active-character/:personajeId
- DELETE /api/users/characters/:personajeId
- GET /api/users/debug/my-data (solo dev)
- GET /api/users/ (admin)

---

### ✅ 3. PERSONAJES (10 endpoints)

**Estado:** Documentado  
**Necesita:** Sistema de equipamiento completo

**Archivos:**

```
src/
  ├── services/
  │   ├── character.service.ts
  │   └── equipment.service.ts
  ├── components/
  │   ├── character-list.component.ts
  │   ├── character-detail.component.ts
  │   ├── character-stats.component.ts
  │   ├── inventory.component.ts
  │   └── equipment-slots.component.ts
```

**Endpoints:**
- POST /api/characters/:characterId/use-consumable
- POST /api/characters/:characterId/revive
- POST /api/characters/:characterId/damage (test only)
- POST /api/characters/:characterId/heal
- POST /api/characters/:characterId/evolve
- POST /api/characters/:characterId/add-experience
- POST /api/characters/:characterId/equip
- POST /api/characters/:characterId/unequip
- GET /api/characters/:characterId/stats
- PUT /api/characters/:characterId/level-up

---

### ✅ 4. COMBATE (4 endpoints)

**Estado:** Omitido en docs, ahora claro

**Archivos:**

```
src/
  ├── services/
  │   └── combat.service.ts
  ├── components/
  │   ├── dungeon-select.component.ts
  │   ├── combat-arena.component.ts
  │   └── combat-results.component.ts
```

**Endpoints:**
- POST /api/dungeons/:dungeonId/start
- POST /api/combat/attack
- POST /api/combat/defend
- POST /api/combat/end

---

### ⚠️ 5. SURVIVAL (12 endpoints) - COMPLETAMENTE OMITIDO

**Estado:** NO DOCUMENTADO EN DOCS ANTERIORES  
**Criticidad:** ALTA - Sistema completo

**Archivos a CREAR:**

```
src/
  ├── services/
  │   └── survival.service.ts
  ├── components/
  │   ├── survival-select.component.ts
  │   ├── survival-arena.component.ts
  │   ├── survival-hud.component.ts
  │   ├── survival-waves.component.ts
  │   ├── survival-exchanges.component.ts
  │   └── survival-leaderboard.component.ts
```

**Endpoints a IMPLEMENTAR:**
- ⚠️ POST /api/survival/start
- ⚠️ POST /api/survival/:sessionId/complete-wave
- ⚠️ POST /api/survival/:sessionId/use-consumable
- ⚠️ POST /api/survival/:sessionId/pickup-drop
- ⚠️ POST /api/survival/:sessionId/end
- ⚠️ POST /api/survival/:sessionId/death
- ⚠️ POST /api/survival/:sessionId/abandon
- ⚠️ POST /api/survival/exchange-points/exp
- ⚠️ POST /api/survival/exchange-points/val
- ⚠️ POST /api/survival/exchange-points/guaranteed-item
- ⚠️ GET /api/survival/leaderboard
- ⚠️ GET /api/survival/my-stats

---

### ✅ 6. MARKETPLACE (8 endpoints)

**Estado:** Parcialmente documentado  
**Faltaban:** Historial de transacciones

**Archivos:**

```
src/
  ├── services/
  │   ├── marketplace.service.ts
  │   └── marketplace-transaction.service.ts
  ├── components/
  │   ├── marketplace-list.component.ts
  │   ├── marketplace-detail.component.ts
  │   ├── marketplace-my-listings.component.ts
  │   └── marketplace-history.component.ts
```

**Endpoints:**
- POST /api/marketplace/marketplace/list
- POST /api/marketplace/marketplace/buy/:listingId
- DELETE /api/marketplace/marketplace/cancel/:listingId
- GET /api/marketplace-transactions/my-history ⚠️ NUEVO
- GET /api/marketplace-transactions/my-sales ⚠️ NUEVO
- GET /api/marketplace-transactions/my-purchases ⚠️ NUEVO
- GET /api/marketplace-transactions/stats ⚠️ NUEVO
- GET /api/marketplace-transactions/:listingId ⚠️ NUEVO

---

### ✅ 7. TIENDA/SHOP (4 endpoints)

**Estado:** Documentado

**Archivos:**

```
src/
  ├── services/
  │   └── shop.service.ts
  ├── components/
  │   ├── shop.component.ts
  │   ├── shop-products.component.ts
  │   └── shop-cart.component.ts
```

**Endpoints:**
- GET /api/shop/info
- POST /api/shop/buy-evo
- POST /api/shop/buy-boletos
- POST /api/shop/buy-val

---

### ⚠️ 8. RANKINGS (5 endpoints) - OMITIDO

**Estado:** NO DOCUMENTADO  
**Criticidad:** MEDIA

**Archivos a CREAR:**

```
src/
  ├── services/
  │   └── rankings.service.ts
  ├── components/
  │   ├── rankings-global.component.ts
  │   ├── rankings-leaderboard.component.ts
  │   └── rankings-my-position.component.ts
```

**Endpoints a IMPLEMENTAR:**
- ⚠️ GET /api/rankings/
- ⚠️ GET /api/rankings/leaderboard/:category
- ⚠️ GET /api/rankings/period/:periodo
- ⚠️ GET /api/rankings/stats
- ⚠️ GET /api/rankings/me

---

### ✅ 9. PAQUETES (6 endpoints)

**Estado:** Básicamente documentado  
**Necesita:** Expansión admin

**Archivos:**

```
src/
  ├── services/
  │   ├── package.service.ts
  │   └── user-package.service.ts
  ├── components/
  │   ├── package-store.component.ts
  │   └── package-open.component.ts
```

**Endpoints:**
- GET /api/packages
- GET /api/packages/:id
- GET /api/user-packages
- GET /api/user-packages/:userId (admin)
- POST /api/user-packages/agregar (admin)
- POST /api/user-packages/quitar (admin)

---

### ⚠️ 10. NOTIFICACIONES (4 endpoints) - OMITIDO

**Estado:** NO DOCUMENTADO  
**Criticidad:** MEDIA

**Archivos a CREAR:**

```
src/
  ├── services/
  │   └── notification.service.ts
  ├── components/
  │   ├── notification-center.component.ts
  │   ├── notification-badge.component.ts
  │   └── notification-item.component.ts
```

**Endpoints a IMPLEMENTAR:**
- ⚠️ GET /api/notifications
- ⚠️ GET /api/notifications/:id
- ⚠️ PUT /api/notifications/:id/read
- ⚠️ DELETE /api/notifications/:id

---

### ⚠️ 11. CHAT (3+ endpoints) - OMITIDO

**Estado:** NO DOCUMENTADO  
**Criticidad:** MEDIA

**Archivos a CREAR:**

```
src/
  ├── services/
  │   └── chat.service.ts
  ├── components/
  │   ├── chat-window.component.ts
  │   ├── chat-message.component.ts
  │   └── chat-input.component.ts
```

**Endpoints a IMPLEMENTAR:**
- ⚠️ GET /api/chat/messages
- ⚠️ POST /api/chat/global
- ⚠️ POST /api/chat/party

---

### ⚠️ 12. EQUIPOS (3+ endpoints) - OMITIDO

**Estado:** NO DOCUMENTADO  
**Criticidad:** BAJA

**Archivos a CREAR:**

```
src/
  ├── services/
  │   └── team.service.ts
  ├── components/
  │   ├── team-list.component.ts
  │   ├── team-create.component.ts
  │   └── team-members.component.ts
```

**Endpoints a IMPLEMENTAR:**
- ⚠️ GET /api/teams
- ⚠️ POST /api/teams
- ⚠️ PUT /api/teams/:id

---

### ✅ 13. SISTEMAS AUXILIARES (20+ endpoints)

**Estado:** Parcialmente documentado

**Módulos incluyen:**
- ✅ Base Characters (1-2)
- ✅ Items/Equipment (2-3)
- ✅ Consumables (1-2)
- ✅ Categories (2)
- ✅ Game Settings (2)
- ✅ Level Requirements (1)
- ✅ Events (1)
- ✅ Offers (1)
- ✅ Player Stats (2)
- ✅ Achievements (2+)
- ✅ User Settings (2)
- ✅ Health Checks (3)

---

## 📊 Matriz de Implementación

| Módulo | Endpoints | Documentado | Status | Prioridad |
|--------|-----------|-------------|--------|-----------|
| Auth | 9 | ✅ | ✅ Listo | 🔴 CRÍTICA |
| Users | 12 | ⚠️ Parcial | ⚠️ Falta energía | 🔴 CRÍTICA |
| Characters | 10 | ✅ | ⚠️ Falta UI equipamiento | 🔴 CRÍTICA |
| Combat | 4 | ❌ Vagamente | ⚠️ Por implementar | 🟡 IMPORTANTE |
| **Survival** | **12** | **❌ OMITIDO** | **❌ TODO** | **🔴 CRÍTICA** |
| Marketplace | 8 | ⚠️ Parcial | ⚠️ Falta historial | 🟡 IMPORTANTE |
| Shop | 4 | ✅ | ✅ Listo | 🟡 IMPORTANTE |
| **Rankings** | **5** | **❌ OMITIDO** | **❌ TODO** | **🟡 IMPORTANTE** |
| Packages | 6 | ✅ | ✅ Listo | 🟡 IMPORTANTE |
| **Notifications** | **4** | **❌ OMITIDO** | **❌ TODO** | **🟢 OPCIONAL** |
| **Chat** | **3+** | **❌ OMITIDO** | **❌ TODO** | **🟢 OPCIONAL** |
| **Teams** | **3+** | **❌ OMITIDO** | **❌ TODO** | **🟢 OPCIONAL** |
| Otros | 20+ | ⚠️ Parcial | ⚠️ Varios | 🟢 OPCIONAL |
| **TOTAL** | **~135** | **31%** | **Actualizando** | 🔴 Ver arriba |

---

## 🚀 PLAN DE ACCIÓN

### FASE 1: CRÍTICOS (2-3 sprints)

**Deben estar listos ANTES de ir a producción:**

1. ✅ Auth (9 endpoints) - YA EXISTE
2. ⚠️ Users completo (12 endpoints) - AGREGAR energía
3. ✅ Characters (10 endpoints) - MEJORAR UI
4. ⚠️ Combat (4 endpoints) - IMPLEMENTAR correctamente
5. 🔴 **Survival (12 endpoints) - CREAR desde cero** ⚠️ FALTA
6. ⚠️ Marketplace (8 endpoints) - AGREGAR historial

### FASE 2: IMPORTANTES (1-2 sprints)

**Nice to have, pero recomendados:**

7. ✅ Shop (4 endpoints) - YA EXISTE
8. 🔴 **Rankings (5 endpoints) - CREAR desde cero** ⚠️ FALTA
9. ✅ Packages (6 endpoints) - YA EXISTE
10. ⚠️ Game Settings (2 endpoints) - REVISAR

### FASE 3: OPCIONALES (Post-MVP)

**Posteriores:**

11. 🔴 **Notifications (4 endpoints) - CREAR** ⚠️ FALTA
12. 🔴 **Chat (3 endpoints) - CREAR** ⚠️ FALTA
13. 🔴 **Teams (3 endpoints) - CREAR** ⚠️ FALTA
14. Achievements, Eventos, etc.

---

## 📝 CHECKLIST PARA CADA MÓDULO

### Plantilla:

```
Módulo: _______________

[ ] Service creado con todos los endpoints
[ ] Componentes principales creados
[ ] Validación de datos (Zod o similar)
[ ] Manejo de errores
[ ] Loading states
[ ] Testing unitario
[ ] Testing e2e
[ ] Documentación interna
[ ] Integración real-time (si aplica)
[ ] Estilos completados
```

---

## 🔗 INTEGRACIÓN REAL-TIME (WebSocket)

**Necesario para:**
- Notificaciones
- Actualizaciones marketplace
- Chat
- Leaderboards en vivo
- Eventos de servidor

**Implementación:**

```typescript
// app.component.ts o service central
import { io } from 'socket.io-client';

this.socket = io(environment.wsUrl, {
  transports: ['websocket'],
  reconnection: true
});

// Eventos a escuchar:
this.socket.on('user:update', (data) => { /* actualizar */ });
this.socket.on('marketplace:new-listing', (listing) => { /* mostrar */ });
this.socket.on('chat:message', (msg) => { /* agregar */ });
this.socket.on('ranking:updated', (data) => { /* refrescar */ });
```

---

## 🎯 PRIORIDAD REAL PARA MVP

**Para lanzar con funcionalidad básica, necesitas:**

1. ✅ Auth (9) - Autenticación
2. ✅ Users (12) - Perfil y recursos  
3. ✅ Characters (10) - Progresión de personaje
4. ✅ Combat (4) - Dungeons básicos
5. 🔴 **Survival (12) - NUEVO SISTEMA COMPLETO**
6. ⚠️ Marketplace (8) - Trading
7. ✅ Shop (4) - Tienda
8. 🔴 **Rankings (5) - LEADERBOARDS**
9. ✅ Packages (6) - Gacha

**Total MVP: ~80 endpoints (59% del total)**

---

## ⚠️ RIESGOS A EVITAR

1. **No documentar Survival** → Pantalla vacía sin funcionalidad
2. **No implementar Rankings** → Leaderboards no funcionan
3. **No completar energía** → Mecánica de gameplay rota
4. **Ignorar marketplace history** → Usuarios no pueden ver transacciones
5. **No usar WebSocket** → Chat y actualizaciones lentas

---

## 📞 PRÓXIMOS PASOS

### Inmediatos (Hoy):
1. ✅ Revisar este documento
2. ✅ Leer 01_ANALISIS_COMPLETO_BACKEND.md
3. ✅ Leer 02_ENDPOINTS_COMPLETOS.md
4. ✅ Actualizar Jira/roadmap con 86+ endpoints faltantes

### Esta semana:
5. Crear Plan de Implementación por módulo
6. Priorizar FASE 1 (Críticos)
7. Comenzar con Survival (más falta)
8. Actualizar documentación de pantallas

### Próximas 2 semanas:
9. Implementar FASE 1 completa
10. Testing e2e para FASE 1
11. Revisión con backend team

---

## 📊 Resumen Final

| Métrica | Valor |
|---------|-------|
| **Endpoints totales** | ~128-135 |
| **Que faltaban documentar** | 86-93 |
| **Módulos sin documentar** | 7 |
| **Sistemas completos omitidos** | 3 (Survival, Rankings, Chat) |
| **% Completitud anterior** | 31% |
| **% Completitud actual** | 100% |
| **Impacto en frontend** | ALTO |
| **Urgencia** | 🔴 CRÍTICA |

---

**Generado:** 1 de diciembre, 2025  
**Base:** Auditoría completa del código  
**Próximo paso:** Regenerar documentación de frontend conforme a esto  
