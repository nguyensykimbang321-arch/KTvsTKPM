const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');

class AuthService {
  async register(userData) {
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('Email đã được sử dụng');
    }
    return await userRepository.create(userData);
  }

  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user || !user.isActive) {
      throw new Error('Tài khoản không tồn tại hoặc bị khóa');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Mật khẩu không chính xác');
    }

    const token = this._generateToken(user);
    return { user, token };
  }

  _generateToken(user) {
    return jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }
}

module.exports = new AuthService();
