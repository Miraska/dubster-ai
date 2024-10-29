import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/config.js';

export const generateAccessToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: "24h", algorithm: "HS256" });
export const verifyToken = (token) => jwt.verify(token, JWT_SECRET);
