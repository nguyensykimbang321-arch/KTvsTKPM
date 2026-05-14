const BaseRepository = require('./base.repository');
const { Notification } = require('../models');

class NotificationRepository extends BaseRepository {
  constructor() {
    super(Notification);
  }

  async findByUser(userId) {
    return await this.model.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
  }
}

module.exports = new NotificationRepository();
