# 📖 GLOSARIO - TÉRMINOS IMPORTANTES

**Definiciones de todos los términos técnicos y de juego**

---

## 🎮 TÉRMINOS DE JUEGO

### **Personaje (Character)**
Entidad jugable controlada por el usuario. Tiene nombre, nivel, stats, equipamiento, y experiencia.

**Relacionados:**
- **Rango**: Profesión del personaje (Guerrero, Mago, etc)
- **Etapa**: Versión del personaje (1: Base, 2: Evolucionado, 3: Ultra evolucionado)
- **Nivel**: 1-100+ (se gana con experiencia)

---

### **Stats**
Valores numéricos que definen capacidades: Ataque, Defensa, Salud, Agilidad, etc.

**Ejemplos:**
- **HP (Health Points)**: Salud actual
- **ATK (Attack)**: Daño base de ataque
- **DEF (Defense)**: Reducción de daño recibido

---

### **Evolución (Evolution)**
Upgrade permanente del personaje. Sube atributos, cambia apariencia, desbloquea habilidades.

**Requisitos típicos:**
- Nivel mínimo (40, 100)
- Recursos (VAL, EVO tokens)
- Quest completada

---

### **Experiencia (EXP)**
Puntos ganados en combate. Acumulada = sube de nivel.

**Fórmula típica:**
- Matar enemigo: EXP base × modificador
- Subir nivel: Requiere threshold EXP

---

### **Combat**
Sistema de batalla 1v1 vs enemigo o jugador.

**Fases:**
1. Setup: Selecciona equipo, poción
2. Batalla: Turnos de acciones
3. Resultado: Gana/pierde, obtiene recompensas

---

### **Survival Mode**
Modo infinito: Enfrentas oleadas de enemigos cada vez más fuertes.

**Características:**
- **Oleada**: Grupo de enemigos
- **Multiplicador**: Daño/recompensa escala con oleadas
- **Leaderboard**: Ranking por mayor oleada alcanzada

---

### **Energía (Energy)**
Recurso limitado requerido para ciertas acciones (combates, survival).

**Sistema:**
- Regenera naturalmente (1 cada ~5 minutos)
- Máximo: 100 (configurable)
- Refill: Pagar VAL para recargar instantáneamente

---

### **VAL**
Moneda in-game de valor.

**Forma de obtener:**
- Ganar combates
- Vender items
- Completar quests
- Comprar (Real money)

**Usos:**
- Evolucionar personajes
- Comprar en shop
- Listar en marketplace
- Refill de energía

---

### **EVO Tokens**
Moneda especial para evoluciones.

**Características:**
- No se puede ganar en combate
- Solo disponible en shop o promociones
- Más escasa que VAL

---

### **Inventory (Inventario)**
Almacén personal de items.

**Tipos:**
- **Equipment**: Armas, armor (equipo actual)
- **Consumables**: Pociones, comida (usos limitados)

---

### **Equipment (Equipamiento)**
Items permanentes que dan bonificaciones.

**Slots:**
- Cabeza, Pecho, Manos, Pies, Accesorios
- Cada slot: 1 item equipado
- Almacén: Items adicionales sin equipar

---

### **Consumibles (Consumables)**
Items con usos limitados.

**Ejemplos:**
- Poción de HP: Regenera salud (3 usos)
- Buff temporal: +ATK por 5 turnos (1 uso)

**Sistema:**
- `usos_maximos`: Cuánto duraba nuevo
- `usos_restantes`: Cuánto le queda

---

### **Marketplace**
Sistema P2P donde jugadores venden/compran items.

**Proceso:**
1. Listas un item por precio
2. Otros pueden comprar tu item
3. 5% tax automático
4. VAL transferido al vendedor

**Estados de Listing:**
- ACTIVO: Disponible para comprar
- VENDIDO: Alguien lo compró
- EXPIRADO: Pasaron 30 días sin vender
- CANCELADO: Dueño lo delistó

---

### **Leaderboard (Rankings)**
Rankings competitivos.

**Tipos:**
- **Overall**: Score total
- **Survival**: Mayor oleada
- **Combat**: Wins/ratio
- **Wealth**: Mayor VAL acumulado

---

### **Team (Equipo)**
Grupo de jugadores cooperativos.

**Características:**
- 1 líder + 3-9 miembros
- Comparten chat privado
- Bonificaciones cooperativas

---

### **Quest**
Misión con objetivo y recompensas.

**Partes:**
- Objetivo: "Derrota 10 esqueletos"
- Recompensas: EXP, VAL, Items
- Progreso: Contador actual/total

---

### **Boss**
Enemigo especial muy fuerte.

**Características:**
- Mayor salud y daño
- Drops raros
- Puede requerir team para derrotar

---

## 💻 TÉRMINOS TÉCNICOS

### **API**
Application Programming Interface. Interfaz que permite que el frontend hable con el backend.

**Ejemplo:**
```
GET /api/characters → Obtén mis personajes
POST /api/combat/start → Inicia un combate
```

---

### **Endpoint**
URL específica de una API que hace algo.

**Partes:**
- **Método**: GET (obtener), POST (crear), PUT (actualizar), DELETE (borrar)
- **Ruta**: `/api/characters`
- **Parámetros**: `/api/characters/123` (ID), `?limit=10` (query)

**Ejemplo:**
```
GET /api/characters/:characterId
  ↑     ↑                    ↑
método ruta           parámetro
```

---

### **JWT (JSON Web Token)**
Token de autenticación que prueba quién eres.

**Estructura:**
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MjMifQ.signature
```

**Dura:** 7 días (luego expirado)

---

### **Rate Limit**
Límite de solicitudes por minuto para evitar abuso.

**Ejemplo:**
- `GET /api/characters`: 50 solicitudes/5 minutos
- Si excedes: Error 429

---

### **HTTP Status Codes**
Códigos que indica el resultado de una solicitud.

**Principales:**
- `200 OK`: Todo bien
- `201 Created`: Recurso creado
- `400 Bad Request`: Parámetros incorrectos
- `401 Unauthorized`: Token faltante/inválido
- `404 Not Found`: Recurso no existe
- `429 Too Many Requests`: Rate limit excedido
- `500 Internal Error`: Error del servidor

---

### **Database (MongoDB)**
Almacén de datos donde guardamos todo.

**Colecciones:** Users, Characters, Items, Listings, etc

**Documento:** Ejemplo de un Character:
```json
{
  "_id": "603c...",
  "nombre": "Héroe",
  "nivel": 50,
  "stats": { "atk": 100, "def": 80 }
}
```

---

### **Schema**
Estructura de cómo se ven los datos.

**Ejemplo (User):**
```
{
  email: string (email válido)
  password: string (bcryptado)
  personajes: [Character] (array)
  valBalance: number (≥ 0)
}
```

---

### **Validation (Validación)**
Proceso de verificar que los datos sean válidos antes de procesarlos.

**Ejemplo:**
```
✅ email: "user@example.com" → Válido
❌ email: "not an email" → Error
❌ password: "123" → Muy corto
```

---

### **WebSocket**
Conexión en tiempo real entre cliente y servidor.

**Usado para:**
- Chat en vivo
- Notificaciones instantáneas
- Actualizaciones de marketplace

**Evento ejemplo:**
```javascript
socket.on('message:new', (msg) => {
  console.log('Nuevo mensaje:', msg);
});
```

---

### **Middleware**
Función que procesa la solicitud antes de llegar al controlador.

**Tipos:**
- **Auth**: Verifica JWT
- **Validation**: Valida parámetros
- **Rate Limit**: Controla solicitudes
- **Error Handler**: Maneja errores

---

### **Service**
Clase con lógica de negocio (no está en controlador).

**Ejemplo:**
```typescript
class CharacterService {
  async levelUpCharacter(characterId) {
    // Lógica para subir de nivel
  }
}
```

---

### **Controller**
Función que maneja una solicitud HTTP.

**Trabajo:**
1. Recibe parámetros
2. Llama a Service
3. Devuelve resultado

---

### **Transaction (Transacción)**
Operación atómica: Todo sale bien o nada.

**Usado en:**
- Marketplace buy: Transferir item + VAL (ambas o ninguna)
- Evolution: Consumir VAL + cambiar stats (ambas o ninguna)

---

### **Mongoose**
Librería para interactuar con MongoDB desde Node.js.

**Funciones:**
- Definir schemas
- Validar datos
- Queries

---

### **bcryptjs**
Librería para encriptar contraseñas de forma segura.

**Función:**
```javascript
const hash = bcrypt.hashSync(password, 10);
// hash ≠ password (es irreversible)
```

---

### **Zod**
Librería para validar datos en TypeScript.

**Ejemplo:**
```typescript
const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});
```

---

### **Environment Variables (.env)**
Configuraciones sensibles (no se suben a GitHub).

**Ejemplo:**
```
DATABASE_URL=mongodb://...
JWT_SECRET=supersecret123
STRIPE_KEY=sk_live_...
```

---

### **CI/CD**
Continuous Integration / Continuous Deployment.

**Pipeline:**
1. Commit a GitHub
2. Tests automáticos
3. Build (compilar)
4. Deploy a AWS

---

### **Docker**
Sistema para empacar la app en un contenedor (ambiente aislado).

**Beneficio:** Funciona igual en desarrollo y producción

---

### **AWS (Amazon Web Services)**
Plataforma de cloud donde deployamos.

**Servicios usados:**
- **EC2**: Servidores virtuales
- **RDS**: Hosted databases
- **S3**: Almacenamiento

---

### **Rate Limiting (5 Tiers)**
Sistema de límites por tipo de operación:

| Tier | Límite | Operaciones |
|------|--------|------------|
| Tier 1 | 1-5/min | Auth, Payments, Delete |
| Tier 2 | 5-10/min | Combate, Marketplace |
| Tier 3 | 10-20/min | POST general |
| Tier 4 | 20-50/min | GET general |
| Tier 5 | 50+/min | Rankings, Health |

---

### **Atomic Operation (Operación Atómica)**
Operación que se ejecuta completa o no se ejecuta.

**Importante en:**
- Marketplace: Vender item
- Evolution: Evolucionar personaje
- Combat: Acabar batalla

---

### **Idempotent**
Operación que produce el mismo resultado cada vez.

**Ejemplo:**
- `DELETE /user/123`: Siempre borra el mismo usuario
- `GET /user/123`: Siempre devuelve los mismos datos

**No idempotent:**
- `POST /combat/start`: Cada vez inicia un combate NUEVO

---

## 🎯 TÉRMINOS DE NEGOCIO

### **SLA (Service Level Agreement)**
Garantía de disponibilidad.

**Ejemplo:** 99.9% uptime = máximo 43 minutos de downtime/mes

---

### **Monetization**
Cómo la app genera dinero.

**Métodos:**
- Web2: Pagar con tarjeta (Stripe)
- Web3: Pagar con cripto (blockchain)
- Free-to-play con microtransacciones

---

### **Monetization Models**
- **Battle Pass**: Pagar por progreso desbloqueado
- **Premium Currency**: VAL por dinero real
- **Cosmetics**: Skins, emotes (solo estética)
- **Battle Pass**: Rewards temporales

---

### **User Acquisition (UA)**
Conseguir nuevos usuarios.

**Canales:**
- Ads en redes sociales
- App stores (iOS, Android)
- Influencers
- Word of mouth

---

### **Retention**
Que los usuarios sigan jugando.

**Estrategias:**
- Content updates
- Events
- Rewards
- Competitive rankings

---

### **DAU (Daily Active Users)**
Cuántos usuarios abren el app cada día.

**Métrica importante:** Indica salud del juego

---

### **P2P (Peer to Peer)**
Jugador a jugador (marketplace).

**Ventaja:** Jugadores controlan precios, no el servidor

---

## 🔐 SEGURIDAD

### **Encryption**
Convertir datos a forma ilegible.

**Tipos:**
- **bcrypt**: Passwords
- **JWT**: Tokens
- **HTTPS**: Comunicación (https vs http)

---

### **Authentication**
Verificar quién eres (login).

**Sistema:**
1. Email + Password
2. Validar en DB
3. Dar JWT
4. Incluir JWT en futuras solicitudes

---

### **Authorization**
Verificar qué puedes hacer (permisos).

**Ejemplo:**
- ✅ Puedes acceder a tu personaje
- ❌ No puedes acceder a personaje de otro

---

### **CORS (Cross-Origin Resource Sharing)**
Configuración que permite que el frontend acceda al backend.

**Sin CORS:** Error "CORS blocked"

---

### **XSS (Cross-Site Scripting)**
Ataque inyectando código malicioso.

**Prevención:** Sanitizar input, usar frameworks seguros

---

### **SQL Injection**
Ataque inyectando código SQL.

**Prevención:** Usar Mongoose queries (no strings raw)

---

---

**Última actualización:** 24 de noviembre, 2025
