import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import dns from 'dns';

// Force Google DNS to resolve MongoDB Atlas SRV records
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function analyze() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('No MONGODB_URI found in .env');
        process.exit(1);
    }

    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB.');

        if (!mongoose.connection.db) {
            console.error('Database connection failed.');
            return;
        }

        const db = mongoose.connection.db;
        const collections = await db.collections();

        console.log(`\nFound ${collections.length} collections:\n`);

        for (const collection of collections) {
            console.log(`=== Collection: ${collection.collectionName} ===`);
            const sampleDocs = await collection.find({}).limit(1).toArray();

            if (sampleDocs.length > 0) {
                const doc = sampleDocs[0];
                console.log('Sample Document Structure (keys and types):');
                printSchema(doc, '  ');
            } else {
                console.log('  (Collection is empty)');
            }
            console.log('');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected.');
    }
}

function printSchema(obj: any, indent: string = '') {
    for (const key in obj) {
        const value = obj[key];
        if (value === null) {
            console.log(`${indent}${key}: null`);
        } else if (Array.isArray(value)) {
            console.log(`${indent}${key}: Array (${value.length > 0 ? typeof value[0] : 'empty'})`);
            if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
                printSchema(value[0], indent + '  ');
            }
        } else if (typeof value === 'object' && value instanceof Date) {
            console.log(`${indent}${key}: Date`);
        } else if (typeof value === 'object' && value.constructor && value.constructor.name === 'ObjectId') {
            console.log(`${indent}${key}: ObjectId`);
        } else if (typeof value === 'object') {
            console.log(`${indent}${key}: Object`);
            printSchema(value, indent + '  ');
        } else {
            console.log(`${indent}${key}: ${typeof value}`);
        }
    }
}

analyze();
