import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';

import routes from './routes';
import { connectDB } from './config/dataBase';
import { errorHandler } from './middlewares/errorHandler';

// Load environment variables
config();

// Initialize Express
const app: Application = express();

// Connect to Database
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(helmet());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Cors
app.use(
  cors({
    origin: '*',
  })
);

// API Documentation
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'MIR Flashcard API Documentation',
  })
);

// API Routes
app.use('/api', routes);
app.use('/api/assignatures', routes);
app.use('/api/auth', routes);
app.use('/api/users', routes);
app.use('/api/flashcards', routes);
// app.use('/api/decks', routes);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
  });
});

// Error handling middleware
app.use(errorHandler);

export default app;
