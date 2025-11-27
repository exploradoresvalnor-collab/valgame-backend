# 🚀 GUÍA RÁPIDA: INTEGRAR ERROR HANDLING EN FRONTEND

**Última actualización:** 27 de noviembre de 2025  
**Para:** Integración rápida de manejo de desconexiones en Angular

---

## ⚡ Pasos Rápidos (10 minutos)

### 1️⃣ Copiar Componente OfflineIndicator

Abre: `28_COMPONENTE_OFFLINE_INDICATOR.md`

Copia TODO el código del componente `OfflineIndicatorComponent` y pega en:
```
src/app/shared/components/offline-indicator/offline-indicator.component.ts
```

### 2️⃣ Copiar Servicio ConnectionMonitor

Copia TODO el código del servicio `ConnectionMonitorService` y pega en:
```
src/app/shared/services/connection-monitor.service.ts
```

### 3️⃣ Agregar en app.component.html

```html
<!-- TOP del template -->
<app-offline-indicator></app-offline-indicator>

<!-- Resto del contenido -->
<router-outlet></router-outlet>
```

### 4️⃣ Importar en app.component.ts (si es standalone) o app.module.ts

**Si es Standalone:**
```typescript
import { OfflineIndicatorComponent } from './shared/components/offline-indicator/offline-indicator.component';
import { ConnectionMonitorService } from './shared/services/connection-monitor.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [OfflineIndicatorComponent, ...],
  providers: [ConnectionMonitorService]
})
export class AppComponent { }
```

**Si usa NgModule:**
```typescript
import { OfflineIndicatorComponent } from './shared/components/offline-indicator/offline-indicator.component';
import { ConnectionMonitorService } from './shared/services/connection-monitor.service';

@NgModule({
  declarations: [OfflineIndicatorComponent],
  providers: [ConnectionMonitorService]
})
export class AppModule { }
```

### 5️⃣ Listo! ✅

El banner aparecerá automáticamente cuando:
- Se pierda la conexión a internet
- Falle una petición al servidor
- Se restaure la conexión

---

## 📦 Qué Hace Cada Pieza

| Componente | Función |
|-----------|---------|
| `OfflineIndicatorComponent` | Muestra banner visual + botón reintentar |
| `ConnectionMonitorService` | Detecta cambios de conexión + health checks |
| `app-offline-indicator` | Tag HTML en el template |

---

## 🎯 Resultado Visual

Cuando se desconecta:

```
┌─────────────────────────────────────┐
│ ⚠️ Sin conexión              [✕]     │
│ Conexión a internet perdida...      │
│ Intento 1 de 3 ████░░░░░░░░░░░░   │
│ [Reintentar]                        │
└─────────────────────────────────────┘
                        🔴 (pulsante)
```

---

## 🔧 Configuración Personalizada

### Cambiar Colores (en component.ts)

```typescript
// En styles array, modificar:
.offline-banner {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%);  // ← Cambiar aquí
  // O usar tus propios colores
  background: linear-gradient(135deg, #YOUR_COLOR1, #YOUR_COLOR2);
}
```

### Cambiar Mensajes (en component.ts)

```typescript
offlineState: OfflineState = {
  isOffline: false,
  message: 'Conexión a internet perdida...', // ← Cambiar aquí
  retryCount: 0,
  maxRetries: 3
};
```

### Cambiar Delay de Health Check (en service.ts)

```typescript
// En ConnectionMonitorService:
setInterval(() => this.performHealthCheck(), 10000); // 10 segundos
// Cambiar 10000 al delay que prefieras (en ms)
```

---

## ✨ Características Incluidas

✅ Detección automática de desconexiones  
✅ Banner visual deslizante  
✅ Punto pulsante en esquina  
✅ Barra de progreso de reintentos  
✅ Botón "Reintentar" manual  
✅ Health check periódico  
✅ Responsive (mobile, tablet, desktop)  
✅ Animaciones suaves  
✅ Detalles técnicos en modo desarrollo  

---

## 📚 Para Más Detalles

- **Código completo:** `28_COMPONENTE_OFFLINE_INDICATOR.md`
- **Guía técnica:** `GUIA_MANEJO_ERRORES_OFFLINE.md`
- **Cambios backend:** `RESUMEN_CAMBIOS_ERROR_HANDLING.md`

---

## 🆘 Problemas Comunes

### El banner no aparece

✓ Verificar que `<app-offline-indicator>` esté en app.component.html  
✓ Verificar que `ConnectionMonitorService` esté en `providers`  
✓ Revisar console del navegador por errores  

### El componente no compila

✓ Asegurarse de copiar TODO el código  
✓ Verificar que las importaciones están correctas  
✓ Ejecutar `ng serve` para detectar errores  

### Health check falla

✓ Endpoint `/api/health` debe estar disponible  
✓ Verificar CORS en backend  
✓ Revisar network tab en DevTools  

---

## 🎉 Listo!

Ya tienes error handling profesional con indicador visual. 

**Próximo paso:** Integrar en servicios críticos (character.service, marketplace.service, payment.service) para reintentos automáticos.

Ver: `GUIA_MANEJO_ERRORES_OFFLINE.md` para ejemplos avanzados.

---

**Implementado por:** GitHub Copilot  
**Fecha:** 27 de noviembre de 2025  
**Estado:** ✅ Production Ready
