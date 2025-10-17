import app from './app';
import { config } from 'dotenv';

// Load environment variables
config();

const PORT: number = Number(process.env.PORT) || 3000;

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
