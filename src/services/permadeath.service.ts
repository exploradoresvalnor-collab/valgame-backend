import cron from 'node-cron';
import { User } from '../models/User';
import GameSettings from '../models/GameSetting';

/**
 * Busca en toda la base de datos personajes heridos cuyo temporizador de muerte permanente haya expirado
 * y los elimina.
 */
export const checkAndEnforcePermadeath = async () => {
  console.log('[CRON-Permadeath] Ejecutando verificación de muerte permanente...');
  
  try {
    const gameSettings = await GameSettings.findOne();
    if (!gameSettings || !gameSettings.PERMADEATH_TIMER_HOURS) {
      console.error('[CRON-Permadeath] No se encontró la configuración de PERMADEATH_TIMER_HOURS.');
      return;
    }

    const permadeathHours = gameSettings.PERMADEATH_TIMER_HOURS;
    const users = await User.find({ 'personajes.estado': 'herido' });

    if (users.length === 0) {
      console.log('[CRON-Permadeath] No se encontraron usuarios con personajes heridos.');
      return;
    }

    const promises: Promise<any>[] = [];
    let charactersRemovedCount = 0;

    for (const user of users) {
      let userModified = false;
      const now = new Date();

      // Filtramos los personajes que deben ser eliminados
      const charactersToRemove = user.personajes.filter(character => {
        if (character.estado === 'herido' && character.fechaHerido) {
          const hoursSinceWounded = (now.getTime() - character.fechaHerido.getTime()) / (1000 * 60 * 60);
          return hoursSinceWounded > permadeathHours;
        }
        return false;
      });

      if (charactersToRemove.length > 0) {
        userModified = true;
        charactersToRemove.forEach(charToRemove => {
          console.log(`[CRON-Permadeath] Personaje ${charToRemove.personajeId} del usuario ${user.username} ha sido eliminado por Permadeath.`);
          user.personajes.pull(charToRemove._id);
          charactersRemovedCount++;
        });
      }

      if (userModified) {
        promises.push(user.save());
      }
    }

    await Promise.all(promises);

    if (charactersRemovedCount > 0) {
        console.log(`[CRON-Permadeath] Verificación completada. Se eliminaron ${charactersRemovedCount} personajes.`);
    } else {
        console.log('[CRON-Permadeath] Verificación completada. Ningún personaje fue eliminado.');
    }

  } catch (error) {
    console.error('[CRON-Permadeath] Error durante la verificación de muerte permanente:', error);
  }
};

/**
 * Inicia el cron job para la verificación de Permadeath. Se ejecuta cada hora.
 */
export const startPermadeathCron = () => {
  // Se ejecuta en el minuto 0 de cada hora: '0 * * * *'
  cron.schedule('0 * * * *', checkAndEnforcePermadeath, {
    timezone: "Etc/UTC"
  });

  console.log('[CRON-Permadeath] Tarea de verificación de muerte permanente programada para ejecutarse cada hora.');
};
