import express from 'express';
import userController from '../controllers/userController.js';
import { authGuard } from '../middlewares/authMiddleware.js';

const router = express.Router();

// unprotected routes (public)

router.post('/login', (req, res, next) => userController.login(req, res, next));

router.post('/', (req, res, next) => userController.add(req, res, next));


// Protected routes (user and admin)
// Regular users can delete only their own profile
// Admin can delete any profile

router.delete('/:id', (req, res, next) => userController.delete(req, res, next));

// Regular users can update only their own profile
// Admin can update any profile

router.put('/:id', (req, res, next) => userController.update(req, res, next));


// Protected routes (only admin)
// Only admin can see other users

router.get('/', (req, res, next) => userController.getAll(req, res, next));

router.get('/:id', (req, res, next) => userController.getById(req, res, next));




export default router;