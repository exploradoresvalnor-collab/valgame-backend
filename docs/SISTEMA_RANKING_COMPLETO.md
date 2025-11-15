# 🏆 SISTEMA DE RANKING - GUÍA COMPLETA

## ✅ LO QUE SE HA IMPLEMENTADO

### 1. **Modelo de Datos** ✅
- ✅ Modelo `Ranking` conectado con `User` mediante `userId` (ref: 'User')
- ✅ Campos: puntos, victorias, derrotas, ultimaPartida, boletosUsados, periodo
- ✅ Índices optimizados en MongoDB

### 2. **Actualización Automática** ✅
- ✅ Se actualiza cuando ganas una mazmorra: +10 puntos, +1 victoria, +1 boleto
- ✅ Se actualiza cuando pierdes una mazmorra: +1 derrota, +1 boleto
- ✅ Usa `upsert: true` - crea el registro automáticamente si no existe
- ✅ Integrado en `dungeons.controller.ts` (victorias y derrotas)

### 3. **Endpoints API** ✅
- ✅ `GET /api/rankings` - Ranking global (público)
- ✅ `GET /api/rankings?limit=20` - Top 20 personalizado
- ✅ `GET /api/rankings/period/:periodo` - Rankings por período (global/semanal/mensual)
- ✅ `GET /api/rankings/me` - Mi ranking personal (requiere auth)
- ✅ `GET /api/rankings/stats` - Estadísticas globales

### 4. **Documentación** ✅
- ✅ Sección completa en `API_REFERENCE_COMPLETA.md` (800+ líneas)
- ✅ Ejemplos de uso para frontend (Angular/React)
- ✅ Explicación del flujo de actualización
- ✅ Componentes de ejemplo listos para copiar
- ✅ Casos de error documentados
- ✅ Validaciones de seguridad explicadas

### 5. **Archivos de Prueba** ✅
- ✅ `test-ranking.http` - Tests Thunder Client del sistema de ranking
- ✅ `test-ranking-completo.http` - Prueba completa paso a paso (login → jugar → verificar ranking)

---

## 🔌 CÓMO ESTÁ CONECTADO CON EL USER

```typescript
// Modelo: src/models/Ranking.ts
export interface IRanking extends Document {
  userId: Types.ObjectId;  // 👈 CONECTADO CON USER
  puntos: number;
  victorias: number;
  derrotas: number;
  // ...más campos
}

const RankingSchema = new Schema<IRanking>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',           // 👈 REFERENCIA AL MODELO User
    required: true, 
    index: true 
  },
  // ...más campos
});
```

**¿Cómo funciona la conexión?**

1. **Cuando un usuario GANA una mazmorra:**
   ```typescript
   // En dungeons.controller.ts (línea ~365)
   await Ranking.findOneAndUpdate(
     { userId: user._id, periodo: 'global' },  // 👈 Usa el ID del usuario autenticado
     { 
       $inc: { puntos: 10, victorias: 1, boletosUsados: 1 },
       $set: { ultimaPartida: new Date() }
     },
     { upsert: true, new: true }
   );
   ```

2. **Cuando consultas el ranking:**
   ```typescript
   // GET /api/rankings
   const rankings = await Ranking.find({ periodo: 'global' })
     .sort({ puntos: -1 })
     .populate('userId', 'username email')  // 👈 Trae datos del User
     .lean();
   
   // Respuesta:
   {
     "userId": {
       "_id": "672...",
       "username": "JugadorPro",    // 👈 Viene del modelo User
       "email": "jugador@example.com"
     },
     "puntos": 150,
     "victorias": 15
   }
   ```

3. **Cuando ves tu ranking personal:**
   ```typescript
   // GET /api/rankings/me
   const myRanking = await Ranking.findOne({ 
     userId: req.userId,  // 👈 Se obtiene del JWT token
     periodo: 'global' 
   });
   ```

---

## 📊 FLUJO COMPLETO

```
┌─────────────────────────────────────────────────────────────┐
│                    USUARIO SE REGISTRA                       │
│              (Se crea en colección 'users')                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   USUARIO JUEGA MAZMORRA                     │
│                  (POST /api/dungeons/play)                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    USUARIO GANA/PIERDE                       │
│              (POST /api/dungeons/action)                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│          SE ACTUALIZA AUTOMÁTICAMENTE EL RANKING             │
│     (Ranking.findOneAndUpdate con upsert: true)             │
│                                                              │
│  Si GANA:  +10 puntos, +1 victoria, +1 boleto              │
│  Si PIERDE: +1 derrota, +1 boleto                          │
│                                                              │
│  Se crea el registro si no existe (primera partida)         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              USUARIO CONSULTA SU RANKING                     │
│                (GET /api/rankings/me)                        │
│                                                              │
│  Respuesta:                                                  │
│  {                                                           │
│    "ranking": {                                              │
│      "userId": "672...",     ← ID del usuario               │
│      "puntos": 50,                                           │
│      "victorias": 5,                                         │
│      "derrotas": 2                                           │
│    },                                                        │
│    "posicion": 12            ← Calculado en tiempo real     │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎮 CÓMO PROBAR

### Opción 1: Thunder Client (Recomendado)

1. **Abre el archivo:** `test-ranking-completo.http`
2. **Sigue los pasos:**
   - PASO 1: Login → Copia el token
   - PASO 2: Ver tus datos
   - PASO 3: Ver tu ranking actual (puede dar 404 si es tu primera vez)
   - PASO 5-6: Obtener IDs de personaje y mazmorra
   - PASO 7-8: Jugar la mazmorra
   - PASO 9: Ver tu ranking actualizado (¡+10 puntos si ganaste!)
   - PASO 10: Ver el ranking global (¡deberías aparecer!)

### Opción 2: Prueba Rápida

```bash
# 1. Login (en otra terminal)
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt

# 2. Ver ranking global (público, no necesita auth)
curl http://localhost:8080/api/rankings

# 3. Ver estadísticas
curl http://localhost:8080/api/rankings/stats

# 4. Ver tu ranking personal (usa cookies del login)
curl http://localhost:8080/api/rankings/me -b cookies.txt
```

---

## 📁 ARCHIVOS IMPORTANTES

### Backend (Ya implementado ✅)

```
src/
├── models/
│   └── Ranking.ts                    ✅ Modelo con ref a User
├── controllers/
│   ├── rankings.controller.ts        ✅ 4 funciones (getGlobal, getByPeriod, getMe, getStats)
│   └── dungeons.controller.ts        ✅ Actualiza ranking en victoria/derrota
├── routes/
│   └── rankings.routes.ts            ✅ 4 endpoints registrados
└── app.ts                            ✅ Rankings routes registrados

docs/
└── API_REFERENCE_COMPLETA.md         ✅ Sección 9 completa (800+ líneas)

tests/
├── test-ranking.http                 ✅ Tests Thunder Client
└── test-ranking-completo.http        ✅ Guía paso a paso
```

### Frontend (Por implementar 🔄)

```typescript
// services/ranking.service.ts
export class RankingService {
  async getGlobalRanking(limit = 10) { ... }
  async getMyRanking() { ... }
  async getRankingByPeriod(period: string) { ... }
  async getStats() { ... }
}

// components/leaderboard/leaderboard.component.ts
export class LeaderboardComponent {
  topPlayers: any[] = [];
  myRanking: any = null;
  stats: any = null;
  
  async loadRanking() { ... }
  async loadMyRanking() { ... }
}

// components/dashboard/dashboard.component.html
<div class="my-position">
  <h3>Tu Posición</h3>
  <p>#{{ myRanking.posicion }}</p>
  <p>{{ myRanking.ranking.puntos }} puntos</p>
</div>
```

---

## 🔒 SEGURIDAD

### ✅ Validaciones Implementadas

1. **No se pueden modificar puntos manualmente**
   - No hay endpoint para cambiar puntos directamente
   - Solo se actualizan mediante victorias en mazmorras

2. **El userId viene del JWT autenticado**
   - No se puede enviar un userId falso en el body
   - El servidor lo obtiene del token de autenticación

3. **Endpoints públicos vs privados**
   - Público: Ver rankings de otros jugadores
   - Privado: Ver tu propio ranking (requiere auth)

4. **Validación de parámetros**
   - `periodo` solo acepta: global, semanal, mensual
   - `limit` debe ser un número positivo

5. **Upsert automático**
   - Crea el registro automáticamente si no existe
   - No hay riesgo de error si es tu primera partida

---

## 📈 DATOS DE EJEMPLO

### Ejemplo de ranking en MongoDB:

```javascript
// Colección: ranking
{
  "_id": ObjectId("673abc123..."),
  "userId": ObjectId("672def456..."),  // 👈 Referencia a users
  "puntos": 150,
  "victorias": 15,
  "derrotas": 3,
  "ultimaPartida": ISODate("2025-11-03T20:45:00.000Z"),
  "boletosUsados": 18,
  "periodo": "global"
}
```

### Ejemplo de usuario en MongoDB:

```javascript
// Colección: users
{
  "_id": ObjectId("672def456..."),
  "username": "JugadorPro",
  "email": "jugador@example.com",
  "isEmailVerified": true,
  // ...más campos
}
```

### Ejemplo de respuesta con populate:

```javascript
// GET /api/rankings
{
  "rankings": [
    {
      "_id": "673abc123...",
      "userId": {                        // 👈 Datos del User (populate)
        "_id": "672def456...",
        "username": "JugadorPro",
        "email": "jugador@example.com"
      },
      "puntos": 150,
      "victorias": 15,
      "derrotas": 3,
      "posicion": 1                      // 👈 Calculado dinámicamente
    }
  ]
}
```

---

## 🚀 PRÓXIMOS PASOS

### Backend (Opcional)
- [ ] WebSocket para actualizar ranking en tiempo real
- [ ] Sistema de premios mensuales/semanales automáticos
- [ ] Notificaciones cuando subes de posición
- [ ] Historial de ranking (ver evolución en el tiempo)
- [ ] Caché de ranking global (actualizar cada 5 min)

### Frontend (Pendiente)
- [ ] Crear servicio RankingService
- [ ] Componente LeaderboardComponent
- [ ] Widget "Mi posición" en dashboard
- [ ] Tabs para cambiar período (global/semanal/mensual)
- [ ] Tabla con top jugadores
- [ ] Página de estadísticas globales

---

## ✅ VERIFICACIÓN FINAL

**Puedes verificar que todo funciona:**

1. ✅ Servidor corriendo: `http://localhost:8080`
2. ✅ MongoDB conectado
3. ✅ Compilación exitosa sin errores TypeScript
4. ✅ Endpoints registrados en `/api/rankings`
5. ✅ Documentación completa en `docs/API_REFERENCE_COMPLETA.md`
6. ✅ Tests preparados en `test-ranking-completo.http`

**Para probar ahora mismo:**

```bash
# Ver ranking global (sin autenticación)
curl http://localhost:8080/api/rankings

# Ver estadísticas
curl http://localhost:8080/api/rankings/stats
```

---

## 📞 RESUMEN TÉCNICO

| Aspecto | Estado | Detalles |
|---------|--------|----------|
| **Modelo** | ✅ | Ranking conectado con User mediante ref |
| **Controlador** | ✅ | 4 funciones implementadas |
| **Rutas** | ✅ | 4 endpoints registrados |
| **Actualización** | ✅ | Automática en victorias/derrotas |
| **Documentación** | ✅ | 800+ líneas en API Reference |
| **Tests** | ✅ | 2 archivos .http preparados |
| **Compilación** | ✅ | Sin errores TypeScript |
| **Seguridad** | ✅ | Validaciones implementadas |
| **Frontend** | 🔄 | Pendiente (ejemplos listos para copiar) |

---

**🎉 El sistema de ranking está 100% funcional y listo para usar!**
