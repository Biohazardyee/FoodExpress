import { expect } from 'chai';
import { describe, it } from 'mocha';
import type { Request, Response, NextFunction } from 'express';
import { validateRestaurantCreation, validateRestaurantUpdate } from '../middlewares/restaurantInputValidation.js';
import { BadRequest } from '../utils/errors.js';

describe('Restaurant Input Validation', () => {
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

    describe('validateRestaurantCreation', () => {
        describe('Required Fields', () => {
            it('should pass with all required fields', async () => {
                const result = await testValidation(validateRestaurantCreation, {
                    name: 'Test Restaurant',
                    address: '123 Main Street, City',
                    phone: '+15551234567',
                    opening_hours: 'Mon-Fri: 9am-10pm'
                });
                expect(result.passed).to.be.true;
            });

            it('should fail when name is missing', async () => {
                const result = await testValidation(validateRestaurantCreation, {
                    address: '123 Main Street, City',
                    phone: '+15551234567',
                    opening_hours: 'Mon-Fri: 9am-10pm'
                });
                expect(result.error).to.be.instanceOf(BadRequest);
                expect(result.error.message).to.equal('All fields (name, address, phone, opening_hours) are required');
            });

            it('should fail when address is missing', async () => {
                const result = await testValidation(validateRestaurantCreation, {
                    name: 'Test Restaurant',
                    phone: '+15551234567',
                    opening_hours: 'Mon-Fri: 9am-10pm'
                });
                expect(result.error).to.be.instanceOf(BadRequest);
                expect(result.error.message).to.equal('All fields (name, address, phone, opening_hours) are required');
            });

            it('should fail when phone is missing', async () => {
                const result = await testValidation(validateRestaurantCreation, {
                    name: 'Test Restaurant',
                    address: '123 Main Street, City',
                    opening_hours: 'Mon-Fri: 9am-10pm'
                });
                expect(result.error).to.be.instanceOf(BadRequest);
                expect(result.error.message).to.equal('All fields (name, address, phone, opening_hours) are required');
            });

            it('should fail when opening_hours is missing', async () => {
                const result = await testValidation(validateRestaurantCreation, {
                    name: 'Test Restaurant',
                    address: '123 Main Street, City',
                    phone: '+15551234567'
                });
                expect(result.error).to.be.instanceOf(BadRequest);
                expect(result.error.message).to.equal('All fields (name, address, phone, opening_hours) are required');
            });
        });

        describe('Whitespace Validation', () => {
            it('should fail when name is empty string', async () => {
                const result = await testValidation(validateRestaurantCreation, {
                    name: '',
                    address: '123 Main Street, City',
                    phone: '+15551234567',
                    opening_hours: 'Mon-Fri: 9am-10pm'
                });
                expect(result.error).to.be.instanceOf(BadRequest);
                expect(result.error.message).to.equal('All fields (name, address, phone, opening_hours) are required');
            });

            it('should fail when name is only whitespace', async () => {
                const result = await testValidation(validateRestaurantCreation, {
                    name: '   ',
                    address: '123 Main Street, City',
                    phone: '+15551234567',
                    opening_hours: 'Mon-Fri: 9am-10pm'
                });
                expect(result.error).to.be.instanceOf(BadRequest);
                expect(result.error.message).to.equal('Fields cannot be empty or whitespace');
            });
        });

        describe('Name Length Validation', () => {
            it('should fail when name is too short', async () => {
                const result = await testValidation(validateRestaurantCreation, {
                    name: 'A',
                    address: '123 Main Street, City',
                    phone: '+15551234567',
                    opening_hours: 'Mon-Fri: 9am-10pm'
                });
                expect(result.error).to.be.instanceOf(BadRequest);
                expect(result.error.message).to.equal('Name must be between 2 and 100 characters long');
            });

            it('should fail when name is too long', async () => {
                const result = await testValidation(validateRestaurantCreation, {
                    name: 'A'.repeat(101),
                    address: '123 Main Street, City',
                    phone: '+15551234567',
                    opening_hours: 'Mon-Fri: 9am-10pm'
                });
                expect(result.error).to.be.instanceOf(BadRequest);
                expect(result.error.message).to.equal('Name must be between 2 and 100 characters long');
            });

            it('should pass with name at minimum length', async () => {
                const result = await testValidation(validateRestaurantCreation, {
                    name: 'AB',
                    address: '123 Main Street, City',
                    phone: '+15551234567',
                    opening_hours: 'Mon-Fri: 9am-10pm'
                });
                expect(result.passed).to.be.true;
            });
        });

        describe('Address Length Validation', () => {
            it('should fail when address is too short', async () => {
                const result = await testValidation(validateRestaurantCreation, {
                    name: 'Test Restaurant',
                    address: 'Abc',
                    phone: '+15551234567',
                    opening_hours: 'Mon-Fri: 9am-10pm'
                });
                expect(result.error).to.be.instanceOf(BadRequest);
                expect(result.error.message).to.equal('Address must be between 5 and 200 characters long');
            });

            it('should pass with valid address', async () => {
                const result = await testValidation(validateRestaurantCreation, {
                    name: 'Test Restaurant',
                    address: '123 Main Street',
                    phone: '+15551234567',
                    opening_hours: 'Mon-Fri: 9am-10pm'
                });
                expect(result.passed).to.be.true;
            });
        });

        describe('Phone Number Format Validation (E.164)', () => {
            it('should fail with invalid phone format', async () => {
                const result = await testValidation(validateRestaurantCreation, {
                    name: 'Test Restaurant',
                    address: '123 Main Street, City',
                    phone: '123-456-7890',
                    opening_hours: 'Mon-Fri: 9am-10pm'
                });
                expect(result.error).to.be.instanceOf(BadRequest);
                expect(result.error.message).to.equal('Invalid phone number format');
            });

            it('should fail with phone starting with 0', async () => {
                const result = await testValidation(validateRestaurantCreation, {
                    name: 'Test Restaurant',
                    address: '123 Main Street, City',
                    phone: '0123456789',
                    opening_hours: 'Mon-Fri: 9am-10pm'
                });
                expect(result.error).to.be.instanceOf(BadRequest);
                expect(result.error.message).to.equal('Invalid phone number format');
            });

            it('should pass with valid E.164 format with plus sign', async () => {
                const result = await testValidation(validateRestaurantCreation, {
                    name: 'Test Restaurant',
                    address: '123 Main Street, City',
                    phone: '+15551234567',
                    opening_hours: 'Mon-Fri: 9am-10pm'
                });
                expect(result.passed).to.be.true;
            });

            it('should pass with valid E.164 format without plus sign', async () => {
                const result = await testValidation(validateRestaurantCreation, {
                    name: 'Test Restaurant',
                    address: '123 Main Street, City',
                    phone: '15551234567',
                    opening_hours: 'Mon-Fri: 9am-10pm'
                });
                expect(result.passed).to.be.true;
            });
        });
    });

    describe('validateRestaurantUpdate', () => {
        describe('At Least One Field Required', () => {
            it('should fail when no fields are provided', async () => {
                const result = await testValidation(validateRestaurantUpdate, {});
                expect(result.error).to.be.instanceOf(BadRequest);
                expect(result.error.message).to.equal('At least one field (name, address, phone, opening_hours) must be provided for update');
            });

            it('should pass when only name is provided', async () => {
                const result = await testValidation(validateRestaurantUpdate, {
                    name: 'Updated Restaurant Name'
                });
                expect(result.passed).to.be.true;
            });

            it('should pass when only address is provided', async () => {
                const result = await testValidation(validateRestaurantUpdate, {
                    address: '456 New Street, Town'
                });
                expect(result.passed).to.be.true;
            });

            it('should pass when only phone is provided', async () => {
                const result = await testValidation(validateRestaurantUpdate, {
                    phone: '+15559876543'
                });
                expect(result.passed).to.be.true;
            });

            it('should pass when only opening_hours is provided', async () => {
                const result = await testValidation(validateRestaurantUpdate, {
                    opening_hours: 'Mon-Sun: 8am-11pm'
                });
                expect(result.passed).to.be.true;
            });
        });

        describe('Name Update Validation', () => {
            it('should fail when name is empty string', async () => {
                const result = await testValidation(validateRestaurantUpdate, {
                    name: ''
                });
                expect(result.error).to.be.instanceOf(BadRequest);
                expect(result.error.message).to.equal('At least one field (name, address, phone, opening_hours) must be provided for update');
            });

            it('should fail when name is too short', async () => {
                const result = await testValidation(validateRestaurantUpdate, {
                    name: 'A'
                });
                expect(result.error).to.be.instanceOf(BadRequest);
                expect(result.error.message).to.equal('Name must be between 2 and 100 characters long');
            });

            it('should pass with valid name', async () => {
                const result = await testValidation(validateRestaurantUpdate, {
                    name: 'New Restaurant Name'
                });
                expect(result.passed).to.be.true;
            });
        });

        describe('Phone Update Validation', () => {
            it('should fail when phone is empty string', async () => {
                const result = await testValidation(validateRestaurantUpdate, {
                    phone: ''
                });
                expect(result.error).to.be.instanceOf(BadRequest);
                expect(result.error.message).to.equal('At least one field (name, address, phone, opening_hours) must be provided for update');
            });

            it('should fail with invalid phone format', async () => {
                const result = await testValidation(validateRestaurantUpdate, {
                    phone: '123-456-7890'
                });
                expect(result.error).to.be.instanceOf(BadRequest);
                expect(result.error.message).to.equal('Invalid phone number format');
            });

            it('should pass with valid phone number', async () => {
                const result = await testValidation(validateRestaurantUpdate, {
                    phone: '+15559876543'
                });
                expect(result.passed).to.be.true;
            });
        });

        describe('Multiple Fields Update', () => {
            it('should pass with multiple valid fields', async () => {
                const result = await testValidation(validateRestaurantUpdate, {
                    name: 'Updated Restaurant',
                    address: '999 New Address Street',
                    phone: '+15551234567',
                    opening_hours: 'Daily: 10am-10pm'
                });
                expect(result.passed).to.be.true;
            });

            it('should fail if one of multiple fields is invalid', async () => {
                const result = await testValidation(validateRestaurantUpdate, {
                    name: 'Valid Name',
                    phone: '123-456-7890' // Invalid format
                });
                expect(result.error).to.be.instanceOf(BadRequest);
                expect(result.error.message).to.equal('Invalid phone number format');
            });
        });
    });
});
