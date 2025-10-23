import UserPackage from '../models/UserPackage';

/**
 * 🧹 Limpieza de locks expirados en UserPackages
 * 
 * Este script elimina locks que han estado activos por más de 30 segundos.
 * Previene que paquetes queden permanentemente lockeados por errores o crashes.
 * 
 * Ejecutar periódicamente (ej: cada 5 minutos) vía cron job o scheduler.
 */
export async function cleanupExpiredLocks(): Promise<void> {
  try {
    const LOCK_TIMEOUT_MS = 30000; // 30 segundos
    const cutoffTime = new Date(Date.now() - LOCK_TIMEOUT_MS);

    const result = await UserPackage.updateMany(
      {
        locked: true,
        lockedAt: { $lt: cutoffTime }
      },
      {
        $set: { locked: false },
        $unset: { lockedAt: '' }
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`[CLEANUP-LOCKS] Liberados ${result.modifiedCount} locks expirados`);
    }

    return;
  } catch (error) {
    console.error('[CLEANUP-LOCKS] Error al limpiar locks:', error);
    throw error;
  }
}

/**
 * 🔍 Obtener estadísticas de locks activos
 * Útil para monitoreo y debugging
 */
export async function getLockStatistics(): Promise<{
  totalLocked: number;
  expiredLocks: number;
  activeLocks: number;
}> {
  try {
    const LOCK_TIMEOUT_MS = 30000;
    const cutoffTime = new Date(Date.now() - LOCK_TIMEOUT_MS);

    const totalLocked = await UserPackage.countDocuments({ locked: true });
    const expiredLocks = await UserPackage.countDocuments({
      locked: true,
      lockedAt: { $lt: cutoffTime }
    });
    const activeLocks = totalLocked - expiredLocks;

    return {
      totalLocked,
      expiredLocks,
      activeLocks
    };
  } catch (error) {
    console.error('[LOCK-STATS] Error al obtener estadísticas:', error);
    throw error;
  }
}

/**
 * 🚨 Liberar TODOS los locks (usar solo en emergencias)
 * ADVERTENCIA: Solo usar si el servidor se reinicia o en caso de emergencia
 */
export async function unlockAllPackages(): Promise<number> {
  try {
    const result = await UserPackage.updateMany(
      { locked: true },
      {
        $set: { locked: false },
        $unset: { lockedAt: '' }
      }
    );

    console.warn(`[UNLOCK-ALL] ⚠️ Liberados ${result.modifiedCount} locks (EMERGENCIA)`);
    return result.modifiedCount;
  } catch (error) {
    console.error('[UNLOCK-ALL] Error al liberar locks:', error);
    throw error;
  }
}
