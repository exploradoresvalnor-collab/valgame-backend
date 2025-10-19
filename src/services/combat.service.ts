import { RealtimeService } from './realtime.service';

// Tipos para el sistema de combate
export interface CombatState {
  id: string;
  turnOrder: string[];
  activeEffects: BuffEffect[];
  damageLog: DamageEntry[];
  turnTimeLimit: number;
  currentTurn: number;
  startTime: Date;
  status: 'waiting' | 'in_progress' | 'finished';
}

export interface BuffEffect {
  type: 'buff' | 'debuff';
  stat: 'atk' | 'defensa' | 'vida';
  value: number;
  duration: number;
  source: string;
}

export interface DamageEntry {
  from: string;
  to: string;
  damage: number;
  type: 'physical' | 'critical' | 'counter';
  timestamp: Date;
}

export class CombatService {
  private static instance: CombatService;
  private activeMatches: Map<string, CombatState> = new Map();
  private realtimeService: RealtimeService;
  private readonly TURN_TIMEOUT = 30000; // 30 segundos por turno

  private constructor() {
    this.realtimeService = RealtimeService.getInstance();
    this.startTurnTimer();
  }

  public static getInstance(): CombatService {
    if (!CombatService.instance) {
      CombatService.instance = new CombatService();
    }
    return CombatService.instance;
  }

  // Iniciar una nueva batalla
  public async startCombat(players: string[]): Promise<CombatState> {
    const matchId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Orden aleatorio de turnos
    const turnOrder = [...players].sort(() => Math.random() - 0.5);
    
    const match: CombatState = {
      id: matchId,
      turnOrder,
      activeEffects: [],
      damageLog: [],
      turnTimeLimit: this.TURN_TIMEOUT,
      currentTurn: 0,
      startTime: new Date(),
      status: 'waiting'
    };

    this.activeMatches.set(matchId, match);

    // Notificar a los jugadores
    players.forEach(playerId => {
      this.realtimeService.notifyBattleUpdate(playerId, {
        type: 'combat_start',
        match
      });
    });

    return match;
  }

  // Procesar una acción de combate
  public async processCombatAction(matchId: string, playerId: string, action: CombatAction): Promise<boolean> {
    const match = this.activeMatches.get(matchId);
    if (!match) return false;

    // Verificar si es el turno del jugador
    if (match.turnOrder[match.currentTurn] !== playerId) {
      return false;
    }

    // Procesar la acción según su tipo
    switch (action.type) {
      case 'attack':
        await this.processAttack(match, playerId, action);
        break;
      case 'defend':
        await this.processDefend(match, playerId, action);
        break;
      case 'use_item':
        await this.processItemUse(match, playerId, action);
        break;
    }

    // Avanzar al siguiente turno
    match.currentTurn = (match.currentTurn + 1) % match.turnOrder.length;

    // Actualizar efectos activos
    this.updateEffects(match);

    // Notificar a todos los jugadores
    match.turnOrder.forEach(pid => {
      this.realtimeService.notifyBattleUpdate(pid, {
        type: 'turn_update',
        match
      });
    });

    return true;
  }

  private startTurnTimer() {
    setInterval(() => {
      this.activeMatches.forEach((match, matchId) => {
        if (match.status !== 'in_progress') return;

        const turnElapsed = Date.now() - match.startTime.getTime();
        if (turnElapsed >= match.turnTimeLimit) {
          // Turno perdido, avanzar al siguiente
          match.currentTurn = (match.currentTurn + 1) % match.turnOrder.length;
          match.startTime = new Date();

          // Notificar a los jugadores
          match.turnOrder.forEach(playerId => {
            this.realtimeService.notifyBattleUpdate(playerId, {
              type: 'turn_timeout',
              match
            });
          });
        }
      });
    }, 1000); // Revisar cada segundo
  }

  private async processAttack(match: CombatState, playerId: string, action: CombatAction) {
    // Implementar lógica de ataque
    const damage = this.calculateDamage(action);
    
    match.damageLog.push({
      from: playerId,
      to: action.target!,
      damage,
      type: 'physical',
      timestamp: new Date()
    });
  }

  private async processDefend(match: CombatState, playerId: string, action: CombatAction) {
    // Implementar lógica de defensa
    match.activeEffects.push({
      type: 'buff',
      stat: 'defensa',
      value: 1.5, // 50% más de defensa
      duration: 1, // dura 1 turno
      source: playerId
    });
  }

  private async processItemUse(match: CombatState, playerId: string, action: CombatAction) {
    // Implementar lógica de uso de items
    if (action.itemId) {
      // Aplicar efecto del item según su tipo
      // TODO: Implementar efectos de items
    }
  }

  private updateEffects(match: CombatState) {
    // Reducir duración de efectos y eliminar los expirados
    match.activeEffects = match.activeEffects
      .map(effect => ({ ...effect, duration: effect.duration - 1 }))
      .filter(effect => effect.duration > 0);
  }

  private calculateDamage(action: CombatAction): number {
    // Implementar cálculo de daño basado en stats y efectos
    // TODO: Implementar fórmula de daño
    return Math.floor(Math.random() * 100) + 50; // Placeholder
  }
}

interface CombatAction {
  type: 'attack' | 'defend' | 'use_item';
  target?: string;
  itemId?: string;
}