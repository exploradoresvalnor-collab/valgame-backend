# GET /api/user/profile/:userId - Perfil de Usuario

**Endpoint:** `GET /api/user/profile/:userId`  
**Método:** GET  
**Autenticación:** Requerida (Bearer token)  
**Uso en frontend:** Ver perfil público de usuarios  

---

## 📋 ESPECIFICACIÓN TÉCNICA

### Request

**URL:**
```
GET /api/user/profile/507f1f77bcf86cd799439012
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Path Parameters:**
| Param | Tipo | Descripción |
|-------|------|-------------|
| `userId` | string | ObjectId del usuario en MongoDB |

---

## 📤 Response

**Status:** 200 OK

```json
{
  "ok": true,
  "profile": {
    "userId": "507f1f77bcf86cd799439012",
    "username": "JuanElCampeón",
    "email": "juan@example.com",
    "joinDate": "2024-01-15T00:00:00Z",
    "lastActive": "2025-11-30T12:00:00Z",
    "stats": {
      "nivel_promedio_personajes": 35,
      "victorias_totales": 250,
      "derrotas_totales": 45,
      "tasa_victoria": 84.7,
      "val_total": 150000,
      "evo_total": 25,
      "tiempo_jugado_horas": 240,
      "mazmorras_completadas": 180,
      "items_unicos_coleccionados": 245
    },
    "personajes": [
      {
        "personajeId": "char_001",
        "nombre": "Guerrero Valiente",
        "nivel": 50,
        "rango": "Épico",
        "etapa": 3,
        "imagen": "url-imagen"
      }
    ],
    "logros_desbloqueados": [
      {
        "id": "achievement_001",
        "nombre": "Primera Victoria",
        "descripcion": "Completa tu primer dungeon",
        "icono": "url-icono",
        "unlockedAt": "2024-02-01T00:00:00Z"
      }
    ],
    "equipamiento_activo": [
      {
        "slot": "arma",
        "nombre": "Espada Legendaria",
        "rareza": "legendario",
        "stats": { "atk": 50, "defensa": 10 }
      }
    ]
  }
}
```

**Status:** 401 Unauthorized

```json
{
  "ok": false,
  "error": "No autenticado"
}
```

**Status:** 404 Not Found

```json
{
  "ok": false,
  "error": "Usuario no encontrado"
}
```

---

## 🛠️ IMPLEMENTACIÓN EN BACKEND

### Crear controlador en `src/controllers/users.controller.ts`

```typescript
export const getUserProfile = async (req: AuthRequest, res: Response) => {
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
    
    // Calcular stats
    const stats = {
      nivel_promedio_personajes: user.personajes?.length > 0 
        ? Math.round(user.personajes.reduce((sum, p) => sum + p.nivel, 0) / user.personajes.length)
        : 0,
      victorias_totales: user.dungeon_stats?.total_victorias || 0,
      derrotas_totales: user.dungeon_stats?.total_derrotas || 0,
      tasa_victoria: ((user.dungeon_stats?.total_victorias || 0) / (((user.dungeon_stats?.total_victorias || 0) + (user.dungeon_stats?.total_derrotas || 0)) || 1) * 100).toFixed(1),
      val_total: user.val || 0,
      evo_total: user.evo || 0,
      tiempo_jugado_horas: 0, // Calcula desde logs si está disponible
      mazmorras_completadas: user.dungeon_stats?.total_victorias || 0,
      items_unicos_coleccionados: (user.inventarioEquipamiento?.length || 0) + (user.inventarioConsumibles?.length || 0)
    };
    
    res.json({
      ok: true,
      profile: {
        userId: user._id,
        username: user.username,
        email: user.email,
        joinDate: user.createdAt || new Date(),
        lastActive: user.updatedAt || new Date(),
        stats,
        personajes: user.personajes.map(p => ({
          personajeId: p.personajeId,
          nombre: p.nombre,
          nivel: p.nivel,
          rango: p.rango,
          etapa: p.etapa
        })),
        logros_desbloqueados: [], // Implementar si existe tabla de achievements
        equipamiento_activo: []
      }
    });
  } catch (error) {
    console.error('[GET-PROFILE] Error:', error);
    res.status(500).json({ ok: false, error: 'Error interno' });
  }
};
```

### Registrar en rutas

```typescript
// En src/routes/users.routes.ts
router.get('/profile/:userId', auth, getUserProfile);
```

---

## 📱 SERVICIO ANGULAR

```typescript
getUserProfile(userId: string): Observable<any> {
  return this.http.get(`${this.apiUrl}/profile/${userId}`, {
    headers: { 'Authorization': `Bearer ${this.getToken()}` }
  });
}
```

## 🧪 CURL TEST

```bash
curl -X GET "http://localhost:8080/api/users/profile/507f1f77bcf86cd799439012" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

