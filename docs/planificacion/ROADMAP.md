# ROADMAP - Valgame Backend

## SECCIÓN 1: INFRAESTRUCTURA Y SEGURIDAD

### 1. Sistema Avanzado de Manejo de Errores ✅
**Objetivo:** Implementar un sistema robusto de manejo de errores que mejore la debuggabilidad y la experiencia del usuario.

**Componentes Implementados:**
- [x] Jerarquía de errores específicos por dominio
  - `GameError` como clase base
  - Subclases especializadas: `AuthError`, `ValidationError`, `ResourceError`
  - Cada error incluye código, mensaje y detalles técnicos

- [x] Sistema de logging mejorado
  - Logs estructurados en JSON
  - Niveles de log configurables (DEBUG, INFO, WARN, ERROR)
  - Rotación automática de logs
  - Integración con sistemas de monitoreo

- [x] Manejo de errores por tipo
  - Errores de base de datos con reintentos automáticos
  - Errores de autenticación con mensajes seguros
  - Errores de lógica de juego con feedback claro

- [x] Respuestas consistentes
  - Formato JSON estandarizado
  - Códigos HTTP apropiados
  - Mensajes amigables para el usuario
  - Stack traces en desarrollo

**Notas de Implementación:**
- Los errores de juego se muestran en la UI con animaciones suaves
- Los errores críticos disparan alertas al equipo de desarrollo
- Sistema preparado para internacionalización (i18n)

### 2. Sistema de Validación con Zod ✅
**Objetivo:** Garantizar la integridad de los datos en toda la aplicación.

**Validaciones Implementadas:**
- [x] Esquemas para todas las entidades
  - Modelos de MongoDB con validación previa
  - DTOs para las APIs
  - Configuraciones del juego

- [x] Validaciones específicas de juego
  - Rangos de stats (ATK, DEF, HP)
  - Niveles y experiencia
  - Economía y balanceo

- [x] Validación de IDs y Referencias
  - ObjectIds de MongoDB
  - Referencias entre colecciones
  - Integridad referencial

- [x] Rangos y Límites
  - Inventario máximo
  - Límites de nivel
  - Costos y recompensas

**Notas Técnicas:**
- Validación en tiempo real en el cliente
- Cacheo de schemas para mejor rendimiento
- Errores de validación localizados

### 3. Rate Limiting y Protección ✅
**Objetivo:** Proteger la infraestructura y mantener la equidad del juego.

**Sistema de Límites:**
- [x] Límites por tipo de acción
  - Auth: 5 intentos/15min
  - Acciones rápidas: 30/min
  - Acciones lentas: 10/5min

- [x] Protección contra spam
  - Cooldowns en acciones de juego
  - Detección de patrones sospechosos
  - Sistema de penalizaciones graduales

- [x] Límites del marketplace
  - Listados máximos por usuario
  - Frecuencia de transacciones
  - Protección contra manipulación

- [x] Configuración por ruta
  - Límites personalizables
  - Bypass para APIs autorizadas
  - Monitoreo en tiempo real

**Notas de Seguridad:**
- Los límites se aplican por IP y por cuenta
- Sistema de whitelisting para IPs confiables
- Alertas automáticas por excesos
- Integración con sistema anti-botting

## SECCIÓN 2: ARQUITECTURA BASE DEL JUEGO

### ÉPICA 1: Sistema de Datos Fundamentales ✅
**Objetivo:** Establecer las estructuras de datos base necesarias para el funcionamiento del juego.

**1. Sistema de Items y Consumibles**
- [x] Campo `usos_maximos` en `Consumable.ts`
  - Permite items con durabilidad limitada
  - Sistema de deterioro progresivo
  - Notificaciones de uso restante
  - **UI:** Barra de durabilidad visible
  - **Juego:** Destrucción automática al agotar usos

**2. Sistema de Inventario Mejorado**
- [x] Refactorización del inventario en `User.ts`
  - Soporte para items con estado
  - Sistema de límites dinámicos
  - Gestión de peso/espacio
  - **UI:** Grid con drag & drop
  - **Juego:** Auto-organización y filtros

**3. Integración Web3**
- [x] Campo `walletAddress` en `User.ts`
  - Conexión con carteras crypto
  - Verificación de propiedad
  - Sistema de recompensas on-chain
  - **Web:** Integración con MetaMask
  - **Juego:** Assets verificables en blockchain

**Notas Técnicas:**
- Todos los cambios incluyen migración de datos
- Sistema de backup automático pre-migración
- Documentación de APIs actualizada

---

## SECCIÓN 3: SISTEMAS DE JUEGO CORE

### MILESTONE 1: CICLO DE JUEGO BÁSICO ✅
**Objetivo:** Implementar el bucle fundamental de gameplay que mantiene a los jugadores comprometidos.

**1. Sistema de Onboarding**
- [x] Paquete del Pionero Automático
  - Ruta: `POST /auth/register`
  - Asignación automática de personaje Rango D
  - Monedas VAL iniciales
  - Kit de supervivencia básico
  - **UI:** Tutorial interactivo
  - **Web:** Página de bienvenida personalizada

**2. Mecánicas de Supervivencia**
- [x] Sistema de Curación
  - Ruta: `POST /api/characters/:characterId/heal`
  - Costo en VAL basado en HP faltante
  - Animaciones de curación
  - **UI:** Barras de vida con degradado
  - **Juego:** Efectos visuales de curación

- [x] Sistema de Resurrección
  - Ruta: `POST /api/characters/:characterId/revive`
  - Penalizaciones balanceadas
  - Tiempo de espera estratégico
  - **UI:** Pantalla especial de muerte
  - **Juego:** Efectos dramáticos de resurreción

**3. Sistema de Recompensas**
- [x] Gestión de Botín
  - Persistencia automática de loot
  - Distribución balanceada
  - Drops especiales
  - **UI:** Animación de items conseguidos
  - **Juego:** Efectos de brillo en items raros

**4. Sistema de Evolución**
- [x] Progresión de Personajes
  - Ruta: `POST /api/characters/:characterId/evolve`
  - Verificación de requisitos
  - Costos en VAL y EVO
  - **UI:** Previsualización de evolución
  - **Juego:** Secuencia especial de evolución

**Notas de Diseño:**
- Todas las acciones tienen feedback inmediato
- Sistema de logros integrado
- Métricas de engagement implementadas
- Balance ajustable en tiempo real

---

### SISTEMA DE INICIALIZACIÓN DE DATOS ✅

**Objetivo:** Garantizar que el juego tenga todos los datos necesarios para funcionar correctamente desde el primer inicio.

**1. Script de Seed Automatizado**
- [x] Implementación Base
  - Archivo: `src/seed.ts`
  - Ejecución: `npm run seed`
  - Verificación automática de existencia
  - Logging detallado del proceso

**2. Datos Fundamentales**
- [x] Items Iniciales
  - Poción de Vida (ID: `68dc525adb5c735854b5659d`)
  - Stats balanceados para principiantes
  - Descripción y tutorial de uso
  - **UI:** Icono especial de item inicial
  - **Juego:** Tutorial de uso integrado

- [x] Personaje Base
  - Rango D (ID: `base_d_001`)
  - Stats equilibrados para nuevos jugadores
  - Historia de origen incluida
  - **UI:** Modelo 3D especial
  - **Juego:** Tutorial de habilidades

- [x] Paquete de Inicio
  - "Paquete del Pionero"
  - Contenido balanceado
  - Instrucciones de uso
  - **Web:** Página de desempaque
  - **Juego:** Animación de apertura

**Verificación del Sistema**
```bash
# Ejecución Local
node -r dotenv/config src/seed.ts

# Verificación en MongoDB
db.items.find({_id:ObjectId('68dc525adb5c735854b5659d')})
db.base_characters.find({descripcion_rango:'D'})
```

**Notas de Implementación:**
- Sistema de rollback en caso de error
- Verificación de integridad de datos
- Logs detallados de cada operación
- Herramienta de diagnóstico incluida

---

## SECCIÓN 4: ECONOMÍA DEL JUEGO

### MILESTONE 2: ECONOMÍA P2P (Jugador a Jugador)
**Objetivo:** Crear un ecosistema económico vibrante y autosostenible dirigido por los jugadores.

**1. Sistema de Marketplace** ✅
- [x] Infraestructura Base
  - Servicio: `MarketplaceService`
  - Modelo `Listing` implementado
  - Sistema de transacciones seguro
  - Impuesto del 5% en ventas
  - Sistema de listings destacados
  - **Web:** API REST completa
  - **Juego:** Notificaciones RT

- [x] Gestión de Listados
  - POST `/api/marketplace/listings`
  - GET `/api/marketplace/listings`
  - POST `/api/marketplace/listings/:id/buy`
  - POST `/api/marketplace/listings/:id/cancel`
  - Validaciones Zod
  - Manejo de tipos de items
  - Sistema de metadata flexible
  - **Web:** Filtros avanzados
  - **Juego:** Estado en tiempo real

- [x] Sistema de Transacciones
  - Transacciones atómicas
  - Validación de propiedad
  - Control de VAL
  - Manejo de inventario
  - Sistema de destacados
  - Devolución proporcional
  - **Web:** API documentada
  - **Juego:** Eventos RT

**Próximas Mejoras:**
1. Sistema de Ofertas
  - Ofertas en items listados
  - Negociación de precios
  - Ofertas por tiempo limitado
  - **Web:** Panel de ofertas
  - **Juego:** Notificaciones

2. Sistema de Subastas
  - Items especiales en subasta
  - Pujas automáticas
  - Tiempo límite dinámico
  - **Web:** Sala de subastas
  - **Juego:** Eventos especiales

3. Análisis de Mercado
  - Historial de precios
  - Tendencias del mercado
  - Recomendaciones de precio
  - **Web:** Gráficos y stats
  - **Juego:** Consejos in-game

4. Sistema de Reputación
  - Calificaciones de vendedores
  - Historial de transacciones
  - Niveles de confianza
  - **Web:** Perfiles públicos
  - **Juego:** Badges especiales

**Notas Económicas:**
- Mecanismos anti-inflación
- Sistema de impuestos variable
- Monitoreo de economía
- Herramientas de moderación

---

## SECCIÓN 5: MONETIZACIÓN Y PAGOS

### MILESTONE 3: SISTEMAS DE MONETIZACIÓN
**Objetivo:** Implementar múltiples vías de monetización que sean justas para los jugadores y sostenibles para el proyecto.

**1. Sistema de Pagos Tradicional (Web2)**
- [ ] Infraestructura de Pagos
  - Servicio: `PurchaseService`
  - Integración con Stripe
  - Sistema de reembolsos
  - **Web:** Panel de compras responsivo
  - **Juego:** Tienda in-game integrada

- [ ] Procesamiento de Pagos
  - Ruta: `POST /api/purchases/initiate-stripe`
  - Manejo de múltiples monedas
  - Sistema anti-fraude
  - **Web:** Checkout optimizado
  - **UI:** Animaciones de compra

- [ ] Verificación de Transacciones
  - Webhook: `POST /api/webhooks/stripe`
  - Validación de pagos
  - Sistema de retries
  - **Web:** Estado de transacción en vivo
  - **Juego:** Entrega inmediata de items

**2. Sistema Crypto (Web3)**
- [ ] Infraestructura Blockchain
  - Ruta: `POST /api/purchases/initiate-crypto`
  - Sistema de nonce único
  - Multiples blockchains soportadas
  - **Web:** Conexión de wallet
  - **UI:** QR para pagos móviles

- [ ] Monitoreo de Transacciones
  - Servicio: `blockchain.listener.ts`
  - Verificación multi-nodo
  - Confirmaciones configurables
  - **Web:** Explorador de transacciones
  - **UI:** Estado de confirmaciones

- [ ] Procesamiento de Eventos
  - Sistema de verificación segura
  - Manejo de forks
  - Registro inmutable
  - **Web:** Historial de compras crypto
  - **Juego:** NFTs especiales

**Notas de Seguridad:**
- Cifrado end-to-end
- Firmas digitales
- Límites de transacción
- Sistema de alertas
- Backups automatizados

---

## SECCIÓN 6: EXPANSIÓN Y RETENCIÓN

### MILESTONE 4: CARACTERÍSTICAS AVANZADAS
**Objetivo:** Implementar sistemas que añadan profundidad al juego y fomenten la retención a largo plazo.

**1. Sistema Social y Gremios**
- [ ] Infraestructura Social
  - Sistema de gremios jerárquico
  - Chat en tiempo real
  - Rankings de gremios
  - **Web:** Portal de gremios
  - **Juego:** Bases de gremio

- [ ] Guerras de Gremios
  - Batallas programadas
  - Territorios conquistables
  - Recompensas exclusivas
  - **Web:** Mapas estratégicos
  - **Juego:** Batallas épicas

**2. Sistema PvP**
- [ ] Arena Competitiva
  - Matchmaking balanceado
  - Rankings por temporada
  - Recompensas exclusivas
  - **Web:** Estadísticas PvP
  - **Juego:** Arenas temáticas

**3. Eventos Mundiales**
- [ ] Jefes de Mundo
  - Spawn dinámico
  - Mecánicas cooperativas
  - Drops especiales
  - **Web:** Rastreador de eventos
  - **Juego:** Cinemáticas épicas

**4. Sistema de Crafteo**
- [ ] Profesiones
  - Árboles de habilidades
  - Recetas descubribles
  - Especialización única
  - **Web:** Guías de crafteo
  - **Juego:** Animaciones de creación

**Notas de Diseño:**
- Todas las características son cross-platform
- Sistema de logros integrado
- Eventos semanales planificados
- Contenido generado por usuarios
- Sistema de temporadas
