import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

// Security headers (e.g. disables x-powered-by, sets sane defaults).
app.use(helmet());

// Only allow the frontend's origin to call this API with credentials.
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// Request logging. "dev" format is concise and colorized for local work.
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Parse incoming JSON/urlencoded bodies into req.body.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple endpoint to confirm the server is alive, used before the DB
// connection (Phase 3) and by anyone deploying/checking the service.
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is healthy',
    data: { timestamp: new Date().toISOString() },
  });
});

// Feature routes will be mounted here in later phases, e.g.:
// app.use('/api/auth', authRoutes);

// Must stay last: unmatched routes -> 404, then all errors -> errorHandler.
app.use(notFound);
app.use(errorHandler);

export default app;
