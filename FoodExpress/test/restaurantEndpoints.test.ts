import app from '../app.js';
import request from 'supertest';
import mongoose from 'mongoose';
import { Restaurant } from '../schema/restaurants.js';
import { User } from '../schema/users.js';
import { before, describe, after, afterEach, it } from 'mocha';
import { expect } from 'chai';
import { 
    generateRandomRestaurant, 
    generateRandomRestaurantName, 
    generateRandomAddress, 
    generateRandomPhone, 
    generateRandomOpeningHours 
} from './helpers.js';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

// Load environment variables
dotenv.config();

describe('Restaurant Endpoints', () => {

    before(async () => {
        try {
            // Use test database connection with a dedicated test DB name
            const mongoUri = process.env.MONGO_DB || process.env.MONGO_URI;
            console.log('🔍 Environment MONGO_DB:', mongoUri);
            
            if (!mongoUri) {
                throw new Error('Please set MONGO_DB or MONGO_URI in .env file');
            }
            
            // Connect with test database name
            const testUri = mongoUri.includes('mongodb+srv') 
                ? mongoUri.replace(/\/[^/?]*\?/, '/foodexpress_test?')  // Atlas: replace DB name
                : mongoUri.replace(/\/[^/?]*$/, '/foodexpress_test');   // Local: replace DB name
                
            console.log('🔗 Connecting to:', testUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials
            
            // Set connection timeout
            await mongoose.connect(testUri, {
                serverSelectionTimeoutMS: 10000, // 10 second timeout
                connectTimeoutMS: 10000,
            });
            console.log('✅ Connected to test database');
        } catch (error) {
            console.error('❌ Database connection failed:', error);
            throw error;
        }
    });

    afterEach(async () => {
        await Restaurant.deleteMany({});
        await User.deleteMany({});
    });

    after(async () => {
        await mongoose.connection.close();
    });

    const mockRestaurant = {
        name: 'Test Restaurant',
        address: '123 Test Street',
        phone: '555-0123',
        opening_hours: '9am - 9pm'
    };

    beforeEach(async () => {
        // Create a restaurant in the database for testing existing restaurant scenarios
        await Restaurant.create(mockRestaurant);
    });

    describe('GET /api/restaurants', () => {
        it('should get all restaurants', async () => {
            const res = await request(app)
                .get('/api/restaurants');

            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.be.greaterThan(0);
            expect(res.body[0]).to.have.property('name', 'Test Restaurant');
        });

        it('should return empty array when no restaurants exist', async () => {
            await Restaurant.deleteMany({});
            
            const res = await request(app)
                .get('/api/restaurants');

            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.equal(0);
        });

        it('should support pagination with page and limit parameters', async () => {
            // Create multiple restaurants
            for (let i = 0; i < 5; i++) {
                await Restaurant.create({
                    name: `Restaurant ${i}`,
                    address: `${i} Test Street`,
                    phone: `555-010${i}`,
                    opening_hours: '9am - 9pm'
                });
            }

            const res = await request(app)
                .get('/api/restaurants?page=1&limit=3');

            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.equal(3);
        });

        it('should handle invalid page parameter', async () => {
            const res = await request(app)
                .get('/api/restaurants?page=invalid');

            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('Invalid page parameter');
        });

        it('should handle invalid limit parameter', async () => {
            const res = await request(app)
                .get('/api/restaurants?limit=invalid');

            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('Invalid limit parameter');
        });

        it('should support sorting by name ascending', async () => {
            await Restaurant.create({
                name: 'Alpha Restaurant',
                address: '100 Alpha St',
                phone: '555-0100',
                opening_hours: '9am - 9pm'
            });

            const res = await request(app)
                .get('/api/restaurants?sort=name');

            expect(res.status).to.equal(200);
            expect(res.body[0].name).to.equal('Alpha Restaurant');
        });
    });

    describe('GET /api/restaurants/:id', () => {
        let restaurantId: string;

        beforeEach(async () => {
            const restaurant = await Restaurant.create({
                name: 'Specific Test Restaurant',
                address: '456 Specific Street',
                phone: '555-0456',
                opening_hours: '10am - 10pm'
            });
            restaurantId = restaurant._id.toString();
        });

        it('should get restaurant by id', async () => {
            const res = await request(app)
                .get(`/api/restaurants/${restaurantId}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('name', 'Specific Test Restaurant');
            expect(res.body).to.have.property('address', '456 Specific Street');
            expect(res.body).to.have.property('phone', '555-0456');
            expect(res.body).to.have.property('opening_hours', '10am - 10pm');
        });

        it('should return 500 for invalid restaurant id format', async () => {
            const res = await request(app)
                .get('/api/restaurants/invalid-id');

            expect(res.status).to.equal(500); // MongoDB throws error for invalid ObjectId
        });

        it('should return 404 for non-existent restaurant', async () => {
            const nonExistentId = '507f1f77bcf86cd799439011'; // Valid ObjectId format but doesn't exist
            const res = await request(app)
                .get(`/api/restaurants/${nonExistentId}`);

            expect(res.status).to.equal(404);
            expect(res.body.message).to.equal('Restaurant not found');
        });
    });

    describe('POST /api/restaurants', () => {
        let adminToken: string;
        let userToken: string;

        beforeEach(async () => {
            // Create admin user
            const hashedAdminPassword = await bcrypt.hash('adminpassword', 10);
            await User.create({
                email: 'admin@example.com',
                username: 'admin',
                password: hashedAdminPassword,
                roles: ['admin']
            });

            // Create regular user
            const hashedUserPassword = await bcrypt.hash('userpassword', 10);
            await User.create({
                email: 'user@example.com',
                username: 'regularuser',
                password: hashedUserPassword,
                roles: ['user']
            });

            // Get admin token
            const adminLoginRes = await request(app)
                .post('/api/users/login')
                .send({
                    email: 'admin@example.com',
                    password: 'adminpassword'
                });
            adminToken = adminLoginRes.body.token;

            // Get user token
            const userLoginRes = await request(app)
                .post('/api/users/login')
                .send({
                    email: 'user@example.com',
                    password: 'userpassword'
                });
            userToken = userLoginRes.body.token;
        });

        it('should create a new restaurant as admin', async () => {
            const newRestaurant = generateRandomRestaurant();
            
            const res = await request(app)
                .post('/api/restaurants')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(newRestaurant);

            expect(res.status).to.equal(201);
            expect(res.body).to.have.property('restaurant');
            expect(res.body.restaurant).to.have.property('name', newRestaurant.name);
            expect(res.body).to.have.property('message', 'Restaurant créé avec succès ✅');
        });

        it('should not create restaurant with existing name', async () => {
            const res = await request(app)
                .post('/api/restaurants')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(mockRestaurant);

            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('Name for this restaurant is already in use');
        });

        it('should not create restaurant with missing fields', async () => {
            const incompleteRestaurant = {
                address: generateRandomAddress(),
                phone: generateRandomPhone(),
                opening_hours: generateRandomOpeningHours()
            };

            const res = await request(app)
                .post('/api/restaurants')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(incompleteRestaurant);

            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('Name, address phone and opening_hours are required');
        });

        it('should not create restaurant as regular user', async () => {
            const newRestaurant = generateRandomRestaurant();

            const res = await request(app)
                .post('/api/restaurants')
                .set('Authorization', `Bearer ${userToken}`)
                .send(newRestaurant);

            expect(res.status).to.equal(403);
        });

        it('should not create restaurant without authentication', async () => {
            const newRestaurant = generateRandomRestaurant();

            const res = await request(app)
                .post('/api/restaurants')
                .send(newRestaurant);

            expect(res.status).to.equal(401);
        });
    });

    describe('PUT /api/restaurants/:id', () => {
        let adminToken: string;
        let userToken: string;
        let testRestaurant: any;

        beforeEach(async () => {
            // Create admin user
            const hashedAdminPassword = await bcrypt.hash('adminpassword', 10);
            await User.create({
                email: 'admin@example.com',
                username: 'admin',
                password: hashedAdminPassword,
                roles: ['admin']
            });

            // Create regular user
            const hashedUserPassword = await bcrypt.hash('userpassword', 10);
            await User.create({
                email: 'user@example.com',
                username: 'regularuser',
                password: hashedUserPassword,
                roles: ['user']
            });

            // Get admin token
            const adminLoginRes = await request(app)
                .post('/api/users/login')
                .send({
                    email: 'admin@example.com',
                    password: 'adminpassword'
                });
            adminToken = adminLoginRes.body.token;

            // Get user token
            const userLoginRes = await request(app)
                .post('/api/users/login')
                .send({
                    email: 'user@example.com',
                    password: 'userpassword'
                });
            userToken = userLoginRes.body.token;

            // Create a test restaurant to update
            const newRestaurant = generateRandomRestaurant();
            testRestaurant = await Restaurant.create(newRestaurant);
        });

        it('should update restaurant as admin', async () => {
            const updatedData = {
                name: 'Updated Restaurant Name',
                address: generateRandomAddress(),
                phone: generateRandomPhone()
            };

            const res = await request(app)
                .put(`/api/restaurants/${testRestaurant._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updatedData);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('restaurant');
            expect(res.body.restaurant).to.have.property('name', updatedData.name);
            expect(res.body.restaurant).to.have.property('address', updatedData.address);
            expect(res.body).to.have.property('message', 'Le restaurant a bien été mis à jour ✅');
        });

        it('should update only specific fields', async () => {
            const originalName = testRestaurant.name;
            const updatedPhone = generateRandomPhone();

            const res = await request(app)
                .put(`/api/restaurants/${testRestaurant._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ phone: updatedPhone });

            expect(res.status).to.equal(200);
            expect(res.body.restaurant).to.have.property('name', originalName);
            expect(res.body.restaurant).to.have.property('phone', updatedPhone);
        });

        it('should not update to existing name', async () => {
            const res = await request(app)
                .put(`/api/restaurants/${testRestaurant._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: mockRestaurant.name });

            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('Name for this restaurant is already in use');
        });

        it('should not update restaurant as regular user', async () => {
            const updatedData = { name: 'Unauthorized Update' };

            const res = await request(app)
                .put(`/api/restaurants/${testRestaurant._id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(updatedData);

            expect(res.status).to.equal(403);
        });

        it('should not update restaurant without authentication', async () => {
            const updatedData = { name: 'Unauthenticated Update' };

            const res = await request(app)
                .put(`/api/restaurants/${testRestaurant._id}`)
                .send(updatedData);

            expect(res.status).to.equal(401);
        });

        it('should return 500 for invalid restaurant ID', async () => {
            const res = await request(app)
                .put('/api/restaurants/invalid-id')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: 'Test' });

            expect(res.status).to.equal(500);
        });

        it('should return 404 for non-existent restaurant', async () => {
            const nonExistentId = '507f1f77bcf86cd799439011';
            
            const res = await request(app)
                .put(`/api/restaurants/${nonExistentId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: 'Test' });

            expect(res.status).to.equal(404);
            expect(res.body.message).to.equal('Restaurant not found');
        });
    });

    describe('DELETE /api/restaurants/:id', () => {
        let adminToken: string;
        let userToken: string;
        let testRestaurant: any;

        beforeEach(async () => {
            // Create admin user
            const hashedAdminPassword = await bcrypt.hash('adminpassword', 10);
            await User.create({
                email: 'admin@example.com',
                username: 'admin',
                password: hashedAdminPassword,
                roles: ['admin']
            });

            // Create regular user
            const hashedUserPassword = await bcrypt.hash('userpassword', 10);
            await User.create({
                email: 'user@example.com',
                username: 'regularuser',
                password: hashedUserPassword,
                roles: ['user']
            });

            // Get admin token
            const adminLoginRes = await request(app)
                .post('/api/users/login')
                .send({
                    email: 'admin@example.com',
                    password: 'adminpassword'
                });
            adminToken = adminLoginRes.body.token;

            // Get user token
            const userLoginRes = await request(app)
                .post('/api/users/login')
                .send({
                    email: 'user@example.com',
                    password: 'userpassword'
                });
            userToken = userLoginRes.body.token;

            // Create a test restaurant to delete
            const newRestaurant = generateRandomRestaurant();
            testRestaurant = await Restaurant.create(newRestaurant);
        });

        it('should delete restaurant as admin', async () => {
            const res = await request(app)
                .delete(`/api/restaurants/${testRestaurant._id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('message', 'Restaurant deleted successfully');

            // Verify restaurant was actually deleted
            const deletedRestaurant = await Restaurant.findById(testRestaurant._id);
            expect(deletedRestaurant).to.be.null;
        });

        it('should not delete restaurant as regular user', async () => {
            const res = await request(app)
                .delete(`/api/restaurants/${testRestaurant._id}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).to.equal(403);

            // Verify restaurant still exists
            const stillExists = await Restaurant.findById(testRestaurant._id);
            expect(stillExists).to.not.be.null;
        });

        it('should not delete restaurant without authentication', async () => {
            const res = await request(app)
                .delete(`/api/restaurants/${testRestaurant._id}`);

            expect(res.status).to.equal(401);

            // Verify restaurant still exists
            const stillExists = await Restaurant.findById(testRestaurant._id);
            expect(stillExists).to.not.be.null;
        });

        it('should return 500 for invalid restaurant ID', async () => {
            const res = await request(app)
                .delete('/api/restaurants/invalid-id')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).to.equal(500);
        });

        it('should return 404 for non-existent restaurant', async () => {
            const nonExistentId = '507f1f77bcf86cd799439011';
            
            const res = await request(app)
                .delete(`/api/restaurants/${nonExistentId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).to.equal(404);
            expect(res.body.message).to.equal('Restaurant not found');
        });

        it('should handle deletion of already deleted restaurant', async () => {
            // First delete
            await request(app)
                .delete(`/api/restaurants/${testRestaurant._id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            // Try to delete again
            const res = await request(app)
                .delete(`/api/restaurants/${testRestaurant._id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).to.equal(404);
            expect(res.body.message).to.equal('Restaurant not found');
        });
    });
});