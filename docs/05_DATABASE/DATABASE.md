# 💾 DATABASE - ESQUEMA Y OPTIMIZACIÓN

**Documentación completa de MongoDB y schemas**

---

## 📋 TABLA DE CONTENIDOS

1. [Conexión](#conexión)
2. [Modelos](#modelos)
3. [Índices](#índices)
4. [Queries](#queries)
5. [Backups](#backups)
6. [Mantenimiento](#mantenimiento)

---

## 🔌 CONEXIÓN {#conexión}

### **MongoDB Atlas**
```javascript
const mongoose = require('mongoose');

const mongoURI = process.env.MONGODB_URI;

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  retryWrites: true,
  w: 'majority'
});

const connection = mongoose.connection;

connection.on('connected', () => {
  console.log('✅ MongoDB conectado');
});

connection.on('error', (err) => {
  console.error('❌ Error MongoDB:', err);
});
```

### **Connection String**
```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

---

## 📊 MODELOS {#modelos}

### **Principales (25+)**

```javascript
// 1. USER - Centro del sistema
User {
  _id: ObjectId,
  email: String (unique),
  username: String (unique),
  password: String (bcryptjs),
  personajes: [Character],
  inventarioEquipamiento: [Equipment],
  inventarioConsumibles: [Consumable],
  valBalance: Number,
  energiaActual: Number,
  verified: Boolean,
  createdAt: Date,
  updatedAt: Date
}

// 2. CHARACTER - Personaje del usuario
Character {
  _id: ObjectId,
  userId: ObjectId,
  nombre: String,
  nivel: Number,
  rango: String,
  etapa: Number,
  saludActual: Number,
  experiencia: Number,
  stats: {
    ataque: Number,
    defensa: Number,
    velocidad: Number
  }
}

// 3. ITEM - Items discriminator pattern
Item {
  _id: ObjectId,
  nombre: String,
  descripcion: String,
  tipo: "equipment" | "consumable",
  // Equipos
  bonusStats: { ataque, defensa },
  // Consumibles
  effect: String,
  usos_maximos: Number,
  usos_restantes: Number
}

// 4. LISTING - Marketplace
Listing {
  _id: ObjectId,
  itemId: ObjectId,
  sellerId: ObjectId,
  precio: Number,
  estado: "activo" | "vendido" | "expirado",
  createdAt: Date,
  expiresAt: Date
}

// 5. SURVIVAL SESSION
SurvivalSession {
  _id: ObjectId,
  playerId: ObjectId,
  characterId: ObjectId,
  status: "active" | "completed" | "died",
  wavesCompleted: Number,
  pointsEarned: Number
}

// 6. RANKING
Ranking {
  _id: ObjectId,
  userId: ObjectId,
  category: "combat" | "survival" | "wealth",
  rank: Number,
  score: Number,
  period: "all_time" | "month" | "week"
}

// 7. CHAT MESSAGE
ChatMessage {
  _id: ObjectId,
  senderId: ObjectId,
  senderName: String,
  type: "global",
  content: String,
  createdAt: Date
}

// 8. NOTIFICATION
Notification {
  _id: ObjectId,
  userId: ObjectId,
  type: "item-sold" | "level-up" | etc,
  title: String,
  message: String,
  read: Boolean,
  createdAt: Date,
  expiresAt: Date
}

// 9. TEAM
Team {
  _id: ObjectId,
  name: String,
  leaderId: ObjectId,
  members: [ObjectId],
  maxMembers: Number,
  tier: "bronze" | "silver" | "gold" | "platinum",
  createdAt: Date
}

// 10+ OTROS
Dungeon, Combat, Achievement, Package,
UserPackage, Event, Offer, GameSetting,
LevelHistory, MarketplaceTransaction, etc
```

---

## 🔑 ÍNDICES {#índices}

### **Críticos (crear primero)**
```javascript
// User
User.collection.createIndex({ email: 1 }, { unique: true });
User.collection.createIndex({ username: 1 }, { unique: true });

// Listing (Marketplace - más importante)
Listing.collection.createIndex({ sellerId: 1 });
Listing.collection.createIndex({ itemId: 1 });
Listing.collection.createIndex({ estado: 1 });
Listing.collection.createIndex({ expiresAt: 1 });

// Chat (Time-series)
ChatMessage.collection.createIndex({ createdAt: -1 });
ChatMessage.collection.createIndex({ senderId: 1 });

// Ranking
Ranking.collection.createIndex({ userId: 1, category: 1 });
Ranking.collection.createIndex({ rank: 1, category: 1 });

// Notification
Notification.collection.createIndex({ userId: 1, read: 1 });
Notification.collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Survival
SurvivalSession.collection.createIndex({ playerId: 1 });
SurvivalSession.collection.createIndex({ status: 1 });

// Transactions (Marketplace)
MarketplaceTransaction.collection.createIndex({ buyerId: 1 });
MarketplaceTransaction.collection.createIndex({ sellerId: 1 });
```

### **Compound Indexes**
```javascript
// Multi-field queries
Ranking.collection.createIndex({ 
  category: 1, 
  period: 1, 
  rank: 1 
});

// Search + filter
ChatMessage.collection.createIndex({ 
  type: 1, 
  createdAt: -1 
});
```

---

## 🔍 QUERIES {#queries}

### **Optimizadas**

```javascript
// ❌ MAL - Traer todo
const users = await User.find();

// ✅ BIEN - Select fields
const users = await User.find()
  .select('_id username level')
  .limit(100);

// ❌ MAL - N+1 problem
const listings = await Listing.find();
for (const listing of listings) {
  const user = await User.findById(listing.sellerId);
}

// ✅ BIEN - Populate
const listings = await Listing.find()
  .populate('sellerId', 'username level')
  .limit(50);

// ❌ MAL - Regex sin índice
db.users.find({ username: /dragon/i });

// ✅ BIEN - Índice de texto
User.collection.createIndex({ username: 'text' });
db.users.find({ $text: { $search: "dragon" } });

// ✅ BIEN - Pagination
const page = 1;
const limit = 20;
const users = await User.find()
  .skip((page - 1) * limit)
  .limit(limit);

// ✅ BIEN - Agregaciones
const stats = await User.aggregate([
  { $match: { verified: true } },
  { $group: { _id: null, avgLevel: { $avg: '$nivel' } } },
  { $project: { avgLevel: 1 } }
]);
```

---

## 💾 BACKUPS {#backups}

### **Automático (MongoDB Atlas)**
```
Configuración:
├─ Frequency: Daily
├─ Retention: 30 days
├─ Snapshot: Cada 4 horas
└─ Georeplication: Enable
```

### **Manual**
```bash
# Exportar
mongodump \
  --uri="mongodb+srv://user:pass@cluster.mongodb.net/valgame" \
  --out=./backup/

# Importar
mongorestore \
  --uri="mongodb+srv://user:pass@cluster.mongodb.net/valgame" \
  --dir=./backup/ \
  --drop
```

---

## 🔧 MANTENIMIENTO {#mantenimiento}

### **Monitoreo**
```javascript
// Revisar tamaño de BD
db.stats();

// Collections grandes
db.getCollectionNames().forEach(name => {
  const size = db[name].dataSize();
  console.log(name, (size / 1024 / 1024).toFixed(2) + ' MB');
});

// Índices no usados
db.collection.aggregate([
  { $indexStats: {} }
]);
```

### **Limpieza**
```javascript
// Eliminar documentos expirados automático
Notification.collection.createIndex(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

// Manual
db.notifications.deleteMany({ expiresAt: { $lt: new Date() } });

// Eliminar listings expirados
db.listings.deleteMany({ 
  estado: "expirado",
  expiresAt: { $lt: new Date() }
});
```

---

## 📈 PERFORMANCE

### **Optimizaciones**

```
1. Índices apropiados (especialmente _id, foreign keys)
2. Query lean() cuando no necesites métodos Mongoose
3. Pagination para colecciones grandes
4. Projection: traer solo campos necesarios
5. Connection pooling
6. Replica set para redundancia
```

### **Monitoreo**
```javascript
// Log queries lentas
mongoose.set('debug', (collectionName, method, query) => {
  console.log(`${collectionName}.${method}`, query);
});

// O con performance stats
const start = Date.now();
const result = await User.find();
console.log(`Query took ${Date.now() - start}ms`);
```

---

## ✅ CHECKLIST

- [ ] Índices en producciones creados
- [ ] Backups automáticos configurados
- [ ] TTL indexes para datos temporales
- [ ] Connection pooling
- [ ] Replicaset habilitado
- [ ] Monitoring en Atlas
- [ ] Alertas de almacenamiento
- [ ] Queries optimizadas
- [ ] Proyecciones implementadas
- [ ] Paginación en endpoints

---

**Última actualización:** 1 de diciembre, 2025  
**Status:** ✅ Production ready
