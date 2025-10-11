import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { ErrorWithStatus } from './errorHandler';

interface JwtPayload {
    id: string;
}

// Protect routes
const protect = async (req: any, res: Response, next: NextFunction) => {
    try {
        let token;

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            // Set token from Bearer token in header
            token = req.headers.authorization.split(' ')[1];
        }

        // Make sure token exists
        if (!token) {
            return next(new Error('Not authorized to access this route'));
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

        req.user = await User.findById(decoded.id).select('-password');

        next();
    } catch (err) {
        return next(new Error('Not authorized to access this route'));
    }
};

// Grant access to specific roles
const authorize = (...roles: string[]) => {
    return (req: any, res: Response, next: NextFunction) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new Error(
                    `User role ${req.user.role} is not authorized to access this route`
                )
            );
        }
        next();
    };
};

export { protect, authorize };