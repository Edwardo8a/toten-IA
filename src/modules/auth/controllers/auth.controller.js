const commandBus = require('../../../core/bus/commandBus');
const LoginCommand = require('../commands/LoginCommand');

class AuthController {
  async login(req, res, next) {
    try {
      const { username, password } = req.body;
      const result = await commandBus.dispatch(new LoginCommand(username, password));
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async me(req, res) {
    return res.json({
      user: req.user
    });
  }
}

module.exports = new AuthController();
