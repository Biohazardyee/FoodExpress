import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { connectDB } from "./config/database.js";

import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';
import { ApiError, InternalError } from './utils/errors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// front-end routes
app.use('/', indexRouter);

// back-end routes
app.use('/api/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

const PORT = 3000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
    });
});

// error handler
app.use(function(err: any, _req: any, res: any, _next: any) {
    let status = 500;
    let message = 'Internal Server Error';

    if (err instanceof ApiError) {
        status = err.status;
        message = err.message;
    } else if (err instanceof SyntaxError) {
        status = 400;
        message = 'Invalid JSON payload';
    } else {
        err = new InternalError();
    }

    res.status(status)
        .json({
            error: status,
            message
        });
});

export default app;