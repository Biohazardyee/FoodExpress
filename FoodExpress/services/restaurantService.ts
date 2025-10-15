import { Service } from './service.js';
import { Restaurant, IRestaurant } from '../schema/restaurants.js';
import { NotFound, BadRequest } from '../utils/errors.js';
import mongoose from 'mongoose';

class RestaurantService extends Service<IRestaurant, string> {
    async add(data: IRestaurant): Promise<IRestaurant> {
        return await Restaurant.create(data);
    }

    async getAll(sort: any, page = 1, limit = 10): Promise<IRestaurant[]> {
        const skip = (page - 1) * limit;
        return Restaurant.find().sort(sort).skip(skip).limit(limit).exec();
    }

    async getById(id: string): Promise<IRestaurant> {
        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequest('Invalid restaurant ID format');
        }
        
        const restaurant = await Restaurant.findById(id);
        if (!restaurant) {
            throw new NotFound('Restaurant not found');
        }
        return restaurant;
    }

    async getByName(name: string): Promise<IRestaurant | null> {
        return Restaurant.findOne({
            name
        });
    }

    async update(id: string, patch: Partial<IRestaurant>): Promise<IRestaurant> {
        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequest('Invalid restaurant ID format');
        }
        
        const updatedRestaurant = await Restaurant.findByIdAndUpdate(id, patch, { new: true });
        if (!updatedRestaurant) throw new NotFound('Restaurant not found');
        return updatedRestaurant;
    }

    async delete(id: string): Promise<IRestaurant> {
        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequest('Invalid restaurant ID format');
        }
        
        const deletedRestaurant = await Restaurant.findByIdAndDelete(id);
        if (!deletedRestaurant) {
            throw new NotFound('Restaurant not found');
        }
        return deletedRestaurant;
    }
}

export default new RestaurantService();