import { Service } from './service.js';
import { Restaurant, IRestaurant } from '../schema/restaurants.js';
import { NotFound } from '../utils/errors.js';

class RestaurantService extends Service<IRestaurant, string> {
    async add(data: IRestaurant): Promise<IRestaurant> {
        return await Restaurant.create(data);
    }

    async getAll(sort: any): Promise<IRestaurant[]> {
        return Restaurant.find().sort(sort);
    }

    async getById(id: string): Promise<IRestaurant> {
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
        const updatedRestaurant = await Restaurant.findByIdAndUpdate(id, patch, { new: true });
        if (!updatedRestaurant) throw new NotFound('Restaurant not found');
        return updatedRestaurant;
    }

    async delete(id: string): Promise<IRestaurant> {
        const deletedRestaurant = await Restaurant.findByIdAndDelete(id);
        if (!deletedRestaurant) {
            throw new NotFound('Restaurant not found');
        }
        return deletedRestaurant;
    }
}

export default new RestaurantService();