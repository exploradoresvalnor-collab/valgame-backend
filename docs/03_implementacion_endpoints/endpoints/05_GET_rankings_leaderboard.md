# GET /api/rankings/leaderboard/:category - Leaderboards Detallados

**Endpoint:** `GET /api/rankings/leaderboard/:category`  
**Método:** GET  
**Autenticación:** No requerida  
**Uso:** Ver rankings filtrados por categoría

---

## 📋 ESPECIFICACIÓN

**URL:** `/api/rankings/leaderboard/nivel?page=1&limit=50`

**Path Parameters:**
- `category` (string): 'nivel', 'victorias', 'winrate', 'riqueza', 'actividad', 'tiempo_jugado'

**Query Parameters:**
- `page` (number, default 1)
- `limit` (number, default 50)
- `timeframe` (string): 'global', 'weekly', 'monthly'

**Response (200):**

```json
{
  "ok": true,
  "category": "nivel",
  "timeframe": "global",
  "leaderboard": [
    {
      "posicion": 1,
      "userId": "user_001",
      "username": "JuanElCampeón",
      "valor": 50,
      "cambio_posicion": 2,
      "insignia": "👑 Rey",
      "puntos_ranking": 5000,
      "secundario": {
        "victorias": 250,
        "tasa_victoria": 84.7
      }
    }
  ],
  "user_position": {
    "posicion": 42,
    "username": "TuNombre",
    "valor": 35,
    "puntos_ranking": 2500
  },
  "total_players": 1523,
  "page": 1,
  "pages": 31,
  "last_updated": "2025-11-30T12:00:00Z"
}
```

**Status 400:** Categoría inválida

---

## 🛠️ BACKEND

Controlador:

```typescript
export const getLeaderboardByCategory = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 50, timeframe = 'global' } = req.query;
    
    const validCategories = ['nivel', 'victorias', 'winrate', 'riqueza', 'actividad', 'tiempo_jugado'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ 
        ok: false, 
        error: `Categoría inválida. Opciones: ${validCategories.join(', ')}`
      });
    }
    
    // Construir pipeline de agregación según categoría
    let sortField = {};
    
    switch(category) {
      case 'nivel':
        sortField = { 'usuario.nivel_promedio': -1 };
        break;
      case 'victorias':
        sortField = { 'ranking.victorias': -1 };
        break;
      case 'winrate':
        sortField = { 'ranking.winrate': -1 };
        break;
      case 'riqueza':
        sortField = { 'usuario.val': -1 };
        break;
      case 'tiempo_jugado':
        sortField = { 'usuario.tiempo_jugado': -1 };
        break;
    }
    
    // Agregar datos
    const leaderboard = await User.aggregate([
      {
        $lookup: {
          from: 'rankings',
          localField: '_id',
          foreignField: 'userId',
          as: 'ranking'
        }
      },
      { $sort: sortField },
      { $skip: (Number(page) - 1) * Number(limit) },
      { $limit: Number(limit) },
      {
        $project: {
          username: 1,
          val: 1,
          nivel_promedio: {
            $cond: [
              { $gt: [{ $size: '$personajes' }, 0] },
              { $avg: '$personajes.nivel' },
              0
            ]
          }
        }
      }
    ]);
    
    // Agregar posición a cada resultado
    const leaderboardWithPosition = leaderboard.map((user, idx) => ({
      posicion: (Number(page) - 1) * Number(limit) + idx + 1,
      userId: user._id,
      username: user.username,
      valor: user.nivel_promedio,
      puntos_ranking: user.ranking?.[0]?.puntos || 0
    }));
    
    const total = await User.countDocuments();
    
    res.json({
      ok: true,
      category,
      timeframe,
      leaderboard: leaderboardWithPosition,
      total_players: total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      last_updated: new Date()
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ ok: false, error: 'Error interno' });
  }
};
```

Rutas:

```typescript
// En src/routes/rankings.routes.ts
router.get('/leaderboard/:category', getLeaderboardByCategory);
```

