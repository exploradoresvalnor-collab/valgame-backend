# 🎨 ESTRUCTURA VISUAL DEL FRONTEND

## 📱 ARQUITECTURA DE NAVEGACIÓN

```
┌─────────────────────────────────────────────┐
│     PÚBLICO (Sin autenticación)             │
├─────────────────────────────────────────────┤
│  / (Landing Page)                           │
│  /auth/login                                │
│  /auth/register                             │
└─────────────────────────────────────────────┘
                    ↓ LOGIN SUCCESS
┌─────────────────────────────────────────────┐
│     PRIVADO (Con autenticación JWT)         │
├─────────────────────────────────────────────┤
│  /dashboard (Home del usuario)              │
│  /characters (Gestión de personajes)        │
│  /inventory (Inventario de items)           │
│  /marketplace (Compra/Venta)                │
│  /dungeons (Exploración)                    │
│  /profile (Perfil de usuario)               │
│  /wallet (Gestión de VAL/USDT)              │
└─────────────────────────────────────────────┘
```

---

## 🏠 LANDING PAGE (/) - ANTES DEL LOGIN

### Header / Navigation
```
┌──────────────────────────────────────────────────────────┐
│  🎮 VALNOR                [Jugar] [Login] [Registro]     │
└──────────────────────────────────────────────────────────┘
```

### Hero Section
```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│           🗡️ BIENVENIDO A VALNOR 🛡️                    │
│                                                          │
│      Explora mazmorras, colecciona personajes           │
│           y comercia en el marketplace                  │
│                                                          │
│        [🎮 Comenzar Ahora]  [📖 Ver Demo]               │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Features Section
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│             │             │             │             │
│  🗡️ COMBATE │ 💎 MERCADO  │ 🎁 PAQUETES │ 🏆 RANKING  │
│             │             │             │             │
│  Explora    │ Compra y    │ Abre cajas  │ Compite con │
│  mazmorras  │ vende items │ misteriosas │ jugadores   │
│             │             │             │             │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

### Call to Action
```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│          ¿Listo para comenzar tu aventura?              │
│                                                          │
│              [🚀 Crear Cuenta Gratis]                    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Footer
```
┌──────────────────────────────────────────────────────────┐
│  © 2025 Valnor | Contacto | Términos | Privacidad      │
└──────────────────────────────────────────────────────────┘
```

---

## 🔐 LOGIN PAGE (/auth/login)

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│                    🎮 VALNOR                             │
│                                                          │
│                 Iniciar Sesión                           │
│                                                          │
│  ┌────────────────────────────────────────────────┐     │
│  │ 📧 Email                                       │     │
│  │ [tu@email.com________________________]         │     │
│  └────────────────────────────────────────────────┘     │
│                                                          │
│  ┌────────────────────────────────────────────────┐     │
│  │ 🔒 Contraseña                                  │     │
│  │ [••••••••••••••••••••••••••••_______]         │     │
│  └────────────────────────────────────────────────┘     │
│                                                          │
│  [ ] Recordarme        [¿Olvidaste tu contraseña?]      │
│                                                          │
│              [🚀 Iniciar Sesión]                         │
│                                                          │
│           ¿No tienes cuenta? [Regístrate]               │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 📝 REGISTER PAGE (/auth/register)

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│                    🎮 VALNOR                             │
│                                                          │
│                   Crear Cuenta                           │
│                                                          │
│  ┌────────────────────────────────────────────────┐     │
│  │ 👤 Nombre de usuario                          │     │
│  │ [jugador123_________________________]         │     │
│  └────────────────────────────────────────────────┘     │
│                                                          │
│  ┌────────────────────────────────────────────────┐     │
│  │ 📧 Email                                       │     │
│  │ [tu@email.com________________________]         │     │
│  └────────────────────────────────────────────────┘     │
│                                                          │
│  ┌────────────────────────────────────────────────┐     │
│  │ 🔒 Contraseña (mín 8 caracteres)              │     │
│  │ [••••••••••••••••••••••••••••_______]         │     │
│  └────────────────────────────────────────────────┘     │
│                                                          │
│  ┌────────────────────────────────────────────────┐     │
│  │ 🔒 Confirmar Contraseña                        │     │
│  │ [••••••••••••••••••••••••••••_______]         │     │
│  └────────────────────────────────────────────────┘     │
│                                                          │
│  [✓] Acepto los términos y condiciones                  │
│                                                          │
│              [🎉 Crear Cuenta]                           │
│                                                          │
│           ¿Ya tienes cuenta? [Inicia Sesión]            │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 🏡 DASHBOARD (/dashboard) - DESPUÉS DEL LOGIN

### Main Layout
```
┌──────────────────────────────────────────────────────────┐
│  🎮 VALNOR  [Dashboard] [Personajes] [Marketplace] 👤   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Bienvenido, Jugador123! 👋                              │
│                                                          │
│  ┌─────────────────┬─────────────────┬────────────────┐ │
│  │  💰 Balance     │  🗡️ Personajes  │  📦 Paquetes   │ │
│  │  1,500 VAL      │  12 / 20        │  3 sin abrir   │ │
│  └─────────────────┴─────────────────┴────────────────┘ │
│                                                          │
│  ⚡ Acciones Rápidas                                     │
│  ┌──────────────┬──────────────┬──────────────┐        │
│  │ 🛒 Comprar   │ 🎁 Abrir     │ ⚔️ Mazmorra   │        │
│  │   Paquetes   │  Paquetes    │              │        │
│  └──────────────┴──────────────┴──────────────┘        │
│                                                          │
│  📊 Actividad Reciente                                   │
│  ┌────────────────────────────────────────────────┐     │
│  │ • Abriste Paquete "Adventure" - hace 2h       │     │
│  │ • Vendiste "Espada de Fuego" - hace 5h        │     │
│  │ • Completaste Mazmorra "Nivel 1" - ayer       │     │
│  └────────────────────────────────────────────────┘     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 🗡️ CHARACTERS PAGE (/characters)

```
┌──────────────────────────────────────────────────────────┐
│  🎮 VALNOR  [Dashboard] [Personajes] [Marketplace] 👤   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  MIS PERSONAJES (12/20)                  [+ Comprar]    │
│                                                          │
│  Filtros: [Todos ▼] [Rango ▼] [Nombre 🔍]              │
│                                                          │
│  ┌──────────┬──────────┬──────────┬──────────┐         │
│  │ 🦁       │ ⚔️       │ 🛡️       │ 🏹       │         │
│  │ León     │ Guerrero │ Guardián │ Arquero  │         │
│  │ Nivel 15 │ Nivel 12 │ Nivel 10 │ Nivel 8  │         │
│  │ Rango: A │ Rango: B │ Rango: B │ Rango: C │         │
│  │ [Ver]    │ [Ver]    │ [Ver]    │ [Ver]    │         │
│  └──────────┴──────────┴──────────┴──────────┘         │
│                                                          │
│  [Más personajes...]                                     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Character Detail Modal
```
┌──────────────────────────────────────────────┐
│                    [X]                        │
│         🦁 LEÓN - Nivel 15                    │
│                                              │
│  ┌──────────────────────────────────┐       │
│  │   [Imagen del personaje]         │       │
│  └──────────────────────────────────┘       │
│                                              │
│  Rango: A (⭐⭐⭐⭐)                         │
│  HP: 450/500                                │
│  ATK: 85                                    │
│  DEF: 60                                    │
│  EXP: 2,450/3,000                           │
│                                              │
│  Habilidades:                               │
│  • Rugido Intimidante (Reduce ATK enemigo)  │
│  • Zarpazo Feroz (Daño crítico x2)          │
│                                              │
│  [⚔️ Enviar a Mazmorra]  [💼 Vender]        │
│                                              │
└──────────────────────────────────────────────┘
```

---

## 🛒 MARKETPLACE PAGE (/marketplace)

```
┌──────────────────────────────────────────────────────────┐
│  🎮 VALNOR  [Dashboard] [Personajes] [Marketplace] 👤   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  MARKETPLACE - Compra y Vende                           │
│                                                          │
│  [Personajes] [Items] [Paquetes]     [🔍 Buscar...]    │
│                                                          │
│  Filtros:                                               │
│  Tipo: [Todos ▼] Rango: [Todos ▼] Precio: [▼]          │
│                                                          │
│  ┌──────────┬──────────┬──────────┬──────────┐         │
│  │ 🗡️       │ 🛡️       │ 🦁       │ ⚡       │         │
│  │ Espada   │ Escudo   │ León     │ Poción   │         │
│  │ de Fuego │ Divino   │ Salvaje  │ de Vida  │         │
│  │          │          │          │          │         │
│  │ 500 VAL  │ 1,200VAL │ 3,500VAL │ 50 VAL   │         │
│  │ [Comprar]│ [Comprar]│ [Comprar]│ [Comprar]│         │
│  └──────────┴──────────┴──────────┴──────────┘         │
│                                                          │
│  📊 Últimas Transacciones:                              │
│  • @usuario1 vendió "Dragón Rojo" por 5,000 VAL         │
│  • @usuario2 compró "Armadura Legendaria" por 2,500 VAL │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 🎁 PACKAGES PAGE (/dashboard - sección paquetes)

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  TIENDA DE PAQUETES                                      │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │  🥚 HUEVO BÁSICO                                │    │
│  │  1 Personaje aleatorio                          │    │
│  │  Probabilidades: C(50%), B(30%), A(15%), S(5%) │    │
│  │                                                 │    │
│  │  💰 1,000 VAL  ($2 USDT)     [Comprar]         │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │  ⚔️ ADVENTURE                                    │    │
│  │  5 Personajes aleatorios                        │    │
│  │  Probabilidades mejoradas                       │    │
│  │                                                 │    │
│  │  💰 5,000 VAL  ($10 USDT)    [Comprar]         │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  [Ver más paquetes...]                                   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Opening Package Animation
```
┌──────────────────────────────────────────────┐
│                                              │
│         ✨ ABRIENDO PAQUETE ✨              │
│                                              │
│  ┌──────────────────────────────────┐       │
│  │   [Animación de caja girando]    │       │
│  └──────────────────────────────────┘       │
│                                              │
│              [Click para abrir]             │
│                                              │
└──────────────────────────────────────────────┘

       ↓ DESPUÉS DEL CLICK ↓

┌──────────────────────────────────────────────┐
│                                              │
│         🎉 ¡FELICIDADES! 🎉                 │
│                                              │
│      Has obtenido:                          │
│                                              │
│  ┌──────────────────────────────────┐       │
│  │   🦅 ÁGUILA DORADA                │       │
│  │   Rango: A ⭐⭐⭐⭐                │       │
│  │   HP: 400 | ATK: 90 | DEF: 45    │       │
│  └──────────────────────────────────┘       │
│                                              │
│  [Abrir otro]  [Ver Personaje]  [Cerrar]   │
│                                              │
└──────────────────────────────────────────────┘
```

---

## ⚔️ DUNGEONS PAGE (/dungeons)

```
┌──────────────────────────────────────────────────────────┐
│  🎮 VALNOR  [Dashboard] [Personajes] [Marketplace] 👤   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  MAZMORRAS DISPONIBLES                                   │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │  🌲 BOSQUE OSCURO                               │    │
│  │  Nivel recomendado: 1-5                         │    │
│  │  Recompensas: 100-200 VAL, Items comunes       │    │
│  │  Estado: Desbloqueada ✓                         │    │
│  │                                                 │    │
│  │  [⚔️ Explorar]                                  │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │  🏔️ MONTAÑA HELADA                              │    │
│  │  Nivel recomendado: 6-10                        │    │
│  │  Recompensas: 300-500 VAL, Items raros         │    │
│  │  Estado: Bloqueada 🔒 (Completa Bosque Oscuro) │    │
│  │                                                 │    │
│  │  [🔒 Bloqueada]                                 │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 👤 PROFILE PAGE (/profile)

```
┌──────────────────────────────────────────────────────────┐
│  🎮 VALNOR  [Dashboard] [Personajes] [Marketplace] 👤   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  MI PERFIL                                               │
│                                                          │
│  ┌──────────────────────────────────────┐               │
│  │  👤 jugador123                      │               │
│  │  📧 player@example.com              │               │
│  │  🎮 Miembro desde: 23 Oct 2025      │               │
│  │  ⭐ Nivel: 15 (2,450/3,000 EXP)     │               │
│  └──────────────────────────────────────┘               │
│                                                          │
│  💰 Balance:                                             │
│  ┌──────────────────────────────────────┐               │
│  │  VAL:  1,500                        │               │
│  │  USDT: $25.00                       │               │
│  │                                     │               │
│  │  [💳 Comprar VAL]  [💸 Retirar]    │               │
│  └──────────────────────────────────────┘               │
│                                                          │
│  📊 Estadísticas:                                        │
│  • Personajes coleccionados: 12/50                      │
│  • Mazmorras completadas: 8                             │
│  • Transacciones en Marketplace: 15                     │
│  • Paquetes abiertos: 23                                │
│                                                          │
│  [⚙️ Configuración]  [🚪 Cerrar Sesión]                │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 🎨 PALETA DE COLORES RECOMENDADA

```css
:root {
  /* Primarios */
  --primary-dark: #1a1a2e;      /* Fondo principal oscuro */
  --primary-blue: #0f3460;      /* Azul profundo */
  --accent-red: #e94560;        /* Rojo vibrante (botones) */
  --accent-gold: #ffd700;       /* Dorado (premium) */
  
  /* Secundarios */
  --bg-card: #16213e;           /* Fondo de tarjetas */
  --text-primary: #ffffff;      /* Texto principal */
  --text-secondary: #a8a8a8;    /* Texto secundario */
  
  /* Rangos de rareza */
  --rarity-common: #9e9e9e;     /* Común - Gris */
  --rarity-uncommon: #4caf50;   /* No común - Verde */
  --rarity-rare: #2196f3;       /* Raro - Azul */
  --rarity-epic: #9c27b0;       /* Épico - Púrpura */
  --rarity-legendary: #ff9800;  /* Legendario - Naranja */
  --rarity-mythic: #f44336;     /* Mítico - Rojo */
  
  /* Estados */
  --success: #4caf50;
  --warning: #ff9800;
  --error: #f44336;
  --info: #2196f3;
}
```

---

## 📱 RESPONSIVE DESIGN

### Mobile (< 768px)
- Navegación hamburger
- Cards en columna única
- Botones full-width

### Tablet (768px - 1024px)
- Grid de 2 columnas
- Sidebar colapsable

### Desktop (> 1024px)
- Grid de 3-4 columnas
- Sidebar fija
- Hover effects

---

## 🚀 ANIMACIONES CLAVE

1. **Fade In:** Al cargar componentes
2. **Slide In:** Modales y sidebars
3. **Bounce:** Al abrir paquetes
4. **Shake:** Al recibir daño en combate
5. **Glow:** Items legendarios
6. **Pulse:** Botones de acción principales

---

## ✅ PRÓXIMOS PASOS

1. **Wireframes detallados** de cada página
2. **Prototipo interactivo** en Figma
3. **Implementación** componente por componente
4. **Testing de UX** con usuarios

---

**Backend URL:** https://valgame-backend.onrender.com

**Siguiente documento:** `10_GUIA_IMPLEMENTACION_PASO_A_PASO.md`
