import { describe, it, before, after } from 'mocha';
import { expect } from 'chai';
import { Menu } from '../schema/menus.js';
import { Restaurant } from '../schema/restaurants.js';
import { User } from '../schema/users.js';
import { setupTestDatabase, teardownTestDatabase, trackMenu, trackRestaurant, trackUser, clearTestCreatedItems } from './testSetup.js';

describe('🔍 Verify Cleanup System', () => {
    let initialMenuCount = 0;
    let initialRestaurantCount = 0;
    let initialUserCount = 0;
    let createdMenuId: string;
    let createdRestaurantId: string;
    let createdUserId: string;

    before(async () => {
        await setupTestDatabase();
        
        // Count items BEFORE test
        initialMenuCount = await Menu.countDocuments();
        initialRestaurantCount = await Restaurant.countDocuments();
        initialUserCount = await User.countDocuments();
        
        console.log(`\n📊 Initial counts:`);
        console.log(`   Menus: ${initialMenuCount}`);
        console.log(`   Restaurants: ${initialRestaurantCount}`);
        console.log(`   Users: ${initialUserCount}`);
    });

    after(async () => {
        await clearTestCreatedItems(); // Clean up items from last test
        await teardownTestDatabase();
    });

    it('should track and delete all created items (menus, restaurants, users)', async () => {
        // Create a restaurant
        const restaurant = await Restaurant.create({
            name: 'Cleanup Test Restaurant',
            address: '123 Test St',
            phone: '+1234567890',
            opening_hours: '9am-9pm'
        });
        createdRestaurantId = restaurant._id.toString();
        trackRestaurant(createdRestaurantId);
        
        // Create a menu
        const menu = await Menu.create({
            name: 'Cleanup Test Menu',
            price: 9.99,
            restaurantId: restaurant._id
        });
        createdMenuId = menu._id.toString();
        trackMenu(createdMenuId);

        // Create a user
        const user = await User.create({
            email: 'cleanup-test@example.com',
            username: 'cleanuptest',
            password: 'hashedpassword123'
        });
        createdUserId = user._id.toString();
        trackUser(createdUserId);

        // Verify they exist
        const menuExists = await Menu.findById(createdMenuId);
        const restaurantExists = await Restaurant.findById(createdRestaurantId);
        const userExists = await User.findById(createdUserId);
        
        expect(menuExists).to.not.be.null;
        expect(restaurantExists).to.not.be.null;
        expect(userExists).to.not.be.null;
        
        console.log(`\n✅ Created and verified:`);
        console.log(`   Menu: ${createdMenuId}`);
        console.log(`   Restaurant: ${createdRestaurantId}`);
        console.log(`   User: ${createdUserId}`);

        // NOW CLEAN UP
        await clearTestCreatedItems();

        // Verify they were deleted
        const menuAfter = await Menu.findById(createdMenuId);
        const restaurantAfter = await Restaurant.findById(createdRestaurantId);
        const userAfter = await User.findById(createdUserId);
        
        expect(menuAfter).to.be.null;
        expect(restaurantAfter).to.be.null;
        expect(userAfter).to.be.null;

        console.log(`\n🗑️  Cleanup verified:`);
        console.log(`   Menu deleted: ${menuAfter === null}`);
        console.log(`   Restaurant deleted: ${restaurantAfter === null}`);
        console.log(`   User deleted: ${userAfter === null}`);

        // Verify counts returned to initial values
        const finalMenuCount = await Menu.countDocuments();
        const finalRestaurantCount = await Restaurant.countDocuments();
        const finalUserCount = await User.countDocuments();
        
        expect(finalMenuCount).to.equal(initialMenuCount);
        expect(finalRestaurantCount).to.equal(initialRestaurantCount);
        expect(finalUserCount).to.equal(initialUserCount);

        console.log(`\n📊 Final counts (should match initial):`);
        console.log(`   Menus: ${finalMenuCount} (was ${initialMenuCount})`);
        console.log(`   Restaurants: ${finalRestaurantCount} (was ${initialRestaurantCount})`);
        console.log(`   Users: ${finalUserCount} (was ${initialUserCount})`);
    });
});
