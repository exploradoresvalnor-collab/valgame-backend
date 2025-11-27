// MongoDB Indexes for Survival System
// Run in MongoDB shell or via connection

// SurvivalSession Indexes
db.getCollection('survivalSessions').createIndex({ userId: 1, state: 1 });
db.getCollection('survivalSessions').createIndex({ userId: 1, startedAt: -1 });
db.getCollection('survivalSessions').createIndex({ state: 1 });

// SurvivalRun Indexes
db.getCollection('survivalruns').createIndex({ userId: 1, completedAt: -1 });
db.getCollection('survivalruns').createIndex({ finalWave: -1 });
db.getCollection('survivalruns').createIndex({ finalPoints: -1 });
db.getCollection('survivalruns').createIndex({ userId: 1, finalWave: -1 });

// SurvivalLeaderboard Indexes
db.getCollection('survivalLeaderboards').createIndex({ userId: 1 }, { unique: true });
db.getCollection('survivalLeaderboards').createIndex({ maxWave: -1, totalPoints: -1 });
db.getCollection('survivalLeaderboards').createIndex({ totalRuns: -1 });
db.getCollection('survivalLeaderboards').createIndex({ rankingPosition: 1 });

// Verificar índices creados
db.getCollection('survivalSessions').getIndexes();
db.getCollection('survivalruns').getIndexes();
db.getCollection('survivalLeaderboards').getIndexes();
