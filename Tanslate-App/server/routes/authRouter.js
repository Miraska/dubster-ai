import { Router } from 'express';
import { check } from 'express-validator';
import authController from '../controllers/authController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = new Router();

router.post("/check-validation-token", authMiddleware, authController.checkValidation);
router.post('/registration', [
    check('username', 'Имя пользователя не может быть пустым').notEmpty(),
    check('password', 'Пароль должен быть больше 4 символов').isLength({ min: 4 })
], authController.registration);
router.post('/login', authController.login);

export default router;
