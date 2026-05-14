const authService = require('../services/auth.service');

class AuthController {
  async register(req, res, next) {
    try {
      const user = await authService.register(req.body);
      res.status(201).json({ message: 'Đăng ký tài khoản thành công', data: user });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json({ message: 'Đăng nhập thành công', ...result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
