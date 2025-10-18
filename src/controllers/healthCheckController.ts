import { Request, Response } from 'express';
import mongoose from 'mongoose';

/**
 * @desc    Basic health check endpoint
 * @route   GET /api/health
 * @access  Public
 */
export const basicHealthCheck = (req: Request, res: Response) => {
    res.status(200).json({
        status: 'success',
        message: 'Server is up and running',
        timestamp: new Date().toISOString(),
    });
};

/**
 * @desc    Database health check endpoint
 * @route   GET /api/health/db
 * @access  Public
 */
export const dbHealthCheck = async (req: Request, res: Response) => {
    try {
        // Get the raw mongoose connection
        const connection = mongoose.connection;

        // Check if MongoDB is connected
        if (connection.readyState === 1) {
            // Optionally, you can run a test query to verify the database is responsive
            // For example, count the number of collections
            const collections = await connection.db.listCollections().toArray();

            res.status(200).json({
                status: 'success',
                message: 'Database connection is healthy',
                dbState: {
                    dbName: connection.name,
                    dbHost: connection.host,
                    dbPort: connection.port,
                    dbUser: connection.user,
                    dbVersion: (await connection.db.command({ serverStatus: 1 })).version,
                    collections: collections.map(c => c.name),
                    uptime: process.uptime(),
                },
                timestamp: new Date().toISOString(),
            });
        } else {
            res.status(503).json({
                status: 'error',
                message: 'Database is not connected',
                dbState: {
                    readyState: connection.readyState,
                    dbState: mongoose.STATES[connection.readyState],
                },
                timestamp: new Date().toISOString(),
            });
        }
    } catch (error: any) {
        res.status(500).json({
            status: 'error',
            message: 'Database health check failed',
            error: error.message,
            timestamp: new Date().toISOString(),
        });
    }
};
