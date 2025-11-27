# ⚡ GUÍA ULTRA-RÁPIDA: FUNCIONALIDADES BÁSICAS

**Para:** Desarrollador frontend que necesita implementar YA  
**Tiempo de lectura:** 10 minutos  
**Última actualización:** 3 de noviembre de 2025

---

## 🎯 LO ESENCIAL

### ⚠️ CONFIGURACIÓN CRÍTICA

**TODAS las peticiones deben incluir:**
```typescript
fetch('http://localhost:3000/api/...', {
  credentials: 'include'  // ⚠️ OBLIGATORIO para cookies
});

// O con axios
axios.get('http://localhost:3000/api/...', {
  withCredentials: true  // ⚠️ OBLIGATORIO para cookies
});
```

**Sin esto, la autenticación NO funcionará.**

---

## 1️⃣ REGISTRO Y LOGIN

### Registrar Usuario
```typescript
const response = await fetch('http://localhost:3000/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'usuario@example.com',
    username: 'Usuario123',
    password: 'MiPassword123'
  })
});

const data = await response.json();
// { message: "Usuario registrado. Revisa tu correo..." }
```

**Usuario debe verificar email antes de login.**

### Login
```typescript
const response = await fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',  // ⚠️ Recibe cookie
  body: JSON.stringify({
    email: 'usuario@example.com',
    password: 'MiPassword123'
  })
});

const data = await response.json();
// Cookie guardada automáticamente
// data.user contiene TODO el perfil del usuario
```

### Obtener Usuario Actual
```typescript
const response = await fetch('http://localhost:3000/api/users/me', {
  credentials: 'include'  // ⚠️ Envía cookie
});

const user = await response.json();
// Si 401 → No logueado, redirect a /login
```

### Logout
```typescript
await fetch('http://localhost:3000/auth/logout', {
  method: 'POST',
  credentials: 'include'
});

// Cookie borrada automáticamente
// Redirect a /login
```

---

## 2️⃣ EQUIPAR / DESEQUIPAR

### Ver Inventario de Equipamiento
```typescript
const response = await fetch('http://localhost:3000/api/users/me', {
  credentials: 'include'
});

const user = await response.json();
const equipamiento = user.inventarioEquipamiento;

// [{ _id: '673...', tipo: 'arma', nombre: 'Espada', ataque: 15, ... }]
```

### Ver Personaje con Equipamiento
```typescript
const response = await fetch('http://localhost:3000/api/users/me', {
  credentials: 'include'
});

const user = await response.json();
const personaje = user.personajes[0];

console.log(personaje.equipamiento);
// { arma: '673...', armadura: null, accesorio: null }
```

### Equipar Item
```typescript
const characterId = '673456def...';
const armaId = '673789012...';

const response = await fetch(
  `http://localhost:3000/api/characters/${characterId}/equip`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ equipmentId: armaId })
  }
);

const data = await response.json();
// data.character.equipamiento.arma === armaId ✅
```

### Desequipar Item
```typescript
const response = await fetch(
  `http://localhost:3000/api/characters/${characterId}/unequip`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ slot: 'arma' })  // o 'armadura' o 'accesorio'
  }
);

const data = await response.json();
// data.character.equipamiento.arma === null ✅
```

### Ver Stats con Equipamiento
```typescript
const response = await fetch(
  `http://localhost:3000/api/characters/${characterId}/stats`,
  { credentials: 'include' }
);

const stats = await response.json();
console.log('HP total:', stats.stats_totales.hp);
console.log('Ataque total:', stats.stats_totales.ataque);
console.log('Bonos:', stats.bonos_equipamiento);
```

---

## 3️⃣ CONSUMIBLES (POCIONES)

### Ver Inventario de Consumibles
```typescript
const response = await fetch('http://localhost:3000/api/users/me', {
  credentials: 'include'
});

const user = await response.json();
const consumibles = user.inventarioConsumibles;

// [{ _id: '673...', nombre: 'Poción', usos_restantes: 3, efecto: {...} }]
```

### Usar Consumible
```typescript
const pocionId = '673890123...';

const response = await fetch(
  `http://localhost:3000/api/characters/${characterId}/use-consumable`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ consumableId: pocionId })
  }
);

const data = await response.json();

if (data.consumable === null) {
  console.log('Poción eliminada (último uso)');
  // Remover de UI
} else {
  console.log('Usos restantes:', data.consumable.usos_restantes);
  // Actualizar UI
}

console.log('HP actual:', data.character.hp_actual);
```

---

## 4️⃣ SANACIÓN Y RESURRECCIÓN

### Curar Personaje (con VAL)
```typescript
const response = await fetch(
  `http://localhost:3000/api/characters/${characterId}/heal`,
  {
    method: 'POST',
    credentials: 'include'
  }
);

const data = await response.json();
console.log('Costó:', data.cost, 'VAL');
console.log('HP actual:', data.character.hp_actual);
console.log('VAL restante:', data.newBalance);
```

**Costo:** `Math.ceil((HP_MAX - HP_ACTUAL) / 10)` VAL

**Ejemplo:** Faltan 50 HP → Cuesta 5 VAL

### Revivir Personaje (con VAL)
```typescript
const response = await fetch(
  `http://localhost:3000/api/characters/${characterId}/revive`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ costVAL: 20 })
  }
);

const data = await response.json();
console.log('Estado:', data.character.estado);  // 'saludable'
console.log('HP:', data.character.hp_actual);   // HP_MAX
```

**Costo fijo:** ~20 VAL (puede variar)

---

## 5️⃣ EXPERIENCIA Y NIVELES

### Agregar Experiencia
```typescript
const response = await fetch(
  `http://localhost:3000/api/characters/${characterId}/add-experience`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ amount: 100 })
  }
);

const data = await response.json();

if (data.character.leveledUp) {
  console.log('¡NIVEL UP!');
  console.log('Nuevo nivel:', data.character.nivel);
  console.log('HP:', data.character.hp_actual, '/', data.character.hp_maximo);
  // HP curado gratis ✅
}
```

**XP por nivel:**
- Nivel 1→2: 100 XP
- Nivel 2→3: 150 XP
- Nivel 3→4: 225 XP
- Nivel 4→5: 338 XP

---

## 6️⃣ EVOLUCIÓN

### Evolucionar Personaje
```typescript
const response = await fetch(
  `http://localhost:3000/api/characters/${characterId}/evolve`,
  {
    method: 'POST',
    credentials: 'include'
  }
);

const data = await response.json();
console.log('Nueva etapa:', data.character.etapa_evolucion);
console.log('Stats nuevos:', data.character.hp_maximo, data.character.ataque_base);
console.log('Costó:', data.costEVO, 'cristales EVO');
```

**Requisitos:**
- Nivel mínimo alcanzado (10, 20, 30)
- `puede_evolucionar === true`
- Suficiente EVO (3, 5, 8 cristales)

---

## 7️⃣ MAZMORRAS

### Listar Mazmorras
```typescript
const response = await fetch('http://localhost:3000/api/dungeons', {
  credentials: 'include'
});

const mazmorras = await response.json();
// [{ _id: '672...', nombre: 'Cueva Oscura', nivel_requerido: 1, ... }]
```

### Iniciar Mazmorra
```typescript
const dungeonId = '672abc123...';

const response = await fetch(
  `http://localhost:3000/api/dungeons/${dungeonId}/start`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ characterId })
  }
);

const data = await response.json();
// data.dungeon contiene info de la mazmorra
// data.character contiene personaje actualizado
```

**Validaciones automáticas:**
- Nivel suficiente
- HP > 0
- Estado = 'saludable'

---

## 8️⃣ MARKETPLACE

### Crear Listing (Vender)
```typescript
const itemId = '673789012...';

const response = await fetch('http://localhost:3000/api/marketplace/listings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    itemId,
    itemType: 'equipamiento',  // o 'consumible'
    precio: 50  // VAL
  })
});

const listing = await response.json();
```

### Buscar Listings
```typescript
const response = await fetch(
  'http://localhost:3000/api/marketplace/listings?tipo=arma&rareza=raro',
  { credentials: 'include' }
);

const listings = await response.json();
// [{ _id: '674...', precio: 50, seller: {...}, item: {...} }]
```

### Comprar Item
```typescript
const listingId = '674123abc...';

const response = await fetch(
  `http://localhost:3000/api/marketplace/listings/${listingId}/purchase`,
  {
    method: 'POST',
    credentials: 'include'
  }
);

const data = await response.json();
// Item ahora en tu inventario
// VAL deducido
```

### Cancelar Listing Propio
```typescript
const response = await fetch(
  `http://localhost:3000/api/marketplace/listings/${listingId}`,
  {
    method: 'DELETE',
    credentials: 'include'
  }
);

// Item vuelve a tu inventario
```

---

## 🎮 FLUJO COMPLETO DE JUEGO

### Preparar Personaje para Mazmorra

```typescript
async function prepararParaMazmorra(characterId) {
  // 1. Obtener estado del personaje
  const userRes = await fetch('http://localhost:3000/api/users/me', {
    credentials: 'include'
  });
  const user = await userRes.json();
  const character = user.personajes.find(p => p._id === characterId);
  
  // 2. Si está herido, revivir
  if (character.estado === 'herido') {
    await fetch(`http://localhost:3000/api/characters/${characterId}/revive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ costVAL: 20 })
    });
  }
  
  // 3. Si HP bajo, curar
  if (character.hp_actual < character.hp_maximo) {
    await fetch(`http://localhost:3000/api/characters/${characterId}/heal`, {
      method: 'POST',
      credentials: 'include'
    });
  }
  
  // 4. Equipar mejor gear
  const mejorArma = user.inventarioEquipamiento
    .filter(i => i.tipo === 'arma')
    .sort((a, b) => (b.ataque || 0) - (a.ataque || 0))[0];
  
  if (mejorArma) {
    await fetch(`http://localhost:3000/api/characters/${characterId}/equip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ equipmentId: mejorArma._id })
    });
  }
  
  // 5. Listo para entrar
  console.log('Personaje preparado ✅');
}
```

### Después de Ganar Mazmorra

```typescript
async function manejarVictoria(characterId, xpGanada) {
  // 1. Agregar XP
  const xpRes = await fetch(
    `http://localhost:3000/api/characters/${characterId}/add-experience`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ amount: xpGanada })
    }
  );
  const data = await xpRes.json();
  
  // 2. Si subió de nivel
  if (data.character.leveledUp) {
    alert(`¡Nivel UP! Ahora eres nivel ${data.character.nivel}`);
    
    // 3. Si puede evolucionar
    if (data.character.puede_evolucionar) {
      const quiere = confirm('¿Evolucionar? (Cuesta 3 EVO)');
      if (quiere) {
        await fetch(
          `http://localhost:3000/api/characters/${characterId}/evolve`,
          {
            method: 'POST',
            credentials: 'include'
          }
        );
        alert('¡Evolucionaste! 🌟');
      }
    }
  }
  
  // 4. Verificar HP
  const userRes = await fetch('http://localhost:3000/api/users/me', {
    credentials: 'include'
  });
  const user = await userRes.json();
  const character = user.personajes.find(p => p._id === characterId);
  
  // 5. Ofrecer curación si HP bajo
  if (character.hp_actual < character.hp_maximo * 0.5) {
    const quiere = confirm('¿Curar personaje? (Cuesta VAL)');
    if (quiere) {
      await fetch(`http://localhost:3000/api/characters/${characterId}/heal`, {
        method: 'POST',
        credentials: 'include'
      });
    }
  }
}
```

---

## 🔴 ERRORES COMUNES

### Error 401 (No autorizado)
```typescript
if (response.status === 401) {
  // Sesión expirada o no logueado
  window.location.href = '/login';
}
```

### Error 400 (Bad Request)
```typescript
const data = await response.json();
alert(data.error);  // Mostrar mensaje al usuario
```

### Item no encontrado
```typescript
// Error 404
const data = await response.json();
console.error(data.error);
// "Item no encontrado en el inventario"
```

### Sin suficiente VAL/EVO
```typescript
// Error 400
const data = await response.json();
alert(data.error);
// "No tienes suficiente VAL para curar (necesitas 10 VAL)"
```

---

## 📦 DATOS QUE NECESITAS GUARDAR EN ESTADO

### Estado Global de la App
```typescript
interface AppState {
  // Usuario
  user: {
    id: string;
    email: string;
    username: string;
    val: number;
    boletos: number;
    evo: number;
    personajes: Character[];
    inventarioEquipamiento: EquipmentItem[];
    inventarioConsumibles: ConsumableItem[];
  } | null;
  
  // UI
  loading: boolean;
  error: string | null;
}
```

### Actualizar Estado Después de Acción
```typescript
// Ejemplo: Después de equipar
const response = await fetch(`/api/characters/${id}/equip`, {...});
const data = await response.json();

// Actualizar personaje en estado
this.user.personajes = this.user.personajes.map(p => 
  p._id === id ? data.character : p
);
```

---

## 🎯 RESUMEN DE URLS

```typescript
const API_BASE = 'http://localhost:3000';

const ENDPOINTS = {
  // Auth
  REGISTER: `${API_BASE}/auth/register`,
  LOGIN: `${API_BASE}/auth/login`,
  LOGOUT: `${API_BASE}/auth/logout`,
  ME: `${API_BASE}/api/users/me`,
  
  // Characters
  EQUIP: (id) => `${API_BASE}/api/characters/${id}/equip`,
  UNEQUIP: (id) => `${API_BASE}/api/characters/${id}/unequip`,
  USE_CONSUMABLE: (id) => `${API_BASE}/api/characters/${id}/use-consumable`,
  HEAL: (id) => `${API_BASE}/api/characters/${id}/heal`,
  REVIVE: (id) => `${API_BASE}/api/characters/${id}/revive`,
  ADD_XP: (id) => `${API_BASE}/api/characters/${id}/add-experience`,
  EVOLVE: (id) => `${API_BASE}/api/characters/${id}/evolve`,
  STATS: (id) => `${API_BASE}/api/characters/${id}/stats`,
  
  // Dungeons
  LIST_DUNGEONS: `${API_BASE}/api/dungeons`,
  START_DUNGEON: (id) => `${API_BASE}/api/dungeons/${id}/start`,
  
  // Marketplace
  LISTINGS: `${API_BASE}/api/marketplace/listings`,
  PURCHASE: (id) => `${API_BASE}/api/marketplace/listings/${id}/purchase`,
  CANCEL: (id) => `${API_BASE}/api/marketplace/listings/${id}`,
};
```

---

## ✅ CHECKLIST ULTRA-RÁPIDO

### Para Implementar HOY
- [ ] Configurar `credentials: 'include'` en todas las peticiones
- [ ] Crear página de Login
- [ ] Crear página de Registro
- [ ] Implementar verificación de sesión al cargar app
- [ ] Crear página de perfil (mostrar VAL, boletos, EVO)
- [ ] Mostrar lista de personajes del usuario
- [ ] Botón de Logout

### Para Implementar MAÑANA
- [ ] Mostrar inventario de equipamiento
- [ ] Implementar equipar/desequipar (botones o drag&drop)
- [ ] Mostrar stats con bonos de equipamiento
- [ ] Mostrar inventario de consumibles
- [ ] Botón "Usar" para consumibles
- [ ] Botón "Curar" con validación de VAL

### Para Implementar ESTA SEMANA
- [ ] Lista de mazmorras
- [ ] Botón "Entrar" con validación
- [ ] Sistema de combate (simulado o real)
- [ ] Pantalla de victoria con XP
- [ ] Pantalla de derrota
- [ ] Botón "Evolucionar" cuando corresponda

---

## 📞 SI TIENES DUDAS

**Documentación completa:**
- `15_GUIA_COMPLETA_AUTENTICACION_SESIONES.md` - Todo sobre login/cookies
- `16_GUIA_EQUIPAMIENTO_PERSONAJES.md` - Todo sobre equipamiento/XP
- `17_RESUMEN_CAMBIOS_NOVIEMBRE_2025.md` - Resumen de cambios

**Tests para referencia:**
- `tests/e2e/master-complete-flow.e2e.test.ts` - 16/18 tests pasando

---

**✅ CON ESTO PUEDES EMPEZAR A DESARROLLAR AHORA MISMO**

**Última actualización:** 3 de noviembre de 2025
