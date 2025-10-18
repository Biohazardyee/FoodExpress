import { describe, it, before, after } from 'mocha';
import { expect } from 'chai';
import { Types } from 'mongoose';
import { getRestaurantId } from '../utils/restaurantUtils.js';
import type { IMenu } from '../schema/menus.js';

describe('Restaurant Utils', () => {
    describe('getRestaurantId', () => {
        it('should return ObjectId when restaurantId is already an ObjectId', () => {
            const objectId = new Types.ObjectId();
            const menu: IMenu = {
                name: 'Test Menu',
                price: 19.99,
                restaurantId: objectId
            } as IMenu;

            const result = getRestaurantId(menu);

            expect(result).to.be.instanceOf(Types.ObjectId);
            expect(result.toString()).to.equal(objectId.toString());
        });

        it('should return ObjectId when restaurantId is a populated object with _id', () => {
            const objectId = new Types.ObjectId();
            const populatedRestaurant = {
                _id: objectId,
                name: 'Test Restaurant',
                address: 'Test Address',
                phone: '123-456-7890',
                opening_hours: '9am - 9pm'
            };

            const menu: IMenu = {
                name: 'Test Menu',
                price: 19.99,
                restaurantId: populatedRestaurant as any
            } as IMenu;

            const result = getRestaurantId(menu);

            expect(result).to.be.instanceOf(Types.ObjectId);
            expect(result.toString()).to.equal(objectId.toString());
        });

        it('should return ObjectId when restaurantId is a populated object with id (fallback)', () => {
            const objectId = new Types.ObjectId();
            const populatedRestaurant = {
                id: objectId,
                name: 'Test Restaurant',
                address: 'Test Address',
                phone: '123-456-7890',
                opening_hours: '9am - 9pm'
            };

            const menu: IMenu = {
                name: 'Test Menu',
                price: 19.99,
                restaurantId: populatedRestaurant as any
            } as IMenu;

            const result = getRestaurantId(menu);

            expect(result).to.be.instanceOf(Types.ObjectId);
            expect(result.toString()).to.equal(objectId.toString());
        });

        it('should prefer _id over id when both are present in populated object', () => {
            const objectId1 = new Types.ObjectId();
            const objectId2 = new Types.ObjectId();

            const populatedRestaurant = {
                _id: objectId1,  // This should be preferred
                id: objectId2,
                name: 'Test Restaurant',
                address: 'Test Address',
                phone: '123-456-7890',
                opening_hours: '9am - 9pm'
            };

            const menu: IMenu = {
                name: 'Test Menu',
                price: 19.99,
                restaurantId: populatedRestaurant as any
            } as IMenu;

            const result = getRestaurantId(menu);

            expect(result).to.be.instanceOf(Types.ObjectId);
            expect(result.toString()).to.equal(objectId1.toString());
            expect(result.toString()).to.not.equal(objectId2.toString());
        });

        it('should handle string representation of ObjectId', () => {
            const objectId = new Types.ObjectId();
            const menu: IMenu = {
                name: 'Test Menu',
                price: 19.99,
                restaurantId: objectId.toString() as any
            } as IMenu;

            const result = getRestaurantId(menu);

            // Should return the original value as ObjectId
            expect(result.toString()).to.equal(objectId.toString());
        });

        it('should handle edge case with empty populated object', () => {
            const objectId = new Types.ObjectId();
            const emptyPopulated = {};

            const menu: IMenu = {
                name: 'Test Menu',
                price: 19.99,
                restaurantId: emptyPopulated as any
            } as IMenu;

            // Since the populated object has no _id or id, it should fallback to treating it as ObjectId
            const result = getRestaurantId(menu);

            // Should return the empty object casted as ObjectId
            expect(result).to.equal(emptyPopulated);
        });

        it('should handle null/undefined populated values gracefully', () => {
            const objectId = new Types.ObjectId();
            const menu: IMenu = {
                name: 'Test Menu',
                price: 19.99,
                restaurantId: null as any
            } as IMenu;

            const result = getRestaurantId(menu);

            // Should return null as ObjectId
            expect(result).to.equal(null);
        });
    });
});