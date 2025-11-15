# 🏰 Sistema de Niveles Dinámicos en Mazmorras (Dungeon Levels)

## 1. ¿Qué es?
Las mazmorras tienen su propio nivel, que sube según los puntos acumulados por victorias de los jugadores. Al subir de nivel:
- Los enemigos se vuelven más fuertes.
- Los premios de VAL y XP aumentan.
- Los drops exclusivos se desbloquean en niveles altos.

## 2. API para consultar progreso de mazmorra

### Endpoint
```http
GET /api/dungeons/:id/progress
Authorization: Bearer {token}
```

### Ejemplo de respuesta
```json
{
  "mazmorra": {
    "id": "67890abc123",
    "nombre": "Cueva de los Goblins",
    "descripcion": "Una cueva oscura...",
    "nivel_requerido_minimo": 1
  },
  "progreso": {
    "victorias": 15,
    "derrotas": 3,
    "nivel_actual": 4,
    "puntos_acumulados": 89,
    "puntos_requeridos_siguiente_nivel": 337,
    "mejor_tiempo": 145,
    "ultima_victoria": "2025-10-22T15:30:00Z"
  },
  "estadisticas_globales": {
    "racha_actual": 5,
    "racha_maxima": 8,
    "total_victorias": 120,
    "total_derrotas": 40,
    "mejor_racha": 12
  }
}
```

## 3. Respuesta de combate y progresión

Al terminar un combate, la respuesta incluye:
```json
{
  "resultado": "victoria",
  "recompensas": {
    "expGanada": 120,
    "valGanado": 22,
    "botinObtenido": [ ... ]
  },
  "progresionMazmorra": {
    "puntosGanados": 47,
    "nivelActual": 4,
    "puntosActuales": 136,
    "puntosRequeridos": 337,
    "subiDeNivel": false,
    "nivelesSubidos": 0
  },
  "rachaActual": 3,
  "tiempoCombate": 145,
  "estadoEquipo": [ ... ]
}
```

## 4. WebSocket: Eventos en tiempo real

El backend emite eventos para que el frontend actualice la UI al instante:
- `dungeon:update` (actualización de estado de mazmorra)
- `dungeon:complete` (nivel completado)
- `character:update` (subida de nivel, evolución, curación)
- `marketplace:new`, `marketplace:sold` (items y moneda en tiempo real)

## 5. ¿Cómo implementarlo en el frontend?

### 1. Consultar progreso de mazmorra
```typescript
// Angular/JS/TS
fetch('https://valgame-backend.onrender.com/api/dungeons/{id}/progress', {
  headers: { Authorization: 'Bearer TU_TOKEN' }
})
  .then(res => res.json())
  .then(data => {
    // Mostrar nivel, puntos, premios, etc.
  });
```

### 2. Escuchar eventos WebSocket
```typescript
// Usando socket.io-client
socket.on('dungeon:update', (data) => {
  // Actualiza la UI con el nuevo nivel, premios, dificultad
});
socket.on('dungeon:complete', (data) => {
  // Notifica que la mazmorra subió de nivel
});
```

### 3. Mostrar cambios en la UI
- Actualiza el nivel de la mazmorra, premios y dificultad en tiempo real.
- Muestra notificaciones cuando la mazmorra sube de nivel o se desbloquean drops exclusivos.

## 6. Documentación y referencias
- `docs/03_SISTEMAS/SISTEMA_PROGRESION_IMPLEMENTADO.md`
- `docs/04_API/API_REFERENCE.md`
- `src/controllers/dungeons.controller.ts`
- `src/models/Dungeon.ts`
- `src/utils/dungeonProgression.ts`

---

**Con esto tienes todo para integrar y mostrar el sistema de niveles dinámicos de mazmorras en tu frontend, con API y eventos en tiempo real.**
