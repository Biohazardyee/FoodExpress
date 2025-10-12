import { Service } from './service.js';
import { Menu, IMenu } from '../schema/menus.js';
import { NotFound } from '../utils/errors.js';
import { populate } from 'dotenv';

class MenuService extends Service<IMenu, string> {
    async add(data: IMenu): Promise<IMenu> {
        return await Menu.create(data);
    }

    async getAll (sort: any, page = 1, limit = 10): Promise<IMenu[]> {
        const skip = (page - 1) * limit;
        return Menu.find().sort(sort).skip(skip).limit(limit).populate('restaurant').exec();
    }

    async getById(id: string): Promise<IMenu> {
        const menu = await Menu.findById(id).populate('restaurant');
        if (!menu) throw new NotFound('Menu not found');
        if (!populate) {
            return menu;
        }
        return menu;
    }

    async update(id: string, patch: Partial<IMenu>): Promise<IMenu> {
        const updatedMenu = await Menu.findByIdAndUpdate(id, patch, { new: true }).populate('restaurant');
        if (!updatedMenu) throw new NotFound('Menu not found');
        return updatedMenu;
    }

    async delete(id: string): Promise<IMenu> {
        const deletedMenu = await Menu.findByIdAndDelete(id);
        if (!deletedMenu) {
            throw new NotFound('Menu not found');
        }
        return deletedMenu;
    }
}

export default new MenuService();