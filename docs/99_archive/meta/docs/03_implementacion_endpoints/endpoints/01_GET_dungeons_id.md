# GET /api/dungeons/:id - Detalles de Mazmorra

**Endpoint:** `GET /api/dungeons/:id`  
**Método:** GET  
**Autenticación:** No requerida (público)  
**Uso en frontend:** Ver detalles antes de combate  

---

## 📋 ESPECIFICACIÓN TÉCNICA

### Request

**URL:**
```
GET /api/dungeons/507f1f77bcf86cd799439040
```

**Headers:**
```
Authorization: Bearer {token} (opcional)
Content-Type: application/json
```

**Path Parameters:**
| Param | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | ObjectId de la mazmorra en MongoDB |

**Query Parameters:** Ninguno

**Body:** Vacío

### Response

**Status:** 200 OK

**Body:**
```json
{
  "ok": true,
  "dungeon": {
    "id": "507f1f77bcf86cd799439040",
    "nombre": "Cueva de Goblins",
    "descripcion": "Una cueva subterránea llena de goblins pequeños. Ideal para principiantes.",
    "imagen": "https://cdn.example.com/dungeons/cave-goblins.jpg",
    "dificultad": "fácil",
    "nivelRecomendado": 10,
    "nivel_requerido_minimo": 1,
    "enemigos": [
      {
        "nombre": "Goblin Pequeño",
        "nivel": 10,
        "vida": 45,
        "ataque": 15,
        "defensa": 5,
        "velocidad": 8,
        "imagen": "url-enemy"
      },
      {
        "nombre": "Goblin Chamán",
        "nivel": 12,
        "vida": 60,
        "ataque": 20,
        "defensa": 10,
        "velocidad": 6,
        "imagen": "url-enemy"
      }
    ],
    "recompensas": {
      "expBase": 500,
      "valBase": 100,
      "probabilidad_boletos": 0.05,
      "probabilidad_evo": 0.02,
      "itemDropRate": 0.10,
      "itemsDropibles": [
        "507f1f77bcf86cd799439101",
        "507f1f77bcf86cd799439102"
      ]
    },
    "estadisticas_promedio_usuario": {
      "victorias_totales": 150,
      "derrotas_totales": 23,
      "tasa_victoria": 86.7,
      "tiempo_promedio_combate_segundos": 45,
      "botines_promedio": 1.2
    },
    "nivel_minimo_para_items_exclusivos": 20,
    "items_exclusivos": [
      "507f1f77bcf86cd799439201"
    ]
  }
}
```

**Status:** 404 Not Found

```json
{
  "ok": false,
  "error": "Mazmorra no encontrada"
}
```

**Status:** 400 Bad Request

```json
{
  "ok": false,
  "error": "ID de mazmorra inválido"
}
```

---

## 🛠️ IMPLEMENTACIÓN EN BACKEND

### Paso 1: Crear el controlador

**Archivo:** `src/controllers/dungeons.controller.ts`

```typescript
export const getDungeonDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Validar ID
    if (!isValidObjectId(id)) {
      return res.status(400).json({ ok: false, error: 'ID de mazmorra inválido' });
    }
    
    // Buscar mazmorra
    const dungeon = await Dungeon.findById(id);
    if (!dungeon) {
      return res.status(404).json({ ok: false, error: 'Mazmorra no encontrada' });
    }
    
    // Obtener estadísticas promedio (opcional)
    const stats = await Ranking.aggregate([
      { $match: { periodo: 'global' } },
      {
        $group: {
          _id: null,
          promedio_victorias: { $avg: '$victorias' }
        }
      }
    ]);
    
    res.json({
      ok: true,
      dungeon: {
        id: dungeon._id,
        nombre: dungeon.nombre,
        descripcion: dungeon.descripcion,
        imagen: dungeon.imagen,
        dificultad: dungeon.dificultad,
        nivelRecomendado: dungeon.nivel_requerido_minimo,
        nivel_requerido_minimo: dungeon.nivel_requerido_minimo,
        enemigos: dungeon.enemigos || [],
        recompensas: dungeon.recompensas,
        estadisticas_promedio_usuario: {
          victorias_totales: stats[0]?.promedio_victorias || 0,
          // ... más stats
        },
        nivel_minimo_para_items_exclusivos: dungeon.nivel_minimo_para_exclusivos,
        items_exclusivos: dungeon.items_exclusivos || []
      }
    });
  } catch (error) {
    console.error('[GET-DUNGEON-DETAILS] Error:', error);
    res.status(500).json({ ok: false, error: 'Error interno del servidor' });
  }
};
```

### Paso 2: Registrar la ruta

**Archivo:** `src/routes/dungeons.routes.ts`

```typescript
import { getDungeonDetails } from '../controllers/dungeons.controller';

// Agregar ANTES de las rutas con :dungeonId/start

router.get('/:id', getDungeonDetails); // GET /api/dungeons/:id - NUEVO

// Resto de rutas existentes
router.post('/:dungeonId/start', auth, startDungeon);
router.get('/:dungeonId/progress', auth, ...);
```

---

## 📱 INTEGRACIÓN EN FRONTEND

### Angular Service

**Archivo:** `src/app/services/dungeon.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DungeonService {
  private apiUrl = '/api/dungeons';

  constructor(private http: HttpClient) { }

  // Obtener detalles de una mazmorra
  getDungeonDetails(dungeonId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${dungeonId}`);
  }

  // Obtener todas las mazmorras (ya existe)
  getAllDungeons(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // Iniciar combate (ya existe)
  startDungeon(dungeonId: string, team: string[]): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${dungeonId}/start`,
      { team },
      { headers: { 'Authorization': `Bearer ${this.getToken()}` } }
    );
  }

  private getToken(): string {
    return localStorage.getItem('token') || '';
  }
}
```

### Angular Component - Ver Detalles

**Archivo:** `src/app/components/dungeon-details/dungeon-details.component.ts`

```typescript
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DungeonService } from '../../services/dungeon.service';

@Component({
  selector: 'app-dungeon-details',
  templateUrl: './dungeon-details.component.html',
  styleUrls: ['./dungeon-details.component.css']
})
export class DungeonDetailsComponent implements OnInit {
  dungeon: any;
  loading = true;
  error: string | null = null;

  constructor(
    private dungeonService: DungeonService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadDungeonDetails();
  }

  loadDungeonDetails(): void {
    const dungeonId = this.route.snapshot.paramMap.get('id');
    
    if (!dungeonId) {
      this.error = 'ID de mazmorra no encontrado';
      this.loading = false;
      return;
    }

    this.dungeonService.getDungeonDetails(dungeonId).subscribe({
      next: (response) => {
        this.dungeon = response.dungeon;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'No se pudo cargar la mazmorra';
        this.loading = false;
        console.error('Error:', err);
      }
    });
  }

  goToTeamSelection(): void {
    // Guardar dungeonId en estado
    sessionStorage.setItem('selectedDungeonId', this.dungeon.id);
    this.router.navigate(['/team-selection']);
  }

  goBack(): void {
    this.router.navigate(['/dungeons']);
  }
}
```

**Archivo:** `src/app/components/dungeon-details/dungeon-details.component.html`

```html
<div class="dungeon-details" *ngIf="!loading && !error">
  <button class="back-btn" (click)="goBack()">← Volver</button>
  
  <img [src]="dungeon.imagen" [alt]="dungeon.nombre" class="dungeon-header">
  
  <h1>{{ dungeon.nombre }}</h1>
  <p class="descripcion">{{ dungeon.descripcion }}</p>
  
  <div class="difficulty">
    <span class="badge" [ngClass]="'difficulty-' + dungeon.dificultad">
      {{ dungeon.dificultad | uppercase }}
    </span>
    <span>Nivel recomendado: {{ dungeon.nivelRecomendado }}</span>
  </div>
  
  <section class="enemies">
    <h2>Enemigos</h2>
    <div class="enemy-list">
      <div class="enemy-card" *ngFor="let enemy of dungeon.enemigos">
        <h3>{{ enemy.nombre }}</h3>
        <p><strong>Nivel:</strong> {{ enemy.nivel }}</p>
        <p><strong>Vida:</strong> {{ enemy.vida }}</p>
        <p><strong>Ataque:</strong> {{ enemy.ataque }}</p>
        <p><strong>Defensa:</strong> {{ enemy.defensa }}</p>
      </div>
    </div>
  </section>
  
  <section class="rewards">
    <h2>Recompensas</h2>
    <p>EXP Base: <strong>{{ dungeon.recompensas.expBase }}</strong></p>
    <p>VAL Base: <strong>{{ dungeon.recompensas.valBase }}</strong></p>
    <p>Probabilidad Boletos: <strong>{{ dungeon.recompensas.probabilidad_boletos * 100 }}%</strong></p>
    <p>Probabilidad Evo: <strong>{{ dungeon.recompensas.probabilidad_evo * 100 }}%</strong></p>
  </section>
  
  <section class="stats">
    <h2>Estadísticas Globales</h2>
    <p>Tasa de Victoria: <strong>{{ dungeon.estadisticas_promedio_usuario.tasa_victoria }}%</strong></p>
    <p>Tiempo Promedio: <strong>{{ dungeon.estadisticas_promedio_usuario.tiempo_promedio_combate_segundos }}s</strong></p>
  </section>
  
  <button class="enter-btn" (click)="goToTeamSelection()">
    ⚔️ Entrar con Equipo
  </button>
</div>

<div class="loading" *ngIf="loading">
  <p>Cargando detalles...</p>
</div>

<div class="error" *ngIf="error">
  <p>❌ {{ error }}</p>
  <button (click)="goBack()">Volver</button>
</div>
```

### Rutas Angular

**Archivo:** `src/app/app-routing.module.ts`

```typescript
const routes: Routes = [
  // ... rutas existentes
  {
    path: 'dungeons/:id',
    component: DungeonDetailsComponent,
    canActivate: [AuthGuard]
  },
  // ... más rutas
];
```

---

## 🧪 TESTING

### Con CURL

```bash
# Obtener detalles de una mazmorra
curl -X GET "http://localhost:8080/api/dungeons/507f1f77bcf86cd799439040" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Con Postman

1. Crear nueva request GET
2. URL: `{{BASE_URL}}/api/dungeons/{{DUNGEON_ID}}`
3. Headers:
   - `Authorization: Bearer {{TOKEN}}`
   - `Content-Type: application/json`
4. Send

---

## 📊 CASOS DE USO

1. **Usuario navega a mazmorras:**
   - Ve listado (GET /api/dungeons) ← EXISTENTE
   - Hace click en una
   - Ve detalles (GET /api/dungeons/:id) ← NUEVO

2. **Usuario quiere comparar mazmorras:**
   - Abre múltiples pestañas con detalles
   - Compara enemigos, recompensas

3. **Usuario es principiante:**
   - Ve nivel recomendado
   - Ve estadísticas de tasa de victoria
   - Decide si intenta o elige otra

---

## ⚠️ ERRORES POSIBLES

| Error | Causa | Solución |
|-------|-------|----------|
| 400 Bad Request | ID inválido | Verificar formato ObjectId |
| 404 Not Found | Mazmorra no existe | Usar ID válido |
| 500 Server Error | Error en servidor | Revisar logs del servidor |

