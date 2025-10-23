# 📦 MODELOS TYPESCRIPT - COPIAR Y PEGAR

## 📁 Ubicación
Crear estos archivos en: `src/app/models/`

---

## 1️⃣ user.model.ts

```typescript
// src/app/models/user.model.ts

export interface User {
  id: string;
  email: string;
  username: string;
  isVerified: boolean;
  walletAddress?: string;
  val: number;
  boletos: number;
  evo: number;
  invocaciones: number;
  evoluciones: number;
  boletosDiarios: number;
  ultimoReinicio?: Date;
  personajeActivoId?: string;
  personajes: Character[];
  inventarioEquipamiento: string[];
  inventarioConsumibles: ConsumableInventoryItem[];
  limiteInventarioEquipamiento: number;
  limiteInventarioConsumibles: number;
  fechaRegistro: Date;
  ultimaActualizacion: Date;
  receivedPioneerPackage?: boolean;
}

// Importar Character desde character.model.ts
import { Character } from './character.model';
import { ConsumableInventoryItem } from './item.model';
```

---

## 2️⃣ character.model.ts

```typescript
// src/app/models/character.model.ts

export interface Character {
  _id: string;
  personajeId: string;
  rango: 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS';
  nivel: number;
  etapa: 1 | 2 | 3;
  progreso: number;
  experiencia: number;
  stats: CharacterStats;
  saludActual: number;
  saludMaxima: number;
  estado: 'saludable' | 'herido';
  fechaHerido: Date | null;
  equipamiento: string[];
  activeBuffs: ActiveBuff[];
}

export interface CharacterStats {
  atk: number;
  vida: number;
  defensa: number;
}

export interface ActiveBuff {
  consumableId: string;
  effects: BuffEffects;
  expiresAt: Date;
}

export interface BuffEffects {
  mejora_atk?: number;
  mejora_defensa?: number;
  mejora_vida?: number;
  mejora_xp_porcentaje?: number;
}

export interface BaseCharacter {
  id: string;
  nombre: string;
  descripcion: string;
  descripcion_rango: string;
  stats: CharacterStats;
  progreso: number;
  etapa: number;
  nivel: number;
  multiplicador_base: number;
  imagen?: string;
}
```

---

## 3️⃣ item.model.ts

```typescript
// src/app/models/item.model.ts

export interface Equipment {
  _id: string;
  nombre: string;
  descripcion: string;
  rareza: 'comun' | 'raro' | 'epico' | 'legendario';
  tipoItem: 'Equipment';
  tipoEquipamiento: 'arma' | 'armadura' | 'accesorio';
  stats: {
    mejora_atk?: number;
    mejora_defensa?: number;
    mejora_vida?: number;
  };
  requisitos?: {
    nivel_minimo?: number;
    rango_minimo?: string;
  };
  precio_val?: number;
  imagen?: string;
}

export interface Consumable {
  _id: string;
  nombre: string;
  descripcion: string;
  rareza: 'comun' | 'raro' | 'epico' | 'legendario';
  tipoItem: 'Consumable';
  efectos: {
    mejora_atk?: number;
    mejora_defensa?: number;
    mejora_vida?: number;
    mejora_xp_porcentaje?: number;
  };
  duracion_minutos: number;
  usos_maximos: number;
  precio_val?: number;
  imagen?: string;
}

export interface ConsumableInventoryItem {
  _id?: string;
  consumableId: string;
  usos_restantes: number;
  consumable?: Consumable;
}

export type Item = Equipment | Consumable;
```

---

## 4️⃣ marketplace.model.ts

```typescript
// src/app/models/marketplace.model.ts

export interface Listing {
  _id: string;
  vendedor: string;
  tipo: 'character' | 'equipment' | 'consumable';
  itemId: string;
  precio: number;
  estado: 'activo' | 'vendido' | 'cancelado' | 'expirado';
  fechaCreacion: Date;
  fechaExpiracion: Date;
  fechaVenta?: Date;
  comprador?: string;
  destacado?: boolean;
  metadata?: ListingMetadata;
  item?: any;
  vendedorData?: {
    username: string;
  };
}

export interface ListingMetadata {
  nivel?: number;
  rango?: string;
  durabilidad?: number;
  usos?: number;
  stats?: {
    atk?: number;
    defensa?: number;
    vida?: number;
  };
}

export interface CreateListingRequest {
  itemId: string;
  precio: number;
  destacar?: boolean;
  metadata?: ListingMetadata;
}

export interface ListingFilters {
  type?: 'character' | 'equipment' | 'consumable';
  precioMin?: number;
  precioMax?: number;
  destacados?: boolean;
  rango?: string;
  nivelMin?: number;
  nivelMax?: number;
  limit?: number;
  offset?: number;
}
```

---

## 5️⃣ dungeon.model.ts

```typescript
// src/app/models/dungeon.model.ts

export interface Dungeon {
  _id: string;
  nombre: string;
  descripcion: string;
  dificultad: 'facil' | 'normal' | 'dificil' | 'extremo';
  nivel_recomendado: number;
  max_personajes: number;
  recompensas: DungeonRewards;
  enemigos: Enemy[];
  activa: boolean;
}

export interface DungeonRewards {
  val_min: number;
  val_max: number;
  experiencia_base: number;
  items_posibles: string[];
}

export interface Enemy {
  nombre: string;
  nivel: number;
  stats: {
    atk: number;
    vida: number;
    defensa: number;
  };
}

export interface EnterDungeonRequest {
  characterIds: string[];
}

export interface DungeonResult {
  victoria: boolean;
  recompensas: {
    val: number;
    experiencia: number;
    items: string[];
  };
  personajes: Array<{
    characterId: string;
    saludFinal: number;
    experienciaGanada: number;
  }>;
}
```

---

## 6️⃣ package.model.ts

```typescript
// src/app/models/package.model.ts

export interface Package {
  _id: string;
  nombre: string;
  descripcion?: string;
  precio_val?: number;
  precio_usdt?: number;
  personajes: number;
  categorias_garantizadas: string[];
  distribucion_aleatoria: string;
  val_reward?: number;
  items_reward?: string[];
  imagen?: string;
  activo?: boolean;
  destacado?: boolean;
  limite_por_usuario?: number;
}

export interface UserPackage {
  _id: string;
  userId: string;
  packageId: string;
  abierto: boolean;
  fechaCompra: Date;
  fechaApertura?: Date;
  contenido?: PackageContent;
}

export interface PackageContent {
  personajes: Array<{
    personajeId: string;
    rango: string;
    nivel: number;
  }>;
  items: Array<{
    itemId: string;
    cantidad: number;
  }>;
  val?: number;
}

export interface PurchasePackageRequest {
  packageId: string;
  paymentMethod: 'val' | 'crypto';
  walletAddress?: string;
}

export interface OpenPackageRequest {
  userPackageId: string;
}
```

---

## 7️⃣ api-response.model.ts

```typescript
// src/app/models/api-response.model.ts

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export enum ErrorCodes {
  // Autenticación
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  
  // Validación
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  
  // Recursos
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  
  // Juego
  INSUFFICIENT_RESOURCES = 'INSUFFICIENT_RESOURCES',
  CHARACTER_NOT_READY = 'CHARACTER_NOT_READY',
  INVALID_EVOLUTION = 'INVALID_EVOLUTION',
  INVENTORY_FULL = 'INVENTORY_FULL',
  
  // Marketplace
  LISTING_EXPIRED = 'LISTING_EXPIRED',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  ITEM_ALREADY_LISTED = 'ITEM_ALREADY_LISTED',
  
  // Sistema
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE'
}
```

---

## 8️⃣ auth.model.ts

```typescript
// src/app/models/auth.model.ts

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

// Importar User
import { User } from './user.model';
```

---

## 9️⃣ game-settings.model.ts

```typescript
// src/app/models/game-settings.model.ts

export interface GameSettings {
  nivel_maximo_personaje: number;
  costo_revivir_personaje: number;
  MAX_PERSONAJES_POR_EQUIPO: number;
  EXP_GLOBAL_MULTIPLIER: number;
  PERMADEATH_TIMER_HOURS: number;
  nivel_evolucion_etapa_2: number;
  nivel_evolucion_etapa_3: number;
  puntos_ranking_por_victoria: number;
  costo_ticket_en_val: number;
  aumento_stats_por_nivel: {
    [key: string]: {
      atk: number;
      defensa: number;
      vida: number;
    };
  };
}

export interface LevelRequirement {
  nivel: number;
  experiencia_requerida: number;
  experiencia_acumulada: number;
}
```

---

## ✅ CHECKLIST DE MODELOS

Después de copiar todos los archivos, verifica:

- [ ] Todos los archivos están en `src/app/models/`
- [ ] No hay errores de TypeScript
- [ ] Las importaciones están correctas
- [ ] Puedes importar los modelos en otros archivos

---

## 📝 EJEMPLO DE USO

```typescript
// En cualquier componente o servicio
import { User } from '@models/user.model';
import { Character } from '@models/character.model';
import { Listing } from '@models/marketplace.model';

// Usar los tipos
const user: User = {
  id: '123',
  email: 'user@example.com',
  // ... resto de propiedades
};

const character: Character = {
  _id: '456',
  personajeId: 'hero_001',
  // ... resto de propiedades
};
```

---

## 🔧 CONFIGURAR PATH ALIAS

Para usar `@models/` en lugar de rutas relativas, agrega en `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@models/*": ["src/app/models/*"],
      "@services/*": ["src/app/core/services/*"],
      "@components/*": ["src/app/shared/components/*"]
    }
  }
}
```

---

**Siguiente paso:** Ve a `04_SERVICIOS_BASE.md`
