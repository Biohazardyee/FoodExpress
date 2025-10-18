import { Request, Response, NextFunction } from 'express';
import { BadRequest, Forbidden } from '../utils/errors.js';

export function checkAdmin(req: Request, res: Response, next: NextFunction) {
    try {

        const loggedUser = (req as any).user;

        if (!loggedUser) {
            throw new BadRequest("User not authenticated");
        }

        const isAdmin = loggedUser.roles?.includes('admin');

        if (!isAdmin) {
            throw new Forbidden("Access denied: admin only");
        }

        next();
    } catch (err) {
        next(err);
    }
}
