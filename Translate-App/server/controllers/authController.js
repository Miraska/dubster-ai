const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const User = require('../models/User.js');
const { generateAccessToken } = require('../utils/tokenUtils.js');


class AuthController {
    async registration(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: "Ошибка при регистрации", errors });
        }

        const { username, password } = req.body;
        const candidate = await User.findOne({ username });

        if (candidate) {
            return res.status(400).json({ message: "Пользователь уже существует" });
        }

        const hashPassword = bcrypt.hashSync(password, 4);
        const user = new User({ username, password: hashPassword });
        await user.save();
        const token = generateAccessToken(user._id);
        res.json({ token });
    }

    async login(req, res) {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(400).json({ message: "Ошибка аутентификации" });
        }

        const token = generateAccessToken(user._id);
        res.json({ token });
    }

    async checkValidation(req, res) {
        res.status(200).json({ message: "Токен действителен", user: req.user });
    }
}

module.exports = new AuthController();
