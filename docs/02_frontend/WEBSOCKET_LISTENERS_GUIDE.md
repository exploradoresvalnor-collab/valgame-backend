# Guía Rápida de Listeners WebSocket (Frontend Angular)

Base: usar `socket.io-client` y un servicio `WebsocketService` centralizado.

## Eventos confirmados
- `chat:message:new`: actualiza feed de chat.
- `marketplace:item:listed|sold|cancelled`: refrescar listados y notificar.
- `survival:wave:new|end`: HUD de supervivencia.
- `character:level-up`: banner + refrescar stats locales.
- `character:evolved`: modal/alerta y recarga de ficha.
- `notification:new|read`: badge y centro de notificaciones.
- `payments:status`: estado de compra (toast + redirect si aplica).
 - `payments:status`: estado de compra (toast + redirect si aplica).

### Payloads de referencia
- payments:status
```json
{ "status": "confirmed", "externalPaymentId": "ext-1", "userId": "...", "valRecibido": 100 }
```
- notification:new
```json
{ "_id": "...", "title": "...", "message": "...", "type": "system_announcement", "isRead": false, "createdAt": "..." }
```
- notification:read
```json
{ "userId": "507f1f77bcf86cd799439011", "notificationId": "..." }
```
- character:level-up
```json
{ "userId":"...","characterId":"char-1","level":2,"levelsGained":1,"statsDelta":{ "atk":2,"defensa":2,"vida":10 }}
```
- character:update
```json
{ "userId":"...","characterId":"char-1","type":"EXP_GAIN","nivel":2,"experiencia":60,"stats":{"atk":12, "defensa":7, "vida":110}}
```
- survival:end
```json
{ "sessionId":"...","lastWave":5,"durationMs":123456,"summary":{"totalPoints":999} }
```

### Payments: estado de pagos (confirmado)

Payload:
```json
{
  "provider": "mock|blockchain|stripe",
  "state": "initiated|pending|confirmed|failed|refunded",
  "meta": {
    "externalPaymentId": "ext-1",
    "purchaseId": "p1",
    "onchainTxHash": "0xabc"
  }
}
```

Notas backend:
- El webhook ahora acepta cuerpo crudo (Buffer) y JSON anidado `{ type:"Buffer", data:[...] }`.
- En `succeeded`, acredita VAL, crea `UserPackage`, emite `payments:status=confirmed` y `notification:new` con `type='system_announcement'`.

Listener sugerido (RxJS):
```ts
this.ws.onPaymentStatus()
  .pipe(distinctUntilChanged((a: any, b: any) => a.state === b.state && a?.meta?.externalPaymentId === b?.meta?.externalPaymentId))
  .subscribe(({ state, meta }: any) => {
    switch (state) {
      case 'initiated':
      case 'pending':
        this.toast.info('Pago en proceso...');
        break;
      case 'confirmed':
        this.toast.success('Pago confirmado, VAL acreditado');
        this.userStore.refreshBalance();
        break;
      case 'failed':
        this.toast.error('Pago fallido. Intenta nuevamente.');
        break;
      case 'refunded':
        this.toast.info('Pago reembolsado');
        break;
    }
  });

// Opcional: escuchar la notificación
this.ws.onNotificationNew()
  .pipe(filter((n: any) => n?.type === 'system_announcement'))
  .subscribe((n: any) => this.toast.success(n?.title ?? 'Pago confirmado'));
```

## Ejemplo listener (RxJS)
```ts
import { io, Socket } from 'socket.io-client';
import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, merge } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WebsocketService {
  private socket!: Socket;
  connected$ = new BehaviorSubject<boolean>(false);

  init(token: string){
    this.socket = io('/', { transports: ['websocket'] });
    this.socket.on('connect', () => {
      this.socket.emit('auth', token);
    });
    this.socket.on('auth:success', () => this.connected$.next(true));
  }

  onChatNew() { return fromEvent(this.socket, 'chat:message:new'); }
  onMarketplaceListed(){ return fromEvent(this.socket, 'marketplace:item:listed'); }
  onMarketplaceSold(){ return fromEvent(this.socket, 'marketplace:item:sold'); }
  onMarketplaceCancelled(){ return fromEvent(this.socket, 'marketplace:item:cancelled'); }
  onSurvivalWave(){ return fromEvent(this.socket, 'survival:wave:new'); }
  onSurvivalEnd(){ return fromEvent(this.socket, 'survival:end'); }
  onCharacterLevelUp(){ return fromEvent(this.socket, 'character:level-up'); }
  onCharacterEvolved(){ return fromEvent(this.socket, 'character:evolved'); }
  onNotificationNew(){ return fromEvent(this.socket, 'notification:new'); }
  onNotificationRead(){ return fromEvent(this.socket, 'notification:read'); }
  onPaymentStatus(){ return fromEvent(this.socket, 'payments:status'); }
}
```

## Uso en componentes
```ts
ngOnInit(){
  this.ws.onCharacterLevelUp().subscribe((e: any) => {
    this.toasts.show(`Nivel ${e.level} (+${e.levelsGained})`);
    this.characterStore.patch(e.characterId, e.statsDelta);
  });
  this.ws.onNotificationNew().subscribe((n: any) => this.notifications.add(n.notification));
  this.ws.onPaymentStatus().subscribe(ps => this.handlePayment(ps));
}
```

## Compatibilidad legacy
- Marketplace mantiene `marketplace:update` durante transición; escuchar ambos si es necesario.
- Chat legacy `chat:message` puede seguir emitiéndose; priorizar `chat:message:new`.
