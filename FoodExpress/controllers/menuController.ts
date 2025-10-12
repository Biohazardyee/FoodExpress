import type { Request, Response, NextFunction } from 'express';
import { Controller } from './controller.js';
import { Unauthorized, BadRequest, NotFound } from '../utils/errors.js';
import menuService from '../services/menuService.js';
import { IMenu } from '../schema/menus.js';
import restaurantService from '../services/restaurantService.js';

class MenuController extends Controller {
    private readonly service

    constructor(service = menuService) {
        super();
        this.service = service;
    }

    async add(req: Request, res: Response, next: NextFunction) {
        try {
            const { title, description, price, restaurant } = req.body;
            if (!title || !description || !price || !restaurant) {
                throw new BadRequest('Title, description, price and restaurant are required');
            }
            const restaurantExists = await restaurantService.getById(restaurant);

            if (!restaurantExists) {
                throw new BadRequest('Restaurant does not exist');
            }

            const newMenuData: Partial<IMenu> = {
                name: title,
                description,
                price,
                restaurant
            };
            const newMenu = await this.service.add(newMenuData as IMenu);
            res.status(201).json({
                message: "Menu créé avec succès ✅",
                menu: newMenu
            });
        } catch (error) {
            next(error);
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const sortQuery = req.query.sort as string | undefined;
            const allowedSortFields = ['category', 'price'];

            // support multi-field sorting: e.g. sort=category:asc,price:desc
            let sort: Record<string, 1 | -1> = {};

            if (sortQuery) {
                const pairs = sortQuery.split(',').map(s => s.trim()).filter(Boolean);
                for (const pair of pairs) {
                    const [field, order] = pair.split(':').map(p => p && p.trim());
                    if (!field) continue;
                    if (!allowedSortFields.includes(field)) {
                        throw new BadRequest(`Sorting by '${field}' is not allowed. Allowed fields: ${allowedSortFields.join(', ')}`);
                    }
                    const dir = order === 'desc' ? -1 : 1;
                    sort[field] = dir;
                }
            }

            // Pagination: page (1-based) and limit (default 10)
            const pageParam = req.query.page as string | undefined;
            const limitParam = req.query.limit as string | undefined;
            const page = pageParam ? parseInt(pageParam, 10) : 1;
            const limit = limitParam ? parseInt(limitParam, 10) : 10;
            if (Number.isNaN(page) || page < 1) throw new BadRequest('Invalid page parameter');
            if (Number.isNaN(limit) || limit < 1) throw new BadRequest('Invalid limit parameter');
            const maxLimit = 100;
            const clampedLimit = Math.min(limit, maxLimit);

            const menus = await this.service.getAll(sort, page, clampedLimit);
            res.status(200).json(menus);
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            if (!id) return next(new BadRequest('ID is required'));
            const menu = await this.service.getById(id);
            if (!menu) return next(new NotFound('Menu not found'));

            res.status(200).json(menu);
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            if (!id) return next(new BadRequest('ID is required'));
            const { title, description, price, restaurant } = req.body;
            const patch: Partial<IMenu> = {};

            if (title) patch.name = title;
            if (description) patch.description = description;
            if (price) patch.price = price;
            if (restaurant) patch.restaurant = restaurant;

            const updatedMenu = await this.service.update(id, patch);
            res.json({
                message: "Le menu a bien été mis à jour ✅",
                menu: updatedMenu
            });
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            if (!id) return next(new BadRequest('ID is required'));

            const deletedMenu = await this.service.delete(id);
            if (!deletedMenu) return next(new NotFound('Menu not found'));

            res.json({
                message: 'Menu deleted successfully',
                menu: deletedMenu
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new MenuController();