import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();

//Inbuilt Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"))
app.use(cookieParser())

//Import routes
import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import applicationRouter from './routes/application.routes.js';

app.use("/v1/auth", authRouter)
app.use("/v1/user", userRouter)
app.use("/v1/application", applicationRouter)



//Import Custom Middlewares
import { globalErrorHandler } from './middlewares/Error.middleware.js';
app.use(globalErrorHandler);

export default app