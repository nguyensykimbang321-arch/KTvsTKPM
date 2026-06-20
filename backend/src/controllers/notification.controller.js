const notificationRepository = require('../repositories/notification.repository');

class NotificationController {
  async getMyNotifications(req, res, next) {
    try {
      const userId = req.user.id;
      const notifications = await notificationRepository.findByUser(userId);
      res.json(notifications);
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req, res, next) {
    try {
      const userId = req.user.id;
      await notificationRepository.markAllAsRead(userId);
      res.json({ message: 'Đã đánh dấu tất cả thông báo là đã đọc' });
    } catch (error) {
      next(error);
    }
  }

  async deleteAllNotifications(req, res, next) {
    try {
      const userId = req.user.id;
      await notificationRepository.deleteAll(userId);
      res.json({ message: 'Đã xóa tất cả thông báo' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();
