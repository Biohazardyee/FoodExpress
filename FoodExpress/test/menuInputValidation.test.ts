import { expect } from 'chai';
import { describe, it } from 'mocha';
import type { Request, Response, NextFunction } from 'express';
import { validateMenuCreation, validateMenuUpdate } from '../middlewares/menuInputValidation.js';
import { BadRequest } from '../utils/errors.js';

describe('Menu Input Validation', () => {
    // Helper to test validation middleware
    async function testValidation(
        validator: (req: Request, res: Response, next: NextFunction) => void,
        body: any
    ): Promise<{ error: any; passed: boolean }> {
        return new Promise((resolve) => {
            const req = { body } as Request;
            const res = {} as Response;
            const next: NextFunction = (error?: any) => {
                resolve({ error, passed: !error });
            };
            validator(req, res, next);
        });
    }

    describe('validateMenuCreation', () => {
        describe('Required Fields', () => {
            it('should pass with all required fields', async () => {
                const result = await testValidation(validateMenuCreation, {
                    name: 'Burger',
                    price: 10.99,
                    restaurantId: '507f1f77bcf86cd799439011'
                });
                expect(result.passed).to.be.true;
            });

            it('should fail when name is missing', async () => {
                const result = await testValidation(validateMenuCreation, {
                    price: 10.99,
                    restaurantId: '507f1f77bcf86cd799439011'
                });
                expect(result.error).to.be.instanceOf(BadRequest);
                expect(result.error.message).to.equal('Name, price and restaurantId are required');
            });

            it('should fail when price is missing', async () => {
                const result = await testValidation(validateMenuCreation, {
                    name: 'Burger',
                    restaurantId: '507f1f77bcf86cd799439011'
                });
                expect(result.error).to.be.instanceOf(BadRequest);
                expect(result.error.message).to.equal('Name, price and restaurantId are required');
            });

            it('should fail when restaurantId is missing', async () => {
                const result = await testValidation(validateMenuCreation, {
                    name: 'Burger',
                    price: 10.99
                });
                expect(result.error).to.be.instanceOf(BadRequest);
                expect(result.error.message).to.equal('Name, price and restaurantId are required');
            });
        });

        describe('Whitespace Validation', () => {
            it('should fail when name is empty string', async () => {
                const result = await testValidation(validateMenuCreation, {
                    name: '',
                    price: 12.99,
                    restaurantId: '507f1f77bcf86cd799439011'
                });
                expect(result.error).to.be.instanceOf(BadRequest);
                expect(result.error.message).to.equal('Name, price and restaurantId are required');
            });

            it('should fail when name is only whitespace', async () => {
                const result = await testValidation(validateMenuCreation, {
                    name: '   ',
                    price: 10.99,
                    restaurantId: '507f1f77bcf86cd799439011'
                });
                expect(result.error).to.be.instanceOf(BadRequest);
                expect(result.error.message).to.equal('Name and restaurantId cannot be empty or whitespace');
            });
        });

        describe('Price Validation', () => {
            it('should fail when price is zero', async () => {
                const result = await testValidation(validateMenuCreation, {
                    name: 'Burger',
                    price: 0,
                    restaurantId: '507f1f77bcf86cd799439011'
                });
                expect(result.error).to.be.instanceOf(BadRequest);
                expect(result.error.message).to.equal('Price must be a positive number');
            });

            it('should fail when price is negative', async () => {
                const result = await testValidation(validateMenuCreation, {
                    name: 'Burger',
                    price: -5.99,
                    restaurantId: '507f1f77bcf86cd799439011'
                });
                expect(result.error).to.be.instanceOf(BadRequest);
                expect(result.error.message).to.equal('Price must be a positive number');
            });

            it('should pass with decimal price', async () => {
                const result = await testValidation(validateMenuCreation, {
                    name: 'Burger',
                    price: 15.99,
                    restaurantId: '507f1f77bcf86cd799439011'
                });
                expect(result.passed).to.be.true;
            });
        });

        describe('Name Length Validation', () => {
            it('should fail when name is too short', async () => {
                const result = await testValidation(validateMenuCreation, {
                    name: 'A',
                    price: 10.99,
                    restaurantId: '507f1f77bcf86cd799439011'
                });
                expect(result.error).to.be.instanceOf(BadRequest);
                expect(result.error.message).to.equal('Name must be between 2 and 100 characters long');
            });

            it('should fail when name is too long', async () => {
                const result = await testValidation(validateMenuCreation, {
                    name: 'A'.repeat(101),
                    price: 10.99,
                    restaurantId: '507f1f77bcf86cd799439011'
                });
                expect(result.error).to.be.instanceOf(BadRequest);
                expect(result.error.message).to.equal('Name must be between 2 and 100 characters long');
            });

            it('should pass with name at minimum length', async () => {
                const result = await testValidation(validateMenuCreation, {
                    name: 'AB',
                    price: 10.99,
                    restaurantId: '507f1f77bcf86cd799439011'
                });
                expect(result.passed).to.be.true;
            });
        });

        describe('Restaurant ID Format Validation', () => {
            it('should fail with invalid ObjectId format', async () => {
                const result = await testValidation(validateMenuCreation, {
                    name: 'Burger',
                    price: 10.99,
                    restaurantId: 'invalid-id'
                });
                expect(result.error).to.be.instanceOf(BadRequest);
                expect(result.error.message).to.equal('Restaurant ID must be a valid ObjectId');
            });

            it('should pass with valid ObjectId', async () => {
                const result = await testValidation(validateMenuCreation, {
                    name: 'Burger',
                    price: 10.99,
                    restaurantId: '507f1f77bcf86cd799439011'
                });
                expect(result.passed).to.be.true;
            });
        });
    });

    describe('validateMenuUpdate', () => {
        describe('At Least One Field Required', () => {
            it('should fail when no fields are provided', async () => {
                const result = await testValidation(validateMenuUpdate, {});
                expect(result.error).to.be.instanceOf(BadRequest);
                expect(result.error.message).to.equal('At least one field (name, description, price, restaurantId, category) must be provided for update');
            });

            it('should pass when only name is provided', async () => {
                const result = await testValidation(validateMenuUpdate, {
                    name: 'Updated Burger'
                });
                expect(result.passed).to.be.true;
            });

            it('should pass when only price is provided', async () => {
                const result = await testValidation(validateMenuUpdate, {
                    price: 15.99
                });
                expect(result.passed).to.be.true;
            });
        });

        describe('Name Update Validation', () => {
            it('should fail when name is empty string', async () => {
                const result = await testValidation(validateMenuUpdate, {
                    name: ''
                });
                expect(result.error).to.be.instanceOf(BadRequest);
                expect(result.error.message).to.equal('At least one field (name, description, price, restaurantId, category) must be provided for update');
            });

            it('should fail when name is too short', async () => {
                const result = await testValidation(validateMenuUpdate, {
                    name: 'A'
                });
                expect(result.error).to.be.instanceOf(BadRequest);
                expect(result.error.message).to.equal('Name must be between 2 and 100 characters long');
            });

            it('should pass with valid name', async () => {
                const result = await testValidation(validateMenuUpdate, {
                    name: 'Updated Menu Item'
                });
                expect(result.passed).to.be.true;
            });
        });

        describe('Price Update Validation', () => {
            it('should fail when price is zero', async () => {
                const result = await testValidation(validateMenuUpdate, {
                    price: 0
                });
                expect(result.error).to.be.instanceOf(BadRequest);
                expect(result.error.message).to.equal('Price must be a positive number');
            });

            it('should pass with valid price', async () => {
                const result = await testValidation(validateMenuUpdate, {
                    price: 25.99
                });
                expect(result.passed).to.be.true;
            });
        });
    });
});
