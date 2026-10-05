const app = require('./src/app');
const env = require('./src/config/env');

const PORT = env.PORT;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log('====================================================');
    console.log(`🚀 Backend Café Lobo (CQRS) corriendo en http://localhost:${PORT}`);
    console.log(`📋 Healthcheck: http://localhost:${PORT}/api/health`);
    console.log(`🏛️ Arquitectura: CQRS Pura (Commands & Queries segregados)`);
    console.log('====================================================');
  });
}

module.exports = app;
