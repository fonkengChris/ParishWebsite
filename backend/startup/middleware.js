import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { httpLogger } from '../middleware/requestLogger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const setupMiddleware = (app) => {
  // Request logging middleware (pino-http) - should be early in the chain
  app.use(httpLogger);

  // Cookie parser middleware (for refresh tokens)
  app.use(cookieParser());

  // Serve admin-uploaded files (see routes/uploads.js). Cached for a day.
  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'), {
    maxAge: '1d'
  }));

  // Body parser middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
};

