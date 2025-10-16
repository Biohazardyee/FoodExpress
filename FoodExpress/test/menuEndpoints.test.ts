import app from '../app.js';
import request from 'supertest';
import mongoose from 'mongoose';
import { Menu } from '../schema/menus.js';
import { Restaurant } from '../schema/restaurants.js';
import { User } from '../schema/users.js';
import { before, describe, after, afterEach, it } from 'mocha';
import { expect } from 'chai';
import {
    generateRandomMenu,
    generateRandomMenuName,
    generateRandomMenuDescription,
    generateRandomMenuPrice,
    generateRandomMenuCategory,
    generateRandomRestaurant,
    clearTestDb,
    disconnectTestDb
} from './helpers.js';
import { setupTestDatabase, teardownTestDatabase, createTestUsers } from './testSetup.js';
import type { TestUsers } from './testSetup.js';

describe('Menu Endpoints', () => {
    let mockRestaurant: any;
    let mockMenu: any;
    let testUsers: TestUsers;

    before(async () => {
        await setupTestDatabase();
        testUsers = await createTestUsers();
    });

    after(async () => {
        await teardownTestDatabase();
    });

    afterEach(async () => {
        await clearTestDb();
    });

    beforeEach(async () => {
        // Create a test restaurant first since menus require a restaurant
        const restaurantData = generateRandomRestaurant();
        mockRestaurant = await Restaurant.create(restaurantData);

        // Create a test menu
        const menuData = generateRandomMenu(mockRestaurant._id.toString());
        mockMenu = await Menu.create(menuData);
    });

    describe('GET /api/menus', () => {
        it('should get all menus', async () => {
            const res = await request(app)
                .get('/api/menus');

            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array');
            expect(res.body).to.have.length(1);
            expect(res.body[0]).to.have.property('name');
            expect(res.body[0]).to.have.property('price');
            expect(res.body[0]).to.have.property('restaurantId');
        });

        it('should return empty array when no menus exist', async () => {
            await Menu.deleteMany({});

            const res = await request(app)
                .get('/api/menus');

            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array');
            expect(res.body).to.have.length(0);
        });

        it('should support pagination with page and limit parameters', async () => {
            // Create additional menus
            const additionalMenus = [];
            for (let i = 0; i < 5; i++) {
                const menuData = generateRandomMenu(mockRestaurant._id.toString());
                additionalMenus.push(menuData);
            }
            await Menu.create(additionalMenus);

            const res = await request(app)
                .get('/api/menus?page=1&limit=3');

            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.be.at.most(3);
        });

        it('should handle invalid page parameter', async () => {
            const res = await request(app)
                .get('/api/menus?page=invalid');

            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('Invalid page parameter');
        });

        it('should handle invalid limit parameter', async () => {
            const res = await request(app)
                .get('/api/menus?limit=invalid');

            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('Invalid limit parameter');
        });

        it('should support sorting by category ascending', async () => {
            // Create menus with different categories
            await Menu.create([
                { ...generateRandomMenu(mockRestaurant._id.toString()), category: 'Dessert' },
                { ...generateRandomMenu(mockRestaurant._id.toString()), category: 'Appetizer' },
                { ...generateRandomMenu(mockRestaurant._id.toString()), category: 'Main Course' }
            ]);

            const res = await request(app)
                .get('/api/menus?sort=category:asc');

            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.be.greaterThan(0);
        });

        it('should support sorting by price descending', async () => {
            // Create menus with different prices
            await Menu.create([
                { ...generateRandomMenu(mockRestaurant._id.toString()), price: 15.99 },
                { ...generateRandomMenu(mockRestaurant._id.toString()), price: 25.99 },
                { ...generateRandomMenu(mockRestaurant._id.toString()), price: 9.99 }
            ]);

            const res = await request(app)
                .get('/api/menus?sort=price:desc');

            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.be.greaterThan(0);
        });

        it('should reject invalid sort fields', async () => {
            const res = await request(app)
                .get('/api/menus?sort=invalid_field:asc');

            expect(res.status).to.equal(400);
            expect(res.body.message).to.include('Sorting by \'invalid_field\' is not allowed');
        });
    });

    describe('GET /api/menus/:id', () => {
        it('should get menu by id', async () => {
            const res = await request(app)
                .get(`/api/menus/${mockMenu._id}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('name', mockMenu.name);
            expect(res.body).to.have.property('price', mockMenu.price);
            expect(res.body).to.have.property('restaurantId');
        });

        it('should return 500 for invalid menu id format', async () => {
            const res = await request(app)
                .get('/api/menus/invalid-id');

            expect(res.status).to.equal(500);
        });

        it('should return 404 for non-existent menu', async () => {
            const nonExistentId = '507f1f77bcf86cd799439011'; // Valid ObjectId format but doesn't exist
            const res = await request(app)
                .get(`/api/menus/${nonExistentId}`);

            expect(res.status).to.equal(404);
            expect(res.body.message).to.equal('Menu not found');
        });
    });

    describe('GET /api/menus/by-restaurant/:restaurantId', () => {
        it('should get menus by restaurant id', async () => {
            // Create additional menus for the same restaurant
            const additionalMenus = [];
            for (let i = 0; i < 3; i++) {
                const menuData = generateRandomMenu(mockRestaurant._id.toString());
                additionalMenus.push(menuData);
            }
            await Menu.create(additionalMenus);

            const res = await request(app)
                .get(`/api/menus/by-restaurant/${mockRestaurant._id}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.equal(4); // 1 original + 3 additional
            res.body.forEach((menu: any) => {
                expect(menu.restaurantId.toString()).to.equal(mockRestaurant._id.toString());
            });
        });

        it('should return empty array for restaurant with no menus', async () => {
            // Create another restaurant with no menus
            const anotherRestaurant = await Restaurant.create(generateRandomRestaurant());

            const res = await request(app)
                .get(`/api/menus/by-restaurant/${anotherRestaurant._id}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array');
            expect(res.body).to.have.length(0);
        });

        it('should handle missing restaurant ID parameter', async () => {
            const res = await request(app)
                .get('/api/menus/by-restaurant/');

            expect(res.status).to.equal(500); // Express throws error for empty param
        });

        it('should handle invalid restaurant ID format', async () => {
            const res = await request(app)
                .get('/api/menus/by-restaurant/invalid-id');

            expect(res.status).to.equal(500);
        });
    });

    describe('POST /api/menus', () => {
        it('should create a new menu as admin', async () => {
            const newMenu = generateRandomMenu(mockRestaurant._id.toString());

            const res = await request(app)
                .post('/api/menus')
                .set('Authorization', `Bearer ${testUsers.adminToken}`)
                .send(newMenu);

            expect(res.status).to.equal(201);
            expect(res.body).to.have.property('menu');
            expect(res.body.menu).to.have.property('name', newMenu.name);
            expect(res.body.menu).to.have.property('price', newMenu.price);
            expect(res.body).to.have.property('message', 'Menu créé avec succès ✅');
        });

        it('should create menu with only required fields', async () => {
            const minimalMenu = {
                name: generateRandomMenuName(),
                price: generateRandomMenuPrice(),
                restaurantId: mockRestaurant._id.toString()
            };

            const res = await request(app)
                .post('/api/menus')
                .set('Authorization', `Bearer ${testUsers.adminToken}`)
                .send(minimalMenu);

            expect(res.status).to.equal(201);
            expect(res.body.menu).to.have.property('name', minimalMenu.name);
            expect(res.body.menu).to.have.property('price', minimalMenu.price);
        });

        it('should create menu with all optional fields', async () => {
            const fullMenu = {
                name: generateRandomMenuName(),
                description: generateRandomMenuDescription(),
                price: generateRandomMenuPrice(),
                restaurantId: mockRestaurant._id.toString(),
                category: generateRandomMenuCategory()
            };

            const res = await request(app)
                .post('/api/menus')
                .set('Authorization', `Bearer ${testUsers.adminToken}`)
                .send(fullMenu);

            expect(res.status).to.equal(201);
            expect(res.body.menu).to.have.property('description', fullMenu.description);
            expect(res.body.menu).to.have.property('category', fullMenu.category);
        });

        it('should not create menu with missing name', async () => {
            const invalidMenu = {
                price: generateRandomMenuPrice(),
                restaurantId: mockRestaurant._id.toString()
            };

            const res = await request(app)
                .post('/api/menus')
                .set('Authorization', `Bearer ${testUsers.adminToken}`)
                .send(invalidMenu);

            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('Name, price and restaurantId are required');
        });

        it('should not create menu with missing price', async () => {
            const invalidMenu = {
                name: generateRandomMenuName(),
                restaurantId: mockRestaurant._id.toString()
            };

            const res = await request(app)
                .post('/api/menus')
                .set('Authorization', `Bearer ${testUsers.adminToken}`)
                .send(invalidMenu);

            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('Name, price and restaurantId are required');
        });

        it('should not create menu with missing restaurantId', async () => {
            const invalidMenu = {
                name: generateRandomMenuName(),
                price: generateRandomMenuPrice()
            };

            const res = await request(app)
                .post('/api/menus')
                .set('Authorization', `Bearer ${testUsers.adminToken}`)
                .send(invalidMenu);

            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('Name, price and restaurantId are required');
        });

        it('should not create menu with non-existent restaurant', async () => {
            const invalidMenu = {
                name: generateRandomMenuName(),
                price: generateRandomMenuPrice(),
                restaurantId: '507f1f77bcf86cd799439011' // Valid ObjectId but restaurant doesn't exist
            };

            const res = await request(app)
                .post('/api/menus')
                .set('Authorization', `Bearer ${testUsers.adminToken}`)
                .send(invalidMenu);

            expect(res.status).to.equal(404);
            expect(res.body.message).to.equal('Restaurant not found');
        });

        it('should not create menu as regular user', async () => {
            const newMenu = generateRandomMenu(mockRestaurant._id.toString());

            const res = await request(app)
                .post('/api/menus')
                .set('Authorization', `Bearer ${testUsers.userToken}`)
                .send(newMenu);

            expect(res.status).to.equal(403);
        });

        it('should not create menu without authentication', async () => {
            const newMenu = generateRandomMenu(mockRestaurant._id.toString());

            const res = await request(app)
                .post('/api/menus')
                .send(newMenu);

            expect(res.status).to.equal(401);
        });

        it('should not create menu with duplicate name for same restaurant', async () => {
            // First, create a menu
            const firstMenu = {
                name: 'Unique Menu Name',
                price: generateRandomMenuPrice(),
                restaurantId: mockRestaurant._id.toString()
            };

            const res1 = await request(app)
                .post('/api/menus')
                .set('Authorization', `Bearer ${testUsers.adminToken}`)
                .send(firstMenu);

            expect(res1.status).to.equal(201);

            // Try to create another menu with the same name for the same restaurant
            const duplicateMenu = {
                name: 'Unique Menu Name',
                price: generateRandomMenuPrice(),
                restaurantId: mockRestaurant._id.toString()
            };

            const res2 = await request(app)
                .post('/api/menus')
                .set('Authorization', `Bearer ${testUsers.adminToken}`)
                .send(duplicateMenu);

            expect(res2.status).to.equal(400);
            expect(res2.body.message).to.equal('A menu with this name already exists for this restaurant');
        });

        it('should allow same menu name in different restaurants', async () => {
            // Create a second restaurant
            const secondRestaurant = await Restaurant.create({
                name: 'Second Restaurant',
                address: '456 Second St',
                phone: '+33123456789',
                opening_hours: '10:00-22:00'
            });

            const sameName = 'Shared Menu Name';

            // Create menu in first restaurant
            const menu1 = {
                name: sameName,
                price: generateRandomMenuPrice(),
                restaurantId: mockRestaurant._id.toString()
            };

            const res1 = await request(app)
                .post('/api/menus')
                .set('Authorization', `Bearer ${testUsers.adminToken}`)
                .send(menu1);

            expect(res1.status).to.equal(201);

            // Create menu with same name in second restaurant
            const menu2 = {
                name: sameName,
                price: generateRandomMenuPrice(),
                restaurantId: secondRestaurant._id.toString()
            };

            const res2 = await request(app)
                .post('/api/menus')
                .set('Authorization', `Bearer ${testUsers.adminToken}`)
                .send(menu2);

            expect(res2.status).to.equal(201);
            expect(res2.body.menu).to.have.property('name', sameName);
        });
    });

    describe('PUT /api/menus/:id', () => {
        let testMenu: any;

        beforeEach(async () => {
            // Create a test menu to update
            const newMenu = generateRandomMenu(mockRestaurant._id.toString());
            testMenu = await Menu.create(newMenu);
        });

        it('should update menu as admin', async () => {
            const updatedData = {
                name: 'Updated Menu Name',
                description: 'Updated description',
                price: 29.99,
                category: 'Updated Category'
            };

            const res = await request(app)
                .put(`/api/menus/${testMenu._id}`)
                .set('Authorization', `Bearer ${testUsers.adminToken}`)
                .send(updatedData);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('menu');
            expect(res.body.menu).to.have.property('name', updatedData.name);
            expect(res.body.menu).to.have.property('description', updatedData.description);
            expect(res.body.menu).to.have.property('price', updatedData.price);
            expect(res.body.menu).to.have.property('category', updatedData.category);
            expect(res.body).to.have.property('message', 'Le menu a bien été mis à jour ✅');
        });

        it('should update only specific fields', async () => {
            const originalName = testMenu.name;
            const updatedPrice = 19.99;

            const res = await request(app)
                .put(`/api/menus/${testMenu._id}`)
                .set('Authorization', `Bearer ${testUsers.adminToken}`)
                .send({ price: updatedPrice });

            expect(res.status).to.equal(200);
            expect(res.body.menu).to.have.property('name', originalName);
            expect(res.body.menu).to.have.property('price', updatedPrice);
        });

        it('should not update menu as regular user', async () => {
            const updatedData = { name: 'Unauthorized Update' };

            const res = await request(app)
                .put(`/api/menus/${testMenu._id}`)
                .set('Authorization', `Bearer ${testUsers.userToken}`)
                .send(updatedData);

            expect(res.status).to.equal(403);
        });

        it('should not update menu without authentication', async () => {
            const updatedData = { name: 'Unauthenticated Update' };

            const res = await request(app)
                .put(`/api/menus/${testMenu._id}`)
                .send(updatedData);

            expect(res.status).to.equal(401);
        });

        it('should return 500 for invalid menu ID', async () => {
            const res = await request(app)
                .put('/api/menus/invalid-id')
                .set('Authorization', `Bearer ${testUsers.adminToken}`)
                .send({ name: 'Test' });

            expect(res.status).to.equal(500);
        });

        it('should return 404 for non-existent menu', async () => {
            const nonExistentId = '507f1f77bcf86cd799439011';

            const res = await request(app)
                .put(`/api/menus/${nonExistentId}`)
                .set('Authorization', `Bearer ${testUsers.adminToken}`)
                .send({ name: 'Test' });

            expect(res.status).to.equal(404);
            expect(res.body.message).to.equal('Menu not found');
        });

        it('should not update menu to duplicate name in same restaurant', async () => {
            // Create a second menu in the same restaurant
            const secondMenu = await Menu.create({
                name: 'Existing Menu',
                price: generateRandomMenuPrice(),
                restaurantId: mockRestaurant._id
            });

            // Try to update testMenu to have the same name as secondMenu
            const res = await request(app)
                .put(`/api/menus/${testMenu._id}`)
                .set('Authorization', `Bearer ${testUsers.adminToken}`)
                .send({ name: 'Existing Menu' });

            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('A menu with this name already exists for this restaurant');
        });

        it('should allow updating menu to same name (no change)', async () => {
            const originalName = testMenu.name;

            const res = await request(app)
                .put(`/api/menus/${testMenu._id}`)
                .set('Authorization', `Bearer ${testUsers.adminToken}`)
                .send({ 
                    name: originalName,
                    price: 99.99 
                });

            expect(res.status).to.equal(200);
            expect(res.body.menu).to.have.property('name', originalName);
            expect(res.body.menu).to.have.property('price', 99.99);
        });
    });

    describe('DELETE /api/menus/:id', () => {
        let testMenu: any;

        beforeEach(async () => {
            // Create a test menu to delete
            const newMenu = generateRandomMenu(mockRestaurant._id.toString());
            testMenu = await Menu.create(newMenu);
        });

        it('should delete menu as admin', async () => {
            const res = await request(app)
                .delete(`/api/menus/${testMenu._id}`)
                .set('Authorization', `Bearer ${testUsers.adminToken}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('message', 'Menu deleted successfully');

            // Verify menu was actually deleted
            const deletedMenu = await Menu.findById(testMenu._id);
            expect(deletedMenu).to.be.null;
        });

        it('should not delete menu as regular user', async () => {
            const res = await request(app)
                .delete(`/api/menus/${testMenu._id}`)
                .set('Authorization', `Bearer ${testUsers.userToken}`);

            expect(res.status).to.equal(403);

            // Verify menu still exists
            const stillExists = await Menu.findById(testMenu._id);
            expect(stillExists).to.not.be.null;
        });

        it('should not delete menu without authentication', async () => {
            const res = await request(app)
                .delete(`/api/menus/${testMenu._id}`);

            expect(res.status).to.equal(401);

            // Verify menu still exists
            const stillExists = await Menu.findById(testMenu._id);
            expect(stillExists).to.not.be.null;
        });

        it('should return 500 for invalid menu ID', async () => {
            const res = await request(app)
                .delete('/api/menus/invalid-id')
                .set('Authorization', `Bearer ${testUsers.adminToken}`);

            expect(res.status).to.equal(500);
        });

        it('should return 404 for non-existent menu', async () => {
            const nonExistentId = '507f1f77bcf86cd799439011';

            const res = await request(app)
                .delete(`/api/menus/${nonExistentId}`)
                .set('Authorization', `Bearer ${testUsers.adminToken}`);

            expect(res.status).to.equal(404);
            expect(res.body.message).to.equal('Menu not found');
        });

        it('should handle deletion of already deleted menu', async () => {
            // First delete
            await request(app)
                .delete(`/api/menus/${testMenu._id}`)
                .set('Authorization', `Bearer ${testUsers.adminToken}`);

            // Try to delete again
            const res = await request(app)
                .delete(`/api/menus/${testMenu._id}`)
                .set('Authorization', `Bearer ${testUsers.adminToken}`);

            expect(res.status).to.equal(404);
            expect(res.body.message).to.equal('Menu not found');
        });
    });
});
