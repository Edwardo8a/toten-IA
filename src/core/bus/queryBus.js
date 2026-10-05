const AppError = require('../errors/AppError');

class QueryBus {
  constructor() {
    this.handlers = new Map();
    this.middlewares = [];
  }

  /**
   * Registra un middleware que intercepta cada query (ej. logging, caching)
   * @param {function} fn - (query, next) => Promise<any>
   */
  use(fn) {
    if (typeof fn === 'function') {
      this.middlewares.push(fn);
    }
    return this;
  }

  /**
   * Registra un handler para un tipo específico de query
   * @param {string|Function} queryType - Nombre de la query o clase constructora
   * @param {object} handlerInstance - Objeto con método execute(query)
   */
  register(queryType, handlerInstance) {
    const key = typeof queryType === 'function' ? queryType.name : queryType;
    if (!handlerInstance || typeof handlerInstance.execute !== 'function') {
      throw new Error(`Handler para [${key}] debe implementar el método execute(query).`);
    }
    this.handlers.set(key, handlerInstance);
  }

  /**
   * Ejecuta una consulta de solo lectura
   * @param {object} query - Instancia de la query
   * @returns {Promise<any>}
   */
  async execute(query) {
    if (!query) {
      throw new AppError('Query nula o indefinida recibida en QueryBus.', 400);
    }

    const queryName = query.constructor ? query.constructor.name : query.name;
    const handler = this.handlers.get(queryName);

    if (!handler) {
      throw new AppError(`No existe un QueryHandler registrado para: [${queryName}]`, 500);
    }

    // Ejecución con middlewares
    let index = -1;
    const runMiddleware = async (i) => {
      if (i <= index) throw new Error('next() llamado múltiples veces');
      index = i;
      const fn = this.middlewares[i];
      if (fn) {
        return fn(query, () => runMiddleware(i + 1));
      }
      return handler.execute(query);
    };

    const startTime = Date.now();
    try {
      const result = await runMiddleware(0);
      const elapsed = Date.now() - startTime;
      console.log(`[QueryBus] 🔍 Query [${queryName}] resuelta en ${elapsed}ms`);
      return result;
    } catch (err) {
      const elapsed = Date.now() - startTime;
      console.error(`[QueryBus] ❌ Error ejecutando query [${queryName}] (${elapsed}ms):`, err.message);
      throw err;
    }
  }

  clear() {
    this.handlers.clear();
    this.middlewares = [];
  }
}

module.exports = new QueryBus();
