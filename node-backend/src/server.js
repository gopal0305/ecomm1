import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createPool } from './db/pool.js';
import { createJwtAuthMiddleware } from './middleware/jwtAuth.js';
import { registerRoutes } from './routes/index.js';
import fs from 'node:fs';
import path from 'node:path';

dotenv.config();

const app = express();
app.use(express.json());

const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:4000')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true,
  })
);

// DB
const pool = createPool({
  connectionString: process.env.DATABASE_URL,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  database: process.env.DB_NAME || 'ecomm',
});

// Ensure DB schema exists? (we rely on init-db script)

// JWT
const jwtAuth = createJwtAuthMiddleware({
  secret: process.env.JWT_SECRET || 'change-this-secret-to-a-long-random-string',
  issuer: process.env.JWT_ISSUER || 'ecomm',
});

app.get('/health', (_req, res) => res.json({ ok: true }));

registerRoutes({ app, pool, jwtAuth });

// generic error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err?.statusCode || 500;
  const message = err?.message || 'Internal Server Error';
  res.status(status).json({ message });
});

const port = process.env.PORT ? Number(process.env.PORT) : 8080;
app.listen(port, () => {
  console.log(`Node backend listening on :${port}`);
});

