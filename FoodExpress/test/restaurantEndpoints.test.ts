import app from '../app.js';
import request from 'supertest';
import mongoose from 'mongoose';
import { Restaurant } from '../schema/restaurants.js';
import { User } from '../schema/users.js';
import { before, describe, after, afterEach, it } from 'mocha';
import { expect } from 'chai';
import bcrypt from 'bcrypt';
import {
    generateRandomRestaurant,
    generateRandomRestaurantName,
    generateRandomAddress,
    generateRandomPhone,
    generateRandomOpeningHours
} from './helpers.js';
import { setupTestDatabase, teardownTestDatabase, createTestUsers, clearTestCreatedItems, trackRestaurant, finalCleanup } from './testSetup.js';
import type { TestUsers } from './testSetup.js';

describe('Restaurant Endpoints', () => {
    let testUsers: TestUsers;

    before(async () => {
        await setupTestDatabase();
        testUsers = await createTestUsers();
    });

    afterEach(async () => {
        await clearTestCreatedItems();
    });

    after(async () => {
        await finalCleanup(); // Final cleanup of any remaining tracked items
        await teardownTestDatabase();
    });

    const mockRestaurant = {
        name: 'Test Restaurant',
        address: '123 Test Street',
        phone: '+15550123',
        opening_hours: '9am - 9pm'
    };

    let mockRestaurantId: string;

    beforeEach(async () => {
        // Create a restaurant in the database for testing existing restaurant scenarios
        const created = await Restaurant.create(mockRestaurant);
        mockRestaurantId = created._id.toString();
        trackRestaurant(mockRestaurantId);
    });

    describe('GET /api/restaurants', () => {
        it('should get all restaurants', async () => {
            const res = await request(app)
                .get('/api/restaurants');

            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.be.greaterThan(0);
            // Just verify we have restaurants with proper structure
            expect(res.body[0]).to.have.property('name');
            expect(res.body[0]).to.have.property('address');
            expect(res.body[0]).to.have.property('phone');
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
                const created = await Restaurant.create({
                    name: `Restaurant ${i}`,
                    address: `${i} Test Street`,
                    phone: `555-010${i}`,
                    opening_hours: '9am - 9pm'
                });
                trackRestaurant(created._id.toString());
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
            const created = await Restaurant.create({
                name: 'Alpha Restaurant',
                address: '100 Alpha St',
                phone: '555-0100',
                opening_hours: '9am - 9pm'
            });
            trackRestaurant(created._id.toString());

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
            trackRestaurant(restaurantId);
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

        it('should return 400 for invalid restaurant id format', async () => {
            const res = await request(app)
                .get('/api/restaurants/invalid-id');

            expect(res.status).to.equal(400);
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
        it('should create a new restaurant as admin', async () => {
            const newRestaurant = generateRandomRestaurant();

            const res = await request(app)
                .post('/api/restaurants')
                .set('Authorization', `Bearer ${testUsers.adminToken}`)
                .send(newRestaurant);

            expect(res.status).to.equal(201);
            expect(res.body).to.have.property('restaurant');
            expect(res.body.restaurant).to.have.property('name', newRestaurant.name);
            expect(res.body).to.have.property('message', 'Restaurant créé avec succès ✅');
            
            // Track the created restaurant for cleanup
            if (res.body.restaurant && res.body.restaurant._id) {
                trackRestaurant(res.body.restaurant._id);
            }
        });

        it('should not create restaurant with existing name', async () => {
            const res = await request(app)
                .post('/api/restaurants')
                .set('Authorization', `Bearer ${testUsers.adminToken}`)
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
                .set('Authorization', `Bearer ${testUsers.adminToken}`)
                .send(incompleteRestaurant);

            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('All fields (name, address, phone, opening_hours) are required');
        });

        it('should not create restaurant as regular user', async () => {
            const newRestaurant = generateRandomRestaurant();

            const res = await request(app)
                .post('/api/restaurants')
                .set('Authorization', `Bearer ${testUsers.userToken}`)
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
        let testRestaurant: any;

        beforeEach(async () => {
            // Create a test restaurant to update
            const newRestaurant = generateRandomRestaurant();
            testRestaurant = await Restaurant.create(newRestaurant);
            trackRestaurant(testRestaurant._id.toString());
        });

        it('should update restaurant as admin', async () => {
            const updatedData = {
                name: 'Updated Restaurant Name',
                address: generateRandomAddress(),
                phone: generateRandomPhone()
            };

            const res = await request(app)
                .put(`/api/restaurants/${testRestaurant._id}`)
                .set('Authorization', `Bearer ${testUsers.adminToken}`)
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
                .set('Authorization', `Bearer ${testUsers.adminToken}`)
                .send({ phone: updatedPhone });

            expect(res.status).to.equal(200);
            expect(res.body.restaurant).to.have.property('name', originalName);
            expect(res.body.restaurant).to.have.property('phone', updatedPhone);
        });

        it('should not update to existing name', async () => {
            const res = await request(app)
                .put(`/api/restaurants/${testRestaurant._id}`)
                .set('Authorization', `Bearer ${testUsers.adminToken}`)
                .send({ name: mockRestaurant.name });

            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('Name for this restaurant is already in use');
        });

        it('should not update restaurant as regular user', async () => {
            const updatedData = { name: 'Unauthorized Update' };

            const res = await request(app)
                .put(`/api/restaurants/${testRestaurant._id}`)
                .set('Authorization', `Bearer ${testUsers.userToken}`)
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

        it('should return 400 for invalid restaurant ID', async () => {
            const res = await request(app)
                .put('/api/restaurants/invalid-id')
                .set('Authorization', `Bearer ${testUsers.adminToken}`)
                .send({ name: 'Test' });

            expect(res.status).to.equal(400);
        });

        it('should return 404 for non-existent restaurant', async () => {
            const nonExistentId = '507f1f77bcf86cd799439011';

            const res = await request(app)
                .put(`/api/restaurants/${nonExistentId}`)
                .set('Authorization', `Bearer ${testUsers.adminToken}`)
                .send({ name: 'Test' });

            expect(res.status).to.equal(404);
            expect(res.body.message).to.equal('Restaurant not found');
        });
    });

    describe('DELETE /api/restaurants/:id', () => {
        let testRestaurant: any;

        beforeEach(async () => {
            // Create a test restaurant to delete
            const newRestaurant = generateRandomRestaurant();
            testRestaurant = await Restaurant.create(newRestaurant);
            trackRestaurant(testRestaurant._id.toString());
        });

        it('should delete restaurant as admin', async () => {
            const res = await request(app)
                .delete(`/api/restaurants/${testRestaurant._id}`)
                .set('Authorization', `Bearer ${testUsers.adminToken}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('message', 'Restaurant deleted successfully');

            // Verify restaurant was actually deleted
            const deletedRestaurant = await Restaurant.findById(testRestaurant._id);
            expect(deletedRestaurant).to.be.null;
        });

        it('should not delete restaurant as regular user', async () => {
            const res = await request(app)
                .delete(`/api/restaurants/${testRestaurant._id}`)
                .set('Authorization', `Bearer ${testUsers.userToken}`);

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

        it('should return 400 for invalid restaurant ID', async () => {
            const res = await request(app)
                .delete('/api/restaurants/invalid-id')
                .set('Authorization', `Bearer ${testUsers.adminToken}`);

            expect(res.status).to.equal(400);
        });

        it('should return 404 for non-existent restaurant', async () => {
            const nonExistentId = '507f1f77bcf86cd799439011';

            const res = await request(app)
                .delete(`/api/restaurants/${nonExistentId}`)
                .set('Authorization', `Bearer ${testUsers.adminToken}`);

            expect(res.status).to.equal(404);
            expect(res.body.message).to.equal('Restaurant not found');
        });

        it('should handle deletion of already deleted restaurant', async () => {
            // First delete
            await request(app)
                .delete(`/api/restaurants/${testRestaurant._id}`)
                .set('Authorization', `Bearer ${testUsers.adminToken}`);

            // Try to delete again
            const res = await request(app)
                .delete(`/api/restaurants/${testRestaurant._id}`)
                .set('Authorization', `Bearer ${testUsers.adminToken}`);

            expect(res.status).to.equal(404);
            expect(res.body.message).to.equal('Restaurant not found');
        });
    });
});
