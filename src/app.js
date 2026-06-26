import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import apiRoutes from './routes/api.js';

const app = express();

// Configuración de CORS flexible para producción
app.use(cors({
  origin: '*', // Permite peticiones desde cualquier origen. En producción podrías especificar tu dominio de frontend.
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Security
app.use(helmet({
  crossOriginResourcePolicy: false, // Necesario para cargar recursos de otros dominios si fuera el caso
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Performance
app.use(compression());
app.use(morgan('dev'));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Aumentado para evitar bloqueos accidentales en desarrollo/pruebas
  message: { error: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo más tarde.' }
});
app.use('/api/', limiter);

// Routes
app.use('/api', apiRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal en el servidor.' });
});

export default app;
