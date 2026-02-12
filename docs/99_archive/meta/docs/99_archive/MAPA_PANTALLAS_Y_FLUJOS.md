# ���️ MAPA VISUAL: FLUJO COMPLETO DE PANTALLAS

**Fecha**: 27 de Noviembre de 2025  
**Versión**: 2.0 - Completamente Documentado

---

## ��� DIAGRAMA DE FLUJO USUARIO

```
INICIO (Sin cuenta)
    ↓
PANTALLA 1: REGISTRO
├─ Campos: Email, Password, Confirm
├─ Validaciones: Zod
├─ Endpoint: POST /api/auth/register
└─ Archivo: 01-Autenticacion-Login.md (1,346 líneas)
    ↓
PANTALLA 1B: VERIFICACIÓN OTP
├─ 6 dígitos
├─ Timeout: 5 minutos
├─ Endpoint: POST /api/auth/verify-otp
└─ Archivo: 01-Autenticacion-Login.md
    ↓
PANTALLA 1C: PAQUETE PIONERO
├─ Personaje inicial
├─ 100 VAL
├─ Endpoint: POST /api/auth/accept-pioneer-package
└─ Archivo: 01-Autenticacion-Login.md
    ↓
PANTALLA 1D: LOGIN (O si ya tiene cuenta)
├─ Email + Password
├─ JWT en httpOnly cookie
├─ Endpoint: POST /api/auth/login
└─ Archivo: 01-Autenticacion-Login.md
    ↓
┌─────────────────────────────────────────────────────┐
│ PANTALLA 2: DASHBOARD (PANEL PRINCIPAL)            │
│ Archivo: 03-Perfil-Dashboard.md (1,284 líneas)     │
│                                                      │
│ ELEMENTOS:                                          │
│ • Header: Logo, nombre, nivel                       │
│ • Navegación: 9 opciones                            │
│ • Área principal: Personaje, recursos, acciones     │
│ • Leaderboard mini (top 5)                         │
│ • Noticias recientes                                │
│                                                      │
│ BOTONES PRINCIPALES:                                │
│ [JUGAR RPG] → A | [ENTRAR SURVIVAL] → B            │
│ [VER PERSONAJES] → C | [IR A TIENDA] → D           │
│ ⚔️ Equipamiento → E                                 │
└─────────────────────────────────────────────────────┘
         ↙          ↓          ↘         ↙
        A           B           C        E
        ↓           ↓           ↓        ↓

OPCIÓN A: JUGAR RPG
    ↓
    PANTALLA 3A: SELECCIONAR PERSONAJE (RPG)
    ├─ Lista 1-50 personajes
    ├─ Muestra: Nombre, Nivel, Rango
    ├─ Información del seleccionado
    ├─ Botones: [JUGAR RPG] [ENTRAR SURVIVAL]
    ├─ Endpoint: GET /api/users/characters
    ├─ Endpoint: POST /api/users/characters/{id}/set-active
    └─ Archivo: 14-Flujo-Seleccion...md (953 líneas)
        ↓
    PANTALLA 4: REVISAR EQUIPAMIENTO
    ├─ 4 slots (Cabeza, Cuerpo, Manos, Pies)
    ├─ Mostrar equipo actual
    ├─ Opción para cambiar
    ├─ Stats en vivo
    ├─ Botón [GUARDAR EQUIPO]
    ├─ Endpoint: GET /api/inventory/equipment
    ├─ Endpoint: POST /api/inventory/equipment/save
    └─ Archivo: 04-Inventario-Equipamiento.md (1,139 líneas)
        ↓
    PANTALLA 5A: ENTRAR DUNGEON RPG
    ├─ Combate contra enemigos
    ├─ Usa equipamiento automáticamente
    ├─ Botones: [Atacar] [Defender] [Item]
    ├─ Drops de items al ganar
    ├─ Gana: EXP, VAL, Items
    ├─ Endpoint: POST /api/rpg/battle/start
    └─ Archivo: 00_BACKEND_API_REFERENCE.md (2,042 líneas)
        ↓
    PANTALLA 6A: RESULTADO RPG
    ├─ EXP ganado
    ├─ VAL ganado
    ├─ Items obtenidos
    ├─ Nuevo nivel (si aplica)
    ├─ Botón [VOLVER DASHBOARD]
    └─ Archivo: 00_BACKEND_API_REFERENCE.md
        ↓
    → Vuelve a DASHBOARD (con datos actualizados)


OPCIÓN B: ENTRAR SURVIVAL
    ↓
    PANTALLA 3B: SELECCIONAR PERSONAJE (SURVIVAL)
    ├─ Lista 1-50 personajes (misma que RPG)
    ├─ Muestra: Nombre, Nivel, Rango
    ├─ Información del seleccionado
    ├─ Botones: [JUGAR RPG] [ENTRAR SURVIVAL]
    ├─ Endpoint: GET /api/users/characters
    ├─ Endpoint: POST /api/users/characters/{id}/set-active
    └─ Archivo: 14-Flujo-Seleccion...md (953 líneas)
        ↓
    PANTALLA 5B: PREPARAR SURVIVAL
    ├─ Muestra personaje seleccionado
    ├─ Equipo automático (del personaje)
    ├─ Stats mostrados
    ├─ Opción para cambiar personaje
    ├─ Opción para cambiar equipo
    ├─ Botón [INICIAR SURVIVAL]
    ├─ Endpoint: GET /api/users/me
    └─ Archivo: 23_GUIA_SURVIVAL_MODO_GAME.md (971 líneas)
        ↓
    PANTALLA 5C: OLEADA 1 / 3
    ├─ Enemigos: 3 vs 1
    ├─ Dificultad: ⭐⭐
    ├─ Combate: [Atacar] [Defender] [Item]
    ├─ Puntos: +50 por oleada
    ├─ Botón: [SIGUIENTE OLEADA]
    ├─ Endpoint: POST /api/survival/wave
    └─ Archivo: 23_GUIA_SURVIVAL_MODO_GAME.md
        ↓
    PANTALLA 5D: OLEADA 2 / 3
    ├─ Más enemigos
    ├─ Dificultad: ⭐⭐⭐
    ├─ Puntos: +75
    ├─ Botón: [SIGUIENTE OLEADA]
    └─ Archivo: 23_GUIA_SURVIVAL_MODO_GAME.md
        ↓
    PANTALLA 5E: OLEADA 3 / 3
    ├─ Final
    ├─ Dificultad: ⭐⭐⭐⭐
    ├─ Puntos: +100 (bonus)
    ├─ Botón: [TERMINAR SESIÓN]
    └─ Archivo: 23_GUIA_SURVIVAL_MODO_GAME.md
        ↓
    PANTALLA 6B: RESULTADO SURVIVAL
    ├─ "¡SESIÓN COMPLETADA!"
    ├─ Puntos totales: 225
    ├─ Recompensas:
    │  ├─ 50 EXP
    │  ├─ 200 VAL
    │  ├─ 1x Poción Rara
    │  └─ +50 Survival Points
    ├─ Actualización de stats
    ├─ Botón [VOLVER DASHBOARD]
    ├─ Endpoint: GET /api/survival/session/{id}/results
    └─ Archivo: 23_GUIA_SURVIVAL_MODO_GAME.md
        ↓
    → Vuelve a DASHBOARD (con datos actualizados)


OPCIÓN C: VER PERSONAJES
    ↓
    PANTALLA 3C: MIS PERSONAJES
    ├─ Lista completa de 1-50 personajes
    ├─ Información detallada de cada uno
    ├─ Botones: Seleccionar, Evolucionar, Vender
    ├─ Endpoint: GET /api/users/characters
    └─ Archivo: 14-Flujo-Seleccion...md (953 líneas)


OPCIÓN D: IR A TIENDA
    ↓
    PANTALLA 3D: MARKETPLACE
    ├─ Items disponibles
    ├─ Precios en VAL
    ├─ Comprar/Vender
    ├─ Endpoint: GET /api/marketplace/listings
    └─ (Fuera de este flujo específico)


OPCIÓN E: EQUIPAMIENTO
    ↓
    PANTALLA 4: ARMAR EQUIPAMIENTO
    ├─ 4 slots (Cabeza, Cuerpo, Manos, Pies)
    ├─ Drag & drop desde inventario
    ├─ Click en slot para selector
    ├─ Stats en tiempo real
    ├─ Validación: 4/4 requerido
    ├─ Botón [GUARDAR EQUIPO]
    ├─ Endpoint: GET /api/inventory/items
    ├─ Endpoint: POST /api/inventory/equipment/save
    └─ Archivo: 04-Inventario-Equipamiento.md (1,139 líneas)
        ↓
    → Vuelve a DASHBOARD
```

---

## ��� TABLA DE PANTALLAS

| # | Pantalla | Componente | Archivo | Líneas |
|---|----------|-----------|---------|---------|
| 1A | Registro | RegisterComponent | 01-Autenticacion-Login.md | 1,346 |
| 1B | Verificación OTP | VerifyEmailComponent | 01-Autenticacion-Login.md | 1,346 |
| 1C | Paquete Pionero | PaquetePioneroComponent | 01-Autenticacion-Login.md | 1,346 |
| 1D | Login | LoginComponent | 01-Autenticacion-Login.md | 1,346 |
| 2 | Dashboard | DashboardComponent | 03-Perfil-Dashboard.md | 1,284 |
| 3A | Sel. Personaje (RPG) | CharacterSelectorComponent | 14-Flujo-Seleccion...md | 953 |
| 3B | Sel. Personaje (Survival) | CharacterSelectorComponent | 14-Flujo-Seleccion...md | 953 |
| 3C | Mis Personajes | MyCharactersComponent | 14-Flujo-Seleccion...md | 953 |
| 4 | Armar Equipamiento | EquipmentComponent | 04-Inventario-Equipamiento.md | 1,139 |
| 5A | RPG Dungeon | RPGBattleComponent | 00_BACKEND_API_REFERENCE.md | 2,042 |
| 5B-E | Survival Oleadas | SurvivalWaveComponent | 23_GUIA_SURVIVAL_MODO_GAME.md | 971 |
| 6A | Resultado RPG | ResultComponent | 00_BACKEND_API_REFERENCE.md | 2,042 |
| 6B | Resultado Survival | ResultComponent | 23_GUIA_SURVIVAL_MODO_GAME.md | 971 |

---

## �� INTEGRACIÓN RPG + SURVIVAL

**Documentado en**: `24_INTEGRACION_RPG_SURVIVAL.md` (589 líneas)

```
┌──────────────────────────────────────────────────────┐
│              USER (Datos Compartidos)                │
├──────────────────────────────────────────────────────┤
│ personajeActivoId: "123"      ← MISMO en ambos modos │
│ val: 1500                     ← Compartido           │
│ evo: 50                       ← Compartido           │
│ personajes: [...]             ← Compartidos          │
│                                                      │
│ personaje.equipamiento: [id1, id2, id3, id4]        │
│                    ↓                                 │
│                SE USA EN:                            │
│        RPG ════════════════ Survival                │
│        (Mismo equipo)    (Mismo equipo)             │
│        (Mismos stats)    (Mismos stats)             │
│        (Mismos items)    (Mismos items)             │
│                                                      │
│ Recursos generados:                                 │
│ RPG → +EXP, +VAL, +Items  ↓  Survival             │
│                   TODO COMPARTIDO                    │
└──────────────────────────────────────────────────────┘
```

---

## ✅ RESUMEN DE COBERTURA

- ✅ **12 pantallas/fases mapeadas**
- ✅ **6 documentos principales** (9,328 líneas)
- ✅ **4 documentos de soporte** (3,684 líneas)
- ✅ **65+ endpoints mapeados**
- ✅ **100% del flujo del usuario documentado**
- ✅ **Integración RPG-Survival completa**

---

**LISTO PARA DESARROLLO FRONTEND**

