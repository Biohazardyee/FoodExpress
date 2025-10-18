import { Types } from 'mongoose';
import { IMenu } from '../schema/menus.js';

// Helper to always get the restaurant id whether `restaurantId` is populated or not
// This is helpful in the case where we want to filter menus by restaurant id
// It retrieves all restaurant object that have the menu with the given restaurant id
// (populated or not, it works either way)

export function getRestaurantId(menu: IMenu): Types.ObjectId {
    const restaurant = menu.restaurantId as any;
    // populated document case (has _id)
    if (restaurant && (restaurant._id ?? restaurant.id)) {
        // prefer _id if present (ObjectId), fallback to id
        return (restaurant._id ?? restaurant.id) as Types.ObjectId;
    }
    // already an ObjectId
    return menu.restaurantId as Types.ObjectId;
}
