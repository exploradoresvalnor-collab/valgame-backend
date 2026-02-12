# 📖 GLOSARIO - Términos y Conceptos de Valgame

**Última actualización:** 20 de noviembre de 2025

---

## 🎮 CONCEPTO GENERAL

### Valgame
Juego de rol estratégico por turnos con elementos Gacha, donde los jugadores coleccionan personajes, los equipan y los hacen combatir en mazmorras para ganar recompensas.

### Gacha System
Sistema de obtención aleatoria de personajes e items, inspirado en juegos como Genshin Impact y Honkai Star Rail.

---

## 👥 ENTIDADES PRINCIPALES

### Usuario (User)
Entidad principal que representa a un jugador registrado en el sistema.

**Campos importantes:**
- `email`: Email único para autenticación
- `username`: Nombre de usuario único
- `val`: Moneda principal del juego
- `evo`: Moneda premium para evolución
- `energia`: Puntos de acción limitados
- `inventarioPersonajes`: Lista de personajes
- `inventarioEquipamiento`: Items de equipamiento
- `inventarioConsumibles`: Pociones y consumibles

### Personaje (Character)
Entidad combatiente controlada por el usuario.

**Campos importantes:**
- `baseCharacterId`: Referencia al personaje base
- `nivel`: Nivel de progreso (1-100)
- `experiencia`: XP acumulada
- `hp_actual/maximo`: Vida actual/máxima
- `ataque_base/defensa_base`: Stats base
- `equipamiento`: Items equipados
- `estado`: saludable/herido
- `etapa_evolucion`: Nivel de evolución (1-4)
- `puede_evolucionar`: Flag para evolución disponible

### Personaje Base (BaseCharacter)
Plantilla inmutable que define las características base de un personaje.

**Campos importantes:**
- `nombre`: Nombre del personaje
- `rareza`: comun/raro/epico/legendario
- `tipo`: Guerrero/Mago/Tanque/Asesino
- `stats_base`: HP, ataque, defensa base
- `imagen`: URL de la imagen
- `descripcion`: Lore del personaje

---

## 💰 SISTEMA ECONÓMICO

### VAL
**Moneda principal** del juego, obtenida principalmente del combate.

- **Obtención:** Mazmorras, ranking semanal, marketplace
- **Uso:** Curación, compra de tickets, marketplace
- **Límite:** Sin límite superior

### EVO (Evolución)
**Moneda premium** para evolucionar personajes.

- **Obtención:** Mazmorras difíciles, eventos, compras
- **Uso:** Evolución de personajes (3, 5, 8 EVO por etapa)
- **Límite:** Sin límite superior

### Energía
**Puntos de acción** limitados que se regeneran automáticamente.

- **Máximo:** 100 puntos (configurable)
- **Regeneración:** 1 punto cada 30 minutos
- **Consumo:** Mazmorras (5), Curación (2), Evolución (10)
- **Reinicio:** A medianoche UTC

### Boletos (Tickets)
**Permisos diarios** para entrar a mazmorras.

- **Diario:** 10 boletos (regeneran diariamente)
- **Compra adicional:** Con VAL
- **Uso:** Una mazmorra por boleto

---

## ⚔️ SISTEMA DE COMBATE

### Mazmorra (Dungeon)
Instancia de combate contra enemigos.

**Tipos:**
- **Normal:** Recompensas estándar
- **Difícil:** Más VAL/EVO, mejor loot
- **Boss:** Alta dificultad, mejores recompensas

**Requerimientos:**
- Personaje con HP > 0
- Energía suficiente (5 puntos)
- Boleto disponible

### Combate
Sistema de combate por turnos.

**Fases:**
1. **Inicio:** Verificación de requerimientos
2. **Combate:** Cálculo automático de daño
3. **Resultado:** Victoria/derrota
4. **Recompensas:** VAL, EVO, XP, items

### Estados de Personaje
- **saludable:** Puede combatir normalmente
- **herido:** No puede combatir, necesita resurrección

---

## 🎒 INVENTARIO Y EQUIPAMIENTO

### Equipamiento (Equipment)
Items que mejoran las stats de los personajes.

**Tipos:**
- **Arma:** + Ataque
- **Armadura:** + Defensa + HP
- **Accesorio:** Bonus variados

**Slots:** Un personaje puede equipar máximo 1 de cada tipo.

### Consumibles
Items de un solo uso.

**Tipos principales:**
- **Poción de Vida Menor:** +20 HP (usos_restantes: 1)
- **Poción de Vida Mayor:** +50 HP (usos_restantes: 1)

**Auto-eliminación:** Se eliminan automáticamente cuando usos_restantes = 0.

---

## 🏆 SISTEMA DE RANKING

### Ranking Global
Clasificación de todos los jugadores por puntos acumulados.

**Cálculo de puntos:**
- **Victoria en mazmorra:** +10 puntos
- **Derrota en mazmorra:** +1 punto (consolación)

### Ranking por Período
- **Global:** Todos los tiempos
- **Semanal:** Reset cada lunes
- **Mensual:** Reset primer día del mes

### Estadísticas de Ranking
- `puntos`: Puntuación total
- `victorias`: Mazmorras completadas
- `derrotas`: Mazmorras fallidas
- `boletosUsados`: Total de boletos consumidos
- `ultimaPartida`: Timestamp de última actividad

---

## 🏪 MARKETPLACE

### Listing
Publicación de venta de un item.

**Campos:**
- `item`: Item a vender (equipamiento/consumible)
- `precio`: Precio en VAL
- `vendedorId`: Usuario que vende
- `compradorId`: Usuario que compra (null hasta venderse)
- `estado`: activo/vendido/cancelado
- `fechaExpiracion`: 7 días desde creación

### Transacción
Proceso de compra/venta.

**Flujo:**
1. Usuario crea listing
2. Otro usuario compra
3. Transferencia atómica: VAL y item
4. Listing marcado como vendido

---

## 🔐 AUTENTICACIÓN Y SEGURIDAD

### JWT (JSON Web Token)
Token de autenticación firmado.

- **Expira:** 7 días
- **Almacenamiento:** Cookie httpOnly (no accesible por JavaScript)
- **Refresh:** Automático con cada petición válida

### Cookies HttpOnly
Cookies que no pueden ser leídas por JavaScript del navegador.

**Ventajas:**
- Anti-XSS (robo de tokens)
- Anti-CSRF (falsificación de peticiones)
- Automáticas (navegador las envía)

### Token Blacklist
Lista de tokens revocados (logout).

- **Almacenamiento:** Colección MongoDB
- **Expiración:** Automática (igual que JWT)
- **Verificación:** Middleware en cada petición

---

## 📧 SISTEMA DE EMAIL

### Gmail SMTP
Servicio de envío de emails reales.

**Configuración:**
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=app-password-de-gmail
```

### Tipos de Email
- **Verificación de registro:** Enlace de activación
- **Recuperación de contraseña:** Enlace de reset (1 hora)
- **Reenvío de verificación:** Nuevo enlace de activación

---

## 🗄️ BASE DE DATOS

### MongoDB
Base de datos NoSQL utilizada.

**Colecciones principales:**
- `users`: Usuarios del sistema
- `characters`: Personajes de jugadores
- `basecharacters`: Plantillas de personajes
- `dungeons`: Definiciones de mazmorras
- `rankings`: Sistema de puntuación
- `marketplacelistings`: Publicaciones de marketplace
- `tokenblacklist`: Tokens revocados

### Operaciones Atómicas
Transacciones que garantizan consistencia.

**Ejemplos:**
- Transferencia de VAL en marketplace
- Consumo de energía
- Actualización de inventario

---

## 🚀 DEPLOYMENT

### Render.com
Plataforma de hosting utilizada.

**Configuración:**
- **Runtime:** Node.js
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Environment:** Variables en dashboard

### Variables de Producción
```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=secret_produccion_seguro
SMTP_*=configuracion_email
```

---

## 🧪 TESTING

### Jest
Framework de testing utilizado.

**Tipos de test:**
- **Unitarios:** Funciones individuales
- **Integración:** Endpoints API
- **E2E:** Flujos completos de usuario

### Thunder Client (VS Code)
Extensión para testing manual de APIs.

**Uso:** Tests guardados en `/tests/api/*.http`

---

## 📱 RESPONSIVE DESIGN

### Breakpoints
Puntos de quiebre para diseño responsive.

- **Mobile:** < 768px
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px

### Landscape Mode
Modo horizontal en móviles.

**Consideraciones:**
- Teclados virtuales
- Espacio limitado de altura
- Orientación de elementos

---

## 🎨 UI/UX CONCEPTOS

### Design System
Sistema de diseño consistente.

**Elementos:**
- **Colores:** Paleta Valnor (azules, dorados)
- **Tipografía:** Roboto, tamaños escalables
- **Espaciado:** Sistema de 4px (4, 8, 12, 16, 24, 32...)
- **Componentes:** Botones, cards, modales reutilizables

### Gamification
Elementos de juego en la interfaz.

- **Progreso visual:** Barras de XP, energía
- **Feedback:** Animaciones de éxito/error
- **Recompensas:** Notificaciones de loot
- **Estados:** Visuales para saludable/herido

---

## 🔧 HERRAMIENTAS DE DESARROLLO

### VS Code Extensions
- **Thunder Client:** Testing de APIs
- **MongoDB for VS Code:** Exploración de BD
- **Prettier:** Formateo de código
- **ESLint:** Linting de código

### Scripts NPM
```bash
npm run dev      # Desarrollo con nodemon
npm start        # Producción
npm test         # Ejecutar tests
npm run lint     # Verificar código
```

---

## 📊 MÉTRICAS Y ANALYTICS

### KPIs del Juego
- **Retention Rate:** Usuarios que regresan
- **Average Session:** Tiempo promedio de sesión
- **Conversion Rate:** Compras premium
- **Churn Rate:** Usuarios que abandonan

### Technical Metrics
- **Response Time:** Latencia de API
- **Error Rate:** Porcentaje de errores
- **Uptime:** Disponibilidad del servicio
- **Database Performance:** Queries por segundo

---

## 🚀 ROADMAP Y FUTURO

### Fase Actual (v3.0)
- Sistema de energía completo
- Mejoras económicas balanceadas
- Marketplace P2P funcional
- Ranking competitivo

### Próximas Fases
- **Auto-battle:** Combate automático
- **PVP Simulado:** Combate entre jugadores
- **PVP Real-time:** Combate en tiempo real
- **Gremios:** Sistema social
- **Arena:** Torneos competitivos

---

## ❓ PREGUNTAS FRECUENTES

### ¿Cómo obtengo más VAL?
- Completando mazmorras
- Vendiendo items en marketplace
- Ranking semanal
- Eventos especiales

### ¿Cómo recupero mi contraseña?
- Botón "Olvidé mi contraseña" en login
- Recibirás email con enlace de reset
- Enlace válido por 1 hora

### ¿Qué pasa si pierdo todos mis boletos?
- Espera regeneración diaria (medianoche UTC)
- O compra boletos adicionales con VAL

### ¿Puedo transferir personajes?
- No directamente
- Pero puedes vender equipamiento en marketplace
- Personajes son únicos por usuario

---

**📅 Última actualización:** 20 de noviembre de 2025  
**👥 Mantenedor:** Equipo Valgame  
**📖 Referencia:** Ver también `API_REFERENCE_COMPLETA.md` para detalles técnicos</content>
<parameter name="filePath">c:\Users\Haustman\Desktop\valgame-backend\docs_reorganizada\00_INICIO\GLOSARIO.md