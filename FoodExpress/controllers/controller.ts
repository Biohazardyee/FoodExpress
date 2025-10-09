import type { Request, Response, NextFunction } from 'express';

export abstract class Controller {
    abstract getAll(req: Request, res: Response, next: NextFunction): unknown;
    abstract getById(req: Request, res: Response, next: NextFunction): unknown;
    abstract add(req: Request, res: Response, next: NextFunction): unknown;
    abstract update(req: Request, res: Response, next: NextFunction): unknown;
    abstract delete(req: Request, res: Response, next: NextFunction): unknown;
}