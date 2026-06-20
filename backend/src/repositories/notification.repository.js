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

  async markAllAsRead(userId) {
    return await this.model.update(
      { isRead: true },
      { where: { userId } }
    );
  }

  async deleteAll(userId) {
    return await this.model.destroy({
      where: { userId }
    });
  }
}

module.exports = new NotificationRepository();

