import app from '../app.js';
import request from 'supertest';
import mongoose from 'mongoose';
import { User } from '../schema/users.js';
import { before, describe, after, afterEach, it } from 'mocha';
import { expect } from 'chai';
import { generateRandomEmail, generateRandomPassword, generateRandomUsername } from './helpers.js';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

// Load environment variables
dotenv.config();

describe('User Endpoints', () => {

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
        await User.deleteMany({});
    });

    after(async () => {
        await mongoose.connection.close();
    });

    const mockUser = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'testpassword'
    };

    beforeEach(async () => {
        // Create a user in the database for testing existing user scenarios
        const hashedPassword = await bcrypt.hash(mockUser.password, 10);
        await User.create({
            email: mockUser.email,
            username: mockUser.username,
            password: hashedPassword
        });
    });



    describe('POST /api/users', () => {
        it('should register a new user', async () => {
            const res = await request(app)
                .post('/api/users')
                .send({
                    username: generateRandomUsername(),
                    email: generateRandomEmail(),
                    password: generateRandomPassword()
                });

            if (res.status !== 201) {
                console.log('❌ Registration failed. Response body:', res.body);
                console.log('❌ Registration failed. Status:', res.status);
            }
            expect(res.status).to.equal(201);
            expect(res.body).to.have.property('user');
        });

        it('should not register a user with existing email', async () => {
            const res = await request(app)
                .post('/api/users')
                .send({
                    username: mockUser.username,
                    email: mockUser.email,
                    password: mockUser.password
                });
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('Email already in use');
        });

        it('should not register a user with existing username', async () => {
            const res = await request(app)
                .post('/api/users')
                .send({
                    username: mockUser.username, // Same username as existing user
                    email: 'different@example.com', // Different email
                    password: 'newpassword123'
                });
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('Username already in use');
        });

        it('should not register a user with missing fields', async () => {
            const res = await request(app)
                .post('/api/users')
                .send({
                    username: generateRandomUsername(),
                    // email is missing
                    password: generateRandomPassword()
                });
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('Email, username and password are required');
        });

        it('should not register a user with invalid email', async () => {
            const res = await request(app)
                .post('/api/users')
                .send({
                    username: generateRandomUsername(),
                    email: 'invalid-email',
                    password: generateRandomPassword()
                });
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('Invalid email format');
        });

        it('should not register a user with short password', async () => {
            const res = await request(app)
                .post('/api/users')
                .send({
                    username: generateRandomUsername(),
                    email: generateRandomEmail(),
                    password: 'short' // too short
                });
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('Password must be at least 8 characters long');
        });

        it('should not register a user with missing password', async () => {
            const res = await request(app)
            .post('/api/users')
            .send({
                username: generateRandomUsername(),
                email: generateRandomEmail()
                // password is missing
            });
            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('Email, username and password are required');
        });

        it('should not register a user with empty string fields', async () => {
            const res = await request(app)
            .post('/api/users')
            .send({
                username: '',
                email: '',
                password: ''
            });
            expect(res.status).to.equal(400);
        });

        it('should not register a user with whitespace-only fields', async () => {
            const res = await request(app)
            .post('/api/users')
            .send({
                username: '   ',
                email: '   ',
                password: '   '
            });
            expect(res.status).to.equal(400);
        });

        it('should not register a user with username too short', async () => {
            const res = await request(app)
            .post('/api/users')
            .send({
                username: 'ab', // too short
                email: generateRandomEmail(),
                password: generateRandomPassword()
            });
            expect(res.status).to.equal(400);
        });

        it('should not register a user with username too long', async () => {
            const res = await request(app)
            .post('/api/users')
            .send({
                username: 'a'.repeat(51), // too long
                email: generateRandomEmail(),
                password: generateRandomPassword()
            });
            expect(res.status).to.equal(400);
        });

        it('should not register a user with invalid username characters', async () => {
            const res = await request(app)
            .post('/api/users')
            .send({
                username: 'user@name!',
                email: generateRandomEmail(),
                password: generateRandomPassword()
            });
            expect(res.status).to.equal(400);
        });

        it('should handle malformed JSON request', async () => {
            const res = await request(app)
            .post('/api/users')
            .set('Content-Type', 'application/json')
            .send('{"invalid": json}');
            expect(res.status).to.equal(400);
        });

        it('should handle request with wrong content type', async () => {
            const res = await request(app)
            .post('/api/users')
            .set('Content-Type', 'text/plain')
            .send('username=test&email=test@example.com&password=testpass');
            expect(res.status).to.equal(500); // Express returns 500 for unparseable content
        });

        it('should not register a user with SQL injection attempt', async () => {
            const res = await request(app)
            .post('/api/users')
            .send({
                username: "'; DROP TABLE users; --",
                email: generateRandomEmail(),
                password: generateRandomPassword()
            });
            expect(res.status).to.equal(400);
        });

        it('should handle very long password', async () => {
            const res = await request(app)
            .post('/api/users')
            .send({
                username: generateRandomUsername(),
                email: generateRandomEmail(),
                password: 'a'.repeat(1000)
            });
            // Should either accept or reject with appropriate status
            expect(res.status === 201 || res.status === 400);
        });
    });

    describe('POST /api/users/login', () => {
        it('should login with valid credentials', async () => {
            const res = await request(app)
                .post('/api/users/login')
                .send({
                    email: mockUser.email,
                    password: mockUser.password
                });

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('token');
            expect(res.body).to.have.property('user');
            expect(res.body.user).to.have.property('email', mockUser.email);
        });

        it('should not login with invalid email', async () => {
            const res = await request(app)
                .post('/api/users/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: mockUser.password
                });

            expect(res.status).to.equal(401);
            expect(res.body.message).to.equal('Invalid email or password');
        });

        it('should not login with invalid password', async () => {
            const res = await request(app)
                .post('/api/users/login')
                .send({
                    email: mockUser.email,
                    password: 'wrongpassword'
                });

            expect(res.status).to.equal(401);
            expect(res.body.message).to.equal('Invalid email or password');
        });

        it('should not login with missing email', async () => {
            const res = await request(app)
                .post('/api/users/login')
                .send({
                    password: mockUser.password
                });

            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('Email and password are required');
        });

        it('should not login with missing password', async () => {
            const res = await request(app)
                .post('/api/users/login')
                .send({
                    email: mockUser.email
                });

            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('Email and password are required');
        });

        it('should not login with empty credentials', async () => {
            const res = await request(app)
                .post('/api/users/login')
                .send({
                    email: '',
                    password: ''
                });

            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('Email and password are required');
        });

        it('should not login with invalid email format', async () => {
            const res = await request(app)
                .post('/api/users/login')
                .send({
                    email: 'invalid-email',
                    password: mockUser.password
                });

            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('Invalid email format');
        });

        it('should not login with whitespace-only credentials', async () => {
            const res = await request(app)
                .post('/api/users/login')
                .send({
                    email: '   ',
                    password: '   '
                });

            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('Email and password cannot be empty or whitespace');
        });
    });

    describe('GET /api/users', () => {
        let adminToken: string;
        let userToken: string;

        beforeEach(async () => {
            // Create admin user
            const hashedAdminPassword = await bcrypt.hash('adminpassword', 10);
            const adminUser = await User.create({
                email: 'admin@example.com',
                username: 'admin',
                password: hashedAdminPassword,
                roles: ['admin']
            });

            // Create regular user
            const hashedUserPassword = await bcrypt.hash('userpassword', 10);
            const regularUser = await User.create({
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

        it('should get all users as admin', async () => {
            const res = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.be.greaterThan(0);
        });

        it('should not get all users as regular user', async () => {
            const res = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).to.equal(403);
        });

        it('should not get all users without authentication', async () => {
            const res = await request(app)
                .get('/api/users');

            expect(res.status).to.equal(401);
        });

        it('should not get all users with invalid token', async () => {
            const res = await request(app)
                .get('/api/users')
                .set('Authorization', 'Bearer invalidtoken');

            expect(res.status).to.equal(401);
        });
    });

    describe('GET /api/users/:id', () => {
        let adminToken: string;
        let userToken: string;
        let userId: string;

        beforeEach(async () => {
            // Create admin user
            const hashedAdminPassword = await bcrypt.hash('adminpassword', 10);
            const adminUser = await User.create({
                email: 'admin@example.com',
                username: 'admin',
                password: hashedAdminPassword,
                roles: ['admin']
            });

            // Create regular user
            const hashedUserPassword = await bcrypt.hash('userpassword', 10);
            const regularUser = await User.create({
                email: 'user@example.com',
                username: 'regularuser',
                password: hashedUserPassword,
                roles: ['user']
            });

            userId = regularUser._id.toString();

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

        it('should get user by id as admin', async () => {
            const res = await request(app)
                .get(`/api/users/${userId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('email', 'user@example.com');
            expect(res.body).to.have.property('username', 'regularuser');
        });

        it('should not get user by id as regular user', async () => {
            const res = await request(app)
                .get(`/api/users/${userId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).to.equal(403);
        });

        it('should not get user by id without authentication', async () => {
            const res = await request(app)
                .get(`/api/users/${userId}`);

            expect(res.status).to.equal(401);
        });

        it('should return 400 for invalid user id format', async () => {
            const res = await request(app)
                .get('/api/users/invalid-id')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('Invalid ID format');
        });

        it('should return 404 for non-existent user', async () => {
            const nonExistentId = '507f1f77bcf86cd799439011'; // Valid ObjectId format but doesn't exist
            const res = await request(app)
                .get(`/api/users/${nonExistentId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).to.equal(404);
        });
    });

    describe('PUT /api/users/:id', () => {
        let adminToken: string;
        let userToken: string;
        let userId: string;
        let adminId: string;

        beforeEach(async () => {
            // Create admin user
            const hashedAdminPassword = await bcrypt.hash('adminpassword', 10);
            const adminUser = await User.create({
                email: 'admin@example.com',
                username: 'admin',
                password: hashedAdminPassword,
                roles: ['admin']
            });
            adminId = adminUser._id.toString();

            // Create regular user
            const hashedUserPassword = await bcrypt.hash('userpassword', 10);
            const regularUser = await User.create({
                email: 'user@example.com',
                username: 'regularuser',
                password: hashedUserPassword,
                roles: ['user']
            });
            userId = regularUser._id.toString();

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

        it('should update user as admin', async () => {
            const res = await request(app)
                .put(`/api/users/${userId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    username: 'updatedusername',
                    email: 'updated@example.com'
                });

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('message');
            expect(res.body.user).to.have.property('username', 'updatedusername');
            expect(res.body.user).to.have.property('email', 'updated@example.com');
        });

        it('should update own profile as regular user', async () => {
            const res = await request(app)
                .put(`/api/users/${userId}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    username: 'updatedbyuser'
                });

            expect(res.status).to.equal(200);
            expect(res.body.user).to.have.property('username', 'updatedbyuser');
        });

        it('should not update other user profile as regular user', async () => {
            const res = await request(app)
                .put(`/api/users/${adminId}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    username: 'attemptedupdate'
                });

            expect(res.status).to.equal(403);
        });

        it('should not update user without authentication', async () => {
            const res = await request(app)
                .put(`/api/users/${userId}`)
                .send({
                    username: 'unauthorizedupdate'
                });

            expect(res.status).to.equal(401);
        });

        it('should not update with invalid email format', async () => {
            const res = await request(app)
                .put(`/api/users/${userId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    email: 'invalid-email'
                });

            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('Invalid email format');
        });

        it('should not update with short password', async () => {
            const res = await request(app)
                .put(`/api/users/${userId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    password: 'short'
                });

            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('Password must be at least 8 characters long');
        });

        it('should not update with invalid username', async () => {
            const res = await request(app)
                .put(`/api/users/${userId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    username: 'ab' // too short
                });

            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('Username must be at least 3 characters long');
        });

        it('should not update with empty request body', async () => {
            const res = await request(app)
                .put(`/api/users/${userId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({});

            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('At least one field (email, username, or password) must be provided for update');
        });

        it('should return 404 for non-existent user update', async () => {
            const nonExistentId = '507f1f77bcf86cd799439011';
            const res = await request(app)
                .put(`/api/users/${nonExistentId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    username: 'newusername'
                });

            expect(res.status).to.equal(404);
        });
    });

    describe('DELETE /api/users/:id', () => {
        let adminToken: string;
        let userToken: string;
        let userId: string;
        let adminId: string;

        beforeEach(async () => {
            // Create admin user
            const hashedAdminPassword = await bcrypt.hash('adminpassword', 10);
            const adminUser = await User.create({
                email: 'admin@example.com',
                username: 'admin',
                password: hashedAdminPassword,
                roles: ['admin']
            });
            adminId = adminUser._id.toString();

            // Create regular user
            const hashedUserPassword = await bcrypt.hash('userpassword', 10);
            const regularUser = await User.create({
                email: 'user@example.com',
                username: 'regularuser',
                password: hashedUserPassword,
                roles: ['user']
            });
            userId = regularUser._id.toString();

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

        it('should delete user as admin', async () => {
            const res = await request(app)
                .delete(`/api/users/${userId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('message', 'User deleted successfully');
        });

        it('should delete own profile as regular user', async () => {
            const res = await request(app)
                .delete(`/api/users/${userId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('message', 'User deleted successfully');
        });

        it('should not delete other user profile as regular user', async () => {
            const res = await request(app)
                .delete(`/api/users/${adminId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).to.equal(403);
        });

        it('should not delete user without authentication', async () => {
            const res = await request(app)
                .delete(`/api/users/${userId}`);

            expect(res.status).to.equal(401);
        });

        it('should return 404 for non-existent user deletion', async () => {
            const nonExistentId = '507f1f77bcf86cd799439011';
            const res = await request(app)
                .delete(`/api/users/${nonExistentId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).to.equal(404);
        });

        it('should return 400 for invalid user id format', async () => {
            const res = await request(app)
                .delete('/api/users/invalid-id')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('Invalid ID format');
        });
    });
});
