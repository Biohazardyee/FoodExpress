import { Request, Response, NextFunction } from 'express';
import { BadRequest } from '../utils/errors.js';

export function validateUserRegistration(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, username, password } = req.body;
        
        // Check required fields
        if (!email || !username || !password) {
            throw new BadRequest('Email, username and password are required');
        }

        // Validate against empty/whitespace strings FIRST
        if (!email.trim() || !username.trim() || !password.trim()) {
            throw new BadRequest('Email, username and password cannot be empty or whitespace');
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new BadRequest('Invalid email format');
        }

        // Validate password length
        if (password.length < 8) {
            throw new BadRequest('Password must be at least 8 characters long');
        }

        // Validate username length and characters
        if (username.length < 3) {
            throw new BadRequest('Username must be at least 3 characters long');
        }
        if (username.length > 20) {
            throw new BadRequest('Username must be less than 20 characters');
        }
        
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!usernameRegex.test(username)) {
            throw new BadRequest('Username can only contain letters, numbers, and underscores');
        }

        next();
    } catch (error) {
        next(error);
    }
}

export function validateUserLogin(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, password } = req.body;
        
        // Check required fields
        if (!email || !password) {
            throw new BadRequest('Email and password are required');
        }

        // Validate against empty/whitespace strings first
        if (!email.trim() || !password.trim()) {
            throw new BadRequest('Email and password cannot be empty or whitespace');
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new BadRequest('Invalid email format');
        }

        next();
    } catch (error) {
        next(error);
    }
}

export function validateUserUpdate(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, username, password } = req.body;
        
        // At least one field must be provided for update
        if (!email && !username && !password) {
            throw new BadRequest('At least one field (email, username, or password) must be provided for update');
        }

        // Validate email format if provided
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new BadRequest('Invalid email format');
            }
            if (!email.trim()) {
                throw new BadRequest('Email cannot be empty or whitespace');
            }
        }

        // Validate username if provided
        if (username) {
            if (username.length < 3) {
                throw new BadRequest('Username must be at least 3 characters long');
            }
            if (username.length > 20) {
                throw new BadRequest('Username must be less than 20 characters');
            }
            
            const usernameRegex = /^[a-zA-Z0-9_]+$/;
            if (!usernameRegex.test(username)) {
                throw new BadRequest('Username can only contain letters, numbers, and underscores');
            }
            if (!username.trim()) {
                throw new BadRequest('Username cannot be empty or whitespace');
            }
        }

        // Validate password if provided
        if (password) {
            if (password.length < 8) {
                throw new BadRequest('Password must be at least 8 characters long');
            }
            if (!password.trim()) {
                throw new BadRequest('Password cannot be empty or whitespace');
            }
        }

        next();
    } catch (error) {
        next(error);
    }
}