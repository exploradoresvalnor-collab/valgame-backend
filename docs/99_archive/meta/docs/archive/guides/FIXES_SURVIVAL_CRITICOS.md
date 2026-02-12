# 🔧 FIXES CRÍTICOS - MODO SURVIVAL

**Versión**: 1.0  
**Fecha**: 27 de Noviembre, 2025  
**Prioridad**: 🔴 BLOQUEADOR

---

## ❌ ERROR #1: Equipment Structure Mismatch

### Problema
En `startSurvival()`, se asigna un array de IDs directamente al campo `equipment`, pero el modelo `SurvivalSession` espera un objeto con slots nombrados (`head`, `body`, `hands`, `feet`).

### Localización
- **Archivo**: `src/services/survival.service.ts`
- **Línea**: 46
- **Método**: `startSurvival()`

### Código Actual (❌ INCORRECTO)
```typescript
const session = new SurvivalSession({
  userId,
  characterId,
  equipment: equipmentIds,  // ❌ ['id1', 'id2', 'id3', 'id4']
  consumables: consumableIds.map((id, index) => ({
    itemId: new mongoose.Types.ObjectId(id),
    usos_restantes: 3
  })),
  // ... resto de campos
});
```

### Código Correcto (✅ SOLUCIÓN)
```typescript
// Mapear 4 IDs a slots específicos
// Asumiendo convención: [head, body, hands, feet]
const equipment = {
  head: equipmentIds[0] ? {
    itemId: new mongoose.Types.ObjectId(equipmentIds[0]),
    rareza: 'común',
    bonusAtaque: 0
  } : undefined,
  body: equipmentIds[1] ? {
    itemId: new mongoose.Types.ObjectId(equipmentIds[1]),
    rareza: 'común',
    bonusDefensa: 0
  } : undefined,
  hands: equipmentIds[2] ? {
    itemId: new mongoose.Types.ObjectId(equipmentIds[2]),
    rareza: 'común',
    bonusDefensa: 0
  } : undefined,
  feet: equipmentIds[3] ? {
    itemId: new mongoose.Types.ObjectId(equipmentIds[3]),
    rareza: 'común',
    bonusVelocidad: 0
  } : undefined
};

const session = new SurvivalSession({
  userId,
  characterId,
  equipment,  // ✅ Ahora es un objeto con slots
  consumables: consumableIds.map((id) => ({
    itemId: new mongoose.Types.ObjectId(id),
    nombre: 'Consumible',  // ✅ Agregado
    usos_restantes: 3,
    efecto: {
      tipo: 'heal' as const,  // ✅ Necesario para el schema
      valor: 10
    }
  })),
  // ... resto de campos
});
```

### Impacto
- ✅ Desbloquea: `POST /api/survival/start`
- ✅ Permite crear sesiones correctamente
- ✅ Estructura compatible con `equipmentUsed` en `SurvivalRun`

### Validación Post-Fix
```bash
# Test endpoint start
curl -X POST http://localhost:8080/api/survival/start \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "characterId": "64f7d1234567890abc123",
    "equipmentIds": ["id1", "id2", "id3", "id4"],
    "consumableIds": ["c1", "c2"]
  }'

# Debe retornar 201 con sessionId
```

---

## ❌ ERROR #2: Missing Fields in SurvivalRun

### Problema
El servicio intenta guardar `sessionId` y `consumablesUsed` en `SurvivalRun`, pero el modelo no tiene estos campos.

### Localización
- **Archivo**: `src/services/survival.service.ts`
- **Líneas**: 257-273 (endSurvival), 291-310 (reportDeath)
- **Métodos**: `endSurvival()`, `reportDeath()`

### Código Actual (❌ INCORRECTO)
```typescript
async endSurvival(
  userId: string,
  sessionId: string,
  finalWave: number,
  totalEnemiesDefeated: number,
  totalPoints: number,
  duration: number
): Promise<ISurvivalRun> {
  try {
    // ...
    const run = new SurvivalRun({
      userId,
      sessionId,              // ❌ NO EXISTE EN ISurvivalRun
      characterId: session.characterId,
      finalWave,
      finalPoints: totalPoints,
      totalEnemiesDefeated,
      itemsObtained: session.dropsCollected,
      rewards: {
        expGained: experienceGained,
        valGained,
        pointsAvailable: totalPoints
      },
      equipmentUsed: session.equipment,
      consumablesUsed: session.consumables.map(c => c.itemId),  // ❌ NO EXISTE
      duration,
      completedAt: new Date()
    });
    // ...
```

### Código Correcto (✅ SOLUCIÓN)
```typescript
async endSurvival(
  userId: string,
  sessionId: string,
  finalWave: number,
  totalEnemiesDefeated: number,
  totalPoints: number,
  duration: number
): Promise<ISurvivalRun> {
  try {
    const session = await SurvivalSession.findById(sessionId);
    if (!session) throw new Error('Session not found');

    // ... anti-cheat validation ...

    const experienceGained = this.calculateExperience(finalWave, totalPoints);
    const valGained = this.calculateVAL(finalWave, totalPoints);

    // ✅ CORRECTO: Solo incluir campos que existen en ISurvivalRun
    const run = new SurvivalRun({
      userId,
      characterId: session.characterId,
      finalWave,
      finalPoints: totalPoints,
      totalEnemiesDefeated,
      itemsObtained: session.dropsCollected,
      rewards: {
        expGained: experienceGained,
        valGained,
        pointsAvailable: totalPoints
      },
      equipmentUsed: session.equipment,  // ✅ Correcto - coincide con estructura
      // NO incluir sessionId
      // NO incluir consumablesUsed
      startedAt: session.startedAt,
      completedAt: new Date(),
      duration
    });

    await run.save();

    // ... resto del código ...
    return run;
  } catch (error: any) {
    throw new Error(`Failed to end survival: ${error.message}`);
  }
}
```

### Método reportDeath (APLICA LO MISMO)
```typescript
async reportDeath(
  userId: string,
  sessionId: string,
  waveAtDeath: number,
  pointsAtDeath: number
): Promise<ISurvivalRun> {
  try {
    const session = await SurvivalSession.findById(sessionId);
    if (!session) throw new Error('Session not found');

    const run = new SurvivalRun({
      userId,
      characterId: session.characterId,
      finalWave: waveAtDeath,
      finalPoints: pointsAtDeath,
      totalEnemiesDefeated: session.enemiesDefeated,
      itemsObtained: session.dropsCollected,
      rewards: {
        expGained: 0,  // Sin recompensas por muerte
        valGained: 0,
        pointsAvailable: 0
      },
      equipmentUsed: session.equipment,  // ✅ Correcto
      // NO incluir sessionId, consumablesUsed
      startedAt: session.startedAt,
      completedAt: new Date(),
      duration: new Date().getTime() - new Date(session.startedAt).getTime()
    });

    await run.save();

    session.state = 'completed';
    session.completedAt = new Date();
    await session.save();

    // Aplicar milestones (aún sin recompensas)
    try {
      await SurvivalMilestonesService.applyForRun(
        userId,
        sessionId,
        run._id.toString(),
        waveAtDeath,
        0  // 0 puntos en caso de muerte
      );
    } catch (e) {
      console.error('Failed to apply survival milestones on death:', (e as any)?.message);
    }

    return run;
  } catch (error: any) {
    throw new Error(`Failed to report death: ${error.message}`);
  }
}
```

### Impacto
- ✅ Desbloquea: `POST /api/survival/:sessionId/end`
- ✅ Desbloquea: `POST /api/survival/:sessionId/report-death`
- ✅ Permite guardar histórico de runs correctamente
- ✅ Leaderboard funciona con datos válidos

### Validación Post-Fix
```bash
# Test endpoint end
curl -X POST http://localhost:8080/api/survival/12345/end \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "finalWave": 25,
    "totalEnemiesDefeated": 150,
    "totalPoints": 5000,
    "duration": 120000
  }'

# Debe retornar 200 con run completo y actualizar leaderboard
```

---

## ❌ ERROR #3: Cascada de Incompatibilidad

### Análisis
Este error es una **cascada de ERROR #1**. Una vez fijo ERROR #1, ERROR #3 se resuelve automáticamente porque:

1. `session.equipment` se crea en formato correcto: `{head, body, hands, feet}`
2. En `endSurvival()`, se copia a `equipmentUsed` que espera exactamente ese formato
3. `SurvivalRun` se guarda correctamente

**No requiere fix adicional**.

---

## ⚠️ ERROR #4: Zod Validation (Opcional)

### Problema
`consumableIds` permite array vacío, cuando intuitivamente debería permitir 0 o más consumibles opcionalmente.

### Localización
- **Archivo**: `src/routes/survival.routes.ts`
- **Línea**: 31
- **Schema**: `StartSurvivalSchema`

### Código Actual (⚠️ VÁLIDO pero IMPLÍCITO)
```typescript
const StartSurvivalSchema = z.object({
  characterId: z.string().min(1),
  equipmentIds: z.array(z.string()).length(4),
  consumableIds: z.array(z.string()).max(5)  // ⚠️ Permite []
});
```

### Código Mejorado (✅ EXPLÍCITO - OPCIONAL)
```typescript
const StartSurvivalSchema = z.object({
  characterId: z.string().min(1),
  equipmentIds: z.array(z.string()).length(4),
  consumableIds: z.array(z.string()).min(0).max(5)  // ✅ Explícito: 0-5 items
  // O si deseas REQUERIR al menos 1:
  // consumableIds: z.array(z.string()).min(1).max(5)
});
```

### Decisión de Diseño
- **Permitir 0 consumibles**: Usuario puede iniciar sin buffs
- **Requerir 1+**: Usuario debe llevar al menos un consumible

**Recomendación**: Permitir 0 (actual) es más flexible para testing y jugadores casuales.

### Impacto
- 🟡 BAJO: No causa crash, solo hace validación más explícita
- ⏱️ Tiempo de fix: 1 minuto
- Prioridad: Baja (cosméticos)

---

## 📋 CHECKLIST DE APLICACIÓN

### Paso 1: Fix ERROR #1
- [ ] Abrir `src/services/survival.service.ts`
- [ ] Localizar método `startSurvival()` (línea 12)
- [ ] Reemplazar código de línea 46 con mapping de equipment
- [ ] Agregar campos `nombre` y `efecto` a consumables
- [ ] Guardar y compilar: `npm run build`
- [ ] Verificar: `npm run lint`

### Paso 2: Fix ERROR #2
- [ ] Abrir `src/services/survival.service.ts`
- [ ] Localizar método `endSurvival()` (línea 225)
- [ ] Remover `sessionId` de objeto `SurvivalRun`
- [ ] Remover `consumablesUsed` de objeto `SurvivalRun`
- [ ] Aplicar cambios idénticos a `reportDeath()` (línea 283)
- [ ] Guardar y compilar: `npm run build`

### Paso 3: Fix ERROR #4 (Opcional)
- [ ] Abrir `src/routes/survival.routes.ts`
- [ ] Actualizar `StartSurvivalSchema` línea 31
- [ ] Agregar `.min(0)` para ser explícito
- [ ] Guardar

### Paso 4: Limpieza ESLint (Opcional)
- [ ] Remover imports no utilizados:
  - `src/routes/survival.routes.ts:7-8` (SurvivalRun, SurvivalLeaderboard)
  - `src/services/survival.service.ts:4` (IUser)
  - `src/services/survivalMilestones.service.ts:1` (mongoose)

### Paso 5: Validación
```bash
# Compilar
npm run build

# Lint (opcional)
npm run lint:fix

# Test
npm run test:unit  # Si existen tests

# Dev mode
npm run dev
```

---

## 🧪 TESTS RECOMENDADOS

Crear archivo: `tests/unit/survival.service.test.ts`

```typescript
describe('SurvivalService', () => {
  let survivalService: SurvivalService;

  beforeEach(() => {
    survivalService = new SurvivalService();
  });

  describe('startSurvival', () => {
    it('should create session with correct equipment structure', async () => {
      const result = await survivalService.startSurvival(
        userId,
        characterId,
        ['head-id', 'body-id', 'hands-id', 'feet-id'],
        ['consumable-id']
      );

      // Verificar estructura
      expect(result.equipment).toHaveProperty('head');
      expect(result.equipment).toHaveProperty('body');
      expect(result.equipment).toHaveProperty('hands');
      expect(result.equipment).toHaveProperty('feet');
      expect(result.equipment.head.itemId).toBeDefined();
    });

    it('should handle empty consumables array', async () => {
      const result = await survivalService.startSurvival(
        userId,
        characterId,
        ['head-id', 'body-id', 'hands-id', 'feet-id'],
        []  // Sin consumibles
      );

      expect(result.consumables).toHaveLength(0);
    });
  });

  describe('endSurvival', () => {
    it('should create run without sessionId field', async () => {
      const result = await survivalService.endSurvival(
        userId,
        sessionId,
        10,
        50,
        5000,
        120000
      );

      // Verificar que NO tiene sessionId
      expect((result as any).sessionId).toBeUndefined();
      // Verificar que sí tiene los campos correctos
      expect(result.finalWave).toBe(10);
      expect(result.equipmentUsed).toBeDefined();
    });
  });

  describe('reportDeath', () => {
    it('should create run with 0 rewards', async () => {
      const result = await survivalService.reportDeath(
        userId,
        sessionId,
        5,
        1000
      );

      expect(result.rewards.expGained).toBe(0);
      expect(result.rewards.valGained).toBe(0);
      expect(result.finalWave).toBe(5);
    });
  });
});
```

---

## 📞 SOPORTE

Si después de aplicar estos fixes aún tienes issues:

1. Verifica que MongoDB está corriendo
2. Verifica tipos en `tsconfig.json` (strict: true)
3. Ejecuta `npm run build` para compilación completa
4. Revisa logs de Mongoose para errores de schema

---

**Tiempo total de fixes**: ~40 minutos  
**Complejidad**: Baja  
**Riesgo**: Muy bajo (solo actualizar lógica existente)

