import express from 'express';
import restaurantController from '../controllers/restaurantController.js';
import { authGuard } from '../middlewares/authMiddleware.js';
import { checkAdmin } from "../middlewares/checkAdmin.js";
import { validateRestaurantCreation, validateRestaurantUpdate } from '../middlewares/restaurantInputValidation.js';

const router = express.Router();

// unprotected routes (public)

router.get('/',
    (req, res, next) => restaurantController.getAll(req, res, next));

router.get('/:id',
    (req, res, next) => restaurantController.getById(req, res, next));


// Protected routes (only admin)
// Only admin can create, edit and delete other restaurants

router.post('/', authGuard, checkAdmin, validateRestaurantCreation,
    (req, res, next) => restaurantController.add(req, res, next));

router.put('/:id', authGuard, checkAdmin, validateRestaurantUpdate,
    (req, res, next) => restaurantController.update(req, res, next));

router.delete('/:id', authGuard, checkAdmin,
    (req, res, next) => restaurantController.delete(req, res, next));

export default router;