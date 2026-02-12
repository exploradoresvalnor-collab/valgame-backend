# GET /api/achievements/:userId - Logros de Usuario

**Endpoint:** `GET /api/achievements/:userId`  
**Método:** GET  
**Autenticación:** Requerida  
**Uso:** Ver logros desbloqueados por un usuario

---

## 📋 ESPECIFICACIÓN

**URL:** `/api/achievements/507f1f77bcf86cd799439012`

**Query Parameters:**
- `unlocked` (boolean, opcional)
- `category` (string, opcional)

**Response (200):**

```json
{
  "ok": true,
  "userId": "507f1f77bcf86cd799439012",
  "achievements_unlocked": [
    {
      "id": "achievement_001",
      "nombre": "Primera Victoria",
      "unlocked": true,
      "unlockedAt": "2024-02-01T00:00:00Z",
      "progress": 100,
      "maxProgress": 1
    }
  ],
  "achievements_locked": [
    {
      "id": "achievement_002",
      "nombre": "100 Victorias",
      "unlocked": false,
      "progress": 23,
      "maxProgress": 100
    }
  ],
  "stats": {
    "total_achievements": 150,
    "unlocked_count": 42,
    "progress_percentage": 28
  }
}
```

---

## 🛠️ BACKEND

Crear modelo `UserAchievement.ts`:

```typescript
import { Schema, model } from 'mongoose';

const UserAchievementSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  achievementId: { type: Schema.Types.ObjectId, ref: 'Achievement' },
  unlocked: Boolean,
  unlockedAt: Date,
  progress: Number,
  maxProgress: Number
});

export const UserAchievement = model('UserAchievement', UserAchievementSchema);
```

Controlador:

```typescript
export const getUserAchievements = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    
    const userAchievements = await UserAchievement.find({ userId })
      .populate('achievementId');
    
    const unlocked = userAchievements.filter(ua => ua.unlocked);
    const locked = userAchievements.filter(ua => !ua.unlocked);
    
    res.json({
      ok: true,
      userId,
      achievements_unlocked: unlocked,
      achievements_locked: locked,
      stats: {
        total_achievements: userAchievements.length,
        unlocked_count: unlocked.length,
        progress_percentage: ((unlocked.length / userAchievements.length) * 100).toFixed(1)
      }
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: 'Error interno' });
  }
};
```

