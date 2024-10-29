import express from 'express';
import cors from 'cors';
import authRouter from './routes/authRouter.js';
import videoRouter from './routes/videoRouter.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/videos', videoRouter);
app.use('/', videoRouter);

export default app;
