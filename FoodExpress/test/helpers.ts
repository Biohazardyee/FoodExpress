import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from '../app.js';
import supertest from 'supertest';

dotenv.config();

/* Database connection for tests */
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


// User-specific helper functions

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

// Restaurant-specific helper functions

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
  // Generate E.164 format phone numbers for validation
  const countryCode = Math.floor(Math.random() * 9) + 1; // 1-9
  const areaCode = Math.floor(Math.random() * 900) + 100; // 100-999
  const number = Math.floor(Math.random() * 9000000) + 1000000; // 1000000-9999999
  return `+${countryCode}${areaCode}${number}`;
}

function generateRandomOpeningHours() {
  const hours = ['9am - 9pm', '8am - 10pm', '10am - 8pm', '11am - 11pm', '7am - 9pm', '9am - 10pm'];
  return hours[Math.floor(Math.random() * hours.length)];
}


// Menu-specific helper functions

function generateRandomMenuName() {
  const dishTypes = ['Pizza', 'Burger', 'Pasta', 'Salad', 'Soup', 'Sandwich', 'Steak', 'Fish', 'Chicken', 'Vegetarian'];
  const adjectives = ['Delicious', 'Special', 'Classic', 'Gourmet', 'Spicy', 'Fresh', 'Organic', 'Grilled', 'Crispy', 'Homemade'];
  const type = dishTypes[Math.floor(Math.random() * dishTypes.length)];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomSuffix = Math.random().toString(36).substring(2, 4);
  return `${adjective} ${type} ${randomSuffix}`;
}

function generateRandomMenuDescription() {
  const descriptions = [
    'A delightful dish prepared with fresh ingredients',
    'Our chef\'s special recipe passed down for generations',
    'A perfect blend of flavors and textures',
    'Made with locally sourced organic ingredients',
    'Traditional recipe with a modern twist',
    'Cooked to perfection with our secret sauce',
    'A customer favorite since day one',
    'Healthy and nutritious option for all ages'
  ];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

function generateRandomMenuPrice() {
  // Generate prices between $5.99 and $49.99
  return Math.round((Math.random() * 44 + 5.99) * 100) / 100;
}

function generateRandomMenuCategory() {
  const categories = ['Appetizer', 'Main Course', 'Dessert', 'Beverage', 'Side Dish', 'Salad', 'Pasta', 'Pizza', 'Seafood', 'Vegetarian'];
  return categories[Math.floor(Math.random() * categories.length)];
}

function generateRandomMenu(restaurantId?: string) {
  return {
    name: generateRandomMenuName(),
    description: generateRandomMenuDescription(),
    price: generateRandomMenuPrice(),
    restaurantId: restaurantId || '507f1f77bcf86cd799439011', // default ObjectId if not provided
    category: generateRandomMenuCategory()
  };
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
  generateRandomOpeningHours,
  generateRandomMenu,
  generateRandomMenuName,
  generateRandomMenuDescription,
  generateRandomMenuPrice,
  generateRandomMenuCategory
};