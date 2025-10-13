import express from 'express';
import userController from '../controllers/userController.js';
import { authGuard } from '../middlewares/authMiddleware.js';
import { checkAdminOrSelf } from "../middlewares/checkAdminOrSelf.js";
import { checkAdmin } from "../middlewares/checkAdmin.js";
import { validateUserRegistration, validateUserLogin, validateUserUpdate } from '../middlewares/userValidation.js';

const router = express.Router();

// unprotected routes (public)

router.post('/login',
    validateUserLogin,
    (req, res, next) => userController.login(req, res, next));

router.post('/',
    validateUserRegistration,
    (req, res, next) => userController.add(req, res, next));

// Protected routes (user and admin)
// Regular users can delete only their own profile
// Admin can delete any profile

router.delete('/:id', authGuard, checkAdminOrSelf,
    (req, res, next) => userController.delete(req, res, next));

// Regular users can update only their own profile
// Admin can update any profile

router.put('/:id', authGuard, checkAdminOrSelf,
    validateUserUpdate,
    (req, res, next) => userController.update(req, res, next));

// Protected routes (only admin)
// Only admin can see other users

router.get('/', authGuard, checkAdmin,
    (req, res, next) => userController.getAll(req, res, next));

router.get('/:id', authGuard, checkAdmin,
    (req, res, next) => userController.getById(req, res, next));

export default router;