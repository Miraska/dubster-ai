const mongoose = require('mongoose');
const { MONGO_URI, SERVER_PORT } = require('./config/config.js');
const app = require('./app.js');

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('База данных подключена');
        app.listen(SERVER_PORT, () => {
            console.log(`Сервер запущен на http://localhost:${SERVER_PORT}`);
        });
    })
    .catch((err) => console.error('Ошибка подключения к БД', err));
