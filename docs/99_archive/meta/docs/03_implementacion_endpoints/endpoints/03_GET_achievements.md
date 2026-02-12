# GET /api/achievements - Lista de Logros

**Endpoint:** `GET /api/achievements`  
**Método:** GET  
**Autenticación:** No requerida  
**Uso:** Ver todos los logros disponibles en el juego

---

## 📋 ESPECIFICACIÓN

**URL:** `/api/achievements`

**Query Parameters:**
- `category` (string, opcional): 'combat', 'collection', 'social', 'progression'
- `page` (number, default 1)
- `limit` (number, default 20)

**Response (200):**

```json
{
  "ok": true,
  "achievements": [
    {
      "id": "achievement_001",
      "nombre": "Primera Victoria",
      "descripcion": "Completa tu primer dungeon",
      "icono": "url-icono",
      "rareza": "común",
      "categoria": "combat",
      "requisitos": { "tipo": "victorias_mazmorra", "valor": 1 },
      "recompensas": { "puntos": 10, "badge": "Primera Victoria" }
    }
  ],
  "total": 150,
  "page": 1,
  "pages": 8
}
```

---

## 🛠️ BACKEND

Primero crear modelo `Achievement.ts`:

```typescript
import { Schema, model } from 'mongoose';

const AchievementSchema = new Schema({
  nombre: String,
  descripcion: String,
  icono: String,
  rareza: { type: String, enum: ['común', 'raro', 'épico', 'legendario'] },
  categoria: { type: String, enum: ['combat', 'collection', 'social', 'progression'] },
  requisitos: {
    tipo: String,
    valor: Number
  },
  recompensas: {
    puntos: Number,
    badge: String
  }
});

export const Achievement = model('Achievement', AchievementSchema);
```

Controlador:

```typescript
export const getAchievements = async (req: Request, res: Response) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    const filter: any = {};
    
    if (category) filter.categoria = category;
    
    const achievements = await Achievement.find(filter)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    
    const total = await Achievement.countDocuments(filter);
    
    res.json({
      ok: true,
      achievements,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: 'Error interno' });
  }
};
```

