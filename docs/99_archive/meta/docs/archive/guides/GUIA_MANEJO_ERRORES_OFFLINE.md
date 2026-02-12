# Guía Completa: Manejo de Errores con Desconexión de Internet

## 🎯 Objetivo
Implementar un sistema robusto de manejo de errores que detecte desconexiones de internet, muestre indicadores visuales al usuario, y reintente automáticamente con backoff exponencial.

---

## 📋 Componentes Implementados

### 1. **Nueva Estructura de Errores** (`src/utils/errors.ts`)

#### Nuevas Clases de Error:

```typescript
// Error de conexión general (503 - Service Unavailable)
export class ConnectionError extends AppError {
  retryable: boolean;
  attemptCount: number;
  maxAttempts: number;
  
  constructor(
    message: string = 'Error de conexión',
    retryable: boolean = true,
    attemptCount: number = 0,
    maxAttempts: number = 3
  )
}

// Error específico de internet (503)
export class OfflineError extends AppError {
  isOffline: boolean = true;
  suggestedAction: string;
  
  constructor(
    message: string = 'Sin conexión a internet...',
    suggestedAction: string = 'retry'
  )
}

// Timeout (504 - Gateway Timeout)
export class TimeoutError extends AppError {
  constructor(message: string = 'Tiempo de espera agotado')
}
```

---

### 2. **Error Handler Mejorado** (`src/middlewares/errorHandler.ts`)

#### Características:

✅ Detecta automáticamente errores de conexión  
✅ Marca respuestas con flags de reconexión  
✅ Agrega headers HTTP para el cliente  
✅ Incluye información de reintento

#### Respuesta Mejorada:

```json
{
  "ok": false,
  "error": "No se pudo conectar con el servidor",
  "code": "ConnectionError",
  "status": 503,
  "isConnectionError": true,
  "retryable": true,
  "attemptCount": 1,
  "maxAttempts": 3,
  "suggestedAction": "retry",
  "timestamp": "2025-11-27T10:30:00.000Z",
  "path": "/api/characters/1/level-up"
}
```

#### Headers HTTP Agregados:

```
X-Connection-Error: true
X-Retry-After: 5
X-Offline-Indicator: show
X-Connection-Status: degraded
X-Server-Time: 2025-11-27T10:30:00.000Z
```

---

### 3. **Middleware de Monitoreo** (`src/middlewares/connectionMonitor.ts`)

#### Funcionalidades:

```typescript
// Middleware principal
connectionMonitorMiddleware(req, res, next)
  ↓
  - Health check cada 30 segundos
  - Monitorea conexión a MongoDB
  - Marca estado en respuestas
  - Agrega información de conexión al payload

// Detector de errores de conexión
detectConnectionErrors(err, req, res, next)
  ↓
  - Identifica códigos de error de red (ECONNREFUSED, ENOTFOUND, ETIMEDOUT)
  - Enriquece errores con metadatos de reconexión
  - Log de errores de conexión

// Función auxiliar
getConnectionStatus(): {
  isOnline: boolean,
  failureCount: number,
  consecutiveFailures: number,
  lastCheck: Date
}
```

---

### 4. **Utilidad de Retry** (`src/utils/retryWithBackoff.ts`)

#### Uso Básico:

```typescript
import { retryWithBackoff, retryOnce, RETRY_PRESETS } from './utils/retryWithBackoff';

// Reintentar 4 veces con backoff exponencial
const result = await retryWithBackoff(async () => {
  return await apiCall();
}, RETRY_PRESETS.NORMAL);

// Reintentar una sola vez
const result = await retryOnce(async () => {
  return await apiCall();
}, 1000); // 1 segundo de delay

// Configuración personalizada
const result = await retryWithBackoff(
  async () => apiCall(),
  {
    maxAttempts: 5,
    baseDelayMs: 2000,
    maxDelayMs: 60000,
    backoffMultiplier: 2,
    jitter: true
  },
  (state) => {
    console.log(`Intento ${state.attempt}: Reintentando en ${state.nextRetryDelayMs}ms`);
  }
);
```

#### Presets Disponibles:

```typescript
RETRY_PRESETS.FAST      // 3 intentos, 500-2000ms
RETRY_PRESETS.NORMAL    // 4 intentos, 1000-10000ms
RETRY_PRESETS.PATIENT   // 5 intentos, 2000-60000ms
RETRY_PRESETS.AGGRESSIVE // 2 intentos, 500-1000ms
```

#### Algoritmo de Backoff Exponencial:

```
Intento 1: Esperar 1000ms
Intento 2: Esperar 2000ms (× 2)
Intento 3: Esperar 4000ms (× 2)
Intento 4: Esperar 8000ms (× 2)
Intento 5: Esperar 16000ms (× 2) [hasta máximo 60000ms]

Con jitter (±10%):
Intento 1: 900-1100ms
Intento 2: 1800-2200ms
...
```

---

### 5. **Componente Angular: OfflineIndicator** (Frontend)

#### Características Visuales:

- 📍 Banner rojo deslizante en la parte superior
- 🔴 Punto pulsante en esquina inferior derecha
- 📊 Barra de progreso de reintentos
- 🔄 Botón para reintentar manualmente
- 📋 Detalles técnicos en modo desarrollo

#### Instalación en app.component.html:

```html
<!-- Al inicio del template, después de <header> -->
<app-offline-indicator></app-offline-indicator>

<!-- Resto del contenido -->
<router-outlet></router-outlet>
```

#### Propiedades Mostradas:

```typescript
offlineState = {
  isOffline: boolean,           // ¿Sin conexión?
  message: string,              // Mensaje al usuario
  retryCount: number,           // Intentos realizados
  maxRetries: number,           // Máximo de intentos
  lastError?: string            // Detalles del error
}
```

---

## 🔌 Integración en Express App

### En `src/app.ts`:

```typescript
// 1. Importar los nuevos middlewares
import { 
  connectionMonitorMiddleware, 
  detectConnectionErrors 
} from './middlewares/connectionMonitor';

// 2. Registrar middleware de monitoreo
app.use(express.json());
app.use(connectionMonitorMiddleware); // ← AQUÍ

// 3. Registrar detector de errores ANTES de errorHandler
app.use(detectConnectionErrors);      // ← AQUÍ
app.use(errorHandler);                // Debe ser el último
```

---

## 🎬 Flujo de Manejo de Errores

```
1. Cliente hace petición HTTP
   ↓
2. Falla la conexión (timeout, internet down, etc.)
   ↓
3. Middleware `detectConnectionErrors` lo captura
   ↓
4. Enriquece con metadatos de reconexión
   ↓
5. `errorHandler` lo procesa
   ↓
6. Responde con status 503 + headers especiales
   ↓
7. Cliente recibe respuesta
   ↓
8. OfflineIndicatorComponent detecta `isConnectionError: true`
   ↓
9. Muestra banner al usuario
   ↓
10. Cliente usa `retryWithBackoff` automáticamente
   ↓
11. Cuando se restaura la conexión → banner se oculta
```

---

## 💡 Ejemplos de Uso en Servicios

### Ejemplo 1: Servicio RPG Con Reintentos

```typescript
// src/services/character.service.ts
import { retryWithBackoff, RETRY_PRESETS } from '../utils/retryWithBackoff';

export class CharacterService {
  async levelUpCharacter(userId: string, characterId: string) {
    return await retryWithBackoff(
      async () => {
        const result = await this.userModel.findByIdAndUpdate(userId, {
          $set: { 'personajes.$[char].nivel': { $inc: 1 } }
        });
        return result;
      },
      RETRY_PRESETS.NORMAL
    );
  }
}
```

### Ejemplo 2: Controlador con Manejo de Error

```typescript
// src/controllers/character.controller.ts
import { OfflineError } from '../utils/errors';

export const levelUpCharacter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { characterId } = req.params;
    const userId = req.user?.id;

    const result = await characterService.levelUpCharacter(userId, characterId);
    
    res.json({
      ok: true,
      data: result,
      message: 'Personaje mejorado exitosamente'
    });
  } catch (error) {
    // Error de conexión será convertido automáticamente
    if (error.code === 'ECONNREFUSED') {
      next(new OfflineError('No se pudo contactar la base de datos'));
    } else {
      next(error);
    }
  }
};
```

### Ejemplo 3: Servicio de Marketplace con Reintentos

```typescript
// src/services/marketplace.service.ts
import { retryWithBackoff } from '../utils/retryWithBackoff';

export class MarketplaceService {
  async buyItem(buyerId: string, listingId: string) {
    return await retryWithBackoff(
      async () => {
        // Transacción atómica
        const session = await mongoose.startSession();
        try {
          return await this.executeAtomicBuy(buyerId, listingId, session);
        } finally {
          await session.endSession();
        }
      },
      { maxAttempts: 3, baseDelayMs: 1000 }
    );
  }
}
```

---

## 🧪 Testing

### Test de Desconexión Simulada:

```typescript
// src/tests/e2e/offline.test.ts
describe('Offline Error Handling', () => {
  it('should show offline banner when connection fails', async () => {
    // 1. Simular desconexión
    cy.intercept('/api/**', {
      forceNetworkError: true
    }).as('networkError');

    // 2. Hacer petición
    cy.visit('/game');
    cy.get('[ng-reflect-personaje-id]').click();

    // 3. Verificar banner
    cy.get('app-offline-indicator').should('have.class', 'show');
    cy.contains('Sin conexión').should('be.visible');

    // 4. Restaurar conexión
    cy.intercept('/api/**', { fixture: 'character.json' }).as('restored');

    // 5. Reintentar
    cy.get('.retry-btn').click();
    cy.wait('@restored');

    // 6. Banner desaparece
    cy.get('app-offline-indicator').should('not.have.class', 'show');
  });
});
```

### Test de Backoff Exponencial:

```typescript
// src/tests/unit/retryWithBackoff.test.ts
describe('retryWithBackoff', () => {
  it('should use exponential backoff', async () => {
    const delays: number[] = [];
    const now = Date.now();

    await retryWithBackoff(
      async () => { throw new Error('test'); },
      RETRY_PRESETS.FAST,
      (state) => {
        delays.push(Date.now() - now);
      }
    ).catch(() => {});

    // Verificar que cada delay es aproximadamente el doble
    expect(delays[1]).toBeGreaterThan(delays[0] * 1.5);
    expect(delays[2]).toBeGreaterThan(delays[1] * 1.5);
  });
});
```

---

## 📊 Monitoreo en Producción

### Headers Agregados para Observabilidad:

```
X-Connection-Status: [online|degraded]
X-Server-Time: ISO 8601 timestamp
X-Connection-Error: true (si hay error)
X-Retry-After: segundos
X-Offline-Indicator: show (si mostrar banner)
```

### Logs Importantes:

```
[ConnectionMonitor] Health check failed: MongoDB connection failed
[Connection Error] GET /api/characters/1 - ECONNREFUSED: connect ECONNREFUSED
[Retry] Attempt 1/4 failed. Retrying in 1000ms...
[Retry] Attempt 2/4 failed. Retrying in 2000ms...
[Retry] Attempt 3/4 failed. Retrying in 4000ms...
[OfflineIndicator] Desconexión detectada
[OfflineIndicator] Conexión restaurada automáticamente
```

---

## ✅ Checklist de Implementación

- [x] Extender tipos de error en `errors.ts`
- [x] Actualizar `errorHandler.ts` con detección de conexión
- [x] Crear `connectionMonitor.ts` middleware
- [x] Crear `retryWithBackoff.ts` utilidad
- [x] Integrar middlewares en `app.ts`
- [x] Crear componente `OfflineIndicator`
- [x] Crear `ConnectionMonitorService` (Angular)
- [ ] Integrar componente en app.component.html
- [ ] Usar `retryWithBackoff` en servicios críticos
- [ ] Agregar tests e2e de desconexión
- [ ] Monitoreo en Sentry o similar

---

## 🚀 Próximos Pasos

1. **Integración Frontend**: Copiar componente a proyecto Angular
2. **Servicios Críticos**: Aplicar `retryWithBackoff` a marketplace, characters, payments
3. **Monitoring**: Integrar Sentry para rastrear errores en producción
4. **Alerting**: Configurar alertas en PagerDuty o similar
5. **Documentación**: Actualizar docs del cliente con eventos de conexión

---

**Última Actualización**: 27 de noviembre de 2025  
**Status**: ✅ Implementado en Backend  
**Próximo**: Integrar en Frontend Angular
