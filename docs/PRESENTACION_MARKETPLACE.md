# ��� PRESENTACIÓN DE PUBLICACIONES EN EL MARKETPLACE

## Cuando un usuario PUBLICA un item, se muestra:

### ��� **PERSONAJES** (`type: 'personaje'`)
Cuando publicas un personaje, el listing incluye:

✅ **Información Visual:**
- `imagen` - URL de la imagen del personaje (del BaseCharacter)
- `nombre` - Nombre del personaje (ej: "Draco Ígneo, Señor de las Llamas")

✅ **Datos del Usuario (TU personaje específico):**
- `rango` - D, C, B, A, S, SS, SSS (categoría asignada cuando lo obtuviste)
- `nivel` - Nivel actual (1-50)
- `etapa` - Etapa de evolución (1, 2 o 3)
- `progreso` - Progreso hacia siguiente nivel (0-100)

✅ **Stats Actuales:**
```typescript
stats: {
  atk: 1500,      // Ataque actual (puede ser mejorado con buffs/equipamiento)
  vida: 2000,     // Vida actual
  defensa: 800    // Defensa actual
}
```

✅ **Estado y Salud:**
- `saludActual` / `saludMaxima`
- `estado` - 'saludable' o 'herido'
- `fechaHerido` - Si está herido
- `equipamiento` - Array de items equipados
- `activeBuffs` - Buffs activos en el personaje

✅ **Información de Venta:**
- `precio` - Precio en VAL
- `destacado` - Si pagaste 100 VAL para destacarlo (aparece primero)
- `fechaExpiracion` - Expira en 7 días si no se vende

---

### ⚔️ **EQUIPAMIENTO** (`type: 'equipamiento'`)
Cuando publicas equipamiento:

✅ **Información Visual:**
- `imagen` - URL de la imagen del item
- `nombre` - Nombre (ej: "Espada Flamígera")
- `descripcion` - Descripción del item

✅ **Propiedades:**
- `rango` - D, C, B, A, S, SS, SSS
- `stats` - Bonificaciones que da (atk, defensa, vida)
- `durabilidad` - Durabilidad actual/máxima (si aplica)

---

### ��� **CONSUMIBLES** (`type: 'consumible'`)
Cuando publicas consumibles:

✅ **Información Visual:**
- `imagen` - URL de la imagen del consumible
- `nombre` - Nombre (ej: "Poción de Experiencia")
- `descripcion` - Qué hace el item

✅ **Propiedades:**
- `rango` - Rareza del consumible
- `usos` - Usos restantes (`usos_restantes` del inventario)

---

## ��� **EJEMPLO REAL de una publicación de personaje:**

```json
{
  "listing": {
    "id": "507f1f77bcf86cd799439011",
    "itemId": "draco-igneo",
    "type": "personaje",
    "sellerId": "507f191e810c19729de860ea",
    "precio": 15000,
    "impuesto": 750,
    "estado": "activo",
    "destacado": true,
    "fechaExpiracion": "2025-10-29T...",
    "metadata": {
      "nombre": "Draco Ígneo, Señor de las Llamas",
      "imagen": "https://..../draco-igneo.png",
      "rango": "SS",
      "nivel": 35,
      "etapa": 2,
      "progreso": 67,
      "stats": {
        "atk": 2800,
        "vida": 3200,
        "defensa": 1500
      },
      "saludActual": 3200,
      "saludMaxima": 3200,
      "estado": "saludable",
      "equipamiento": ["507f...", "507f..."],
      "activeBuffs": []
    }
  }
}
```

---

## ��� **FILTROS DISPONIBLES (implementados recientemente):**

Los compradores pueden buscar por:

✅ **Texto:** `?search=draco` - Busca "draco" en el nombre
✅ **Rango:** `?rango=SS` - Solo personajes SS
✅ **Etapa:** `?etapa=2` - Solo personajes en etapa 2
✅ **Stats mínimos:** `?atkMin=2000` - ATK mínimo 2000
✅ **Stats máximos:** `?atkMax=3000` - ATK máximo 3000
✅ **Rangos de stats:** `?atkMin=2000&atkMax=3000` - ATK entre 2000-3000
✅ **Vida:** `?vidaMin=3000&vidaMax=5000`
✅ **Defensa:** `?defensaMin=1000&defensaMax=2000`
✅ **Ordenamiento:** `?sortBy=atk&sortOrder=desc` - Ordenar por ATK descendente

---

## ��� **INFORMACIÓN IMPORTANTE:**

### ⚠️ Seguridad:
- Los `stats` que se muestran son **LOS REALES del personaje**
- El backend obtiene la metadata desde la base de datos, **NO del cliente**
- Esto previene que alguien publique un personaje con stats falsos

### ��� Costos:
- **Impuesto de venta:** 5% del precio (el vendedor recibe 95%)
- **Destacar publicación:** 100 VAL (aparece primero en resultados)
- **Duración:** 7 días, después expira automáticamente

### ��� Restricciones:
- No puedes vender tu **personaje activo**
- Precio mínimo:
  - Personajes: 100 VAL
  - Equipamiento: 10 VAL
  - Consumibles: 5 VAL
- Precio máximo: 1,000,000 VAL

