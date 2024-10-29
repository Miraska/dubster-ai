import mongoose from 'mongoose';
import { MONGO_URI, SERVER_PORT } from './config/config.js';
import app from './app.js';

mongoose.connect(MONGO_URI).then(() => {
        console.log('База данных подключена');
        app.listen(SERVER_PORT, () => {
            console.log(`Сервер запущен на http://localhost:${SERVER_PORT}`);
        });
    })
    .catch((err) => console.error('Ошибка подключения к БД', err));
