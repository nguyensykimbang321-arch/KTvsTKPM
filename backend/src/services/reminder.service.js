const cron = require('node-cron');
const { Op } = require('sequelize');
const { Booking, Notification, Service } = require('../models');
const dayjs = require('dayjs');

// Quét lịch hẹn sau mỗi 5 phút
const initReminderCron = () => {
  console.log('⏰ Cron Job nhắc lịch đã được khởi tạo (5 phút/lần)');
  
  cron.schedule('*/5 * * * *', async () => {
    try {
      const now = dayjs();
      const oneHourLater = now.add(1, 'hour');

      // Tìm các lịch hẹn "confirmed" diễn ra trong 1 giờ tới
      const upcomingBookings = await Booking.findAll({
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
        // Kiểm tra xem đã gửi nhắc nhở cho lịch này chưa
        const existingReminder = await Notification.findOne({
          where: {
            bookingId: booking.id,
            type: 'reminder'
          }
        });

        if (!existingReminder) {
          await Notification.create({
            userId: booking.customerId,
            bookingId: booking.id,
            title: '⏰ Nhắc nhở lịch hẹn sắp diễn out',
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
};

// Tự động hủy lịch hẹn nếu đến giờ mà chưa được confirm (chạy mỗi phút)
const initAutoCancelCron = () => {
  console.log('⏰ Cron Job tự động hủy lịch quá hạn đã được khởi tạo (1 phút/lần)');
  
  cron.schedule('* * * * *', async () => {
    try {
      const now = dayjs();
      // Lấy danh sách booking đang chờ (pending/draft) mà đã quá giờ bắt đầu
      const overdueBookings = await Booking.findAll({
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
          // Cập nhật trạng thái sang cancelled
          await booking.update({
            status: 'cancelled',
            cancelReason: 'Hệ thống tự động hủy do quá giờ bắt đầu mà chưa được xác nhận.',
            cancelledAt: new Date()
          });

          // Tạo thông báo cho khách hàng
          await Notification.create({
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
};

module.exports = { initReminderCron, initAutoCancelCron };
