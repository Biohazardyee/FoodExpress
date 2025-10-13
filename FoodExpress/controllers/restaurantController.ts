import type { Request, Response, NextFunction } from 'express';
import { Controller } from './controller.js';
import { Unauthorized, BadRequest, NotFound } from '../utils/errors.js';
import restaurantService from '../services/restaurantService.js';
import {IRestaurant, Restaurant} from '../schema/restaurants.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";

dotenv.config();

class RestaurantController extends Controller {
    private readonly service;

    constructor(service = restaurantService) {
        super();
        this.service = service;
    }

    async add(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, address, phone, opening_hours } = req.body;
            if (!name || !address || !phone || !opening_hours) {
                throw new BadRequest('Name, address phone and opening_hours are required');
            }

            const existingRestaurant = await this.service.getByName(name);

            if (existingRestaurant) {
                throw new BadRequest('Name for this restaurant is already in use');
            }

            const newUserData: Partial<IRestaurant> = {
                name,
                address,
                phone,
                opening_hours
            };

            const createdRestaurant = await this.service.add(newUserData as IRestaurant);

            res.status(201).json({
                message: "Restaurant créé avec succès ✅",
                restaurant: createdRestaurant
            });
        }
        catch (err) {
            next(err);
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {

            const sortQuery = req.query.sort as string | undefined;
            const allowedSortFields = ['name', 'address'];

            let sort = {};

            if (sortQuery) {
                const field = sortQuery.replace("-", "");
                if (allowedSortFields.includes(field)) {
                    sort = { [field]: sortQuery.startsWith("-") ? -1 : 1 };
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

            const restaurants = await this.service.getAll(sort, page, clampedLimit);

            res.json(restaurants);

        } catch (error) {
            next(error);
        }
    }


    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            if (!id) return next(new BadRequest('ID is required'));
            const restaurant = await this.service.getById(id);
            if (!restaurant) return next(new NotFound('Restaurant not found'));

            res.json(restaurant);
        } catch (e) {
            next(e);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            if (!id) return next(new BadRequest('ID is required'));

            const { name, address, phone, opening_hours } = req.body;

            // Check if name is being updated and if it already exists
            if (name) {
                const existingRestaurant = await this.service.getByName(name);
                if (existingRestaurant && existingRestaurant._id.toString() !== id) {
                    throw new BadRequest('Name for this restaurant is already in use');
                }
            }

            const patch: Partial<IRestaurant> = {};

            if (name) patch.name = name;
            if (address) patch.address = address;
            if (phone) patch.phone = phone;
            if (opening_hours) patch.opening_hours = opening_hours;

            const updatedRestaurant = await this.service.update(id, patch);

            res.json({
                message: "Le restaurant a bien été mis à jour ✅",
                restaurant: updatedRestaurant
            });

        } catch (e) {
            next(e);
        }
    }


    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            if (!id) return next(new BadRequest('ID is required'));

            const deletedRestaurant = await this.service.delete(id);
            if (!deletedRestaurant) return next(new NotFound('Restaurant not found'));

            res.json({
                message: 'Restaurant deleted successfully',
                restaurant: deletedRestaurant
            });
        } catch (e) {
            next(e);
        }
    }
}

export default new RestaurantController();