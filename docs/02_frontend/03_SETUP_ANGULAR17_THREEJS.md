# Setup Angular 17 + Three.js (Frontend)

Objetivo: arrancar rápido un frontend Angular 17 con autenticación, HTTP interceptors, Socket.IO y una escena básica de Three.js.

## Requisitos
- Angular 17 (standalone APIs)
- Paquetes instalados: `three`, `@types/three`, `socket.io-client`
- Backend: `API_URL` apuntando al servidor (ej: `http://localhost:8080/api`), WebSocket en la misma base (`/socket.io`)

## Environment
`src/environments/environment.ts`
```ts
export const environment = {
  production: false,
  API_URL: 'http://localhost:8080/api',
  WS_URL: 'http://localhost:8080',
};
```

## Bootstrap (main.ts)
```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
  ],
});
```

## Auth Interceptor (HttpInterceptorFn)
`src/app/interceptors/auth.interceptor.ts`
```ts
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('jwt');
  if (!token) return next(req);
  const cloned = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  return next(cloned);
};
```
Registrar el interceptor:
```ts
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/interceptors/auth.interceptor';

providers: [
  provideHttpClient(withInterceptors([authInterceptor])),
]
```

## ApiService base
`src/app/services/api.service.ts`
```ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = environment.API_URL;

  getMe(){ return this.http.get(`${this.base}/users/me`); }
  openNextPackage(){ return this.http.post(`${this.base}/user-packages/open`, {}); }
}
```

## WebSocket (Socket.IO)
`src/app/services/websocket.service.ts`
```ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WebsocketService {
  private socket?: Socket;

  connect(token: string){
    this.socket = io(environment.WS_URL, {
      path: '/socket.io', transports: ['websocket'], auth: { token }
    });
  }

  on<T = any>(event: string, cb: (payload: T) => void){
    this.socket?.on(event, cb);
  }

  disconnect(){ this.socket?.disconnect(); }
}
```

## Three.js: Servicio + Componente
Servicio de escena mínima:
`src/app/services/three-scene.service.ts`
```ts
import { Injectable, NgZone } from '@angular/core';
import * as THREE from 'three';

@Injectable({ providedIn: 'root' })
export class ThreeSceneService {
  private renderer!: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  private cube!: THREE.Mesh;
  private raf?: number;

  constructor(private zone: NgZone){}

  init(canvas: HTMLCanvasElement){
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.resize(canvas.clientWidth, canvas.clientHeight);
    this.camera.position.z = 3;

    const geom = new THREE.BoxGeometry(1,1,1);
    const mat = new THREE.MeshNormalMaterial();
    this.cube = new THREE.Mesh(geom, mat);
    this.scene.add(this.cube);

    this.zone.runOutsideAngular(() => this.animate());
  }

  private animate = () => {
    this.raf = requestAnimationFrame(this.animate);
    this.cube.rotation.x += 0.01;
    this.cube.rotation.y += 0.01;
    this.renderer.render(this.scene, this.camera);
  };

  resize(w: number, h: number){
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  destroy(){ if (this.raf) cancelAnimationFrame(this.raf); this.renderer.dispose(); }
}
```

Componente standalone mínimo:
`src/app/components/three-canvas/three-canvas.component.ts`
```ts
import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { ThreeSceneService } from '../../services/three-scene.service';

@Component({ selector: 'app-three-canvas', standalone: true, template: `
  <canvas #cv style="width:100%;height:100%;display:block;"></canvas>
`, styles: [":host{display:block; width:100%; height:300px}"] })
export class ThreeCanvasComponent implements AfterViewInit, OnDestroy {
  @ViewChild('cv', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  constructor(private three: ThreeSceneService){}

  ngAfterViewInit(){ this.three.init(this.canvasRef.nativeElement); }
  @HostListener('window:resize') onResize(){
    const el = this.canvasRef.nativeElement;
    this.three.resize(el.clientWidth, el.clientHeight);
  }
  ngOnDestroy(){ this.three.destroy(); }
}
```

## Flujo sugerido de Tienda (UX)
1) Mostrar paquetes pendientes (si el backend los lista); si no, botón “Abrir paquete”.
2) `POST /user-packages/open` (sin body) → manejar 200/404/409/429.
3) Refrescar `GET /users/me` y/o `GET /inventory`.
4) Mostrar recompensas (toasts/modales). Suscribirse a `notification:new`.

## Manejo de errores
- 401: relogin/refresh
- 404: sin paquetes → deshabilitar botón
- 409: retry con backoff 500–1500ms (jitter)
- 429: backoff exponencial (ver `ERRORS_AND_LIMITS.md`)

## Checklist de Integración
- [ ] Variables env (`API_URL`, `WS_URL`)
- [ ] Auth interceptor aplicado
- [ ] ApiService con endpoints críticos (`/auth/*`, `/users/me`, `/user-packages/open`)
- [ ] WebsocketService conectado con token y listeners clave
- [ ] Componente Three.js renderiza escena
- [ ] Manejo de 401/404/409/429 en flujos de tienda
- [ ] Tests de servicios (mocks HttpClient)
