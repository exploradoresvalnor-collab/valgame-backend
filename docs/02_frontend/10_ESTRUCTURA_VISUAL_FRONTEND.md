# 🎨 ESTRUCTURA VISUAL DEL FRONTEND - VALGAME

> Guía completa de la estructura visual, navegación y componentes del frontend

---

## 📋 Tabla de Contenidos

1. [Landing Page (Pre-Login)](#landing-page-pre-login)
2. [Aplicación Principal (Post-Login)](#aplicación-principal-post-login)
3. [Jerarquía de Componentes](#jerarquía-de-componentes)
4. [Sistema de Navegación](#sistema-de-navegación)
5. [Páginas Principales](#páginas-principales)
6. [Componentes Compartidos](#componentes-compartidos)
7. [Estados de la Aplicación](#estados-de-la-aplicación)

---

## 🏠 Landing Page (Pre-Login)

### Estructura de la Landing

```
┌─────────────────────────────────────────────────────────┐
│                     HEADER/NAVBAR                        │
│  [Logo Valgame]              [Login] [Registrarse]      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│                    HERO SECTION                          │
│                                                          │
│   ╔════════════════════════════════════════╗            │
│   ║  VALGAME - El RPG del Futuro          ║            │
│   ║                                        ║            │
│   ║  Colecciona, Evoluciona y Conquista   ║            │
│   ║                                        ║            │
│   ║  [▶ Empezar Ahora]  [Ver Trailer]    ║            │
│   ╚════════════════════════════════════════╝            │
│                                                          │
│        [Imagen hero: Personajes épicos]                 │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│                  FEATURES SECTION                        │
│                                                          │
│   ┌───────────┐  ┌───────────┐  ┌───────────┐          │
│   │  🎮       │  │  ⚔️       │  │  🏪       │          │
│   │ Gacha     │  │ Combate   │  │ Market    │          │
│   │ System    │  │ Mazmorras │  │ place     │          │
│   └───────────┘  └───────────┘  └───────────┘          │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│               PAQUETES DESTACADOS                        │
│                                                          │
│   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│   │ Paquete      │ │ Paquete      │ │ Paquete      │   │
│   │ Inicial      │ │ Héroe        │ │ Legendario   │   │
│   │              │ │              │ │              │   │
│   │ 0 VAL        │ │ 1500 VAL     │ │ 5000 VAL     │   │
│   │ 1 Boleto     │ │ 0 Boletos    │ │ 0 Boletos    │   │
│   │              │ │              │ │              │   │
│   │ [Ver más]    │ │ [Ver más]    │ │ [Ver más]    │   │
│   └──────────────┘ └──────────────┘ └──────────────┘   │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│               SISTEMA DE RANGOS                          │
│                                                          │
│   ╔═══════════════════════════════════════════════╗    │
│   ║  [D] [C] [B] [A] [S] [SS] [SSS]              ║    │
│   ║                                                ║    │
│   ║  Cada personaje tiene un rango que define     ║    │
│   ║  su rareza y poder                            ║    │
│   ╚═══════════════════════════════════════════════╝    │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│                    FOOTER                                │
│   © 2025 Valgame | [Términos] [Privacidad] [FAQ]       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Componentes de Landing

#### 1. Hero Section Component
```
Ubicación: src/app/features/landing/components/hero-section/

Propósito: 
- Captar atención del usuario
- Call-to-action principal (Registrarse)
- Mostrar valor único del juego

Elementos:
- Título principal
- Subtítulo descriptivo
- Botón CTA primario
- Botón CTA secundario (trailer/demo)
- Imagen/Video de fondo
```

#### 2. Features Grid Component
```
Ubicación: src/app/features/landing/components/features-grid/

Propósito:
- Mostrar características principales
- Iconos visuales atractivos
- Descripciones breves

Features a mostrar:
- 🎮 Sistema Gacha: Abre paquetes, colecciona personajes
- ⚔️ Combate por Turnos: Mazmorras desafiantes
- 🏪 Marketplace: Compra y vende items con VAL
- 🔄 Evoluciones: Mejora tus personajes
- 💎 Economía VAL: Sistema de moneda interno
- 🎯 Misiones Diarias: Recompensas constantes
```

#### 3. Package Showcase Component
```
Ubicación: src/app/features/landing/components/package-showcase/

Propósito:
- Mostrar paquetes disponibles
- Incentivar primera compra
- Explicar sistema de gacha

Datos desde API:
GET /api/packages

Mostrar:
- Nombre del paquete
- Imagen
- Precio (VAL/Boletos)
- Cantidad de personajes
- Garantía de rango
- Probabilidades
```

#### 4. Rank System Explainer Component
```
Ubicación: src/app/features/landing/components/rank-system/

Propósito:
- Explicar sistema de rangos
- Mostrar progresión visual
- Crear expectativa

Rangos:
D → C → B → A → S → SS → SSS
(Cada uno con color distintivo)
```

---

## 🎮 Aplicación Principal (Post-Login)

### Estructura General

```
┌─────────────────────────────────────────────────────────┐
│                   TOP NAVBAR                             │
│  [Logo] [Dashboard] [Personajes] [Inventario]...        │
│                          [Val: 1500] [👤 Usuario] [🔔]  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│                  CONTENT AREA                            │
│              (Router Outlet aquí)                        │
│                                                          │
│                                                          │
│                                                          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Top Navbar (Siempre visible post-login)

```
┌────────────────────────────────────────────────────────┐
│  [🎮 Valgame]  [Dashboard] [Personajes] [Inventario]  │
│                [Marketplace] [Mazmorras]                │
│                                                          │
│          [💰 VAL: 1,500]  [🎟️ Boletos: 10]             │
│          [⚡ EVO: 5]                                     │
│                            [👤 Usuario ▼] [🔔 3]        │
└────────────────────────────────────────────────────────┘
```

**Elementos del Navbar:**
- Logo (link a dashboard)
- Links de navegación principales
- Recursos del usuario (VAL, Boletos, EVO)
- Menú de usuario (perfil, configuración, logout)
- Notificaciones

---

## 📊 Páginas Principales

### 1. Dashboard (Vista Principal)

```
┌─────────────────────────────────────────────────────────┐
│                     DASHBOARD                            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Bienvenido, [Username]!                                │
│                                                          │
│  ┌──────────────────┐  ┌──────────────────┐            │
│  │ 📊 Estadísticas  │  │ 🎯 Misiones      │            │
│  │                  │  │                  │            │
│  │ Personajes: 15   │  │ ▫️ Diaria 1      │            │
│  │ Nivel Prom: 12   │  │ ✅ Diaria 2      │            │
│  │ Val Total: 1500  │  │ ▫️ Semanal 1     │            │
│  └──────────────────┘  └──────────────────┘            │
│                                                          │
│  ┌──────────────────────────────────────────┐           │
│  │        TU EQUIPO ACTIVO                  │           │
│  ├──────────────────────────────────────────┤           │
│  │  [👤 Personaje 1]                       │           │
│  │  [👤 Personaje 2]                       │           │
│  │  [👤 Personaje 3]                       │           │
│  │                                          │           │
│  │  [Cambiar Equipo]                       │           │
│  └──────────────────────────────────────────┘           │
│                                                          │
│  ┌──────────────────────────────────────────┐           │
│  │        NOTICIAS Y EVENTOS                │           │
│  ├──────────────────────────────────────────┤           │
│  │  🎉 Nuevo evento: Caza del Tesoro        │           │
│  │  📦 Paquete especial disponible          │           │
│  │  ⚔️ Nueva mazmorra desbloqueada          │           │
│  └──────────────────────────────────────────┘           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Componentes del Dashboard:**
- Resumen de estadísticas personales
- Misiones diarias/semanales
- Equipo activo (personajes seleccionados)
- Noticias y eventos del juego
- Accesos rápidos a secciones principales

---

### 2. Personajes (Colección)

```
┌─────────────────────────────────────────────────────────┐
│                   MIS PERSONAJES                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [🔍 Buscar]  [Filtros: Rango ▼] [Nivel ▼] [Estado ▼] │
│                                                          │
│  Total: 15 personajes  |  Espacios: 15/100              │
│                                                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │ [Img]   │ │ [Img]   │ │ [Img]   │ │ [Img]   │       │
│  │         │ │         │ │         │ │         │       │
│  │ Héroe A │ │ Mago B  │ │ Tank C  │ │ DPS D   │       │
│  │ Rango: S│ │ Rango: A│ │ Rango: B│ │ Rango: C│       │
│  │ Nv: 25  │ │ Nv: 18  │ │ Nv: 15  │ │ Nv: 10  │       │
│  │ ❤️ 100% │ │ ❤️ 80%  │ │ ❤️ 100% │ │ ❤️ 50%  │       │
│  │         │ │         │ │         │ │         │       │
│  │ [Ver]   │ │ [Ver]   │ │ [Ver]   │ │ [Ver]   │       │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
│                                                          │
│  [... más personajes ...]                               │
│                                                          │
│  [◀ Anterior] [1] [2] [3] [4] [Siguiente ▶]            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Funcionalidades:**
- Grid de personajes con tarjetas
- Filtros por rango, nivel, estado
- Búsqueda por nombre
- Indicador de salud
- Click para ver detalles

---

### 3. Detalle de Personaje

```
┌─────────────────────────────────────────────────────────┐
│                 DETALLE DE PERSONAJE                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [← Volver a Personajes]                                │
│                                                          │
│  ┌──────────────┐  ╔═════════════════════════╗          │
│  │              │  ║  Héroe Legendario        ║          │
│  │   [IMAGEN    │  ║  Rango: S                ║          │
│  │   GRANDE]    │  ║  Nivel: 25 / 100         ║          │
│  │              │  ║  Experiencia: 2500/3000  ║          │
│  │              │  ║                          ║          │
│  └──────────────┘  ║  ┌────────────────────┐ ║          │
│                    ║  │ ATK:  250          │ ║          │
│                    ║  │ VIDA: 1200         │ ║          │
│                    ║  │ DEF:  180          │ ║          │
│                    ║  └────────────────────┘ ║          │
│                    ║                          ║          │
│                    ║  Estado: 🟢 Saludable   ║          │
│                    ║  Salud: ████████ 100%   ║          │
│                    ╚═════════════════════════╝          │
│                                                          │
│  ┌──────────────────────────────────────────┐           │
│  │           EQUIPAMIENTO                    │           │
│  ├──────────────────────────────────────────┤           │
│  │  [Arma] [Armadura] [Accesorio] [Botas]  │           │
│  │                                          │           │
│  │  [+ Equipar Item]                       │           │
│  └──────────────────────────────────────────┘           │
│                                                          │
│  ┌──────────────────────────────────────────┐           │
│  │           ACCIONES                        │           │
│  ├──────────────────────────────────────────┤           │
│  │  [⚔️ Usar en Combate]                   │           │
│  │  [⬆️ Evolucionar] (Requiere Nv 40)      │           │
│  │  [💊 Curar] (50 VAL)                    │           │
│  │  [🍎 Usar Consumible]                   │           │
│  │  [💼 Vender en Marketplace]             │           │
│  └──────────────────────────────────────────┘           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Información mostrada:**
- Imagen del personaje
- Stats completos (ATK, VIDA, DEF)
- Barra de experiencia
- Nivel y progreso
- Estado de salud
- Equipamiento actual
- Buffs activos
- Acciones disponibles

---

### 4. Inventario

```
┌─────────────────────────────────────────────────────────┐
│                      INVENTARIO                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [Equipamiento] [Consumibles] [Paquetes]                │
│                                                          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━            │
│                                                          │
│  EQUIPAMIENTO (Espacios: 25/200)                        │
│                                                          │
│  [Filtros: Tipo ▼] [Rareza ▼] [Equipado/No Equipado]   │
│                                                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │ [⚔️]    │ │ [🛡️]    │ │ [👢]    │ │ [💍]    │       │
│  │ Espada  │ │ Escudo  │ │ Botas   │ │ Anillo  │       │
│  │ ATK+50  │ │ DEF+30  │ │ VEL+10  │ │ VIDA+20 │       │
│  │ Rareza: │ │ Rareza: │ │ Rareza: │ │ Rareza: │       │
│  │ Épico   │ │ Raro    │ │ Común   │ │ Legendar│       │
│  │         │ │         │ │         │ │         │       │
│  │[Equipar]│ │[Equipar]│ │[Vender] │ │[Equipar]│       │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
│                                                          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━            │
│                                                          │
│  CONSUMIBLES (Espacios: 18/200)                         │
│                                                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                   │
│  │ [🍎]    │ │ [⚡]    │ │ [💊]    │                   │
│  │ Poción  │ │ Buff    │ │ Revivir │                   │
│  │ HP+50   │ │ ATK+20% │ │ 100%HP  │                   │
│  │ Usos: 3 │ │ 30 min  │ │ Usos: 1 │                   │
│  │         │ │         │ │         │                   │
│  │ [Usar]  │ │ [Usar]  │ │ [Usar]  │                   │
│  └─────────┘ └─────────┘ └─────────┘                   │
│                                                          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━            │
│                                                          │
│  PAQUETES SIN ABRIR (3)                                 │
│                                                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │ [📦]        │ │ [📦]        │ │ [📦]        │       │
│  │ Paquete     │ │ Paquete     │ │ Paquete     │       │
│  │ Inicial     │ │ Héroe       │ │ Especial    │       │
│  │             │ │             │ │             │       │
│  │ 3 Chars     │ │ 5 Chars     │ │ 10 Chars    │       │
│  │ Garantía: D │ │ Garantía: C │ │ Garantía: B │       │
│  │             │ │             │ │             │       │
│  │ [✨ Abrir]  │ │ [✨ Abrir]  │ │ [✨ Abrir]  │       │
│  └─────────────┘ └─────────────┘ └─────────────┘       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Secciones del inventario:**
1. **Equipamiento:** Items que mejoran stats
2. **Consumibles:** Pociones, buffs, revivals
3. **Paquetes:** Paquetes gacha sin abrir

---

### 5. Marketplace

```
┌─────────────────────────────────────────────────────────┐
│                      MARKETPLACE                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [Comprar] [Mis Ventas] [Mi Historial]                  │
│                                                          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━            │
│                                                          │
│  🔍 Buscar items...                                      │
│                                                          │
│  Filtros: [Tipo ▼] [Rango ▼] [Precio ▼] [Destacados]   │
│                                                          │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ │
│  │ ⭐ DESTACADO  │ │               │ │               │ │
│  │ [IMG]         │ │ [IMG]         │ │ [IMG]         │ │
│  │ Héroe Épico   │ │ Espada Fuego  │ │ Buff ATK x10  │ │
│  │ Rango: S      │ │ ATK: +80      │ │ Duración: 1h  │ │
│  │ Nivel: 30     │ │ Rareza: Épico │ │ Cantidad: 10  │ │
│  │               │ │               │ │               │ │
│  │ 💰 2,500 VAL  │ │ 💰 800 VAL    │ │ 💰 150 VAL    │ │
│  │ 👤 Usuario123 │ │ 👤 ProGamer   │ │ 👤 Merchant   │ │
│  │               │ │               │ │               │ │
│  │ [🛒 Comprar]  │ │ [🛒 Comprar]  │ │ [🛒 Comprar]  │ │
│  └───────────────┘ └───────────────┘ └───────────────┘ │
│                                                          │
│  [... más items ...]                                     │
│                                                          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━            │
│                                                          │
│  📤 VENDER UN ITEM                                       │
│                                                          │
│  [Seleccionar item de tu inventario ▼]                  │
│  Precio: [_____] VAL                                    │
│  [ ] Destacar (+50 VAL)                                 │
│                                                          │
│  [✅ Publicar Venta]                                    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Funcionalidades:**
- Ver todos los listings activos
- Filtrar por tipo, rango, precio
- Items destacados (pagando extra)
- Comprar items con VAL
- Vender items propios
- Ver historial de transacciones

---

### 6. Mazmorras

```
┌─────────────────────────────────────────────────────────┐
│                      MAZMORRAS                           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  SELECCIONA UNA MAZMORRA                                │
│                                                          │
│  ┌──────────────────┐  ┌──────────────────┐            │
│  │ 🏰 Guarida       │  │ 🌋 Volcán        │            │
│  │    del Sapo      │  │    Oscuro        │            │
│  │                  │  │                  │            │
│  │ Nivel Req: 1     │  │ Nivel Req: 10    │            │
│  │ Dificultad: ⭐   │  │ Dificultad: ⭐⭐⭐│            │
│  │                  │  │                  │            │
│  │ Recompensas:     │  │ Recompensas:     │            │
│  │ • VAL: 100-300   │  │ • VAL: 500-1000  │            │
│  │ • EXP: 150       │  │ • EXP: 800       │            │
│  │ • Items: Común   │  │ • Items: Épico   │            │
│  │                  │  │                  │            │
│  │ Tu progreso:     │  │ 🔒 BLOQUEADA     │            │
│  │ ▓▓▓░░ 3/5        │  │                  │            │
│  │                  │  │                  │            │
│  │ [⚔️ Entrar]     │  │ [Ver requisitos] │            │
│  └──────────────────┘  └──────────────────┘            │
│                                                          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━            │
│                                                          │
│  TU EQUIPO PARA COMBATE (Selecciona hasta 3)            │
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                │
│  │ [IMG]    │ │ [IMG]    │ │ [Vacío]  │                │
│  │ Héroe A  │ │ Mago B   │ │          │                │
│  │ Nv: 25   │ │ Nv: 18   │ │ +        │                │
│  │ ❤️ 100%  │ │ ❤️ 80%   │ │          │                │
│  │          │ │          │ │          │                │
│  │ [Cambiar]│ │ [Cambiar]│ │[Agregar] │                │
│  └──────────┘ └──────────┘ └──────────┘                │
│                                                          │
│  [🎯 Iniciar Combate]                                   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Funcionalidades:**
- Lista de mazmorras disponibles
- Requisitos de nivel
- Recompensas mostradas
- Progreso personal
- Selección de equipo (hasta 3 personajes)
- Sistema de combate por turnos (en ventana modal o nueva vista)

---

### 7. Perfil de Usuario

```
┌─────────────────────────────────────────────────────────┐
│                    MI PERFIL                             │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────┐                                           │
│  │ [AVATAR] │  Username: Usuario123                     │
│  │          │  Email: usuario@ejemplo.com               │
│  │          │  Miembro desde: 15 Ene 2025               │
│  └──────────┘                                           │
│                                                          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━            │
│                                                          │
│  📊 ESTADÍSTICAS                                         │
│                                                          │
│  Total Personajes: 15                                   │
│  Nivel Promedio: 12                                     │
│  Personaje más fuerte: Héroe Legendario (Nv 25)         │
│                                                          │
│  Mazmorras completadas: 23                              │
│  Victorias en combate: 45                               │
│  Derrotas: 8                                            │
│                                                          │
│  Items vendidos en Marketplace: 12                      │
│  Items comprados: 8                                     │
│  VAL ganado (ventas): 5,600                             │
│                                                          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━            │
│                                                          │
│  💰 RECURSOS ACTUALES                                    │
│                                                          │
│  VAL: 1,500                                             │
│  Boletos: 10                                            │
│  EVO: 5                                                 │
│                                                          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━            │
│                                                          │
│  ⚙️ CONFIGURACIÓN                                        │
│                                                          │
│  [Cambiar Contraseña]                                   │
│  [Notificaciones]                                       │
│  [Preferencias de Visualización]                        │
│  [Cerrar Sesión]                                        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🧩 Jerarquía de Componentes

```
app-root
├── landing (pre-login)
│   ├── hero-section
│   ├── features-grid
│   ├── package-showcase
│   ├── rank-system-explainer
│   └── footer
│
├── auth
│   ├── login
│   ├── register
│   └── verify-email
│
└── main-app (post-login)
    ├── top-navbar
    │   ├── logo
    │   ├── nav-links
    │   ├── resources-display (VAL, Boletos, EVO)
    │   ├── user-menu
    │   └── notifications-bell
    │
    ├── dashboard
    │   ├── stats-card
    │   ├── missions-panel
    │   ├── active-team-display
    │   └── news-feed
    │
    ├── characters
    │   ├── character-grid
    │   │   └── character-card (repetido)
    │   ├── filters-bar
    │   └── pagination
    │
    ├── character-detail
    │   ├── character-image
    │   ├── stats-panel
    │   ├── equipment-slots
    │   └── actions-panel
    │
    ├── inventory
    │   ├── equipment-tab
    │   │   └── equipment-item-card (repetido)
    │   ├── consumables-tab
    │   │   └── consumable-item-card (repetido)
    │   └── packages-tab
    │       └── package-card (repetido)
    │
    ├── marketplace
    │   ├── marketplace-search-bar
    │   ├── marketplace-filters
    │   ├── marketplace-grid
    │   │   └── listing-card (repetido)
    │   ├── sell-item-form
    │   └── my-listings-tab
    │
    ├── dungeons
    │   ├── dungeon-list
    │   │   └── dungeon-card (repetido)
    │   ├── team-selector
    │   │   └── team-slot (x3)
    │   └── combat-view (modal o nueva ruta)
    │
    └── profile
        ├── user-info
        ├── stats-summary
        ├── resources-display
        └── settings-panel
```

---

## 🎨 Componentes Compartidos (Shared)

### Componentes reutilizables en toda la app:

```typescript
// 1. Loading Spinner
<app-loading-spinner></app-loading-spinner>

// 2. Alert/Notification
<app-alert type="success" message="Operación exitosa"></app-alert>

// 3. Modal
<app-modal [isOpen]="showModal" (close)="showModal = false">
  <h2>Contenido del modal</h2>
</app-modal>

// 4. Confirmation Dialog
<app-confirm-dialog
  message="¿Estás seguro de vender este item?"
  (confirm)="onConfirm()"
  (cancel)="onCancel()">
</app-confirm-dialog>

// 5. Resource Display Badge
<app-resource-badge resource="val" amount="1500"></app-resource-badge>

// 6. Character Avatar
<app-character-avatar 
  [character]="character" 
  [size]="'medium'">
</app-character-avatar>

// 7. Progress Bar
<app-progress-bar 
  [current]="2500" 
  [max]="3000" 
  [label]="'Experiencia'">
</app-progress-bar>

// 8. Rank Badge
<app-rank-badge [rank]="'S'"></app-rank-badge>

// 9. Stats Display
<app-stats-display [stats]="{ atk: 250, vida: 1200, defensa: 180 }">
</app-stats-display>

// 10. Empty State
<app-empty-state 
  icon="📦" 
  message="No tienes paquetes disponibles">
</app-empty-state>
```

---

## 🔄 Estados de la Aplicación

### Estados Globales (NgRx o Service)

```typescript
interface AppState {
  // Usuario actual
  user: {
    id: string;
    username: string;
    email: string;
    val: number;
    boletos: number;
    evo: number;
    personajes: Personaje[];
    inventarioEquipamiento: Equipment[];
    inventarioConsumibles: Consumable[];
  } | null;

  // Loading states
  loading: {
    global: boolean;
    characters: boolean;
    marketplace: boolean;
    dungeons: boolean;
  };

  // Notifications
  notifications: Notification[];

  // Marketplace
  marketplace: {
    listings: Listing[];
    myListings: Listing[];
    filters: MarketplaceFilters;
  };

  // Dungeon progress
  dungeonProgress: Map<string, DungeonProgress>;
}
```

### Estados de Loading

```
Estados visuales durante carga:

1. Skeleton screens (para contenido que está cargando)
2. Spinner (para acciones rápidas)
3. Progress bar (para operaciones largas)
4. Disabled buttons (durante POST/PUT/DELETE)
```

### Estados de Error

```
Manejo de errores:

1. Toast/Snackbar: Errores menores (campo inválido)
2. Modal de error: Errores graves (servidor caído)
3. Empty state: Sin datos pero no es error
4. Inline validation: Errores de formulario
```

---

## 🎯 Flujos de Usuario Principales

### 1. Flujo de Registro y Primer Login

```
1. Usuario llega a Landing Page
2. Click en "Registrarse"
3. Completa formulario de registro
4. Recibe correo de verificación
5. Click en link de verificación
6. Recibe Paquete del Pionero automáticamente
7. Redirigido a Dashboard
8. Puede abrir el paquete desde Inventario
9. Asignar personajes a equipo activo
10. Listo para jugar
```

### 2. Flujo de Abrir Paquete

```
1. Usuario va a Inventario > Paquetes
2. Ve paquete sin abrir
3. Click en "Abrir"
4. Animación de apertura (loading)
5. Modal con resultados:
   - Personajes obtenidos (con rareza)
   - Items obtenidos
   - VAL ganado
6. Mostrar si hubo duplicados (convertidos a VAL)
7. Click "Aceptar"
8. Personajes agregados a colección
9. Notificación de éxito
```

### 3. Flujo de Combate en Mazmorra

```
1. Usuario va a Mazmorras
2. Selecciona una mazmorra disponible
3. Selecciona equipo (hasta 3 personajes)
4. Click "Iniciar Combate"
5. Vista de combate (turnos):
   - Personajes atacan
   - Enemigos contraatacan
   - Mostrar daño, efectos
6. Resultado:
   - Victoria: Recompensas + XP
   - Derrota: Personajes heridos
7. Actualizar stats y progreso
8. Volver a lista de mazmorras
```

### 4. Flujo de Venta en Marketplace

```
1. Usuario va a Marketplace
2. Click en "Vender"
3. Selecciona item de inventario
4. Establece precio en VAL
5. Opción de destacar (+50 VAL)
6. Click "Publicar"
7. Item removido de inventario
8. Listing aparece en marketplace
9. Cuando se vende:
   - Usuario recibe VAL
   - Notificación de venta
   - Item va al comprador
```

---

## 🎨 Paleta de Colores Sugerida

```scss
// Rangos de personajes
$rango-d: #9e9e9e;    // Gris
$rango-c: #4caf50;    // Verde
$rango-b: #2196f3;    // Azul
$rango-a: #9c27b0;    // Púrpura
$rango-s: #ff9800;    // Naranja
$rango-ss: #f44336;   // Rojo
$rango-sss: #ffd700;  // Dorado

// Estados
$success: #4caf50;
$warning: #ff9800;
$danger: #f44336;
$info: #2196f3;

// UI
$primary: #1976d2;
$secondary: #dc004e;
$background: #f5f5f5;
$surface: #ffffff;
$text-primary: #212121;
$text-secondary: #757575;
```

---

## ✅ Checklist de Implementación

- [ ] Landing page con hero section
- [ ] Sistema de navegación top navbar
- [ ] Dashboard con estadísticas
- [ ] Grid de personajes con filtros
- [ ] Detalle de personaje completo
- [ ] Inventario con 3 tabs (Equipamiento, Consumibles, Paquetes)
- [ ] Marketplace con búsqueda y filtros
- [ ] Sistema de ventas
- [ ] Lista de mazmorras
- [ ] Sistema de combate por turnos
- [ ] Perfil de usuario
- [ ] Componentes compartidos (loading, modal, alert, etc.)
- [ ] Animaciones de transición
- [ ] Responsive design (mobile-first)
- [ ] Manejo de estados de carga y error
- [ ] WebSocket para actualizaciones en tiempo real

---

**¡Listo para diseñar tu UI!** 🎨

Esta guía proporciona una visión completa de la estructura visual del frontend.
