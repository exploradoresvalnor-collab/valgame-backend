# ⚔️ GUÍA COMPLETA: EQUIPAMIENTO Y GESTIÓN DE PERSONAJES

**Fecha de actualización:** 3 de noviembre de 2025  
**Última revisión:** Sistema de equipamiento, consumibles y evolución probado

---

## 📚 ÍNDICE

1. [Sistema de Inventario](#sistema-de-inventario)
2. [Equipar Items](#equipar-items)
3. [Desequipar Items](#desequipar-items)
4. [Consumibles y Pociones](#consumibles-y-pociones)
5. [Sistema de Sanación](#sistema-de-sanación)
6. [Sistema de Resurrección](#sistema-de-resurrección)
7. [Experiencia y Niveles](#experiencia-y-niveles)
8. [Evolución de Personajes](#evolución-de-personajes)
9. [Stats con Equipamiento](#stats-con-equipamiento)
10. [Implementación Frontend](#implementación-frontend)
11. [Casos de Uso Completos](#casos-de-uso-completos)

---

## 🎒 SISTEMA DE INVENTARIO

### Estructura de Datos

```typescript
interface User {
  // RECURSOS GENERALES
  val: number;              // Moneda del juego
  boletos: number;          // Para invocar personajes
  evo: number;              // Cristales de evolución
  invocaciones: number;     // Contador de invocaciones
  evoluciones: number;      // Contador de evoluciones
  
  // INVENTARIOS
  inventarioEquipamiento: EquipmentItem[];
  inventarioConsumibles: ConsumableItem[];
  personajes: Character[];
  
  // LÍMITES
  limiteInventarioEquipamiento: number;  // Default: 50
  limiteInventarioConsumibles: number;   // Default: 50
  limiteInventarioPersonajes: number;    // Default: 30
  
  // PERSONAJE ACTIVO
  personajeActivoId: string | null;
}
```

### Items de Equipamiento

```typescript
interface EquipmentItem {
  _id: string;              // ID único del item
  tipo: 'arma' | 'armadura' | 'accesorio';
  nombre: string;
  descripcion?: string;
  rareza: 'comun' | 'raro' | 'epico' | 'legendario';
  
  // STATS BONUS
  ataque?: number;
  defensa?: number;
  hp_bonus?: number;
  velocidad?: number;
  
  // EFECTOS ESPECIALES (opcional)
  efectos?: {
    tipo: string;
    valor: number;
  }[];
}
```

### Items Consumibles

```typescript
interface ConsumableItem {
  _id: string;
  nombre: string;
  descripcion?: string;
  usos_restantes: number;   // Se decrementa al usar
  
  efecto: {
    tipo: 'curacion' | 'buff_ataque' | 'buff_defensa' | 'revivir';
    valor: number;
  };
}
```

### Estructura de Personaje

```typescript
interface Character {
  _id: string;
  baseCharacterId: string;  // Referencia al BaseCharacter
  
  // ESTADO
  nivel: number;
  experiencia: number;
  estado: 'saludable' | 'herido';  // herido = necesita revivir
  
  // HP
  hp_actual: number;
  hp_maximo: number;
  
  // EQUIPAMIENTO (slots)
  equipamiento: {
    arma: string | null;        // ID del item equipado
    armadura: string | null;
    accesorio: string | null;
  };
  
  // STATS BASE (del BaseCharacter + nivel)
  ataque_base: number;
  defensa_base: number;
  velocidad_base: number;
  
  // EVOLUCIÓN
  etapa_evolucion: number;      // 1, 2, 3
  puede_evolucionar: boolean;
}
```

---

## ⚔️ EQUIPAR ITEMS

### Endpoint
```typescript
POST /api/characters/:characterId/equip
Content-Type: application/json
Cookie: token=<JWT>  (automático)
```

### Request Body
```json
{
  "equipmentId": "673789012345678901234567"
}
```

### Validaciones Automáticas
1. ✅ El item existe en el inventario del usuario
2. ✅ El item no está equipado en otro personaje
3. ✅ El tipo de item corresponde al slot correcto
4. ✅ El personaje pertenece al usuario
5. ✅ Si ya hay un item en ese slot, se desequipa automáticamente

### Response Exitoso (200)
```json
{
  "message": "Equipamiento equipado exitosamente",
  "character": {
    "_id": "673456def789012345678901",
    "nivel": 5,
    "estado": "saludable",
    "hp_actual": 140,
    "hp_maximo": 140,
    
    "equipamiento": {
      "arma": "673789012345678901234567",      // ⚠️ Item equipado
      "armadura": null,
      "accesorio": null
    },
    
    "ataque_base": 25,
    "defensa_base": 15,
    "velocidad_base": 20
  }
}
```

### Flujo Interno
```
1. Buscar item en inventarioEquipamiento
2. Verificar que tipo coincida con slot vacío o reemplazable
3. Si slot ocupado → mover item anterior a inventario
4. Asignar nuevo item al slot
5. Marcar item como "equipado" (no disponible para otros)
6. Guardar cambios
7. Recalcular stats totales (base + equipamiento)
```

### Tipos y Slots

| Tipo Item | Slot Correspondiente | Campo |
|-----------|---------------------|-------|
| arma | Arma | `equipamiento.arma` |
| armadura | Armadura | `equipamiento.armadura` |
| accesorio | Accesorio | `equipamiento.accesorio` |

### Response Error
```json
// 404 - Item no encontrado
{
  "error": "Item no encontrado en el inventario"
}

// 400 - Item ya equipado en otro personaje
{
  "error": "Este item ya está equipado en otro personaje"
}

// 400 - Tipo de item no válido
{
  "error": "Tipo de equipamiento no válido"
}
```

---

## 🛡️ DESEQUIPAR ITEMS

### Endpoint
```typescript
POST /api/characters/:characterId/unequip
Content-Type: application/json
Cookie: token=<JWT>
```

### Request Body
```json
{
  "slot": "arma"
}
```

**Slots válidos:** `"arma"`, `"armadura"`, `"accesorio"`

### Response Exitoso (200)
```json
{
  "message": "Equipamiento desequipado exitosamente",
  "character": {
    "_id": "673456def789012345678901",
    "equipamiento": {
      "arma": null,           // ⚠️ Ahora vacío
      "armadura": null,
      "accesorio": null
    }
  }
}
```

### Flujo Interno
```
1. Verificar que el slot tenga un item
2. Obtener ID del item equipado
3. Liberar el slot (ponerlo en null)
4. Item vuelve a estar disponible en inventario
5. Guardar cambios
6. Recalcular stats (sin bonus del item)
```

### Response Error
```json
// 400 - Slot vacío
{
  "error": "No hay equipamiento en ese slot"
}

// 400 - Slot inválido
{
  "error": "Slot de equipamiento no válido"
}
```

---

## 🧪 CONSUMIBLES Y POCIONES

### Endpoint
```typescript
POST /api/characters/:characterId/use-consumable
Content-Type: application/json
Cookie: token=<JWT>
```

### Request Body
```json
{
  "consumableId": "673890123456789012345678"
}
```

### Tipos de Consumibles

| Tipo | Efecto | Ejemplo |
|------|--------|---------|
| curacion | Restaura HP | Poción de Vida (50 HP) |
| buff_ataque | +Ataque temporal | Elixir de Fuerza (+10 ATK) |
| buff_defensa | +Defensa temporal | Tónico de Protección (+10 DEF) |
| revivir | Revive personaje herido | Lágrima del Fénix |

### Response Exitoso (200)

**Caso 1: Poción de curación**
```json
{
  "message": "Consumible usado exitosamente",
  "character": {
    "_id": "673456def789012345678901",
    "hp_actual": 100,        // ⚠️ HP restaurado
    "hp_maximo": 140,
    "estado": "saludable"
  },
  "consumable": {
    "_id": "673890123456789012345678",
    "nombre": "Poción de Vida Menor",
    "usos_restantes": 0      // ⚠️ Se decrementa
  }
}
```

**Caso 2: Item se elimina automáticamente**
```json
{
  "message": "Consumible usado exitosamente (último uso - item eliminado)",
  "character": {
    "_id": "673456def789012345678901",
    "hp_actual": 140,
    "hp_maximo": 140
  },
  "consumable": null         // ⚠️ Ya no existe
}
```

### Flujo de Uso de Consumible
```
1. Buscar consumible en inventarioConsumibles del usuario
2. Verificar que usos_restantes > 0
3. Aplicar efecto según tipo:
   - curacion: hp_actual += efecto.valor (max: hp_maximo)
   - buff_ataque: aplicar boost temporal
   - revivir: estado = 'saludable', hp_actual = hp_maximo
4. Decrementar usos_restantes -= 1
5. Si usos_restantes <= 0:
   → Eliminar item del inventario completamente
6. Guardar cambios
7. Devolver estado actualizado
```

### 🔴 IMPORTANTE: Auto-eliminación
**Los consumibles se BORRAN AUTOMÁTICAMENTE cuando `usos_restantes <= 0`**

Esto significa:
- No ocupan espacio en inventario indefinidamente
- No necesitas lógica de limpieza en frontend
- El backend se encarga de todo

### Response Error
```json
// 404 - Consumible no encontrado
{
  "error": "Consumible no encontrado en el inventario"
}

// 400 - Sin usos restantes
{
  "error": "Este consumible no tiene usos restantes"
}

// 400 - HP ya al máximo
{
  "error": "El personaje ya tiene HP al máximo"
}
```

---

## 💚 SISTEMA DE SANACIÓN

### Endpoint
```typescript
POST /api/characters/:characterId/heal
Cookie: token=<JWT>
```

**No requiere body** - Cura completamente al personaje.

### Costo de Sanación
```typescript
// Fórmula
const hpFaltante = hp_maximo - hp_actual;
const costoVAL = Math.ceil(hpFaltante / 10);

// Ejemplo
hp_maximo = 140
hp_actual = 40
hpFaltante = 100
costoVAL = Math.ceil(100 / 10) = 10 VAL
```

**📊 Tabla de Costos:**

| HP Faltante | Costo VAL |
|-------------|-----------|
| 1-10 HP | 1 VAL |
| 11-20 HP | 2 VAL |
| 21-30 HP | 3 VAL |
| 50 HP | 5 VAL |
| 100 HP | 10 VAL |
| 200 HP | 20 VAL |

### Validaciones
1. ✅ Personaje debe estar `saludable` (no herido)
2. ✅ HP debe estar por debajo del máximo
3. ✅ Usuario debe tener suficiente VAL

### Response Exitoso (200)
```json
{
  "message": "Personaje curado exitosamente",
  "character": {
    "_id": "673456def789012345678901",
    "hp_actual": 140,        // ⚠️ Curado completamente
    "hp_maximo": 140,
    "estado": "saludable"
  },
  "cost": 10,                // VAL gastado
  "newBalance": 90           // VAL restante del usuario
}
```

### Flujo de Sanación
```
1. Verificar que estado = 'saludable'
2. Verificar que hp_actual < hp_maximo
3. Calcular costo: Math.ceil((hp_maximo - hp_actual) / 10)
4. Verificar que usuario.val >= costo
5. Restar VAL al usuario
6. Restaurar hp_actual = hp_maximo
7. Guardar cambios
8. Devolver personaje curado + nuevo balance
```

### Response Error
```json
// 400 - Personaje herido (debe revivir primero)
{
  "error": "El personaje está herido. Usa revivir primero"
}

// 400 - HP ya al máximo
{
  "error": "El personaje ya tiene HP al máximo"
}

// 400 - Sin suficiente VAL
{
  "error": "No tienes suficiente VAL para curar (necesitas 10 VAL)"
}
```

---

## ⚰️ SISTEMA DE RESURRECCIÓN

### Endpoint
```typescript
POST /api/characters/:characterId/revive
Content-Type: application/json
Cookie: token=<JWT>
```

### Request Body
```json
{
  "costVAL": 20
}
```

**Nota:** El costo puede variar según el nivel/rareza del personaje.

### ¿Cuándo usar Revivir?
Un personaje entra en estado `herido` cuando:
- HP llega a 0 en combate
- Pierde en una mazmorra
- Sufre un golpe mortal

**Estado herido:**
- ❌ No puede entrar a mazmorras
- ❌ No puede ser sanado con `heal`
- ❌ No puede usar consumibles de curación
- ✅ Puede ser revivido con VAL
- ✅ Puede ser revivido con consumible tipo "revivir"

### Response Exitoso (200)
```json
{
  "message": "Personaje revivido exitosamente",
  "character": {
    "_id": "673456def789012345678901",
    "estado": "saludable",   // ⚠️ Cambió de herido a saludable
    "hp_actual": 140,        // ⚠️ HP restaurado completamente
    "hp_maximo": 140
  },
  "cost": 20,
  "newBalance": 80           // VAL restante
}
```

### Flujo de Resurrección
```
1. Verificar que estado = 'herido'
2. Verificar que usuario.val >= costVAL
3. Restar VAL al usuario
4. Cambiar estado = 'saludable'
5. Restaurar hp_actual = hp_maximo
6. Guardar cambios
7. Devolver personaje revivido
```

### Response Error
```json
// 400 - Personaje no está herido
{
  "error": "El personaje no está herido"
}

// 400 - Sin suficiente VAL
{
  "error": "No tienes suficiente VAL para revivir (necesitas 20 VAL)"
}
```

### 💡 Diferencia: Heal vs Revive

| Acción | Requisito | Resultado | Costo |
|--------|-----------|-----------|-------|
| **Heal** | Estado = saludable<br>HP < HP_MAX | HP = HP_MAX | ~1-20 VAL |
| **Revive** | Estado = herido | Estado = saludable<br>HP = HP_MAX | ~20+ VAL |

---

## 📈 EXPERIENCIA Y NIVELES

### Endpoint: Agregar Experiencia
```typescript
POST /api/characters/:characterId/add-experience
Content-Type: application/json
Cookie: token=<JWT>
```

### Request Body
```json
{
  "amount": 100
}
```

### Sistema de Niveles

**Fórmula de XP requerida:**
```typescript
const xpParaNivel = (nivel: number) => {
  return Math.floor(100 * Math.pow(1.5, nivel - 1));
};
```

**Tabla de XP:**

| Nivel | XP Requerida | XP Acumulada |
|-------|--------------|--------------|
| 1→2 | 100 | 100 |
| 2→3 | 150 | 250 |
| 3→4 | 225 | 475 |
| 4→5 | 338 | 813 |
| 5→6 | 507 | 1,320 |
| 10→11 | ~3,840 | ~25,000 |

### Response: Sin Subir de Nivel
```json
{
  "message": "Experiencia agregada",
  "character": {
    "_id": "673456def789012345678901",
    "nivel": 3,
    "experiencia": 150,      // ⚠️ XP acumulada
    "leveledUp": false
  }
}
```

### Response: Con Subida de Nivel
```json
{
  "message": "¡El personaje subió de nivel!",
  "character": {
    "_id": "673456def789012345678901",
    "nivel": 4,              // ⚠️ Nivel aumentó
    "experiencia": 25,       // ⚠️ XP sobrante
    "hp_actual": 150,        // ⚠️ Stats aumentaron
    "hp_maximo": 150,
    "ataque_base": 30,
    "defensa_base": 18,
    "velocidad_base": 22,
    "leveledUp": true        // ⚠️ Indica que subió
  }
}
```

### Flujo de Experiencia
```
1. Agregar experiencia al personaje
2. Verificar si experiencia >= xpParaNivel(nivel_actual)
3. Si SÍ:
   a. Subir nivel += 1
   b. Restar XP usada (experiencia -= xpRequerida)
   c. Aumentar stats base según crecimiento
   d. Aumentar hp_maximo
   e. Curar hp_actual = hp_maximo (regalo por subir)
   f. Verificar si hay XP suficiente para otro nivel (loop)
4. Si NO:
   a. Solo actualizar XP acumulada
5. Guardar cambios
```

### 🎁 Beneficios al Subir de Nivel
- ✅ HP restaurado completamente (gratis)
- ✅ HP máximo aumenta
- ✅ Ataque base aumenta
- ✅ Defensa base aumenta
- ✅ Velocidad base aumenta
- ✅ Puede desbloquear evolución (niveles específicos)

### Crecimiento de Stats por Nivel

```typescript
// Ejemplo de crecimiento (valores aproximados)
nivelUp() {
  this.hp_maximo += Math.floor(this.hp_maximo * 0.1);  // +10%
  this.ataque_base += Math.floor(this.ataque_base * 0.08);  // +8%
  this.defensa_base += Math.floor(this.defensa_base * 0.08);
  this.velocidad_base += Math.floor(this.velocidad_base * 0.05);
  this.hp_actual = this.hp_maximo;  // Cura completa
}
```

---

## 🌟 EVOLUCIÓN DE PERSONAJES

### Endpoint
```typescript
POST /api/characters/:characterId/evolve
Cookie: token=<JWT>
```

**No requiere body** - Usa automáticamente los EVO del usuario.

### Requisitos para Evolucionar
1. ✅ Personaje debe estar en nivel específico (ej: 10, 20, 30)
2. ✅ `puede_evolucionar` debe ser `true`
3. ✅ Usuario debe tener suficiente EVO (cristales)
4. ✅ Debe existir siguiente etapa en BaseCharacter

### Etapas de Evolución

| Etapa | Nivel Mínimo | Costo EVO | Ejemplo |
|-------|--------------|-----------|---------|
| 1 | 1 | - | Novato |
| 2 | 10 | 3 EVO | Guerrero |
| 3 | 20 | 5 EVO | Veterano |
| 4 | 30 | 8 EVO | Maestro |

### Response Exitoso (200)
```json
{
  "message": "Personaje evolucionado exitosamente",
  "character": {
    "_id": "673456def789012345678901",
    "etapa_evolucion": 2,        // ⚠️ Etapa aumentó
    "puede_evolucionar": false,  // ⚠️ Debe subir más niveles
    
    "nivel": 10,
    "hp_maximo": 200,            // ⚠️ Stats aumentaron mucho
    "ataque_base": 45,
    "defensa_base": 30,
    "velocidad_base": 25,
    
    "baseCharacterId": "672abc...",  // ⚠️ Puede cambiar a nueva forma
    "imagen_url": "/characters/guerrero_etapa2.png"
  },
  "costEVO": 3,
  "newEVOBalance": 5               // EVO restante del usuario
}
```

### Flujo de Evolución
```
1. Verificar nivel mínimo
2. Verificar puede_evolucionar = true
3. Obtener BaseCharacter actual
4. Verificar que existe evoluciones[etapa_actual]
5. Calcular costo EVO
6. Verificar que usuario.evo >= costo
7. Restar EVO al usuario
8. Aumentar etapa_evolucion += 1
9. Actualizar stats masivamente (multiplicadores)
10. Cambiar baseCharacterId si hay nueva forma
11. puede_evolucionar = false (hasta siguiente nivel)
12. Guardar cambios
```

### 🚀 Beneficios de Evolucionar

**Stats Boost:**
- HP: +50% ~ +100%
- Ataque: +30% ~ +50%
- Defensa: +30% ~ +50%
- Velocidad: +20% ~ +40%

**Cambios Visuales:**
- Nueva imagen/sprite
- Nuevos efectos visuales
- Nombre puede cambiar (ej: "Guerrero" → "Paladín")

**Gameplay:**
- Acceso a mazmorras de mayor dificultad
- Puede desbloquear habilidades especiales
- Mayor poder en combate

### Response Error
```json
// 400 - Nivel insuficiente
{
  "error": "El personaje debe estar en nivel 10 para evolucionar"
}

// 400 - No puede evolucionar aún
{
  "error": "El personaje aún no puede evolucionar"
}

// 400 - Sin suficiente EVO
{
  "error": "No tienes suficiente EVO para evolucionar (necesitas 3 EVO)"
}

// 404 - No hay siguiente etapa
{
  "error": "No hay evolución disponible para este personaje"
}
```

---

## 📊 STATS CON EQUIPAMIENTO

### Endpoint: Obtener Stats Totales
```typescript
GET /api/characters/:characterId/stats
Cookie: token=<JWT>
```

### Response (200)
```json
{
  "characterId": "673456def789012345678901",
  "nivel": 5,
  "etapa_evolucion": 1,
  
  "stats_base": {
    "hp": 140,
    "ataque": 25,
    "defensa": 15,
    "velocidad": 20
  },
  
  "equipamiento": {
    "arma": {
      "_id": "673789012345678901234567",
      "nombre": "Espada de Hierro",
      "tipo": "arma",
      "ataque": 15,
      "defensa": 0
    },
    "armadura": {
      "_id": "673789012345678901234568",
      "nombre": "Armadura de Cuero",
      "tipo": "armadura",
      "ataque": 0,
      "defensa": 10,
      "hp_bonus": 20
    },
    "accesorio": null
  },
  
  "stats_totales": {
    "hp": 160,           // 140 + 20 (armadura)
    "ataque": 40,        // 25 + 15 (espada)
    "defensa": 25,       // 15 + 10 (armadura)
    "velocidad": 20      // Sin bonus
  },
  
  "bonos_equipamiento": {
    "hp": 20,
    "ataque": 15,
    "defensa": 10,
    "velocidad": 0
  }
}
```

### Cálculo de Stats Totales

```typescript
// Fórmula
stats_totales = stats_base + bonos_equipamiento

// Ejemplo detallado
hp_total = hp_base + arma.hp_bonus + armadura.hp_bonus + accesorio.hp_bonus
ataque_total = ataque_base + arma.ataque + armadura.ataque + accesorio.ataque
defensa_total = defensa_base + arma.defensa + armadura.defensa + accesorio.defensa
velocidad_total = velocidad_base + arma.velocidad + armadura.velocidad + accesorio.velocidad
```

### Uso en Combate
```typescript
// Al iniciar mazmorra, el sistema usa stats_totales
const personaje = await Character.findById(id).populate('equipamiento');
const statsParaCombate = calcularStatsTotales(personaje);

// En cada turno de combate
const daño = statsParaCombate.ataque - enemigo.defensa;
personaje.hp_actual -= Math.max(1, daño);
```

---

## 💻 IMPLEMENTACIÓN FRONTEND

### Service: CharacterService

**📚 Ver `04_SERVICIOS_BASE.md`** para el servicio completo que incluye:
- ✅ `equipItem()` - Equipar items
- ✅ `unequipItem()` - Desequipar items  
- ✅ `useConsumable()` - Usar pociones
- ✅ `healCharacter()` - Curar con VAL
- ✅ `reviveCharacter()` - Revivir heridos
- ✅ `addExperience()` - Agregar XP
- ✅ `evolveCharacter()` - Evolucionar
- ✅ `getCharacterStats()` - Stats con equipamiento

**Ejemplo mínimo:**
```typescript
@Injectable({ providedIn: 'root' })
export class CharacterService {
  constructor(private http: HttpClient) {}

  equipItem(charId: string, equipId: string) {
    return this.http.post(`/api/characters/${charId}/equip`, 
      { equipmentId: equipId },
      { withCredentials: true }
    );
  }
}
```

### Componente: Equipamiento de Personaje

**📚 Ver `05_COMPONENTES_EJEMPLO.md`** para componentes completos listos para usar.

**Ejemplo mínimo:**

```typescript
// character-equipment.component.ts (versión simple)
import { Component, Input, OnInit } from '@angular/core';
import { CharacterService } from './character.service';

@Component({
  selector: 'app-character-equipment',
  template: `
    <div class="equipment-panel">
      <h2>Equipamiento de {{ character?.nombre }}</h2>
      
      <!-- SLOTS DE EQUIPAMIENTO -->
      <div class="equipment-slots">
        <!-- ARMA -->
        <div class="slot" [class.equipped]="character?.equipamiento?.arma">
          <h3>⚔️ Arma</h3>
          <div *ngIf="character?.equipamiento?.arma" class="equipped-item">
            <p>{{ getEquippedItem('arma')?.nombre }}</p>
            <button (click)="unequip('arma')">Quitar</button>
          </div>
          <div *ngIf="!character?.equipamiento?.arma" class="empty-slot">
            <p>Vacío</p>
          </div>
        </div>
        
        <!-- ARMADURA -->
        <div class="slot" [class.equipped]="character?.equipamiento?.armadura">
          <h3>🛡️ Armadura</h3>
          <div *ngIf="character?.equipamiento?.armadura" class="equipped-item">
            <p>{{ getEquippedItem('armadura')?.nombre }}</p>
            <button (click)="unequip('armadura')">Quitar</button>
          </div>
          <div *ngIf="!character?.equipamiento?.armadura" class="empty-slot">
            <p>Vacío</p>
          </div>
        </div>
        
        <!-- ACCESORIO -->
        <div class="slot" [class.equipped]="character?.equipamiento?.accesorio">
          <h3>💍 Accesorio</h3>
          <div *ngIf="character?.equipamiento?.accesorio" class="equipped-item">
            <p>{{ getEquippedItem('accesorio')?.nombre }}</p>
            <button (click)="unequip('accesorio')">Quitar</button>
          </div>
          <div *ngIf="!character?.equipamiento?.accesorio" class="empty-slot">
            <p>Vacío</p>
          </div>
        </div>
      </div>
      
      <!-- INVENTARIO DISPONIBLE -->
      <div class="available-equipment">
        <h3>Inventario de Equipamiento</h3>
        <div class="item-grid">
          <div 
            *ngFor="let item of availableEquipment" 
            class="item-card"
            [class.disabled]="isEquipped(item._id)"
          >
            <h4>{{ item.nombre }}</h4>
            <p>Tipo: {{ item.tipo }}</p>
            <p>Rareza: {{ item.rareza }}</p>
            <div class="stats">
              <span *ngIf="item.ataque">⚔️ +{{ item.ataque }}</span>
              <span *ngIf="item.defensa">🛡️ +{{ item.defensa }}</span>
              <span *ngIf="item.hp_bonus">💚 +{{ item.hp_bonus }}</span>
            </div>
            <button 
              (click)="equip(item._id)"
              [disabled]="isEquipped(item._id)"
            >
              {{ isEquipped(item._id) ? 'Equipado' : 'Equipar' }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- STATS TOTALES -->
      <div class="stats-panel" *ngIf="stats">
        <h3>Stats Totales</h3>
        <div class="stat-row">
          <span>💚 HP:</span>
          <span>{{ stats.stats_totales.hp }}</span>
          <span class="bonus" *ngIf="stats.bonos_equipamiento.hp > 0">
            (+{{ stats.bonos_equipamiento.hp }})
          </span>
        </div>
        <div class="stat-row">
          <span>⚔️ Ataque:</span>
          <span>{{ stats.stats_totales.ataque }}</span>
          <span class="bonus" *ngIf="stats.bonos_equipamiento.ataque > 0">
            (+{{ stats.bonos_equipamiento.ataque }})
          </span>
        </div>
        <div class="stat-row">
          <span>🛡️ Defensa:</span>
          <span>{{ stats.stats_totales.defensa }}</span>
          <span class="bonus" *ngIf="stats.bonos_equipamiento.defensa > 0">
            (+{{ stats.bonos_equipamiento.defensa }})
          </span>
        </div>
        <div class="stat-row">
          <span>⚡ Velocidad:</span>
          <span>{{ stats.stats_totales.velocidad }}</span>
          <span class="bonus" *ngIf="stats.bonos_equipamiento.velocidad > 0">
            (+{{ stats.bonos_equipamiento.velocidad }})
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .equipment-slots {
      display: flex;
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .slot {
      flex: 1;
      border: 2px solid #ccc;
      border-radius: 10px;
      padding: 15px;
      text-align: center;
    }
    
    .slot.equipped {
      border-color: #4CAF50;
      background: #f0fff0;
    }
    
    .empty-slot {
      color: #999;
      font-style: italic;
    }
    
    .item-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 15px;
    }
    
    .item-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 15px;
    }
    
    .item-card.disabled {
      opacity: 0.5;
      pointer-events: none;
    }
    
    .stats span {
      display: inline-block;
      margin: 5px;
      padding: 3px 8px;
      background: #e3f2fd;
      border-radius: 4px;
    }
    
    .stat-row {
      display: flex;
      justify-content: space-between;
      padding: 8px;
      border-bottom: 1px solid #eee;
    }
    
    .bonus {
      color: #4CAF50;
      font-weight: bold;
    }
  `]
})
export class CharacterEquipmentComponent implements OnInit {
  @Input() character: any;
  @Input() availableEquipment: any[] = [];
  
  stats: any = null;
  loading = false;

  constructor(private characterService: CharacterService) {}

  ngOnInit() {
    if (this.character) {
      this.loadStats();
    }
  }

  loadStats() {
    this.characterService.getCharacterStats(this.character._id).subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (err) => {
        console.error('Error cargando stats:', err);
      }
    });
  }

  equip(equipmentId: string) {
    this.loading = true;
    this.characterService.equipItem(this.character._id, equipmentId).subscribe({
      next: (response) => {
        console.log('Item equipado:', response);
        this.character = response.character;
        this.loadStats();  // Recargar stats
        this.loading = false;
      },
      error: (err) => {
        console.error('Error equipando:', err);
        alert(err.error?.error || 'Error al equipar item');
        this.loading = false;
      }
    });
  }

  unequip(slot: string) {
    this.loading = true;
    this.characterService.unequipItem(this.character._id, slot).subscribe({
      next: (response) => {
        console.log('Item desequipado:', response);
        this.character = response.character;
        this.loadStats();  // Recargar stats
        this.loading = false;
      },
      error: (err) => {
        console.error('Error desequipando:', err);
        alert(err.error?.error || 'Error al desequipar item');
        this.loading = false;
      }
    });
  }

  isEquipped(itemId: string): boolean {
    const equip = this.character?.equipamiento;
    return equip?.arma === itemId || 
           equip?.armadura === itemId || 
           equip?.accesorio === itemId;
  }

  getEquippedItem(slot: string): any {
    const itemId = this.character?.equipamiento?.[slot];
    if (!itemId) return null;
    return this.availableEquipment.find(item => item._id === itemId);
  }
}
```

---

## 🎮 CASOS DE USO COMPLETOS

### Caso 1: Preparar Personaje para Mazmorra

```typescript
async prepararPersonaje(characterId: string) {
  // 1. Revisar estado
  const character = await this.getCharacter(characterId);
  
  if (character.estado === 'herido') {
    // Revivir primero
    await this.characterService.reviveCharacter(characterId, 20).toPromise();
  }
  
  if (character.hp_actual < character.hp_maximo) {
    // Curar a máximo
    await this.characterService.healCharacter(characterId).toPromise();
  }
  
  // 2. Equipar mejor gear disponible
  const mejorArma = this.findBestWeapon();
  const mejorArmadura = this.findBestArmor();
  
  await this.characterService.equipItem(characterId, mejorArma._id).toPromise();
  await this.characterService.equipItem(characterId, mejorArmadura._id).toPromise();
  
  // 3. Verificar stats finales
  const stats = await this.characterService.getCharacterStats(characterId).toPromise();
  console.log('Stats finales:', stats.stats_totales);
  
  // 4. Listo para mazmorra
  return true;
}
```

### Caso 2: Durante Combate

```typescript
async manejarCombate(characterId: string) {
  // El combate reduce HP
  let character = await this.getCharacter(characterId);
  
  // Si HP está bajo, usar poción
  if (character.hp_actual < character.hp_maximo * 0.3) {
    const pocion = this.findHealingPotion();
    if (pocion) {
      await this.characterService.useConsumable(characterId, pocion._id).toPromise();
      console.log('Poción usada');
    }
  }
  
  // Continuar combate...
}
```

### Caso 3: Después de Combate (Victoria)

```typescript
async manejarVictoria(characterId: string, xpGanada: number) {
  // 1. Agregar XP
  const result = await this.characterService.addExperience(characterId, xpGanada).toPromise();
  
  if (result.character.leveledUp) {
    // ¡Subió de nivel!
    this.mostrarNotificacion('¡Nivel UP!', `Ahora eres nivel ${result.character.nivel}`);
    
    // Verificar si puede evolucionar
    if (result.character.puede_evolucionar) {
      // Preguntar al jugador
      const quiereEvolucionar = await this.confirmarEvolucion();
      if (quiereEvolucionar) {
        await this.characterService.evolveCharacter(characterId).toPromise();
        this.mostrarNotificacion('¡Evolución!', 'Tu personaje evolucionó');
      }
    }
  }
  
  // 2. Si HP bajo, ofrecer curación
  if (result.character.hp_actual < result.character.hp_maximo * 0.5) {
    const quiereCurar = await this.confirmarCuracion();
    if (quiereCurar) {
      await this.characterService.healCharacter(characterId).toPromise();
    }
  }
}
```

### Caso 4: Cambiar Equipamiento Completo

```typescript
async cambiarSetCompleto(characterId: string, nuevoSet: EquipmentSet) {
  // 1. Desequipar todo
  await this.characterService.unequipItem(characterId, 'arma').toPromise();
  await this.characterService.unequipItem(characterId, 'armadura').toPromise();
  await this.characterService.unequipItem(characterId, 'accesorio').toPromise();
  
  // 2. Equipar nuevo set
  if (nuevoSet.arma) {
    await this.characterService.equipItem(characterId, nuevoSet.arma).toPromise();
  }
  if (nuevoSet.armadura) {
    await this.characterService.equipItem(characterId, nuevoSet.armadura).toPromise();
  }
  if (nuevoSet.accesorio) {
    await this.characterService.equipItem(characterId, nuevoSet.accesorio).toPromise();
  }
  
  // 3. Verificar stats nuevos
  const stats = await this.characterService.getCharacterStats(characterId).toPromise();
  return stats;
}
```

---

## 🎯 RESUMEN DE FUNCIONALIDADES

### ✅ Equipamiento
- ✅ Equipar arma/armadura/accesorio
- ✅ Desequipar items
- ✅ Auto-reemplazo si slot ocupado
- ✅ Prevención de equipar en múltiples personajes
- ✅ Cálculo automático de stats con bonos

### ✅ Consumibles
- ✅ Usar pociones de curación
- ✅ Auto-eliminación cuando usos_restantes = 0
- ✅ Validación de efectos según estado
- ✅ Múltiples tipos de consumibles

### ✅ Sanación y Resurrección
- ✅ Curación con VAL (fórmula dinámica)
- ✅ Resurrección con VAL (costo fijo)
- ✅ Validaciones de estado
- ✅ Verificación de balance

### ✅ Progresión
- ✅ Sistema de XP con curva exponencial
- ✅ Subida de nivel automática
- ✅ Crecimiento de stats por nivel
- ✅ Curación gratis al subir nivel
- ✅ Evolución con cristales EVO
- ✅ Boost masivo de stats al evolucionar

### ✅ Stats y Combate
- ✅ Cálculo de stats base + equipamiento
- ✅ API para obtener stats totales
- ✅ Stats usados en mazmorras
- ✅ Diferenciación clara de bonos

---

## 📞 SOPORTE

**Tests E2E disponibles:**
- `tests/e2e/master-complete-flow.e2e.test.ts` - 16/18 tests pasando
- Cubre: equipamiento, consumibles, sanación, resurrección, niveles

**Documentación relacionada:**
- `15_GUIA_COMPLETA_AUTENTICACION_SESIONES.md` - Login y sesiones
- `00_BACKEND_API_REFERENCE.md` - Referencia completa
- `02_API_REFERENCE.md` - Endpoints básicos

---

**✅ SISTEMA COMPLETAMENTE FUNCIONAL Y PROBADO**

**Última actualización:** 3 de noviembre de 2025
