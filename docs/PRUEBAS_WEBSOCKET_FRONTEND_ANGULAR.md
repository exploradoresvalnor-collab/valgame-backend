# Pruebas de WebSocket en Angular 17 (socket.io)

## 1. Instalar socket.io-client

Ejecuta en la raíz de tu proyecto Angular:
```bash
npm install socket.io-client
```

---

## 2. Crear servicio WebSocket en Angular

Crea el archivo `src/app/services/websocket.service.ts`:

```typescript
// src/app/services/websocket.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WebsocketService {
  private socket: Socket | undefined;

  connect(token: string): void {
    this.socket = io('https://valgame-backend.onrender.com', {
      transports: ['websocket'],
      withCredentials: true
    });

    this.socket.on('connect', () => {
      console.log('Conectado al WebSocket:', this.socket?.id);
      this.socket?.emit('auth', token);
    });

    this.socket.on('auth:success', () => {
      console.log('Autenticación exitosa en tiempo real');
    });

    this.socket.on('auth:error', (err) => {
      console.error('Error de autenticación:', err);
    });
  }

  onMarketplaceUpdate(): Observable<any> {
    return new Observable(observer => {
      this.socket?.on('marketplace:update', (data) => {
        observer.next(data);
      });
    });
  }

  onGameEvent(): Observable<any> {
    return new Observable(observer => {
      this.socket?.on('game:event', (eventData) => {
        observer.next(eventData);
      });
    });
  }

  onRankingsUpdate(): Observable<any> {
    return new Observable(observer => {
      this.socket?.on('rankings:update', (rankings) => {
        observer.next(rankings);
      });
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
  }
}
```

---

## 3. Usar el servicio en un componente Angular

Ejemplo en `src/app/app.component.ts`:

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { WebsocketService } from './services/websocket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  template: `<h1>WebSocket Angular 17</h1>`
})
export class AppComponent implements OnInit, OnDestroy {
  private subs: Subscription[] = [];
  private token = 'TU_JWT_AQUI'; // Reemplaza por el JWT real

  constructor(private wsService: WebsocketService) {}

  ngOnInit(): void {
    this.wsService.connect(this.token);

    this.subs.push(
      this.wsService.onMarketplaceUpdate().subscribe(data => {
        console.log('Marketplace actualizado:', data);
      })
    );
    this.subs.push(
      this.wsService.onGameEvent().subscribe(eventData => {
        console.log('Evento de juego:', eventData);
      })
    );
    this.subs.push(
      this.wsService.onRankingsUpdate().subscribe(rankings => {
        console.log('Rankings actualizados:', rankings);
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(sub => sub.unsubscribe());
    this.wsService.disconnect();
  }
}
```

---

## 4. Pasos para probar

1. Instala `socket.io-client`.
2. Crea el servicio `websocket.service.ts` y copia el código.
3. Usa el servicio en tu componente principal o donde lo necesites.
4. Reemplaza `TU_JWT_AQUI` por el token JWT real que obtienes tras login.
5. Ejecuta tu app Angular y abre la consola para ver los logs de conexión y eventos en tiempo real.

---

## 5. Recomendaciones
- Usa la misma URL que tienes configurada en el backend para CORS/WebSocket.
- Si usas local, cambia la URL a `http://localhost:8080`.
- El JWT debe ser válido y generado por tu backend.
- Si ves errores de CORS, revisa la variable de entorno en el backend.

---

## 6. Debug
- Si no te conectas, revisa la consola del navegador y los logs del backend.
- Si no recibes eventos, haz acciones en el juego que los disparen (ejemplo: compra en marketplace, combate, etc.).
- Si el JWT es inválido, revisa el flujo de login y obtención del token.

---

---

## 7. Rutas, país y recomendaciones regionales

- **Backend:**
  - URL de producción: `https://valgame-backend.onrender.com`
  - URL local: `http://localhost:8080`
- **Frontend:**
  - URL de producción: `https://cool-faloodeh-b39ece.netlify.app`
  - URL local: `http://localhost:4200`
- **País:** Colombia (GMT-5)
  - Ten en cuenta la zona horaria para eventos programados y cron jobs.
  - Si usas servicios de terceros, verifica que soporten la zona horaria correctamente.
- **Recomendaciones:**
  - Mantén las variables de entorno actualizadas en Render y Netlify.
  - Si tienes usuarios en otros países, considera internacionalización y manejo de horarios.
  - Para pruebas locales, asegúrate de que ambos orígenes estén permitidos en el backend (`FRONTEND_ORIGIN`).

---

**¡Con esto puedes probar y validar la conexión en tiempo real en Angular 17, con rutas y contexto regional claro!**
