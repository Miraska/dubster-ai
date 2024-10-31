const { Router } = require('express');
const { check } = require('express-validator');
const authController = require('../controllers/authController.js');
const authMiddleware = require('../middlewares/authMiddleware.js');

const router = new Router();

router.post("/check-validation-token", authMiddleware, authController.checkValidation);
router.post('/registration', [
    check('username', 'Имя пользователя не может быть пустым').notEmpty(),
    check('password', 'Пароль должен быть больше 4 символов').isLength({ min: 4 })
], authController.registration);
router.post('/login', authController.login);

module.exports = router;
