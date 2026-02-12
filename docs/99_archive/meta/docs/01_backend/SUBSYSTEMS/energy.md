# ⚡ ENERGY SYSTEM - SISTEMA DE ENERGÍA

**Documentación completa del sistema de Energía (2 endpoints)**

---

## 📖 DESCRIPCIÓN

Sistema de recurso limitado de energía. Jugadores tienen energía máxima que se regenera con el tiempo. Acciones del juego consumen energía.

**Estado:** ⭐ NUEVO - Completamente omitido en documentación anterior

---

## 🔋 MECÁNICA

```
Energía máxima: 100
Regeneración: +1 cada 6 minutos (automático)
O: +10 cada minuto (compra con VAL)

Acciones que cuestan energía:
├─ Combat: -20
├─ Survival: -10 por oleada
├─ Marketplace: -5 por compra
├─ Character evolution: -15
└─ Dungeon start: -20
```

---

## 📡 ENDPOINTS (2)

### **1. Consumir energía**
```
POST /api/energy/consume

Request:
{
  "action": "combat",  // Tipo de acción
  "amount": 20         // Energía a gastar
}

Response SUCCESS (200):
{
  "success": true,
  "data": {
    "energyBefore": 100,
    "energyConsumed": 20,
    "energyAfter": 80,
    "nextRegeneration": "2025-12-01T10:36:00Z"
  }
}

Response ERROR (400):
{
  "success": false,
  "error": "INSUFFICIENT_ENERGY",
  "message": "Need 20 energy, have 15",
  "data": {
    "required": 20,
    "available": 15,
    "shortOf": 5
  }
}
```

---

### **2. Ver estado de energía**
```
GET /api/energy/status

Response:
{
  "success": true,
  "data": {
    "current": 80,
    "maximum": 100,
    "percentage": 80,
    "lastRegeneration": "2025-12-01T10:30:00Z",
    "nextRegeneration": "2025-12-01T10:36:00Z",
    "secondsUntilNextRegeneration": 360,
    "autoRegenerationRate": 1,  // Per 6 minutes
    "canPurchaseRegeneration": true,
    "regenerationPackages": [
      {
        "id": "regen_10",
        "name": "Quick Recharge",
        "amount": 10,
        "cost": 50,
        "currency": "VAL"
      },
      {
        "id": "regen_50",
        "name": "Full Recharge",
        "amount": 50,
        "cost": 200,
        "currency": "VAL"
      }
    ]
  }
}
```

---

## 📊 MODELOS

### **User (energy fields)**
```javascript
{
  // ... otros campos
  energiaActual: Number,      // 0-100
  energiaMaxima: Number,      // Siempre 100
  ultimaRegeneracion: Date,   // Última vez que se regeneró
  velocidadRegeneracion: Number  // +1 cada X minutos
}
```

### **Energy Log (opcional)**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  action: "combat" | "survival" | "marketplace" | etc,
  amountSpent: Number,
  energyBefore: Number,
  energyAfter: Number,
  timestamp: Date
}
```

---

## 🎯 REGENERACIÓN

### **Automática**
```
Cada 6 minutos: +1 energía
Máximo: 100

Timeline:
00:00 - Energía: 100
06:00 - Energía: 100 (máximo alcanzado)
```

### **Compra acelerada**
```
POST /api/shop/buy-energy-recharge

Request:
{
  "packageId": "regen_10"  // +10 energía por 50 VAL
}

Response:
{
  "success": true,
  "data": {
    "energyBefore": 30,
    "energyAdded": 10,
    "energyAfter": 40,
    "valSpent": 50
  }
}
```

---

## ⚡ CONSUMO POR ACCIÓN

| Acción | Costo | Notas |
|--------|-------|-------|
| Combat Start | 20 | Por dungeon |
| Survival Wave | 10 | Por oleada |
| Character Evolve | 15 | Por evolución |
| Marketplace Buy | 5 | Por compra |
| Item Use | 2-5 | Varía por item |
| Respawn | 25 | Revivir rápidamente |

---

## 🔄 INTEGRACIÓN

### **Con Combat**
```
Iniciar dungeon:
1. POST /api/energy/consume → "combat" (-20)
2. POST /api/combat/start-dungeon
```

### **Con Survival**
```
Completar oleada:
1. POST /api/energy/consume → "survival" (-10)
2. POST /api/survival/:id/complete-wave
```

### **Con UI**
```
Mostrar en HUD:
├─ Barra de energía (actual/máx)
├─ Contador segundos hasta regeneración
├─ Botón para comprar recharge
└─ Log de últimas acciones
```

---

## 📱 WEBSOCKET EVENTS

```javascript
// Server → Client
socket.on('energy:consumed', {
  current: 80,
  action: "combat",
  amount: 20
})

socket.on('energy:regenerated', {
  current: 81,
  timestamp: "2025-12-01T10:36:00Z"
})

socket.on('energy:max-reached', {
  current: 100,
  message: "Energía llena"
})
```

---

## 📋 VALIDACIONES ZOD

```typescript
EnergyConsumeSchema {
  action: z.enum(['combat', 'survival', 'marketplace', ...]),
  amount: z.number().min(1).max(100)
}
```

---

## 🔐 RATE LIMITING

```
POST /api/energy/consume → 100 req/15min
GET /api/energy/status → Sin límite
```

---

## 🐛 ERRORES

| Código | Causa | Solución |
|--------|-------|----------|
| 400 | Energía insuficiente | Esperar regeneración o comprar |
| 400 | Acción inválida | Verificar action válida |
| 404 | Usuario no existe | Login primero |
| 429 | Rate limit | Esperar 15 minutos |

---

## 🎯 UI/UX TIPS

### **Mostrar siempre:**
```
┌─────────────────┐
│ ⚡ Energía: 80/100
│ ↻ Próxima: 6 min
│ 💎 [Comprar +10]
└─────────────────┘
```

### **Avisar cuando:**
- Energía < 20%
- Acción cuesta más energía disponible
- Energía llena (regeneración completa)

### **Bloquear:**
- Botón de acción si energy < required
- Mostrar: "Necesitas 20 energía. Tienes 15."

---

## 💰 MONETIZACIÓN

```
Venta de Energy Recharge:
├─ 10 energía: 50 VAL
├─ 50 energía: 200 VAL
├─ 100 energía (Full): 350 VAL
└─ Premium Pass: Regen +1 extra/minuto

Ingresos esperados: ~10-15% del VAL total
```

---

## ✅ CHECKLIST

- [ ] Modelo User energy fields
- [ ] Endpoint consume energy
- [ ] Endpoint get status
- [ ] Regeneración automática (cron)
- [ ] Compra de recharge
- [ ] Validaciones Zod
- [ ] WebSocket events
- [ ] UI energy bar
- [ ] Rate limiting
- [ ] Error handling

---

**Última actualización:** 1 de diciembre, 2025  
**Estado:** ⭐ NUEVO  
**Endpoints:** 2  
**Crítico para:** Combat, Survival, Dungeon
