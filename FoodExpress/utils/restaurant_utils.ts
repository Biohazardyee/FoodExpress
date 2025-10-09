import { Types } from 'mongoose';
import { IMenu } from '../schema/menus.js';

// Helper to always get the restaurant id whether `restaurant` is populated or not
// This is helpful in the case where we want to filter menus by restaurant id
// It retrieves all restaurant object that have the menu with the given restaurant id
// (populated or not, it works either way)

export function getRestaurantId(menu: IMenu): Types.ObjectId {
    const r = menu.restaurant as any;
    // populated document case (has _id)
    if (r && (r._id ?? r.id)) {
        // prefer _id if present (ObjectId), fallback to id
        return (r._id ?? r.id) as Types.ObjectId;
    }
    // already an ObjectId
    return menu.restaurant as Types.ObjectId;
}
