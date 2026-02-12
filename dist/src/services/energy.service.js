"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnergyService = void 0;
class EnergyService {
    /**
     * Regenera la energía del usuario basada en el tiempo transcurrido
     */
    static async regenerateEnergy(user) {
        const now = new Date();
        const lastRegeneration = user.ultimoReinicioEnergia || user.fechaRegistro;
        // Calcular tiempo transcurrido en horas
        const timeDiffMs = now.getTime() - lastRegeneration.getTime();
        const hoursElapsed = timeDiffMs / this.REGENERATION_INTERVAL_MS;
        if (hoursElapsed >= 1) {
            // Calcular energía a regenerar
            const energyToRegenerate = Math.floor(hoursElapsed * this.REGENERATION_RATE_PER_HOUR);
            const newEnergy = Math.min(user.energia + energyToRegenerate, user.energiaMaxima);
            // Actualizar usuario
            user.energia = newEnergy;
            user.ultimoReinicioEnergia = now;
            await user.save();
            console.log(`[ENERGY] 🔋 Energía regenerada para ${user.username}: ${user.energia}/${user.energiaMaxima} (+${energyToRegenerate})`);
        }
    }
    /**
     * Consume energía del usuario
     */
    static async consumeEnergy(user, amount) {
        // Regenerar energía primero
        await this.regenerateEnergy(user);
        if (user.energia < amount) {
            return {
                success: false,
                message: `No tienes suficiente energía. Necesitas ${amount}, tienes ${user.energia}/${user.energiaMaxima}`
            };
        }
        user.energia -= amount;
        await user.save();
        console.log(`[ENERGY] ⚡ Energía consumida por ${user.username}: -${amount}, restante: ${user.energia}/${user.energiaMaxima}`);
        return {
            success: true,
            message: `Energía consumida: ${amount}`
        };
    }
    /**
     * Obtiene el estado actual de energía del usuario (con regeneración automática)
     */
    static async getEnergyStatus(user) {
        // Regenerar energía antes de devolver el estado
        await this.regenerateEnergy(user);
        // Calcular tiempo para siguiente regeneración
        const now = new Date();
        const lastRegeneration = user.ultimoReinicioEnergia || user.fechaRegistro;
        const timeSinceLastRegeneration = now.getTime() - lastRegeneration.getTime();
        const timeToNextRegeneration = Math.max(0, this.REGENERATION_INTERVAL_MS - timeSinceLastRegeneration);
        const minutesToNext = Math.ceil(timeToNextRegeneration / (60 * 1000));
        return {
            energia: user.energia,
            energiaMaxima: user.energiaMaxima,
            tiempoParaSiguienteRegeneracion: minutesToNext
        };
    }
    /**
     * Aumenta la energía máxima del usuario (por ejemplo, con mejoras o niveles)
     */
    static async increaseMaxEnergy(user, increase) {
        user.energiaMaxima += increase;
        // También aumentar energía actual si es menor que la máxima
        if (user.energia < user.energiaMaxima) {
            user.energia = Math.min(user.energia + increase, user.energiaMaxima);
        }
        await user.save();
        console.log(`[ENERGY] 📈 Energía máxima aumentada para ${user.username}: ${user.energiaMaxima} (+${increase})`);
    }
}
exports.EnergyService = EnergyService;
// Configuración de energía
EnergyService.MAX_ENERGY = 100;
EnergyService.REGENERATION_RATE_PER_HOUR = 10; // 10 energía por hora
EnergyService.REGENERATION_INTERVAL_MS = 60 * 60 * 1000; // 1 hora en ms
exports.default = EnergyService;
