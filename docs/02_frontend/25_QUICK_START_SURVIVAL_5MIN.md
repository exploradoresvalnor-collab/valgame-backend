# 🚀 QUICK START - SURVIVAL PARA FRONTEND (5 MINUTOS)

**Esta es tu guía express para entender Survival EN 5 MINUTOS**

---

## ⚡ LO BÁSICO (1 MIN)

### Survival = Juego de Oleadas

```
Usuario:
  1. Selecciona 1 personaje (del equipo de 1-9)
  2. Entra a Survival (automático con equipo del RPG)
  3. Completa 5 oleadas de enemigos
  4. Gana PUNTOS (no EXP directo)
  5. Canjea puntos por EXP/VAL/Items

Resultado: Usuario goza, también progresa en RPG
```

---

## 🎮 FLUJO EN 30 SEGUNDOS (2 MIN)

```
PASO 1: Usuario en menú principal
  └─ Selecciona personaje (mismo que RPG)

PASO 2: Verifica equipamiento
  └─ Si tiene 4 items en RPG → OK
  └─ Si no → "Equipa en RPG primero"

PASO 3: Entra a Survival
  └─ POST /api/survival/start { characterId }
  └─ Backend toma equipamiento automáticamente
  └─ Crea sesión

PASO 4: Juega oleadas
  └─ POST /api/survival/{sessionId}/complete-wave
  └─ Gana puntos

PASO 5: Termina (ganar o perder)
  └─ POST /api/survival/{sessionId}/end (ganar)
  └─ POST /api/survival/{sessionId}/report-death (perder)
  └─ Obtiene recompensas

PASO 6: Canjea puntos
  └─ POST /api/survival/exchange-points/exp
  └─ 100 puntos = +100 EXP
  └─ Sube nivel en RPG
```

---

## 📱 PANTALLAS QUE NECESITAS (3 MIN)

```
┌─────────────────────────────────────┐
│ PANTALLA 1: MENÚ SURVIVAL           │
├─────────────────────────────────────┤
│                                     │
│  Personajes disponibles (1-9):      │
│  • Héroe Principal (Nv 35) ✓ACTIVO  │
│  • Mago (Nv 28)                     │
│  • Paladín (Nv 32)                  │
│                                     │
│  [ENTRAR SURVIVAL]  [VOLVER]        │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│ PANTALLA 2: PRE-SESIÓN              │
├─────────────────────────────────────┤
│                                     │
│ Personaje: Héroe Principal (Nv 35)  │
│                                     │
│ Equipo (automático):                │
│ • Cabeza: Casco de Hierro           │
│ • Cuerpo: Peto de Acero             │
│ • Manos: Guantes                    │
│ • Pies: Botas                       │
│                                     │
│ [INICIAR]  [CANCELAR]               │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│ PANTALLA 3: COMBATE (OLEADA 1)      │
├─────────────────────────────────────┤
│                                     │
│ Vida: ███████░░░ (70/100)           │
│ Puntos: 250                         │
│ Oleada: 1/5                         │
│                                     │
│ 👹 Enemigos: 5 Goblins              │
│                                     │
│ [ATACAR]  [CONSUMIBLE]  [HUIR]      │
│                                     │
│ (UI del juego aquí)                 │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│ PANTALLA 4: RESULTADO               │
├─────────────────────────────────────┤
│                                     │
│ 🎉 GANASTE! (o ☠️ PERDISTE)        │
│                                     │
│ Oleadas: 5/5                        │
│ Puntos: 1250                        │
│                                     │
│ Recompensas:                        │
│ • +250 EXP → Subes a Nv 36          │
│ • +150 VAL                          │
│ • +50 Survival Points               │
│                                     │
│ [OTRA SESIÓN]  [MENÚ]  [CANJEAR]   │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│ PANTALLA 5: CANJEAR PUNTOS          │
├─────────────────────────────────────┤
│                                     │
│ Puntos: 300                         │
│                                     │
│ Canje por EXP:                      │
│ Ingresa: [100] → Obtienes +100 EXP  │
│ [CANJEAR]                           │
│                                     │
│ Canje por VAL:                      │
│ Ingresa: [200] → Obtienes +100 VAL  │
│ [CANJEAR]                           │
│                                     │
│ [VOLVER]                            │
└─────────────────────────────────────┘
```

---

## 💻 CÓDIGO QUE NECESITAS (4-5 MIN)

### Service Survival (TypeScript)

```typescript
// survival.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SurvivalService {
  constructor(private http: HttpClient) {}

  // 1. Iniciar sesión
  startSurvival(characterId: string): Observable<any> {
    return this.http.post('/api/survival/start', { characterId });
  }

  // 2. Completar oleada
  completeWave(sessionId: string, data: any): Observable<any> {
    return this.http.post(`/api/survival/${sessionId}/complete-wave`, data);
  }

  // 3. Finalizar (ganaste)
  endSurvival(sessionId: string, data: any): Observable<any> {
    return this.http.post(`/api/survival/${sessionId}/end`, data);
  }

  // 4. Finalizar (perdiste)
  reportDeath(sessionId: string, data: any): Observable<any> {
    return this.http.post(`/api/survival/${sessionId}/report-death`, data);
  }

  // 5. Canjear puntos por EXP
  exchangeExp(points: number): Observable<any> {
    return this.http.post('/api/survival/exchange-points/exp', { points });
  }

  // 6. Canjear puntos por VAL
  exchangeVal(points: number): Observable<any> {
    return this.http.post('/api/survival/exchange-points/val', { points });
  }

  // 7. Ver leaderboard
  getLeaderboard(): Observable<any[]> {
    return this.http.get('/api/survival/leaderboard?limit=10');
  }

  // 8. Mis estadísticas
  getMyStats(): Observable<any> {
    return this.http.get('/api/survival/my-stats');
  }
}
```

### Componente Principal (TypeScript)

```typescript
// survival.component.ts
import { Component, OnInit } from '@angular/core';
import { SurvivalService } from '../../services/survival.service';

@Component({
  selector: 'app-survival',
  templateUrl: './survival.component.html',
  styleUrls: ['./survival.component.scss']
})
export class SurvivalComponent implements OnInit {
  sessionId: string = '';
  currentWave: number = 0;
  currentPoints: number = 0;
  gameState: 'menu' | 'playing' | 'ended' = 'menu';

  constructor(private survivalService: SurvivalService) {}

  ngOnInit() {
    // Componente inicializa
  }

  // 1. Iniciar sesión
  startSurvival(characterId: string) {
    this.survivalService.startSurvival(characterId).subscribe(
      (session) => {
        this.sessionId = session.sessionId;
        this.gameState = 'playing';
      },
      (error) => alert('Error: ' + error.error.error)
    );
  }

  // 2. Completar oleada
  completeWave() {
    this.currentWave++;
    this.currentPoints += 250;

    const data = {
      waveNumber: this.currentWave,
      enemiesDefeated: 5,
      damageDealt: 250
    };

    this.survivalService.completeWave(this.sessionId, data).subscribe(
      (result) => {
        if (this.currentWave >= 5) {
          this.finishGame('win');
        }
      }
    );
  }

  // 3. Finalizar sesión
  finishGame(status: 'win' | 'lose') {
    const data = {
      finalWave: this.currentWave,
      totalEnemiesDefeated: this.currentWave * 5,
      totalPoints: this.currentPoints,
      duration: 600
    };

    const method = status === 'win' 
      ? this.survivalService.endSurvival(this.sessionId, data)
      : this.survivalService.reportDeath(this.sessionId, data);

    method.subscribe((result) => {
      this.gameState = 'ended';
      // Mostrar recompensas
      console.log('Recompensas:', result.rewards);
    });
  }
}
```

---

## 🔗 INTEGRACIÓN CON RPG (1 MIN ADICIONAL)

```
IMPORTANTE: RPG y Survival son el MISMO usuario

┌─────────────────────────────────────────┐
│ User {                                  │
│   _id: "user123"                        │
│   val: 500                 ← COMPARTIDO │
│   personajes: [...]        ← COMPARTIDO │
│   personajeActivoId: "char1" ← COMPARTIDO
│   survivalPoints: 150      ← SURVIVAL   │
│ }                                       │
└─────────────────────────────────────────┘

Flujo:
1. RPG: User gasta 100 VAL en evolución → val: 400
2. Survival: User canjea 200 puntos por 100 VAL → val: 500
3. RPG: Personaje sube nivel por EXP canjeado en Survival

= Recursos fluyen libremente entre modos
```

---

## ✅ CHECKLIST RÁPIDO

Antes de empezar:

- [ ] Backend corriendo en localhost:8080
- [ ] Leíste 23_GUIA_SURVIVAL_MODO_GAME.md (15 min)
- [ ] Leíste 24_INTEGRACION_RPG_SURVIVAL.md (15 min)
- [ ] Copiaste SurvivalService (5 min)
- [ ] Creaste primeras pantallas (1-2 horas)
- [ ] Conectaste con backend (1 hora)

---

## 🎯 PRÓXIMO PASO

1. **Abre**: `FRONTEND_STARTER_KIT/23_GUIA_SURVIVAL_MODO_GAME.md` (guía completa)
2. **Lee**: La sección de "Flujo de Usuario" (tiene todo)
3. **Copia**: El código de ejemplo
4. **Implementa**: Las 6 pantallas
5. **Conecta**: Con tu backend local

---

## 🆘 ¿DUDAS?

| Pregunta | Respuesta |
|----------|-----------|
| ¿Cómo inicio Survival? | POST /api/survival/start { characterId } |
| ¿Qué es equipamiento automático? | Backend toma los 4 items del personaje RPG |
| ¿Cómo subo nivel? | Canjea puntos de Survival → +EXP → sube nivel |
| ¿Puedo estar en RPG y Survival al mismo tiempo? | NO, es uno u otro |
| ¿Se pierden los items en Survival? | NO, son read-only (solo se leen) |
| ¿Cuántos puntos necesito? | 100 min para EXP, 200 para VAL, 150 por item |

---

## 💡 TIPS FINALES

1. **Empieza simple**: Solo login → seleccionar personaje → entrar a Survival
2. **Luego agrega**: Oleadas, combate, resultados
3. **Después**: Canje de puntos y leaderboard
4. **Finalmente**: Validaciones y error handling

**Tiempo estimado**: 2-3 semanas (módulo completo)

---

**¡LISTO? ¡A PROGRAMAR! 🚀**

Lee: `FRONTEND_STARTER_KIT/23_GUIA_SURVIVAL_MODO_GAME.md`

