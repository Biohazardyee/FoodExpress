import express, { Request, Response, NextFunction } from 'express';
import { BadRequest } from '../utils/errors.js';

export function validateMenuCreation(req: Request, res: Response, next: NextFunction) {
    try {
        const { name, description, price, restaurantId, category } = req.body;

        // Only name, price, and restaurantId are required (description and category are optional)
        if (!name || price === undefined || !restaurantId) {
            throw new BadRequest('Name, price and restaurantId are required');
        }

        // Validate against empty/whitespace strings for required fields
        if (!name.trim() || !restaurantId.trim()) {
            throw new BadRequest('Name and restaurantId cannot be empty or whitespace');
        }

        // Validate optional fields if provided
        if (description !== undefined && !description.trim()) {
            throw new BadRequest('Description cannot be empty or whitespace');
        }
        if (category !== undefined && !category.trim()) {
            throw new BadRequest('Category cannot be empty or whitespace');
        }

        // Validate price is a positive number
        if (isNaN(price) || price <= 0) {
            throw new BadRequest('Price must be a positive number');
        }

        // Validate name length
        if (name.length < 2 || name.length > 100) {
            throw new BadRequest('Name must be between 2 and 100 characters long');
        }

        // Validate optional field lengths
        if (description !== undefined && (description.length < 5 || description.length > 500)) {
            throw new BadRequest('Description must be between 5 and 500 characters long');
        }
        if (category !== undefined && (category.length < 2 || category.length > 50)) {
            throw new BadRequest('Category must be between 2 and 50 characters long');
        }

        // Validate restaurantId format (MongoDB ObjectId)
        const objectIdRegex = /^[0-9a-fA-F]{24}$/;
        if (!objectIdRegex.test(restaurantId)) {
            throw new BadRequest('Restaurant ID must be a valid ObjectId');
        }

        next();
    }
    catch (error) {
        next(error);
    }
}

export function validateMenuUpdate(req: Request, res: Response, next: NextFunction) {
    try {
        const { name, description, price, restaurantId, category } = req.body;

        if (!name && !description && price === undefined && !restaurantId && !category) {
            throw new BadRequest('At least one field (name, description, price, restaurantId, category) must be provided for update');
        }

        // Validate fields if they are provided
        if (name !== undefined) {
            if (!name.trim()) {
                throw new BadRequest('Name cannot be empty or whitespace');
            }
            if (name.length < 2 || name.length > 100) {
                throw new BadRequest('Name must be between 2 and 100 characters long');
            }
        }
        if (description !== undefined) {
            if (!description.trim()) {
                throw new BadRequest('Description cannot be empty or whitespace');
            }
            if (description.length < 5 || description.length > 500) {
                throw new BadRequest('Description must be between 5 and 500 characters long');
            }
        }
        if (price !== undefined) {
            if (isNaN(price) || price <= 0) {
                throw new BadRequest('Price must be a positive number');
            }
        }
        if (category !== undefined) {
            if (!category.trim()) {
                throw new BadRequest('Category cannot be empty or whitespace');
            }
            if (category.length < 2 || category.length > 50) {
                throw new BadRequest('Category must be between 2 and 50 characters long');
            }
        }
        if (restaurantId !== undefined) {
            if (!restaurantId.trim()) {
                throw new BadRequest('Restaurant ID cannot be empty or whitespace');
            }
            // Validate restaurantId format (MongoDB ObjectId)
            const objectIdRegex = /^[0-9a-fA-F]{24}$/;
            if (!objectIdRegex.test(restaurantId)) {
                throw new BadRequest('Restaurant ID must be a valid ObjectId');
            }
        }

        next();
    } catch (error) {
        next(error);
    }
}
