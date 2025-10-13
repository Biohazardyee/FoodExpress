function generateRandomUser() {
    return {
        username: generateRandomUsername() as string,
        email: generateRandomEmail() as string,
        password: generateRandomPassword() as string
    };
}

function generateRandomEmail() {
    const randomString = Math.random().toString(36).substring(2, 15);
    return `${randomString}@example.com`;
}

function generateRandomUsername() {
    return Math.random().toString(36).substring(2, 15);
}

function generateRandomPassword() {
    return Math.random().toString(36).substring(2, 15);
}

function generateRandomRestaurant() {
    return {
        name: generateRandomRestaurantName(),
        address: generateRandomAddress(),
        phone: generateRandomPhone(),
        opening_hours: generateRandomOpeningHours()
    };
}

function generateRandomRestaurantName() {
    const prefixes = ['Le', 'La', 'Chez', 'Restaurant', 'Bistro', 'Cafe'];
    const names = ['Jardin', 'Maison', 'Soleil', 'Etoile', 'Royal', 'Gourmet', 'Saveurs', 'Delices'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const name = names[Math.floor(Math.random() * names.length)];
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    return `${prefix} ${name} ${randomSuffix}`;
}

function generateRandomAddress() {
    const streetNumber = Math.floor(Math.random() * 9999) + 1;
    const streetNames = ['Main St', 'Oak Ave', 'Pine Rd', 'Elm Way', 'Maple Dr', 'Cedar Ln'];
    const streetName = streetNames[Math.floor(Math.random() * streetNames.length)];
    return `${streetNumber} ${streetName}`;
}

function generateRandomPhone() {
    const area = Math.floor(Math.random() * 900) + 100;
    const exchange = Math.floor(Math.random() * 900) + 100;
    const number = Math.floor(Math.random() * 9000) + 1000;
    return `${area}-${exchange}-${number}`;
}

function generateRandomOpeningHours() {
    const hours = ['9am - 9pm', '8am - 10pm', '10am - 8pm', '11am - 11pm', '7am - 9pm', '9am - 10pm'];
    return hours[Math.floor(Math.random() * hours.length)];
}

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from '../app.js';
import supertest from 'supertest';

dotenv.config();

const request = supertest(app as any);

export async function connectTestDb() {
  const uri = process.env.MONGO_URI || process.env.MONGO_DB || 'mongodb://127.0.0.1:27017/foodexpress_test';
  
  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to test database');
  } catch (error) {
    console.log(`❌ Could not connect to database: ${error}`);
    console.log('💡 To run tests, either:');
    console.log('   1. Start local MongoDB: mongod --port 27017');
    console.log('   2. Set MONGO_DB or MONGO_URI in .env to your database');
    throw new Error('Database connection required for tests');
  }
}

export async function clearTestDb() {
  const conn = mongoose.connection;
  if (!conn || !conn.db) return;
  const db = conn.db;
  const collections = await db.listCollections().toArray();
  for (const coll of collections) {
    if (coll.name.startsWith('system.')) continue;
    await db.collection(coll.name).deleteMany({});
  }
}

export async function disconnectTestDb() {
  await mongoose.disconnect();
}

export { request };

export {
    generateRandomUser,
    generateRandomEmail,
    generateRandomUsername,
    generateRandomPassword,
    generateRandomRestaurant,
    generateRandomRestaurantName,
    generateRandomAddress,
    generateRandomPhone,
    generateRandomOpeningHours
};