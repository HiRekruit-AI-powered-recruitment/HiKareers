import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();

//Inbuilt Middleware
const allowedOrigins = [
  process.env.CORS_ORIGIN,
  'http://localhost:5173',
  'http://localhost:5174',
  'https://careers.hirekruit.com',
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());

//Import routes
import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import applicationRouter from './routes/application.routes.js';
import verificationRouter from './routes/verification.routes.js';
import jobRouter from './routes/job.routes.js';

app.use('/v1/verification', verificationRouter);
app.use('/v1/auth', authRouter);
app.use('/v1/user', userRouter);
app.use('/v1/application', applicationRouter);
app.use('/v1/jobs', jobRouter);

//Import Custom Middlewares
import { globalErrorHandler } from './middlewares/Error.middleware.js';
app.use(globalErrorHandler);

export default app;
