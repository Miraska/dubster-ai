import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import User from '../models/User.js';
import { generateAccessToken } from '../utils/tokenUtils.js';

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

export default new AuthController();