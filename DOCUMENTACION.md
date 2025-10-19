# Documento Maestro de Diseño: Exploradores de Valnor

## 0. Mejoras de Seguridad y Estabilidad (Octubre 2025)

### Cambios Clave Aplicados (Marketplace y Realtime)
- Marketplace ahora usa transacciones atómicas en listar/comprar/cancelar para evitar estados parciales.
- Compra segura con reserva atómica del listing (evita compras duplicadas por condiciones de carrera).
- Corrección de tipos: buyerId guardado como ObjectId, y manejo de ObjectId para inventarios.
- Validación de límites de inventario antes de transferir ítems (compras/cancelaciones).
- Metadata coherente al listar consumibles (usos) y personajes (datos completos para restauración).
- Búsquedas de listings filtran expirados; se elimina broadcast global en GET.
- Autenticación de sockets (Socket.IO) ahora verifica JWT real (antes era un placeholder inseguro).
- Cron de expiración: marca listings vencidos como expirados y devuelve los ítems al vendedor.

### Sistema de Manejo de Errores
Se implementó un sistema jerárquico de manejo de errores que proporciona:
- Errores específicos para cada dominio (Auth, DB, Game Logic)
- Logging estructurado con contexto
- Respuestas de error consistentes y detalladas

Beneficios:
1. Mejor debugging y trazabilidad
2. Mensajes de error más claros para usuarios
3. Mayor seguridad en la exposición de errores
4. Mantenibilidad mejorada

### Sistema de Validación con Zod
Se implementó un sistema robusto de validación que incluye:
- Esquemas para todas las entidades del juego
- Validaciones específicas para gameplay
- Validación de IDs y referencias
- Rangos y límites para valores del juego

Beneficios:
1. Mayor integridad de datos
2. Prevención de datos maliciosos
3. Mejor integración con TypeScript
4. Validaciones centralizadas

### Rate Limiting y Protección
Se implementó un sistema avanzado de rate limiting y protección que garantiza la equidad del juego y la estabilidad del servidor.

#### Sistema de Límites:
1. **Límites por Tipo de Acción**
   - Autenticación: 5 intentos/15min
   - Acciones rápidas: 30/min
   - Acciones lentas: 10/5min

2. **Protección contra Spam**
   - Cooldowns en acciones de juego
   - Detección de patrones sospechosos
   - Sistema de penalizaciones graduales

3. **Límites del Marketplace**
   - Listados máximos por usuario
   - Frecuencia de transacciones controlada
   - Protección contra manipulación de precios

4. **Configuración por Ruta**
   - Límites personalizables por endpoint
   - Bypass para APIs autorizadas
   - Monitoreo en tiempo real

#### Características de Seguridad:
- Límites aplicados por IP y por cuenta simultáneamente
- Sistema de whitelisting para IPs confiables
- Alertas automáticas por excesos de intentos
- Integración con sistema anti-botting

Beneficios:
1. Protección robusta contra ataques DDoS
2. Prevención de abuso de recursos
3. Juego más justo y balanceado
4. Experiencia optimizada por tipo de acción
5. Monitoreo proactivo de actividad sospechosa



## 1. Visión Estratégica: El Viaje del Explorador
Exploradores de Valnor es un RPG táctico con una economía persistente y consecuencias reales. El juego se centra en un ciclo adictivo: Preparación, Riesgo, Recompensa, Gestión y Progresión. El jugador es un estratega que debe sopesar cada decisión.

## 2. El Comienzo de la Aventura: El Flujo del Nuevo Jugador (Onboarding)
El objetivo es una entrada al juego inmediata y emocionante.

- **Registro y Verificación:** El jugador crea una cuenta y la verifica a través de un correo electrónico. Este sistema ya está implementado usando Nodemailer.
### Sistema de Onboarding

#### Paquete del Pionero Automático
- **Ruta:** `POST /auth/register`
- **Proceso:**
  1. Asignación automática de personaje Rango D
  2. Depósito de monedas VAL iniciales
  3. Entrega de kit de supervivencia básico

#### Experiencia de Usuario
- **UI:** Tutorial interactivo guiado
- **Web:** Página de bienvenida personalizada
- **Juego:** Introducción paso a paso a las mecánicas

#### Contenido del Paquete Inicial
1. **Personaje Base**
   - ID: `base_d_001`
   - Rango: D
   - Stats equilibrados para nuevos jugadores
   - Historia de origen incluida

2. **Items Iniciales**
   - Poción de Vida (ID: `68dc525adb5c735854b5659d`)
   - Stats balanceados para principiantes
   - Tutorial de uso integrado

#### Verificación del Sistema
```bash
# Verificación en MongoDB
db.items.find({_id:ObjectId('68dc525adb5c735854b5659d')})
db.base_characters.find({descripcion_rango:'D'})
```

## 3. El Corazón del Juego: El Ciclo de Combate en Mazmorras
Esta es la mecánica principal del juego.

- **Fase de Preparación:** El jugador forma un equipo (1-4 héroes), les equipa armas/armaduras (cuyas stats se suman) y puede usar consumibles para obtener "buffs" temporales.
- **La Expedición (Batalla Automática):** El jugador envía su equipo a una mazmorra. El backend simula la batalla completa de forma instantánea y devuelve un reporte detallado. La lógica de simulación, incluyendo cálculo de stats, probabilidades de fallo y determinación de victoria/derrota, ya está implementada en `src/controllers/dungeons.controller.ts`.
- **Victoria y Recompensas:** Ocurre si la vida de la mazmorra llega a cero. Otorga Experiencia (EXP) y la posibilidad de obtener `loot` (ítems).
- **Derrota y Consecuencias:** Ocurre si todo el equipo es derrotado. No hay recompensas y los héroes entran en "Estado Herido", activando el "Temporizador de la Muerte".

## 4. La Senda del Héroe: El Sistema de Progresión
La progresión se basa en Rango, Nivel y Evolución.

### A. El Rango: El Potencial Innato
Obtenido al abrir "Paquetes", el Rango (D-SSS) es aleatorio y determina el potencial máximo de un personaje (stats por nivel, nivel máximo).

### B. Subir de Nivel (Level Up)
- **Funcionamiento:** Los personajes ganan EXP en combate. Al alcanzar la `experiencia_requerida` (definida en `level_requirements`), suben de nivel.
- **Recompensas:** Mejora permanente de estadísticas (basado en el Rango), curación completa y registro en `level_history`.
- **Estado:** La lógica de subida de nivel ya está implementada y funcional en `src/services/character.service.ts`.

### C. La Evolución: La Trascendencia del Héroe

#### Sistema de Evolución
- **Ruta:** `POST /api/characters/:characterId/evolve`
- **Funcionamiento:**
  1. Verificación de requisitos
  2. Consumo de recursos (VAL y EVO)
  3. Transformación del personaje
  4. Actualización de stats

#### Hitos de Evolución
1. **Primera Evolución (Nivel 40)**
   - Costo: 1000 VAL + 1 EVO
   - Incremento significativo de stats base
   - Desbloqueo de habilidad especial

2. **Segunda Evolución (Nivel 100)**
   - Costo: 5000 VAL + 3 EVO
   - Transformación visual del personaje
   - Multiplicador de stats permanente

#### Experiencia de Usuario
- **UI:** Previsualización de evolución
- **Juego:** Secuencia especial de evolución
- **Efectos:** Animaciones y efectos especiales

#### Sistema de Stats Post-Evolución
- Recalculación automática de stats
- Nuevos límites de nivel desbloqueados
- Habilidades especiales disponibles

#### Notas Técnicas
- Proceso atómico y transaccional
- Backups automáticos pre-evolución
- Sistema de rollback en caso de error
- Métricas de seguimiento

## 5. Consecuencias y Gestión: La Supervivencia del Explorador
### Mecánicas de Supervivencia

#### Sistema de Curación
- **Ruta:** `POST /api/characters/:characterId/heal`
- **Funcionamiento:**
  - Costo en VAL basado en HP faltante
  - Curación progresiva con animaciones
  - Notificaciones de estado

- **Interfaz:**
  - Barras de vida con degradado
  - Efectos visuales de curación
  - Indicadores de costo

#### Sistema de Resurrección
- **Ruta:** `POST /api/characters/:characterId/revive`
- **Mecánicas:**
  - Penalizaciones balanceadas por muerte
  - Tiempo de espera estratégico
  - Costo progresivo de resurrección

- **Experiencia:**
  - Pantalla especial de muerte
  - Efectos dramáticos de resurreción
  - Temporizador visible

#### Sistema de Muerte Permanente
- **Servicio:** `src/services/permadeath.service.ts`
- **Funcionamiento:**
  1. Personaje entra en "Estado Herido"
  2. Temporizador de 24 horas se inicia
  3. Si no es revivido, se pierde permanentemente

- **Implementación:**
  - Cron job robusto para tracking
  - Sistema de notificaciones
  - Backups de seguridad

## 6. La Economía del Juego

### 6.1. Ítems (Equipamiento vs. Consumibles)
- **Equipamiento:** Ítems permanentes que otorgan estadísticas pasivas. La progresión se basa en reemplazarlos por otros de mejor Rango.
- **Consumibles:** Ítems con un número limitado de usos. El modelo `Consumable.ts` tiene un campo `usos_maximos` y el inventario del `User.ts` rastrea los `usos_restantes` de cada ítem.

#### 6.1.1. Gestión de Inventario y Límites
Para soportar ítems con estado (como los consumibles con múltiples usos) de forma eficiente y escalable, el inventario del usuario se divide en dos arrays especializados:

- **`inventarioEquipamiento`**: Un array simple que contiene los `ObjectId` de los ítems de tipo `Equipment` que posee el jugador.
- **`inventarioConsumibles`**: Un array de sub-documentos donde cada entrada representa una instancia única de un consumible. Su estructura es `{ consumableId, usos_restantes }`.

Ambos inventarios tienen un límite de tamaño definido en el modelo `User`:
- **`limiteInventarioEquipamiento`**: Por defecto, `20`.
- **`limiteInventarioConsumibles`**: Por defecto, `50`.

En el futuro, se podrá implementar una funcionalidad que permita a los jugadores ampliar estos límites a cambio de VAL.

#### Flujo a Nivel de Sistema (Backend)
1.  **Recepción de Ítem:** Cuando un jugador obtiene un nuevo ítem (ej. `loot` de una mazmorra), el sistema primero identifica su `tipoItem` ('Equipment' o 'Consumable').
2.  **Validación de Límite:** Antes de añadirlo, el sistema comprueba si el inventario correspondiente ha alcanzado su límite (`limiteInventarioEquipamiento` o `limiteInventarioConsumibles`). Si el inventario está lleno, la operación falla y se notifica al jugador.
3.  **Inserción en Inventario:**
    *   Si es **Equipment**, su `ObjectId` se añade directamente al array `inventarioEquipamiento`.
    *   Si es **Consumable**, se crea un nuevo sub-documento `{ consumableId: <ID_DEL_ITEM>, usos_restantes: <USOS_MAXIMOS_DEL_ITEM> }` y se inserta en el array `inventarioConsumibles`. El valor de `usos_restantes` se toma del campo `usos_maximos` del modelo `Consumable`.
4.  **Uso de Consumible:** Cuando el jugador utiliza un consumible, el sistema busca la instancia específica en su `inventarioConsumibles`, decrementa el campo `usos_restantes` en 1. Si `usos_restantes` llega a 0, el sub-documento completo se elimina del array.

#### Experiencia a Nivel de Juego (Jugador)
- **Gestión Estratégica:** Los límites de inventario separados obligan al jugador a tomar decisiones estratégicas. No pueden acumular infinitas piezas de equipo o pociones, lo que fomenta la venta de ítems no deseados y una gestión activa de sus recursos.
- **Claridad Visual:** En la interfaz de usuario (UI), el jugador ve su inventario de forma unificada, pero con indicadores claros. Los ítems consumibles muestran visiblemente sus usos restantes (ej. "Poción de Vida (4/5 usos)").
- **Sensación de Valor:** Al tener un estado (usos), los consumibles se perciben como recursos más valiosos y finitos. Encontrar un consumible con múltiples usos (`usos_maximos > 1`) se siente como una recompensa más significativa.
- **Progresión Tangible:** La futura opción de gastar `VAL` para ampliar los límites del inventario se convierte en un objetivo de progresión claro y una recompensa tangible para el jugador a largo plazo.

- **Sumideros de Ítems:** Para combatir la inflación, los ítems se pueden vender a un NPC (`POST /api/items/:id/sell`), lo que los destruye a cambio de una pequeña cantidad de VAL.

### 6.2. Marketplace P2P

#### 6.2.1. Visión General
El marketplace es un sistema que permite a los jugadores comerciar entre sí usando VAL como moneda.

#### 6.2.2. Perspectiva del Jugador
- **Vender Items**
  - Listar personajes (excepto el activo)
  - Listar equipamiento
  - Listar consumibles
  - Establecer precios en VAL
  - Destacar listings por 100 VAL
  - Listings duran 7 días

- **Comprar Items**
  - Ver todos los items disponibles
  - Filtrar por tipo, precio, rango, nivel
  - Items destacados aparecen primero
  - 20 items por página
  - Notificaciones de nuevos listings

- **Gestionar Ventas**
  - Cancelar listings activos
  - Recuperar parte del costo de destacado
  - Ver historial de transacciones

#### 6.2.3. Perspectiva del Desarrollador

##### Modelo de Datos
```typescript
interface IListing {
  itemId: string;
  type: 'personaje' | 'equipamiento' | 'consumible' | 'especial';
  sellerId: ObjectId;
  precio: number;
  precioOriginal: number;
  impuesto: number;
  estado: 'activo' | 'vendido' | 'cancelado' | 'expirado';
  fechaCreacion: Date;
  fechaExpiracion: Date;
  fechaVenta?: Date;
  buyerId?: ObjectId;
  destacado: boolean;
  metadata: {
    nivel?: number;
    rango?: string;
    stats?: {
      atk?: number;
      defensa?: number;
      vida?: number;
    }
  }
}
```

##### API Endpoints
```typescript
// Crear listing
POST /api/marketplace/listings
Body: {
  itemId: string;
  precio: number;
  destacar?: boolean;
  metadata?: object; // opcional; el backend la derivará si falta
}

// Buscar listings
GET /api/marketplace/listings
Query: {
  type?: string;
  precioMin?: number;
  precioMax?: number;
  destacados?: boolean;
  rango?: string;
  nivelMin?: number;
  nivelMax?: number;
  limit?: number;
  offset?: number;
}

// Comprar item
POST /api/marketplace/listings/:id/buy

// Cancelar listing
POST /api/marketplace/listings/:id/cancel
```

##### Características Técnicas
1. **Transacciones Atómicas**
   - Reserva atómica del listing para evitar doble compra
   - Validación de fondos y límites de inventario
   - Transferencia de VAL (con impuesto) y movimiento de items
   - Actualización de estados y notificaciones en tiempo real tras commit

2. **Sistema de Impuestos**
   - 5% de cada venta
   - Cálculo automático
   - Sumidero de VAL

3. **Listings Destacados**
   - Costo: 100 VAL
   - Prioridad en búsquedas
   - Devolución proporcional
   - Sistema de caducidad

4. **Integración RT**
   - Notificaciones Socket.io
   - Updates en tiempo real en eventos de cambio (new/sold/cancelled)
   - Estado de transacciones e inventarios por usuario
   - Autenticación de sockets con JWT verificado

##### Sistema de Seguridad
1. **Validaciones**
   - Propiedad de items
   - Saldo suficiente
   - Estados válidos
   - Tipos permitidos

2. **Rate Limiting**
   - Límite de listings
   - Cooldown entre ventas
   - Protección anti-spam

3. **Monitoreo**
   - Logs de transacciones
   - Detección de anomalías
   - Métricas de mercado
   - Alertas de seguridad

#### 6.2.4. Expiración de Listings
- El sistema ejecuta un cron cada 5 minutos que:
  - Marca como 'expirado' los listings activos cuya fechaExpiracion ya pasó
  - Devuelve el ítem al vendedor (sin reembolso del costo de destacado)
  - Emite un refresh global para que los clientes actualicen vistas
- Las búsquedas (GET /api/marketplace/listings) ya no retornan listados expirados.

#### 6.2.5. Próximas Mejoras
1. **Sistema de Ofertas**
   - Ofertas en listings
   - Negociación de precios
   - Ofertas por tiempo
   - Panel de ofertas
   - Notificaciones

2. **Sistema de Subastas**
   - Items especiales
   - Pujas automáticas
   - Tiempo dinámico
   - Sala de subastas
   - Eventos especiales

3. **Análisis de Mercado**
   - Historial de precios
   - Tendencias
   - Recomendaciones
   - Gráficos y stats
   - Consejos in-game

4. **Sistema de Reputación**
   - Calificaciones
   - Historial detallado
   - Niveles de confianza
   - Perfiles públicos
   - Badges especiales

## 7. La Tienda y el Sistema de Compras Híbrido (Web2 y Web3)

### A. Flujo con Tarjeta de Crédito (Web2 - Stripe)
1.  **`POST /api/purchases/initiate-stripe`**: El backend crea una `PaymentIntent` en Stripe.
2.  **Frontend**: Usa un `client_secret` para mostrar un formulario de pago seguro de Stripe.
3.  **`POST /api/webhooks/stripe`**: El backend recibe la confirmación de Stripe, verifica la petición y acredita la compra.

### B. Flujo con Criptomonedas (Web3)
1.  **`POST /api/purchases/initiate-crypto`**: El backend registra una compra pendiente con un `nonce`.
2.  **Frontend**: Pide al usuario firmar una transacción al Contrato Inteligente del juego.
3.  **Contrato Inteligente**: Emite un evento `PurchaseSuccessful`.
4.  **`src/services/blockchain.listener.ts`**: Un servicio de backend escucha este evento.
5.  **Verificación**: Al detectar el evento, el backend verifica los datos y acredita el producto.

## 8. El Futuro de Valnor: Próximas Expansiones
- **Sistema Social:** Gremios y Guerras de Gremios.
- **Arena PvP:** Combate Jugador contra Jugador.
- **Eventos Mundiales:** Jefes de Mundo cooperativos.
- **Sistema de Crafteo:** Profesiones y creación de ítems.