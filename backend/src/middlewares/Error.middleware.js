import ApiError from "../utils/ApiError.utils.js";

export const globalErrorHandler = (err, req, res, next) => {
    console.log("Error occurred:", err);
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: err.success,
            message: err.message,
            statusCode: err.statusCode,
            error: err.error || null,
        });
    }

    // Handle Mongoose duplicate key error (11000)
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(409).json({
            success: false,
            message: `Duplicate ${field}. This ${field} already exists.`,
            statusCode: 409,
            error: err.message,
        });
    }

    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            statusCode: 400,
            error: errors,
        });
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token',
            statusCode: 401,
            error: err.message,
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired',
            statusCode: 401,
            error: err.message,
        });
    }

    // Generic server error
    return res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        statusCode: 500,
        error: err.message || 'Something went wrong',
    });
};
