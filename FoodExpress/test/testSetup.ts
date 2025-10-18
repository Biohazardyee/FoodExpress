import mongoose from 'mongoose';
import { User } from '../schema/users.js';
import request from 'supertest';
import app from '../app.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

export interface TestUsers {
    adminToken: string;
    userToken: string;
    adminUser: any;
    regularUser: any;
}

// Track items created during tests for cleanup
interface TestDataTracker {
    menus: Set<string>;
    restaurants: Set<string>;
    users: Set<string>;
}

let globalTestUsers: TestUsers | null = null;
let testDataTracker: TestDataTracker = {
    menus: new Set(),
    restaurants: new Set(),
    users: new Set()
};

export async function setupTestDatabase(): Promise<void> {
    const mongoUri = process.env.MONGO_DB;

    if (!mongoUri) {
        throw new Error('MONGO_DB environment variable is required');
    }

    // Connect with test database name
    const testUri = mongoUri.includes('mongodb+srv')
        ? mongoUri.replace(/\/[^/?]*\?/, '/foodexpress_test?')  // Atlas: replace DB name
        : mongoUri.replace(/\/[^/?]*$/, '/foodexpress_test');   // Local: replace DB name

    const maskedUri = testUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔗  Database Connection');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📍  ${maskedUri}`);

    await mongoose.connect(testUri);
    console.log('✅  Connected successfully\n');
}

export async function teardownTestDatabase(): Promise<void> {
    await mongoose.disconnect();
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔌  Database Disconnected');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

export async function clearTestDb(): Promise<void> {
    const conn = mongoose.connection;
    if (!conn || !conn.db) return;
    const db = conn.db;
    const collections = await db.listCollections().toArray();
    for (const coll of collections) {
        if (coll.name.startsWith('system.')) continue;
        await db.collection(coll.name).deleteMany({});
    }
}

// New function to clear only test-created items
export async function clearTestCreatedItems(): Promise<void> {
    const { Menu } = await import('../schema/menus.js');
    const { Restaurant } = await import('../schema/restaurants.js');
    const { User } = await import('../schema/users.js');


    // Delete only tracked items
    if (testDataTracker.menus.size > 0) {
        await Menu.deleteMany({ _id: { $in: Array.from(testDataTracker.menus) } });
        testDataTracker.menus.clear();
    }

    if (testDataTracker.restaurants.size > 0) {
        await Restaurant.deleteMany({ _id: { $in: Array.from(testDataTracker.restaurants) } });
        testDataTracker.restaurants.clear();
    }

    if (testDataTracker.users.size > 0) {
        // Don't delete the test admin and regular user
        const testUserEmails = ['testadmin@example.com', 'testuser@example.com'];
        await User.deleteMany({
            _id: { $in: Array.from(testDataTracker.users) },
            email: { $nin: testUserEmails }
        });
        testDataTracker.users.clear();
    }
}

// Final cleanup function to be called in after() hook - just calls clearTestCreatedItems
export async function finalCleanup(): Promise<void> {
    await clearTestCreatedItems();
}

// Helper functions to track created items
export function trackMenu(id: string): void {
    testDataTracker.menus.add(id);
}

export function trackRestaurant(id: string): void {
    testDataTracker.restaurants.add(id);
}

export function trackUser(id: string): void {
    testDataTracker.users.add(id);
}

export function getTestDataTracker(): TestDataTracker {
    return testDataTracker;
}

export async function createTestUsers(): Promise<TestUsers> {
    // Always check if users exist in database, even if we have cached objects
    const existingAdmin = await User.findOne({ email: 'testadmin@example.com' });
    const existingUser = await User.findOne({ email: 'testuser@example.com' });

    let adminUser, regularUser;

    if (existingAdmin && existingUser) {
        console.log('♻️   Reusing existing test users');
        adminUser = existingAdmin;
        regularUser = existingUser;
    } else {
        console.log('👥  Creating test users...');
        // Create admin user if doesn't exist
        if (!existingAdmin) {
            const hashedAdminPassword = await bcrypt.hash('adminpassword', 10);
            adminUser = await User.create({
                email: 'testadmin@example.com',
                username: 'testadmin',
                password: hashedAdminPassword,
                roles: ['admin']
            });
        } else {
            adminUser = existingAdmin;
        }

        // Create regular user if doesn't exist
        if (!existingUser) {
            const hashedUserPassword = await bcrypt.hash('userpassword', 10);
            regularUser = await User.create({
                email: 'testuser@example.com',
                username: 'testuser',
                password: hashedUserPassword,
                roles: ['user']
            });
        } else {
            regularUser = existingUser;
        }

        console.log('   ✓ Admin user created');
        console.log('   ✓ Regular user created');
    }

    // Get admin token
    const adminLoginRes = await request(app)
        .post('/api/users/login')
        .send({
            email: 'testadmin@example.com',
            password: 'adminpassword'
        });

    if (adminLoginRes.status !== 200) {
        throw new Error(`Failed to login admin: ${adminLoginRes.status} ${adminLoginRes.text}`);
    }

    // Get user token
    const userLoginRes = await request(app)
        .post('/api/users/login')
        .send({
            email: 'testuser@example.com',
            password: 'userpassword'
        });

    if (userLoginRes.status !== 200) {
        throw new Error(`Failed to login user: ${userLoginRes.status} ${userLoginRes.text}`);
    }

    globalTestUsers = {
        adminToken: adminLoginRes.body.token,
        userToken: userLoginRes.body.token,
        adminUser,
        regularUser
    };

    console.log('�  Authentication tokens generated\n');
    return globalTestUsers;
}

export function getTestUsers(): TestUsers {
    if (!globalTestUsers) {
        throw new Error('Test users not created. Call createTestUsers() first.');
    }
    return globalTestUsers;
}

export function resetTestUsers(): void {
    globalTestUsers = null;
}