import mongoose from 'mongoose';
import { Team } from '../src/models/Team';
import { User } from '../src/models/User';
import { connectDB, disconnectDB } from '../src/config/db';

async function migrateActiveTeams() {
  try {
    console.log('🔄 Iniciando migración de equipos activos...');

    await connectDB(process.env.MONGODB_URI || 'mongodb://localhost:27017/valgame');

    // Encontrar todos los equipos activos
    const activeTeams = await Team.find({ isActive: true });

    console.log(`📊 Encontrados ${activeTeams.length} equipos activos`);

    // Actualizar cada usuario con su equipo activo
    for (const team of activeTeams) {
      await User.findByIdAndUpdate(team.userId, { equipoActivoId: team._id });
      console.log(`✅ Actualizado usuario ${team.userId} con equipo activo ${team._id}`);
    }

    console.log('🎉 Migración completada exitosamente');

  } catch (error) {
    console.error('❌ Error en migración:', error);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
}

// Ejecutar migración
migrateActiveTeams();