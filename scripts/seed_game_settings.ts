import mongoose from 'mongoose';
import GameSetting from '../src/models/GameSetting';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/valgame';

const GAME_SETTINGS_DOC = {
  nivel_evolucion_etapa_2: 40,
  nivel_evolucion_etapa_3: 100,
  puntos_ranking_por_victoria: 10,
  costo_ticket_en_val: 50,
  nivel_maximo_personaje: 100,
  MAX_PERSONAJES_POR_EQUIPO: 3,
  EXP_GLOBAL_MULTIPLIER: 1,
  costo_revivir_personaje: 50,
  PERMADEATH_TIMER_HOURS: 24,
  aumento_stats_por_nivel: {
    D: { atk: 2, vida: 10, defensa: 2 },
    C: { atk: 3, vida: 15, defensa: 3 },
    B: { atk: 4, vida: 20, defensa: 4 },
    A: { atk: 5, vida: 25, defensa: 5 },
    S: { atk: 6, vida: 30, defensa: 6 }
  }
};

async function main() {
  console.log('Conectando a MongoDB en', MONGO_URI);
  await mongoose.connect(MONGO_URI, { dbName: process.env.MONGO_DB || undefined });

  try {
    const res = await GameSetting.findOneAndUpdate({}, { $set: GAME_SETTINGS_DOC }, { upsert: true, new: true });
    console.log('GameSetting upserted:', res);
  } catch (err) {
    console.error('Error al upsert GameSetting:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});