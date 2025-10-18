import type { Request, Response, NextFunction } from 'express';
import { Controller } from './controller.js';
import { Unauthorized, BadRequest, NotFound } from '../utils/errors.js';
import userService from '../services/userService.js';
import { IUser } from '../schema/users.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import mongoose from 'mongoose';

dotenv.config();

class UserController extends Controller {
    private readonly service;

    constructor(service = userService) {
        super();
        this.service = service;
    }

    async add(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, username, password, roles } = req.body;

            // Check for existing user
            const existingUserByEmail = await this.service.getByEmail(email);
            if (existingUserByEmail) {
                throw new BadRequest('Email already in use');
            }

            const existingUserByUsername = await this.service.getByUsername(username);
            if (existingUserByUsername) {
                throw new BadRequest('Username already in use');
            }

            const hashedPassword = await bcrypt.hash(password, 10);


            const newUserData: Partial<IUser> = {
                username,
                email,
                password: hashedPassword,
            };

            if (roles) {
                newUserData.roles = roles;
            }

            const createdUser = await this.service.add(newUserData as IUser);

            res.status(201).json({
                message: "Created User Successfully",
                user: createdUser
            });
        }
        catch (err) {
            next(err);
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;

            const user = await this.service.getByEmail(email);
            if (!user) {
                throw new Unauthorized('Invalid email or password');
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new Unauthorized('Invalid email or password');
            }

            const token = jwt.sign(
                { id: user._id, email: user.email, username: user.username, roles: user.roles },
                process.env.JWT_SECRET || 'defaultsecret',
                { expiresIn: '1h' }
            );
            res.status(200).json({
                message: 'Login successful',
                token,
                user: {
                    id: user._id.toString(),
                    name: user.username,
                    email: user.email,
                    roles: user.roles
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

            // Validate ObjectId format
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return next(new BadRequest('Invalid ID format'));
            }

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

            // Validate ObjectId format
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return next(new BadRequest('Invalid ID format'));
            }

            const { username, email, password, roles } = req.body;

            const patch: Partial<IUser> = {};

            if (username) patch.username = username;
            if (email) patch.email = email;
            if (roles) patch.roles = roles;
            if (password) patch.password = await bcrypt.hash(password, 10);

            const updatedUser = await this.service.update(id, patch);

            res.json({
                message: "User Updated successfully",
                user: updatedUser
            });

        } catch (e) {
            next(e);
        }
    }


    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            if (!id) return next(new BadRequest('ID is required'));

            // Validate ObjectId format
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return next(new BadRequest('Invalid ID format'));
            }

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