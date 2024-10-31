const express = require('express');
const cors = require('cors');
const authRouter = require('./routes/authRouter.js');
const videoRouter = require('./routes/videoRouter.js');


const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/videos', videoRouter);
app.use('/', videoRouter);

module.exports = app;

