import { verifyToken } from '../utils/tokenUtils.js';

const authMiddleware = (req, res, next) => {
    console.log(req.headers);
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Токен не найден или неверный формат' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Токен недействителен' });
    }
};

export default authMiddleware;