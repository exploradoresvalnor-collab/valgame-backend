"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CombatService = void 0;
const realtime_service_1 = require("./realtime.service");
class CombatService {
    constructor() {
        this.activeMatches = new Map();
        this.TURN_TIMEOUT = 30000; // 30 segundos por turno
        this.realtimeService = realtime_service_1.RealtimeService.getInstance();
        this.startTurnTimer();
    }
    static getInstance() {
        if (!CombatService.instance) {
            CombatService.instance = new CombatService();
        }
        return CombatService.instance;
    }
    // Iniciar una nueva batalla
    async startCombat(players) {
        const matchId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        // Orden aleatorio de turnos
        const turnOrder = [...players].sort(() => Math.random() - 0.5);
        const match = {
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
    async processCombatAction(matchId, playerId, action) {
        const match = this.activeMatches.get(matchId);
        if (!match)
            return false;
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
    startTurnTimer() {
        setInterval(() => {
            this.activeMatches.forEach((match, matchId) => {
                if (match.status !== 'in_progress')
                    return;
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
    async processAttack(match, playerId, action) {
        // Implementar lógica de ataque
        const damage = this.calculateDamage(action);
        match.damageLog.push({
            from: playerId,
            to: action.target,
            damage,
            type: 'physical',
            timestamp: new Date()
        });
    }
    async processDefend(match, playerId, action) {
        // Implementar lógica de defensa
        match.activeEffects.push({
            type: 'buff',
            stat: 'defensa',
            value: 1.5, // 50% más de defensa
            duration: 1, // dura 1 turno
            source: playerId
        });
    }
    async processItemUse(match, playerId, action) {
        // Implementar lógica de uso de items
        if (action.itemId) {
            // Aplicar efecto del item según su tipo
            // TODO: Implementar efectos de items
        }
    }
    updateEffects(match) {
        // Reducir duración de efectos y eliminar los expirados
        match.activeEffects = match.activeEffects
            .map(effect => ({ ...effect, duration: effect.duration - 1 }))
            .filter(effect => effect.duration > 0);
    }
    calculateDamage(action) {
        // Implementar cálculo de daño basado en stats y efectos
        // TODO: Implementar fórmula de daño
        return Math.floor(Math.random() * 100) + 50; // Placeholder
    }
}
exports.CombatService = CombatService;
