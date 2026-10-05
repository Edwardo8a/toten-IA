const bcrypt = require('bcryptjs');
const env = require('../../../../config/env');
const { signToken } = require('../../../../config/jwt');
const ValidationError = require('../../../../core/errors/ValidationError');
const AppError = require('../../../../core/errors/AppError');

class LoginCommandHandler {
  async execute(command) {
    const { username, password } = command;

    if (!username || !password) {
      throw new ValidationError('Usuario y contraseña requeridos.');
    }

    if (username !== env.ADMIN_USER) {
      throw new AppError('Credenciales inválidas.', 401);
    }

    if (!env.ADMIN_PASSWORD_HASH) {
      throw new AppError('ADMIN_PASSWORD_HASH no configurado en el servidor.', 500);
    }

    const esValida = await bcrypt.compare(password, env.ADMIN_PASSWORD_HASH);
    if (!esValida) {
      throw new AppError('Credenciales inválidas.', 401);
    }

    const payload = {
      username: env.ADMIN_USER,
      role: 'admin'
    };

    const token = signToken(payload);

    return {
      token,
      token_type: 'Bearer',
      expires_in: env.JWT_EXPIRES_IN,
      user: payload
    };
  }
}

module.exports = LoginCommandHandler;
