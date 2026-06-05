const cron = require('node-cron');
const { Op } = require('sequelize');
const dayjs = require('dayjs');
const bookingRepository = require('../repositories/booking.repository');
const notificationRepository = require('../repositories/notification.repository');
const BookingContext = require('../patterns/state/booking.context');
const Subject = require('../patterns/observer/subject');
const LoggingObserver = require('../patterns/observer/logging.observer');
const { Service } = require('../models');

// ReminderService kế thừa Subject (Observer Pattern) để phát sự kiện khi có hành động tự động
class ReminderService extends Subject {
  constructor() {
    super();
    this.attach(new LoggingObserver());
  }

  // Quét lịch hẹn sau mỗi 5 phút
  initReminderCron() {
    console.log('⏰ Cron Job nhắc lịch đã được khởi tạo (5 phút/lần)');
    
    cron.schedule('*/5 * * * *', async () => {
      try {
        const now = dayjs();
        const oneHourLater = now.add(1, 'hour');

        // Repository Pattern: Truy xuất Booking qua Repository
        const upcomingBookings = await bookingRepository.findAll({
          where: {
            status: 'confirmed',
            bookingDate: now.format('YYYY-MM-DD'),
            startTime: {
              [Op.between]: [now.format('HH:mm:ss'), oneHourLater.format('HH:mm:ss')]
            }
          },
          include: [{ model: Service }]
        });

        console.log(`🔍 Cron: Đang quét lịch nhắc... Tìm thấy ${upcomingBookings.length} lịch sắp tới.`);

        for (const booking of upcomingBookings) {
          // Repository Pattern: Kiểm tra thông qua NotificationRepository
          const existingReminder = await notificationRepository.findOne({
            where: {
              bookingId: booking.id,
              type: 'reminder'
            }
          });

          if (!existingReminder) {
            // Repository Pattern: Tạo Notification qua Repository
            await notificationRepository.create({
              userId: booking.customerId,
              bookingId: booking.id,
              title: '⏰ Nhắc nhở lịch hẹn sắp diễn ra',
              message: `Lịch hẹn dịch vụ "${booking.Service?.name || 'Làm đẹp'}" của bạn sẽ bắt đầu lúc ${booking.startTime.substring(0, 5)}. Đừng quên bạn nhé!`,
              type: 'reminder'
            });
            console.log(`✅ Đã tạo nhắc nhở cho Booking ID: ${booking.id}`);
          }
        }
      } catch (error) {
        console.error('❌ Lỗi chạy Cron Job nhắc lịch:', error);
      }
    });
  }

  // Tự động hủy lịch hẹn nếu đến giờ mà chưa được confirm (chạy mỗi phút)
  initAutoCancelCron() {
    console.log('⏰ Cron Job tự động hủy lịch quá hạn đã được khởi tạo (1 phút/lần)');
    
    cron.schedule('* * * * *', async () => {
      try {
        const now = dayjs();
        // Repository Pattern: Lấy danh sách booking quá hạn qua Repository
        const overdueBookings = await bookingRepository.findAll({
          where: {
            status: { [Op.in]: ['pending', 'draft'] },
            [Op.or]: [
              { bookingDate: { [Op.lt]: now.format('YYYY-MM-DD') } },
              { 
                bookingDate: now.format('YYYY-MM-DD'),
                startTime: { [Op.lte]: now.format('HH:mm:ss') }
              }
            ]
          },
          include: [{ model: Service }]
        });

        if (overdueBookings.length > 0) {
          console.log(`🧹 Cron: Phát hiện ${overdueBookings.length} lịch hẹn quá hạn chưa xác nhận. Đang tiến hành hủy...`);
          
          for (const booking of overdueBookings) {
            // State Pattern: Chuyển trạng thái qua BookingContext
            const context = new BookingContext(booking, bookingRepository);
            await context.cancel();

            // Cập nhật thông tin hủy qua Repository
            await bookingRepository.update(booking.id, {
              cancelReason: 'Hệ thống tự động hủy do quá giờ bắt đầu mà chưa được xác nhận.',
              cancelledAt: new Date()
            });

            // Repository Pattern: Tạo thông báo qua NotificationRepository
            await notificationRepository.create({
              userId: booking.customerId,
              bookingId: booking.id,
              title: '❌ Lịch hẹn đã bị hủy tự động',
              message: `Lịch hẹn dịch vụ "${booking.Service?.name}" lúc ${booking.startTime.substring(0, 5)} ngày ${booking.bookingDate} đã bị hủy do quá giờ xác nhận.`,
              type: 'alert'
            });

            console.log(`✅ Đã tự động hủy Booking ID: ${booking.id}`);
          }
        }
      } catch (error) {
        console.error('❌ Lỗi chạy Cron Job tự động hủy lịch:', error);
      }
    });
  }
}

const reminderService = new ReminderService();

module.exports = { 
  initReminderCron: () => reminderService.initReminderCron(), 
  initAutoCancelCron: () => reminderService.initAutoCancelCron() 
};
