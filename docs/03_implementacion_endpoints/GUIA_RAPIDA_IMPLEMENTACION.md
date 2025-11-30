# 🚀 GUÍA RÁPIDA DE IMPLEMENTACIÓN - PASO A PASO

**Versión:** 1.0  
**Tiempo estimado:** 3-4 horas de implementación  
**Complejidad:** Media

---

## 📋 RESUMEN DE TAREAS

```
┌─────────────────────────────────────────────────────────┐
│  TAREAS DE IMPLEMENTACIÓN - ORDEN RECOMENDADO           │
└─────────────────────────────────────────────────────────┘

BACKEND:
[  ] Tarea 1: Implementar GET /api/dungeons/:id (15 min)
[  ] Tarea 2: Implementar GET /api/user/profile/:userId (15 min)
[  ] Tarea 3: Crear modelo Achievement (10 min)
[  ] Tarea 4: Implementar GET /api/achievements (10 min)
[  ] Tarea 5: Crear modelo UserAchievement (10 min)
[  ] Tarea 6: Implementar GET /api/achievements/:userId (10 min)
[  ] Tarea 7: Implementar GET /api/rankings/leaderboard/:category (20 min)
[  ] Tarea 8: npm run build & npm run test (10 min)

FRONTEND:
[  ] Tarea 9: Crear servicios Angular (5 endpoints) (30 min)
[  ] Tarea 10: Crear componentes (5 pantallas) (1 hora)
[  ] Tarea 11: Conectar rutas (20 min)
[  ] Tarea 12: Testing en navegador (20 min)

DOCUMENTACIÓN:
[  ] Tarea 13: Revisar y limpiar docs (20 min)
```

---

## 🔧 PASO 1: IMPLEMENTACIÓN BACKEND

### 1.1 - GET /api/dungeons/:id (15 minutos)

**Archivo:** `src/controllers/dungeons.controller.ts`

Agregar función:

```typescript
import { isValidObjectId } from 'mongoose';

export const getDungeonDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Validar ID
    if (!isValidObjectId(id)) {
      return res.status(400).json({ ok: false, error: 'ID inválido' });
    }
    
    // Buscar mazmorra
    const dungeon = await Dungeon.findById(id);
    if (!dungeon) {
      return res.status(404).json({ ok: false, error: 'Mazmorra no encontrada' });
    }
    
    // Calcular estadísticas
    const stats = await PlayerStat.aggregate([
      { $group: { _id: null, avg_val: { $avg: '$valAcumulado' } } }
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
          victorias_totales: 0,
          derrotas_totales: 0,
          tasa_victoria: 0,
          tiempo_promedio_combate_segundos: 45
        },
        nivel_minimo_para_items_exclusivos: dungeon.nivel_minimo_para_exclusivos || 20,
        items_exclusivos: dungeon.items_exclusivos || []
      }
    });
  } catch (error) {
    console.error('[GET-DUNGEON-DETAILS] Error:', error);
    res.status(500).json({ ok: false, error: 'Error interno' });
  }
};
```

**Archivo:** `src/routes/dungeons.routes.ts`

Agregar ruta:

```typescript
import { getDungeonDetails } from '../controllers/dungeons.controller';

// AGREGAR ANTES de router.post('/:dungeonId/start')
router.get('/:id', getDungeonDetails);

// Resto de rutas existentes...
```

**Test:**
```bash
curl -X GET http://localhost:8080/api/dungeons/ID_AQUI
```

---

### 1.2 - GET /api/user/profile/:userId (15 minutos)

**Archivo:** `src/controllers/users.controller.ts`

Agregar función:

```typescript
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ ok: false, error: 'ID inválido' });
    }
    
    const user = await User.findById(userId)
      .populate({ path: 'personajes.equipamiento', model: 'Item' })
      .lean();
    
    if (!user) {
      return res.status(404).json({ ok: false, error: 'Usuario no encontrado' });
    }
    
    const nivel_promedio = user.personajes?.length > 0 
      ? Math.round(user.personajes.reduce((sum, p) => sum + p.nivel, 0) / user.personajes.length)
      : 0;
    
    const total_combates = (user.dungeon_stats?.total_victorias || 0) + (user.dungeon_stats?.total_derrotas || 0);
    const tasa_victoria = total_combates > 0 
      ? ((user.dungeon_stats?.total_victorias || 0) / total_combates * 100).toFixed(1)
      : 0;
    
    res.json({
      ok: true,
      profile: {
        userId: user._id,
        username: user.username,
        email: user.email,
        joinDate: user.createdAt,
        lastActive: user.updatedAt,
        stats: {
          nivel_promedio_personajes: nivel_promedio,
          victorias_totales: user.dungeon_stats?.total_victorias || 0,
          derrotas_totales: user.dungeon_stats?.total_derrotas || 0,
          tasa_victoria: Number(tasa_victoria),
          val_total: user.val || 0,
          evo_total: user.evo || 0,
          tiempo_jugado_horas: 0,
          mazmorras_completadas: user.dungeon_stats?.total_victorias || 0,
          items_unicos_coleccionados: (user.inventarioEquipamiento?.length || 0) + (user.inventarioConsumibles?.length || 0)
        },
        personajes: user.personajes?.map(p => ({
          personajeId: p.personajeId,
          nombre: p.nombre,
          nivel: p.nivel,
          rango: p.rango,
          etapa: p.etapa
        })) || [],
        logros_desbloqueados: [],
        equipamiento_activo: []
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ ok: false, error: 'Error interno' });
  }
};
```

**Archivo:** `src/routes/users.routes.ts`

Agregar ruta:

```typescript
router.get('/profile/:userId', auth, getUserProfile);
```

---

### 1.3-1.7: Achievements y Rankings (60 minutos)

Los endpoints de achievements y rankings ya están parcialmente documentados en sus archivos específicos.

**Verificar qué falta implementar** antes de hacer cambios. Algunos pueden estar parcialmente hechos.

---

### 1.8 - Compilar y Verificar (10 minutos)

```bash
# Compilar
npm run build

# Si hay errores, revisar e corregir
# Si compila OK, iniciar servidor
npm start

# En otra terminal, verificar endpoints
curl -X GET http://localhost:8080/api/dungeons/ID
curl -X GET http://localhost:8080/api/users/profile/ID
```

---

## 📱 PASO 2: IMPLEMENTACIÓN FRONTEND

### 2.1 - Crear Servicios (30 minutos)

**Archivo:** `src/app/services/dungeon.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DungeonService {
  private apiUrl = '/api/dungeons';

  constructor(private http: HttpClient) { }

  getDungeonDetails(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
}
```

**Archivo:** `src/app/services/user.service.ts`

```typescript
getUserProfile(userId: string): Observable<any> {
  return this.http.get(`/api/users/profile/${userId}`);
}
```

**Archivo:** `src/app/services/ranking.service.ts`

```typescript
getLeaderboardByCategory(category: string, page: number = 1): Observable<any> {
  return this.http.get(`/api/rankings/leaderboard/${category}`, {
    params: { page, limit: 50 }
  });
}
```

---

### 2.2 - Crear Componentes (1 hora)

```bash
# Generar componentes
ng g c components/dungeon-details
ng g c components/user-profile
ng g c components/leaderboard
ng g c components/achievements
ng g c components/achievements-user
```

Cada componente necesita:
- `*.component.ts` - Lógica
- `*.component.html` - Template
- `*.component.css` - Estilos

Ver ejemplos en archivo `01_GET_dungeons_id.md`

---

### 2.3 - Conectar Rutas (20 minutos)

**Archivo:** `src/app/app-routing.module.ts`

```typescript
const routes: Routes = [
  // Existentes...
  {
    path: 'dungeons/:id',
    component: DungeonDetailsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'profile/:userId',
    component: UserProfileComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'rankings/:category',
    component: LeaderboardComponent
  },
  {
    path: 'achievements',
    component: AchievementsComponent
  },
  // ... más rutas
];
```

---

### 2.4 - Testing en Navegador (20 minutos)

1. Compilar frontend: `ng build` (o `ng serve` para desarrollo)
2. Navegar a cada pantalla
3. Verificar que carga datos correctamente
4. Probar filtros y paginación
5. Verificar errores en consola

---

## ✅ CHECKLIST FINAL

**Backend:**
- [ ] GET /api/dungeons/:id compila y responde
- [ ] GET /api/user/profile/:userId compila y responde
- [ ] GET /api/achievements compila y responde (si se implementó)
- [ ] GET /api/achievements/:userId compila y responde (si se implementó)
- [ ] GET /api/rankings/leaderboard/:category compila y responde (si se implementó)
- [ ] `npm run build` sin errores
- [ ] `npm start` inicia sin errores

**Frontend:**
- [ ] Servicios creados y compilados
- [ ] Componentes creados y compilados
- [ ] Rutas registradas
- [ ] App compila sin errores (`ng build` o `ng serve`)
- [ ] Pantallas cargan datos correctamente
- [ ] Navegación funciona entre pantallas

**Testing:**
- [ ] CURL requests funcionan
- [ ] Frontend puede navegar a nuevas pantallas
- [ ] Datos se muestran correctamente
- [ ] No hay errores en consola

---

## 🔗 REFERENCIAS RÁPIDAS

| Documento | Descripción |
|-----------|-------------|
| `00_MAESTRO_ENDPOINTS_NUEVOS.md` | Visión general de todos los endpoints |
| `flujos/FLUJO_COMPLETO_USUARIO.md` | Flujo paso a paso |
| `endpoints/01_GET_dungeons_id.md` | Detalles completos endpoint 1 |
| `endpoints/02_GET_user_profile.md` | Detalles completos endpoint 2 |
| `endpoints/03_GET_achievements.md` | Detalles completos endpoint 3 |
| `endpoints/04_GET_achievements_userId.md` | Detalles completos endpoint 4 |
| `endpoints/05_GET_rankings_leaderboard.md` | Detalles completos endpoint 5 |

