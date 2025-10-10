import { Request, Response, NextFunction } from 'express';
import { Unauthorized, BadRequest } from '../utils/errors.js';

export function checkAdminOrSelf(req: Request, res: Response, next: NextFunction) {
    try {
        const loggedUser = req.user;
        if (!loggedUser) {
            throw new BadRequest("Utilisateur non authentifié");
        }

        const targetUserId = req.params.id;
        const isAdmin = loggedUser.roles?.includes('admin');

        if (isAdmin || loggedUser.id === targetUserId) {
            return next();
        }

        throw new Unauthorized("Accès refusé : réservé à l'utilisateur ou à un admin");

    } catch (err) {
        next(err);
    }
}
