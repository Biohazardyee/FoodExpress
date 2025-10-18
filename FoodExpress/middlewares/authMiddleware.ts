import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Unauthorized } from '../utils/errors.js';

const JWT_SECRET = process.env.JWT_SECRET || '';

export function authGuard(req: Request, _res: Response, next: NextFunction) {
    const authHeader = req.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new Unauthorized('Authorization header manquant ou invalide'));
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return next(new Unauthorized('Missing token'));
    }
    try {
        (req as any).user = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        return next(new Unauthorized('Expired or invalid token'));
    }
}
