const AppError = require('../errors/AppError');

class CommandBus {
  constructor() {
    this.handlers = new Map();
    this.middlewares = [];
  }

  /**
   * Registra un middleware que intercepta cada comando
   * @param {function} fn - (command, next) => Promise<any>
   */
  use(fn) {
    if (typeof fn === 'function') {
      this.middlewares.push(fn);
    }
    return this;
  }

  /**
   * Registra un handler para un tipo específico de comando
   * @param {string|Function} commandType - Nombre del comando o clase constructora
   * @param {object} handlerInstance - Objeto con método execute(command)
   */
  register(commandType, handlerInstance) {
    const key = typeof commandType === 'function' ? commandType.name : commandType;
    if (!handlerInstance || typeof handlerInstance.execute !== 'function') {
      throw new Error(`Handler para [${key}] debe implementar el método execute(command).`);
    }
    this.handlers.set(key, handlerInstance);
  }

  /**
   * Despacha un comando al handler registrado
   * @param {object} command - Instancia del comando a ejecutar
   * @returns {Promise<any>}
   */
  async dispatch(command) {
    if (!command) {
      throw new AppError('Comando nulo o indefinido recibido en CommandBus.', 400);
    }

    const commandName = command.constructor ? command.constructor.name : command.name;
    const handler = this.handlers.get(commandName);

    if (!handler) {
      throw new AppError(`No existe un CommandHandler registrado para: [${commandName}]`, 500);
    }

    // Ejecución con middlewares
    let index = -1;
    const runMiddleware = async (i) => {
      if (i <= index) throw new Error('next() llamado múltiples veces');
      index = i;
      const fn = this.middlewares[i];
      if (fn) {
        return fn(command, () => runMiddleware(i + 1));
      }
      return handler.execute(command);
    };

    const startTime = Date.now();
    try {
      const result = await runMiddleware(0);
      const elapsed = Date.now() - startTime;
      console.log(`[CommandBus] ⚡ Comando [${commandName}] completado en ${elapsed}ms`);
      return result;
    } catch (err) {
      const elapsed = Date.now() - startTime;
      console.error(`[CommandBus] ❌ Error ejecutando comando [${commandName}] (${elapsed}ms):`, err.message);
      throw err;
    }
  }

  clear() {
    this.handlers.clear();
    this.middlewares = [];
  }
}

module.exports = new CommandBus();
