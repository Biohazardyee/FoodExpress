import { Request, Response, NextFunction } from 'express';
import { Unauthorized, BadRequest, Forbidden } from '../utils/errors.js';

export function checkAdmin(req: Request, res: Response, next: NextFunction) {
    try {
        // req.user set by auth middleware; cast to any to satisfy ts in tests
        const loggedUser = (req as any).user;

        if (!loggedUser) {
            throw new BadRequest("Utilisateur non authentifié");
        }

        const isAdmin = loggedUser.roles?.includes('admin');

        if (!isAdmin) {
            throw new Forbidden("Accès refusé : réservé aux administrateurs");
        }

        next();
    } catch (err) {
        next(err);
    }
}
