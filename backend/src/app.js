import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';
import { env } from './config/env.js';
import apiRouter from './routes/index.js';
import { notFound, errorHandler } from './middlewares/errorHandler.js';

const app = express();
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const openApiDocument = YAML.parse(
  readFileSync(path.resolve(currentDirectory, '../../openapi.yaml'), 'utf8')
);

 
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()),
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));

 
if (!env.isTest) {
  app.use(morgan(env.isProduction ? 'combined' : 'dev'));
}

 
app.get('/health', (req, res) => res.json({ status: 'ok' }));

 
app.use('/api-docs', (req, res, next) => {
  res.removeHeader('Content-Security-Policy');
  next();
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument, {
  customSiteTitle: 'EventHub API - Swagger',
}));

 
app.use('/api', apiRouter);

 
app.use(notFound);
app.use(errorHandler);

 
export default app;