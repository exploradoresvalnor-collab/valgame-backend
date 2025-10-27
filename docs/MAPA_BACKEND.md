# 🗺️ MAPA COMPLETO DEL BACKEND

> **Guía visual:** Cómo funciona el backend a nivel de código y experiencia de usuario  
> **Última actualización:** 27 de octubre de 2025

---

## 📂 ESTRUCTURA DE CÓDIGO

```
valgame-backend/
│
├── 📁 src/                          ← CÓDIGO FUENTE PRINCIPAL
│   ├── app.ts                       ⚡ Punto de entrada (servidor Express)
│   ├── seed.ts                      🌱 Datos iniciales (BaseCharacters, Items)
│   │
│   ├── 📁 config/                   ⚙️ CONFIGURACIÓN
│   │   ├── db.ts                    🔌 Conexión MongoDB Atlas
│   │   └── mailer.ts                📧 Nodemailer (verificación email)
│   │
│   ├── 📁 models/                   🗂️ ESQUEMAS DE BASE DE DATOS
│   │   ├── User.ts                  👤 Usuarios (auth, recursos, inventario)
│   │   ├── BaseCharacter.ts         📋 Plantillas de personajes
│   │   ├── Personaje.ts             🦸 Personajes del usuario (stats, HP, equipo)
│   │   ├── Consumable.ts            🧪 Items consumibles (pociones, buffs)
│   │   ├── Equipment.ts             ⚔️ Equipamiento (armas, armaduras)
│   │   ├── Listing.ts               🏪 Marketplace (items en venta)
│   │   ├── MarketplaceTransaction.ts 💰 Historial de compras/ventas
│   │   ├── Dungeon.ts               🏰 Mazmorras (enemigos, recompensas)
│   │   ├── Package.ts               📦 Paquetes gacha (probabilidades)
│   │   ├── UserPackage.ts           🎁 Paquetes del usuario
│   │   ├── PurchaseLog.ts           📊 Auditoría de compras
│   │   ├── GameSettings.ts          🎮 Configuración del juego
│   │   ├── Notification.ts          🔔 Notificaciones in-app
│   │   └── TokenBlacklist.ts        🚫 Tokens revocados (logout)
│   │
│   ├── 📁 controllers/              🎮 LÓGICA DE NEGOCIO
│   │   ├── auth.controller.ts       🔐 Registro, login, verificación
│   │   ├── characters.controller.ts 🦸 Curar, evolucionar, revivir
│   │   ├── dungeons.controller.ts   ⚔️ Combate automático
│   │   ├── marketplace.controller.ts 🏪 Compra/venta P2P
│   │   ├── packages.controller.ts   📦 Abrir paquetes gacha
│   │   └── users.controller.ts      👤 Perfil, inventario, tutorial
│   │
│   ├── 📁 services/                 🔧 SERVICIOS ESPECIALIZADOS
│   │   ├── character.service.ts     🦸 Subir nivel, calcular stats
│   │   ├── combat.service.ts        ⚔️ Simulación de combate
│   │   ├── onboarding.service.ts    🎁 Paquete del Pionero automático
│   │   ├── permadeath.service.ts    💀 Cron: eliminar personajes heridos 24h
│   │   ├── marketplace-expiration.service.ts ⏰ Cron: expirar listings 7 días
│   │   └── realtime.service.ts      🌐 WebSocket (Socket.IO)
│   │
│   ├── 📁 middlewares/              🛡️ SEGURIDAD Y VALIDACIÓN
│   │   ├── auth.ts                  🔐 Verificar JWT (header o cookie)
│   │   ├── rateLimits.ts            🚦 Rate limiting por endpoint
│   │   └── errorHandler.ts          🐛 Manejo global de errores
│   │
│   ├── 📁 routes/                   🛣️ ENDPOINTS API
│   │   ├── auth.routes.ts           🔐 /auth (register, login, verify)
│   │   ├── users.routes.ts          👤 /api/users (perfil, tutorial)
│   │   ├── characters.routes.ts     🦸 /api/characters (heal, evolve, revive)
│   │   ├── dungeons.routes.ts       🏰 /api/dungeons (start, progress)
│   │   ├── marketplace.routes.ts    🏪 /api/marketplace (listings, buy)
│   │   ├── packages.routes.ts       📦 /api/packages (públicos)
│   │   ├── userPackages.routes.ts   🎁 /api/user-packages (abrir)
│   │   └── ... (más rutas)
│   │
│   ├── 📁 validations/              ✅ ESQUEMAS ZOD
│   │   ├── auth.validation.ts       🔐 Validar email, password
│   │   ├── character.validation.ts  🦸 Validar acciones de personajes
│   │   └── marketplace.validation.ts 🏪 Validar listings, compras
│   │
│   └── 📁 utils/                    🛠️ UTILIDADES
│       ├── jwt.ts                   🔑 Generar/verificar tokens
│       └── ... (helpers varios)
│
├── 📁 tests/                        🧪 TESTS
│   ├── 📁 e2e/                      🌐 Tests de flujo completo
│   │   └── master-complete-flow.e2e.test.ts ⭐ Test maestro
│   └── 📁 security/                 🔒 Tests de seguridad
│       └── packages.security.test.ts 💰 Auditoría VAL
│
├── 📁 scripts/                      📜 SCRIPTS ÚTILES
│   ├── check-env.js                 ✅ Verificar variables de entorno
│   ├── seed-*.js                    🌱 Poblar base de datos
│   └── ... (más scripts)
│
├── 📁 docs/                         📚 DOCUMENTACIÓN
│   ├── 00_INICIO/README.md          🏠 Índice maestro
│   ├── DEPENDENCIAS_PRODUCCION.md   📦 Versiones y setup
│   ├── MAPA_BACKEND.md              🗺️ Este archivo
│   ├── DOCUMENTACION.md             📖 Documento maestro de diseño
│   ├── TODO_PROYECTO.md             📋 Tareas pendientes
│   └── ...
│
├── 📁 FRONTEND_STARTER_KIT/         🎨 GUÍAS PARA FRONTEND
│   ├── 00_LEEME_PRIMERO.md          🏁 Inicio rápido
│   ├── 02_API_REFERENCE.md          📖 Todos los endpoints
│   ├── 03_MODELOS_TYPESCRIPT.md     📐 Interfaces TypeScript
│   └── ...
│
├── .env                             🔐 Variables de entorno (no subir a Git)
├── .env.example                     📄 Ejemplo de variables
├── package.json                     📦 Dependencias npm
├── tsconfig.json                    ⚙️ Configuración TypeScript
└── README.md                        📘 Documento principal
```

---

## 🎮 FLUJO DE USUARIO: EXPERIENCIA COMPLETA

### 1️⃣ REGISTRO Y VERIFICACIÓN

```
Usuario ingresa                   Backend procesa              Estado final
────────────────                  ───────────────              ────────────

[Formulario registro]             POST /auth/register          ✉️ Email enviado
  ├─ email                        ├─ Valida con Zod            ├─ User creado
  ├─ username                     ├─ Hash password bcrypt      ├─ isVerified: false
  └─ password                     ├─ Genera verificationToken  └─ verificationToken: ABC123
                                  └─ Envía email Nodemailer

[Click en link email]             GET /auth/verify/:token      ✅ Usuario verificado
  └─ https://.../verify/ABC123    ├─ Busca token en DB         ├─ isVerified: true
                                  ├─ Valida no expirado        ├─ Paquete del Pionero:
                                  ├─ onboarding.service.ts     │  • 3 personajes D-C
                                  └─ Entrega recompensas       │  • 1500 VAL
                                                               │  • 10 boletos
                                                               └─ receivedPioneerPackage: true
```

### 2️⃣ LOGIN Y AUTENTICACIÓN

```
Usuario ingresa                   Backend procesa              Estado final
────────────────                  ───────────────              ────────────

[Formulario login]                POST /auth/login             🍪 Cookie JWT
  ├─ email                        ├─ Busca usuario             ├─ token en httpOnly cookie
  └─ password                     ├─ Verifica isVerified       ├─ Expira en 7 días
                                  ├─ Compara password bcrypt   ├─ SameSite=Strict
                                  ├─ Genera JWT (7 días)       ├─ Secure (producción)
                                  └─ res.cookie('token', ...)  └─ No en JSON response

[Peticiones protegidas]           Middleware auth.ts           ✅ Autenticado
  └─ Cookie enviada auto          ├─ Lee req.cookies.token     ├─ req.user = userData
                                  ├─ O Authorization header    └─ Sigue al controller
                                  ├─ Verifica JWT
                                  └─ Decodifica payload
```

### 3️⃣ DASHBOARD Y RECURSOS

```
Usuario ve                        Backend responde             Datos mostrados
──────────                        ────────────────             ───────────────

[Dashboard principal]             GET /api/users/me            💰 Recursos
  └─ Pantalla inicial             ├─ auth.ts verifica JWT      ├─ VAL: 1500
                                  ├─ users.controller          ├─ Boletos: 10
                                  └─ Busca user + populate     ├─ EVO: 0
                                                               ├─ Personajes: 3
                                                               └─ Inventario: {...}
```

### 4️⃣ FORMACIÓN DE EQUIPO

```
Usuario selecciona                Backend procesa              Estado final
──────────────                    ───────────────              ────────────

[Colección personajes]            GET /api/users/me            📋 Lista de personajes
  └─ Ver todos mis personajes     └─ populate('personajes')    ├─ Personaje A (Rango D, Lv 1)
                                                               ├─ Personaje B (Rango C, Lv 1)
                                                               └─ Personaje C (Rango D, Lv 1)

[Seleccionar activo]              PUT /api/users/              ⭐ Personaje activo
  └─ Click en personaje A            set-active-character/:id  └─ activeCharacterId: A
```

### 5️⃣ EQUIPAR Y PREPARAR

```
Usuario equipa                    Backend procesa              Stats calculados
──────────────                    ───────────────              ────────────────

[Inventario equipamiento]         GET /api/users/me            ⚔️ Items disponibles
  └─ Ver armas/armaduras          └─ populate(inventarios)     ├─ Espada (+10 ATK)
                                                               └─ Armadura (+5 DEF)

[Equipar ítem]                    POST /api/characters/:id/    ✅ Equipado
  └─ Drag Espada → Personaje A       equip-item                ├─ equipamiento: [Espada ID]
                                  ├─ Valida ownership          ├─ Stats recalculados:
                                  ├─ Añade a personaje         │  • ATK: 15 → 25
                                  └─ character.service.ts      └─ Item bloqueado en inv
```

### 6️⃣ COMBATE EN MAZMORRA

```
Usuario inicia                    Backend simula               Resultado
──────────────                    ──────────────               ──────────

[Seleccionar mazmorra]            GET /api/dungeons            🏰 Lista mazmorras
  └─ Ver mazmorras disponibles    └─ Filtra por nivel req      ├─ Cueva Oscura (Lv 1+)
                                                               └─ Bosque Maldito (Lv 5+)

[Botón "Iniciar Combate"]         POST /api/dungeons/:id/start ⚔️ Batalla automática
  └─ Enviar equipo (1-3 heroes)   ├─ Valida equipo válido      │
                                  ├─ Calcula stats totales     │
                                  ├─ combat.service.ts         │
                                  │  • Simula turnos           │
                                  │  • Calcula daño            │
                                  │  • Aplica buffs            │
                                  │  • Determina victoria      │
                                  └─ Devuelve reporte completo │

[Si VICTORIA ✅]                                                🎉 Recompensas
  └─ Todos enemigos derrotados    ├─ EXP ganada: +150          ├─ Personajes suben stats
                                  ├─ VAL ganado: +200          ├─ Puede subir de nivel
                                  └─ Loot: Poción (50% chance) └─ Items a inventario

[Si DERROTA ❌]                                                 💀 Consecuencias
  └─ Equipo eliminado             ├─ Sin recompensas           ├─ Personajes → "herido"
                                  ├─ Estado: "herido"          ├─ fechaHerido: NOW
                                  └─ Timer 24h activado        └─ ⏰ 24h para revivir
```

### 7️⃣ PROGRESIÓN: SUBIR DE NIVEL

```
Evento                            Backend procesa              Resultado
──────                            ───────────────              ──────────

[Personaje gana EXP]              character.service.ts         📈 Progreso
  └─ EXP actual: 150/200          ├─ Suma EXP ganada           ├─ EXP: 150 + 150 = 300
                                  └─ Compara vs requerida      └─ 300 >= 200 → LEVEL UP!

[Subida automática]               Lógica de level up           ⭐ Nivel 2
  └─ LEVEL UP!                    ├─ nivel: 1 → 2              ├─ Stats aumentados:
                                  ├─ Calcula nuevos stats      │  • ATK: 25 → 30 (+5)
                                  ├─ Basado en Rango           │  • DEF: 15 → 18 (+3)
                                  ├─ saludActual = saludMaxima │  • HP: 100 → 120 (+20)
                                  └─ experiencia = 100/300     ├─ HP curado completo
                                                               └─ level_history actualizado
```

### 8️⃣ MUERTE Y RESURRECCIÓN

```
Usuario decide                    Backend procesa              Estado final
──────────────                    ───────────────              ────────────

[Personaje herido]                Estado en DB                 ⏰ Timer activo
  └─ Después de derrota           ├─ estado: "herido"          ├─ Puede revivir (costo VAL)
                                  └─ fechaHerido: 12:00 PM     └─ O esperar 24h → ELIMINADO

[Opción 1: Revivir]               POST /api/characters/:id/    ✅ Revivido
  └─ Pagar VAL                       revive                    ├─ Costo: 500 VAL
                                  ├─ Valida VAL suficiente     ├─ estado: "vivo"
                                  ├─ Deduce VAL                ├─ HP: 50% restaurado
                                  └─ Restaura 50% HP           └─ fechaHerido: null

[Opción 2: Esperar]               Cron job cada hora           💀 PERMADEATH
  └─ No hacer nada                ├─ permadeath.service.ts     ├─ Si >24h herido:
                                  ├─ Revisa fechaHerido        │  • Personaje ELIMINADO
                                  └─ Si >24h → DELETE          └─ No hay forma de recuperar
```

### 9️⃣ EVOLUCIÓN

```
Usuario evoluciona                Backend procesa              Resultado
──────────────                    ───────────────              ──────────

[Botón "Evolucionar"]             POST /api/characters/:id/    ⭐ Etapa 2
  └─ Requisitos:                     evolve                    ├─ etapa: 1 → 2
     • Nivel 40+                  ├─ Valida nivel              ├─ Stats multiplicados
     • 1000 VAL                   ├─ Valida recursos           │  • ATK: 50 → 75 (+50%)
     • 1 EVO                      ├─ Deduce VAL + EVO          │  • DEF: 30 → 45 (+50%)
                                  ├─ Consulta BaseCharacter    │  • HP: 200 → 300 (+50%)
                                  ├─ Aplica stats de etapa     ├─ Nivel máximo: 40 → 100
                                  └─ Recalcula stats totales   └─ Aspecto visual mejorado
```

### 🔟 MARKETPLACE: COMPRA/VENTA P2P

```
Usuario vende                     Backend procesa              Estado final
─────────────                     ───────────────              ────────────

[Crear venta]                     POST /api/marketplace/       🏪 Listing creado
  └─ Listar Espada por 500 VAL       listings                  ├─ itemId: Espada
                                  ├─ Valida ownership          ├─ vendedorId: User A
                                  ├─ Remueve de inventario     ├─ precio: 500 VAL
                                  ├─ Crea Listing              ├─ estado: "activo"
                                  ├─ metadata del item         ├─ fechaExpiracion: +7 días
                                  └─ WebSocket broadcast       └─ Item bloqueado

[Otro usuario compra]             POST /api/marketplace/       💰 Transacción atómica
  └─ User B click "Comprar"          listings/:id/buy          │
                                  ├─ TRANSACCIÓN ATÓMICA:      ├─ User B: -500 VAL
                                  │  • Reserva listing         ├─ User A: +475 VAL (5% tax)
                                  │  • Valida VAL suficiente   ├─ Espada → inventario User B
                                  │  • Valida espacio inv      ├─ Listing: estado "vendido"
                                  │  • Transfiere VAL          ├─ Transaction log creado
                                  │  • Mueve item              └─ WebSocket notifica ambos
                                  │  • Actualiza listing       
                                  └─ Si falla: ROLLBACK        

[Cancelar venta]                  POST /api/marketplace/       ❌ Listing cancelado
  └─ User A cancela               listings/:id/cancel          ├─ Espada → inventario User A
                                  ├─ Valida ownership          ├─ estado: "cancelado"
                                  ├─ Devuelve item             └─ Destacado: reembolso 50%
                                  └─ Reembolso parcial         
```

### 1️⃣1️⃣ GACHA: ABRIR PAQUETES

```
Usuario abre                      Backend procesa              Resultado
────────────                      ───────────────              ──────────

[Comprar paquete]                 POST /api/user-packages/     📦 Paquete comprado
  └─ Paquete Básico (1 boleto)       purchase (futuro)         ├─ -1 boleto
                                  ├─ Valida recursos           └─ UserPackage creado
                                  └─ Crea UserPackage          

[Abrir paquete]                   POST /api/user-packages/open 🎰 RNG gacha
  └─ Click "Abrir"                ├─ TRANSACCIÓN ATÓMICA:      │
                                  │  • Lee probabilidades      ├─ Roll 1: 45 (D tier)
                                  │  • RNG por cada slot       ├─ Roll 2: 78 (C tier)
                                  │  • Selecciona BaseChar     ├─ Roll 3: 92 (B tier!)
                                  │  • Crea 3 Personajes       │
                                  │  • Añade a usuario         ├─ 3 personajes nuevos:
                                  │  • Elimina UserPackage     │  • Guerrero (D, Lv 1)
                                  └─ Si falla: ROLLBACK        │  • Mago (C, Lv 1)
                                                               └─  • Arquera (B, Lv 1) ⭐

[Sistema duplicados]              Lógica en apertura           💰 Conversión a VAL
  └─ Si personaje ya existe       ├─ Detecta duplicado         ├─ No agrega personaje
                                  └─ Convierte a VAL           └─ +100 VAL (según rango)
```

### 1️⃣2️⃣ NOTIFICACIONES TIEMPO REAL

```
Evento ocurre                     Backend emite                Usuario recibe
─────────────                     ─────────────                ──────────────

[Personaje sube nivel]            realtime.service.ts          🔔 Notificación push
  └─ Level 5 alcanzado            ├─ io.to(`user:${userId}`)   └─ "¡Nivel 5 alcanzado!"
                                  └─ emit('character:update')   

[Item vendido]                    WebSocket event              🔔 "Tu Espada se vendió!"
  └─ Alguien compró tu item       ├─ emit('marketplace:sold')  └─ +475 VAL recibidos
                                  └─ Notificación in-app       

[Marketplace nuevo]               Broadcast global             🔔 Nuevo item disponible
  └─ Listing destacado creado     ├─ emit('marketplace:new')   └─ Espada Legendaria (2000 VAL)
                                  └─ Solo si destacado=true    
```

---

## 🔄 SERVICIOS CRON (AUTOMÁTICOS)

### ⏰ Permadeath Service
```
Cada 1 hora                       Lógica                       Acción
───────────                       ──────                       ──────

[Cron ejecuta]                    permadeath.service.ts        💀 Limpieza automática
  └─ node-cron: '0 * * * *'       ├─ Busca personajes heridos  │
                                  ├─ Filtra: fechaHerido < 24h ├─ Personaje A: 12h herido (OK)
                                  ├─ Elimina permanentemente    ├─ Personaje B: 25h herido (DELETE!)
                                  └─ Log en consola             └─ Personaje B eliminado de DB
```

### ⏰ Marketplace Expiration Service
```
Cada 1 hora                       Lógica                       Acción
───────────                       ──────                       ──────

[Cron ejecuta]                    marketplace-expiration       📅 Expirar listings
  └─ node-cron: '0 * * * *'          .service.ts               │
                                  ├─ Busca listings activos    ├─ Listing A: 2 días (OK)
                                  ├─ Filtra: fecha > 7 días    ├─ Listing B: 8 días (EXPIRADO!)
                                  ├─ Marca como "expirado"     │
                                  ├─ Devuelve item a vendedor  └─ Item B → inventario vendedor
                                  └─ WebSocket notifica        
```

---

## 🔐 SEGURIDAD: CAPAS DE PROTECCIÓN

```
REQUEST ENTRANTE
     ↓
┌────────────────────────────────────────────────────┐
│  1. HELMET                                         │
│     ├─ Oculta header X-Powered-By                 │
│     ├─ Previene clickjacking                      │
│     └─ Headers de seguridad HTTP                  │
└────────────────────────────────────────────────────┘
     ↓
┌────────────────────────────────────────────────────┐
│  2. CORS                                           │
│     ├─ origin: FRONTEND_ORIGIN                    │
│     ├─ credentials: true (cookies)                │
│     └─ Bloquea otros orígenes                     │
└────────────────────────────────────────────────────┘
     ↓
┌────────────────────────────────────────────────────┐
│  3. RATE LIMITING                                  │
│     ├─ authLimiter: 50 req / 15 min               │
│     ├─ gameplayLimiter: 60 req / min              │
│     ├─ marketplaceLimiter: 50 req / 5 min         │
│     └─ Skip IPs locales (127.0.0.1)               │
└────────────────────────────────────────────────────┘
     ↓
┌────────────────────────────────────────────────────┐
│  4. ZOD VALIDATION                                 │
│     ├─ Valida estructura de datos                 │
│     ├─ Tipos correctos (email, string, number)    │
│     └─ ANTES de llegar a Mongoose                 │
└────────────────────────────────────────────────────┘
     ↓
┌────────────────────────────────────────────────────┐
│  5. AUTH MIDDLEWARE                                │
│     ├─ Lee cookie httpOnly o header               │
│     ├─ Verifica JWT (jsonwebtoken.verify)         │
│     ├─ Verifica no en blacklist (logout)          │
│     └─ req.user = decoded payload                 │
└────────────────────────────────────────────────────┘
     ↓
┌────────────────────────────────────────────────────┐
│  6. BUSINESS LOGIC                                 │
│     ├─ Verifica ownership (es tu item?)           │
│     ├─ Verifica recursos (tienes VAL?)            │
│     ├─ Valida estados (personaje vivo?)           │
│     └─ Transacciones atómicas (MongoDB)           │
└────────────────────────────────────────────────────┘
     ↓
  RESPONSE
```

---

## 📊 FLUJO DE DATOS: MONGODB

```
COLECCIONES PRINCIPALES
───────────────────────

users                           ← Usuarios
  ├─ email, username, password
  ├─ val, boletos, evo
  ├─ inventarioEquipamiento: [ObjectId]
  ├─ inventarioConsumibles: [{consumableId, usos_restantes}]
  ├─ personajes: [ObjectId]
  ├─ activeCharacterId
  └─ dungeon_progress: Map<dungeonId, progress>

personajes                      ← Personajes del usuario
  ├─ personajeId (ref BaseCharacter)
  ├─ rango (D-SSS)
  ├─ nivel, etapa
  ├─ experiencia
  ├─ stats: {atk, vida, defensa}
  ├─ saludActual, estado
  ├─ fechaHerido
  └─ equipamiento: [ObjectId]

base_characters                 ← Plantillas (seed)
  ├─ id (ej. "base_d_001")
  ├─ nombre, imagen
  ├─ descripcion_rango
  ├─ stats base
  └─ evoluciones: [{nivel, stats}]

listings                        ← Marketplace
  ├─ itemId, type
  ├─ sellerId (ObjectId)
  ├─ precio, estado
  ├─ fechaExpiracion
  └─ metadata: {nivel, rango, stats}

marketplace_transactions        ← Historial
  ├─ listingId
  ├─ sellerId, buyerId
  ├─ precio, impuesto
  └─ fechaTransaccion

dungeons                        ← Mazmorras (seed)
  ├─ nombre, descripcion
  ├─ nivel_requerido_minimo
  ├─ oleadas
  ├─ enemigos: [{nombre, vida, atk}]
  └─ recompensas: {val, exp, items}

packages                        ← Paquetes gacha (seed)
  ├─ nombre, descripcion
  ├─ precio: {val, boletos}
  ├─ garantia_rango
  ├─ cantidad_personajes
  └─ probabilidades: {D: 70, C: 20, B: 8, A: 2}

user_packages                   ← Paquetes del usuario
  ├─ userId
  ├─ packageId
  └─ fechaObtencion

consumables                     ← Items consumibles (seed)
  ├─ nombre, descripcion
  ├─ usos_maximos
  └─ efecto: {stat, valor, duracion}

equipment                       ← Equipamiento (seed)
  ├─ nombre, tipo
  ├─ rango
  └─ stats: {atk, defensa, vida}
```

---

## 🌐 WEBSOCKET: EVENTOS TIEMPO REAL

```
CLIENTE                          SERVIDOR                         TODOS LOS CLIENTES
───────                          ────────                         ──────────────────

[Conecta]                        realtime.service.ts              
socket.connect()                 ├─ connection event              
                                 └─ Espera autenticación          

[Autentica]                      
socket.emit('auth', {token})     ├─ Verifica JWT real             ✅ Autenticado
                                 ├─ socket.userId = decoded       socket.userId = "ABC123"
                                 ├─ Únete sala: `user:${userId}`  
                                 └─ emit('auth:success')          

[Escucha eventos]                                                 
socket.on('user:update')         Backend emite cuando:            🔔 Recibe actualización
  └─ Actualiza UI                ├─ VAL cambia                    { val: 2000, boletos: 5 }
                                 ├─ Inventario cambia             
                                 └─ Recursos actualizados         

socket.on('character:update')    Backend emite cuando:            🔔 Personaje cambió
  └─ Actualiza stats             ├─ Sube de nivel                 { nivel: 6, stats: {...} }
                                 ├─ Evoluciona                    
                                 └─ HP cambia                     

socket.on('marketplace:new')     Backend emite cuando:            🔔 Nuevo item
  └─ Añade a lista               ├─ Nuevo listing destacado       { itemId, precio, seller }
                                 └─ Broadcast global              

socket.on('marketplace:sold')    Backend emite cuando:            🔔 Item vendido
  └─ Remueve de lista            ├─ Compra exitosa                { listingId }
                                 └─ Notifica vendedor y comprador 
```

---

## 🎯 ENDPOINTS CRÍTICOS (RESUMEN)

### 🔓 PÚBLICOS (sin auth)
```
GET  /health                     → Health check
GET  /api/packages               → Lista paquetes gacha
GET  /api/base-characters        → Plantillas de personajes
GET  /api/dungeons               → Lista mazmorras
GET  /api/equipment              → Equipamiento disponible
GET  /api/consumables            → Consumibles disponibles
```

### 🔐 AUTENTICACIÓN
```
POST /auth/register              → Crear cuenta
GET  /auth/verify/:token         → Verificar email + Paquete Pionero
POST /auth/login                 → Login (httpOnly cookie)
POST /auth/logout                → Logout (blacklist token)
```

### 👤 USUARIO
```
GET  /api/users/me               → Perfil completo
PUT  /api/users/tutorial/complete → Marcar tutorial completo
```

### 🦸 PERSONAJES
```
POST /api/characters/:id/heal    → Curar (costo VAL)
POST /api/characters/:id/revive  → Revivir (costo VAL, 24h max)
POST /api/characters/:id/evolve  → Evolucionar (nivel + recursos)
POST /api/characters/:id/use-consumable → Usar poción/buff
```

### 🏰 MAZMORRAS
```
POST /api/dungeons/:id/start     → Iniciar combate automático
GET  /api/dungeons/:id/progress  → Ver progreso personal
```

### 🏪 MARKETPLACE
```
GET  /api/marketplace/listings   → Buscar con filtros
POST /api/marketplace/listings   → Crear venta
POST /api/marketplace/listings/:id/buy → Comprar (transacción atómica)
POST /api/marketplace/listings/:id/cancel → Cancelar venta
```

### 📦 PAQUETES
```
GET  /api/user-packages          → Mis paquetes sin abrir
POST /api/user-packages/open     → Abrir paquete (gacha RNG)
```

---

## 🚀 DESPLIEGUE Y MONITOREO

### RENDER.COM
```
GitHub Push                      Render Auto-Deploy           Producción
───────────                      ──────────────               ──────────

[git push origin main]           
  └─ Trigger webhook             ├─ Detecta cambio            🔄 Build iniciado
                                 ├─ npm install               │
                                 ├─ npm run build             ├─ TypeScript → JavaScript
                                 └─ npm start                 └─ node dist/app.js

[Servidor corriendo]             
  └─ Escucha en $PORT            ├─ Express iniciado          ✅ LIVE
                                 ├─ MongoDB conectado         https://valgame-backend
                                 ├─ WebSocket listo              .onrender.com
                                 └─ Crons activados           
```

### HEALTH CHECK
```bash
# Verificar backend live
curl https://valgame-backend.onrender.com/health
# → {"ok": true}

# Despertar de cold start (Free Tier)
# Implementar en frontend:
setTimeout(() => {
  fetch('https://valgame-backend.onrender.com/health')
}, 1000)
```

---

**Fin del mapa completo** 🗺️  
**Para más detalles:** Ver `docs/DOCUMENTACION.md` y `FRONTEND_STARTER_KIT/`
