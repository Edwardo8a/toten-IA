const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const env = require('./config/env');
const registerBuses = require('./registerBuses');
const errorHandler = require('./middlewares/errorHandler');

// Rutas de módulos
const authRoutes = require('./modules/auth/routes/auth.routes');
const productosRoutes = require('./modules/productos/routes/productos.routes');
const descuentosRoutes = require('./modules/descuentos/routes/descuentos.routes');
const ventasRoutes = require('./modules/ventas/routes/ventas.routes');
const cuponesRoutes = require('./modules/cupones/routes/cupones.routes');
const estadisticasRoutes = require('./modules/estadisticas/routes/estadisticas.routes');

// Inicializar CommandBus y QueryBus
registerBuses();

const app = express();

app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'backend-cafe-lobo-cqrs',
    architecture: 'Pure CQRS (Command Query Responsibility Segregation)',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    env: {
      supabase_configured: Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY),
      loyverse_configured: Boolean(env.LOYVERSE_TOKEN),
      admin_configured: Boolean(env.ADMIN_USER && env.ADMIN_PASSWORD_HASH)
    }
  });
});

// Montar rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/descuentos', descuentosRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api', cuponesRoutes);
app.use('/api/estadisticas', estadisticasRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({
    error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
});

// Manejo centralizado de errores
app.use(errorHandler);

module.exports = app;
