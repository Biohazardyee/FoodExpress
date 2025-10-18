import { Request, Response, NextFunction } from 'express';
import { BadRequest, Forbidden } from '../utils/errors.js';

export function checkAdminOrSelf(req: Request, res: Response, next: NextFunction) {
    try {
        // req.user is injected by auth middleware; cast to any to satisfy TS here
        const loggedUser = (req as any).user;
        if (!loggedUser) {
            throw new BadRequest("User not authenticated");
        }

        const targetUserId = req.params.id;
        const isAdmin = loggedUser.roles?.includes('admin');

        if (isAdmin || loggedUser.id === targetUserId) {
            return next();
        }

        throw new Forbidden("Access denied: admin or self only");

    } catch (err) {
        next(err);
    }
}
