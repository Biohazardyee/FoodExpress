import express, { Request, Response, NextFunction } from 'express';
import { BadRequest } from '../utils/errors.js';

export function validateRestaurantCreation(req: Request, res: Response, next: NextFunction) {
    try {
        const {name, address, phone, opening_hours} = req.body;

        if (!name || !address || !phone || !opening_hours) {
            throw new BadRequest('All fields (name, address, phone, opening_hours) are required');
        }

        // Validate against empty/whitespace strings
        if (!name.trim() || !address.trim() || !phone.trim() || !opening_hours.trim()) {
            throw new BadRequest('Fields cannot be empty or whitespace');
        }

        // Validate field lengths
        if (name.length < 2 || name.length > 100) {
            throw new BadRequest('Name must be between 2 and 100 characters long');
        }
        if (address.length < 5 || address.length > 200) {
            throw new BadRequest('Address must be between 5 and 200 characters long');
        }
        if (opening_hours.length < 5 || opening_hours.length > 100) {
            throw new BadRequest('Opening hours must be between 5 and 100 characters long');
        }

        // Validate phone number format (E.164 format)
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        if (!phoneRegex.test(phone)) {
            throw new BadRequest('Invalid phone number format');
        }

        next();
    }
    catch (error) {
        next(error);
    }
}
        
export function validateRestaurantUpdate(req: Request, res: Response, next: NextFunction) {
    try {
        const {name, address, phone, opening_hours} = req.body;
        if (!name && !address && !phone && !opening_hours) {
            throw new BadRequest('At least one field (name, address, phone, opening_hours) must be provided for update');
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
        if (address !== undefined) {
            if (!address.trim()) {
                throw new BadRequest('Address cannot be empty or whitespace');
            }
            if (address.length < 5 || address.length > 200) {
                throw new BadRequest('Address must be between 5 and 200 characters long');
            }
        }
        if (phone !== undefined) {
            if (!phone.trim()) {
                throw new BadRequest('Phone cannot be empty or whitespace');
            }
            const phoneRegex = /^\+?[1-9]\d{1,14}$/;
            if (!phoneRegex.test(phone)) {
                throw new BadRequest('Invalid phone number format');
            }
        }
        if (opening_hours !== undefined) {
            if (!opening_hours.trim()) {
                throw new BadRequest('Opening hours cannot be empty or whitespace');
            }
            if (opening_hours.length < 5 || opening_hours.length > 100) {
                throw new BadRequest('Opening hours must be between 5 and 100 characters long');
            }
        }
        
        // If validation passes, proceed to next middleware
        next();
    } catch (error) {
        next(error);
    }
}