/**
 * Script para inspeccionar game_settings - salida plana UTF8
 */
import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';

async function main() {
    const lines: string[] = [];
    const log = (msg: string) => { lines.push(msg); console.log(msg); };

    await mongoose.connect(MONGODB_URI);
    log('Conectado a MongoDB');

    const db = mongoose.connection.db!;
    const collection = db.collection('game_settings');
    const count = await collection.countDocuments();
    log(`Total documentos en game_settings: ${count}`);

    const docs = await collection.find({}).toArray();

    for (let i = 0; i < docs.length; i++) {
        const doc = docs[i];
        log(`\nDocumento #${i + 1} (_id: ${doc._id})`);
        log('--- Contenido completo ---');
        log(JSON.stringify(doc, null, 2));
    }

    // Campos esperados del modelo
    const expectedFields = [
        'nivel_evolucion_etapa_2', 'nivel_evolucion_etapa_3',
        'puntos_ranking_por_victoria', 'costo_ticket_en_val',
        'descripcion_ticket', 'nivel_maximo_personaje',
        'costo_evo_etapa_2', 'costo_evo_etapa_3',
        'tasa_cambio_usdt', 'MAX_PERSONAJES_POR_EQUIPO',
        'EXP_GLOBAL_MULTIPLIER', 'costo_revivir_personaje',
        'costo_evo_por_val', 'PERMADEATH_TIMER_HOURS',
        'aumento_stats_por_nivel'
    ];

    if (docs.length > 0) {
        const doc = docs[0];
        const docKeys = Object.keys(doc).filter(k => k !== '_id' && k !== '__v');

        log('\n=== ANALISIS MODELO vs BD ===');

        const missingInDB = expectedFields.filter(f => !(f in doc));
        if (missingInDB.length > 0) {
            log(`\nCampos del MODELO que FALTAN en la BD (${missingInDB.length}):`);
            missingInDB.forEach(f => log(`  FALTA: ${f}`));
        } else {
            log('\nTodos los campos del modelo existen en la BD');
        }

        const extraInDB = docKeys.filter(f => !expectedFields.includes(f));
        if (extraInDB.length > 0) {
            log(`\nCampos EXTRA en la BD que NO estan en el modelo (${extraInDB.length}):`);
            extraInDB.forEach(f => {
                log(`  EXTRA: ${f} = ${JSON.stringify(doc[f])}`);
            });
        } else {
            log('\nNo hay campos extra en la BD');
        }

        // Campos usados en character.service.ts pero no en el schema
        const usedInCodeButNotInSchema = [
            'exp_req_multiplier_por_rango',
            'exp_gain_multiplier_por_rango'
        ];
        log('\n=== CAMPOS REFERENCIADOS EN CODIGO ===');
        usedInCodeButNotInSchema.forEach(f => {
            if (f in doc) {
                log(`  EN BD: ${f} = ${JSON.stringify(doc[f])}`);
            } else {
                log(`  NO EN BD: ${f} (usado en character.service.ts con fallback)`);
            }
        });
    }

    await mongoose.disconnect();
    log('\nDesconectado');

    // Escribir a archivo limpio
    fs.writeFileSync('tmp_gs_report.txt', lines.join('\n'), 'utf8');
}

main().catch(err => { console.error('Error:', err); process.exit(1); });
