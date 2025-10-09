import type { Request, Response, NextFunction } from 'express';
import { Controller } from './controller.js';
import { Unauthorized, BadRequest, NotFound } from '../utils/errors.js';
import userService from '../services/userService.js';
import { IUser } from '../schema/users.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";

dotenv.config();

class UserController extends Controller {
    private readonly service;

    constructor(service = userService) {
        super();
        this.service = service;
    }

    async add(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, username, password } = req.body;
            if (!email || !username || !password) {
                throw new BadRequest('Email, username and password are required');
            }
            const existingUser = await this.service.getByEmail(email) || await this.service.getByUsername(username);
            if (existingUser) {
                throw new BadRequest('Email or username already in use');
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const createdUser = await this.service.add({
                username,
                email,
                password: hashedPassword,
                role: 'user'
            } as IUser);
            res.status(201).json(createdUser);
        }
        catch (err) {
            next(err);
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                throw new BadRequest('Email and password are required');
            }

            const user = await this.service.getByEmail(email);
            if (!user) {
                throw new Unauthorized('Invalid email or password');
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new Unauthorized('Invalid email or password');
            }

            const token = jwt.sign(
                { id: user._id, email: user.email, role: user.role },
                process.env.JWT_SECRET || 'defaultsecret',
                { expiresIn: '1h' }
            );
            res.status(200).json({
                message: 'Login successful',
                token,
                user: {
                    id: user._id,
                    name: user.username,
                    email: user.email,
                    rols: [user.role]
                }
            });
        }
        catch (err) {
            next(err);
        }
    }

    async getAll(_req: Request, res: Response, next: NextFunction) {
        try {
            const users = await this.service.getAll();
            res.json(users);
        } catch (err) {
            next(err);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            if (!id) return next(new BadRequest('ID is required'));
            const user = await this.service.getById(id);
            if (!user) return next(new NotFound('User not found'));

            res.json(user);
        } catch (e) {
            next(e);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            if (!id) return next(new BadRequest('ID is required'));

            const { username, email, password, role } = req.body;

            const patch: Partial<IUser> = {};

            if (username) patch.username = username;
            if (email) patch.email = email;
            if (role) patch.role = role;
            if (password) patch.password = await bcrypt.hash(password, 10);

            const updatedUser = await this.service.update(id, patch);
            res.json(updatedUser);
        } catch (e) {
            next(e);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            if (!id) return next(new BadRequest('ID is required'));

            const deletedUser = await this.service.delete(id);
            if (!deletedUser) return next(new NotFound('User not found'));

            res.json({
                message: 'User deleted successfully',
                user: deletedUser
            });
        } catch (e) {
            next(e);
        }
    }
}


export default new UserController();