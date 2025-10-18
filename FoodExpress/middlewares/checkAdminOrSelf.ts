import { Request, Response, NextFunction } from 'express';
import { BadRequest, Forbidden } from '../utils/errors.js';

export function checkAdminOrSelf(req: Request, res: Response, next: NextFunction) {
    try {
        // req.user is injected by auth middleware; cast to any to satisfy TS here
        const loggedUser = (req as any).user;
        if (!loggedUser) {
            throw new BadRequest("Utilisateur non authentifié");
        }

        const targetUserId = req.params.id;
        const isAdmin = loggedUser.roles?.includes('admin');

        if (isAdmin || loggedUser.id === targetUserId) {
            return next();
        }

        throw new Forbidden("Accès refusé : réservé à l'utilisateur ou à un admin");

    } catch (err) {
        next(err);
    }
}
