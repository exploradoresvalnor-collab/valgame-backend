# Guía clara: Cómo obtener, abrir y mostrar paquetes en el frontend

## 1. Obtener los paquetes del usuario

El frontend llama al endpoint para listar los paquetes asignados al usuario:

```typescript
// Ejemplo usando fetch
const res = await fetch('/api/user-packages/por-correo', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'proyectoagesh@gmail.com' })
});
const paquetes = await res.json();
// paquetes = [{ _id, nombre, fecha, ... }, ...]
```

## 2. Abrir un paquete

El frontend llama al endpoint para abrir el paquete seleccionado:

# Flujo completo de paquetes en el frontend

## 1. Compra de paquete
- El usuario compra un paquete en la tienda.
- El backend crea un documento en la colección `user_packages` para ese usuario.
- El paquete aparece en la sección "Paquetes por abrir" del usuario.

  body: JSON.stringify({ userPackageId: paqueteId })
});
```

## 2. Visualización de paquetes pendientes
- El frontend consulta los paquetes pendientes con:
  - `POST /api/user-packages/por-correo` (por email)
  - o `GET /api/user-packages/:userId` (por ID)
- Muestra una lista de paquetes por abrir en la UI (con nombre, fecha, etc.).

```json
{
  "message": "Paquete abierto exitosamente",

## 3. Apertura de paquete
- El usuario selecciona un paquete y lo abre.
- El frontend llama a:
  - `POST /api/user-packages/open` con el ID del paquete y el userId.
- El backend asigna los personajes, ítems y VAL al usuario y elimina el paquete de `user_packages`.
- La respuesta incluye los objetos asignados:
  ```json
  {
    "ok": true,
    "assigned": ["personajeId1", "personajeId2"],
    "summary": {
      "charactersReceived": 2,
      "itemsReceived": 3,
      "valReceived": 100,
      "totalCharacters": 5,
      "totalItems": 10,
      "valBalance": 200
    }
  }
  ```

```typescript
// Al abrir un paquete

## 4. Actualización de inventario y personajes
- El frontend actualiza la vista de inventario y personajes con los nuevos objetos recibidos.
- El paquete abierto ya no aparece en "Paquetes por abrir".

resultado.items.forEach(i => mostrarItem(i));
// Actualizar saldo VAL
actualizarVal(resultado.val);
```

## 5. Resumen del flujo correcto

## 5. Ventajas del flujo

4. El frontend muestra y actualiza la UI con los nuevos personajes, ítems y VAL.
- Botón para abrir cada paquete.
- Al abrir, muestra los objetos recibidos y actualiza la vista.

## 7. Ejemplo Angular/TS para mostrar y abrir paquetes

### Servicio para obtener y abrir paquetes
```typescript
// package.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class PackageService {
  constructor(private http: HttpClient) {}

  getPackagesByEmail(email: string) {
    return this.http.post<any[]>('/api/user-packages/por-correo', { email }, { withCredentials: true });
  }

  openPackage(userPackageId: string, userId: string) {
    return this.http.post('/api/user-packages/open', { userPackageId, userId }, { withCredentials: true });
  }
}
```

### Componente para mostrar y abrir paquetes
```typescript
// user-packages.component.ts
import { Component, OnInit } from '@angular/core';
import { PackageService } from './package.service';

@Component({
  selector: 'app-user-packages',
  template: `
    <div *ngIf="packages.length">
      <div *ngFor="let pkg of packages">
        <strong>{{ pkg.packageSnapshot?.nombre || 'Paquete' }}</strong>
        <button (click)="abrirPaquete(pkg._id)">Abrir</button>
      </div>
    </div>
    <div *ngIf="opened">
      <h3>¡Paquete abierto!</h3>
      <div *ngIf="opened.summary">
        <p>Personajes recibidos: {{ opened.summary.charactersReceived }}</p>
        <p>Items recibidos: {{ opened.summary.itemsReceived }}</p>
        <p>VAL recibido: {{ opened.summary.valReceived }}</p>
      </div>
    </div>
  `
})
export class UserPackagesComponent implements OnInit {
  packages: any[] = [];
  opened: any = null;
  email = 'proyectoagesh@gmail.com'; // Puedes obtenerlo del usuario logueado
  userId = '...'; // Debes obtenerlo del usuario logueado

  constructor(private packageService: PackageService) {}

  ngOnInit() {
    this.packageService.getPackagesByEmail(this.email).subscribe(pkgs => this.packages = pkgs);
  }

  abrirPaquete(pkgId: string) {
    this.packageService.openPackage(pkgId, this.userId).subscribe(res => {
      this.opened = res;
      // Actualiza la lista de paquetes
      this.packageService.getPackagesByEmail(this.email).subscribe(pkgs => this.packages = pkgs);
    });
  }
}
```

### Vista ejemplo
```html
<app-user-packages></app-user-packages>
```

---
Con esto puedes mostrar los paquetes pendientes y abrirlos, actualizando la UI con las recompensas recibidas.

