import express from 'express';
import menuController from '../controllers/menuController.js';
import { authGuard } from '../middlewares/authMiddleware.js';
import { checkAdmin } from '../middlewares/checkAdmin.js';

const router = express.Router();

// Public routes (read)
router.get('/', (req, res, next) => menuController.getAll(req, res, next));
router.get('/:id', (req, res, next) => menuController.getById(req, res, next));

// Admin-only routes
router.post('/', authGuard, checkAdmin, (req, res, next) => menuController.add(req, res, next));
router.put('/:id', authGuard, checkAdmin, (req, res, next) => menuController.update(req, res, next));
router.delete('/:id', authGuard, checkAdmin, (req, res, next) => menuController.delete(req, res, next));

export default router;

