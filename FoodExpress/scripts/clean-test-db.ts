#!/usr/bin/env ts-node
/**
 * Manual cleanup script to remove all data from test database
 * Run with: npm run clean:testdb
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function cleanTestDatabase() {
    try {
        const mongoUri = process.env.MONGO_DB;
        if (!mongoUri) {
            throw new Error('MONGO_DB environment variable is required');
        }

        // Connect to test database
        const testUri = mongoUri.includes('mongodb+srv')
            ? mongoUri.replace(/\/[^/?]*\?/, '/foodexpress_test?')
            : mongoUri.replace(/\/[^/?]*$/, '/foodexpress_test');

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('�️  Test Database Cleanup');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('�🔗 Connecting to test database...');
        
        await mongoose.connect(testUri);
        console.log('✅ Connected successfully\n');

        const db = mongoose.connection.db;
        if (!db) {
            throw new Error('Database connection not established');
        }

        // Get all collections
        const collections = await db.listCollections().toArray();
        
        if (collections.length === 0) {
            console.log('📭 Database is already empty!\n');
            await mongoose.disconnect();
            process.exit(0);
        }

        console.log('📊 Current state:');
        for (const coll of collections) {
            if (coll.name.startsWith('system.')) continue;
            const count = await db.collection(coll.name).countDocuments();
            console.log(`   ${coll.name}: ${count} documents`);
        }

        console.log('\n🗑️  Deleting all data...');
        
        let totalDeleted = 0;
        for (const coll of collections) {
            if (coll.name.startsWith('system.')) continue;
            
            const result = await db.collection(coll.name).deleteMany({});
            totalDeleted += result.deletedCount || 0;
            console.log(`   ✓ Deleted ${result.deletedCount} from ${coll.name}`);
        }

        console.log(`\n✅ Successfully deleted ${totalDeleted} documents!`);
        
        // Verify cleanup
        console.log('\n📊 Final state:');
        for (const coll of collections) {
            if (coll.name.startsWith('system.')) continue;
            const count = await db.collection(coll.name).countDocuments();
            console.log(`   ${coll.name}: ${count} documents`);
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Test database is now clean!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error cleaning test database:', error);
        process.exit(1);
    }
}

cleanTestDatabase();
