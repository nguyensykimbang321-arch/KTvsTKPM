const BaseRepository = require('./base.repository');
const { User } = require('../models');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return await this.model.findOne({ where: { email } });
  }

  async findActiveStaff() {
    return await this.model.findAll({
      where: { role: 'staff', isActive: true },
      attributes: ['id', 'fullName', 'email', 'phone']
    });
  }
}

module.exports = new UserRepository();
