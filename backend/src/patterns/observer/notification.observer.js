const Observer = require('./observer');
const notificationRepository = require('../../repositories/notification.repository');

class NotificationObserver extends Observer {
  async update(event, data) {
    const { booking, customer, staff, payment } = data;
    
    const notificationMap = {
      'booking_created': {
        userId: staff.id,
        title: 'Lịch hẹn mới',
        message: `Khách hàng ${customer.fullName} vừa đặt dịch vụ #${booking.id}`,
        type: 'booking_created'
      },
      'booking_confirmed': {
        userId: customer.id,
        title: 'Lịch hẹn được xác nhận',
        message: `Lịch hẹn #${booking.id} của bạn đã được nhân viên ${staff.fullName} xác nhận`,
        type: 'booking_confirmed'
      },
      'payment_success': {
        userId: customer?.id,
        title: 'Thanh toán thành công',
        message: `Thanh toán cho booking #${booking?.id} đã thành công. Số tiền: ${payment?.amount || '0'} VNĐ`,
        type: 'payment_success'
      },
      'booking_cancelled': {
        userId: staff.id,
        title: 'Lịch hẹn đã bị hủy',
        message: `Khách hàng ${customer.fullName} đã hủy lịch hẹn #${booking.id}`,
        type: 'booking_cancelled'
      }
    };

    const config = notificationMap[event];
    if (config) {
      await notificationRepository.create({
        ...config,
        bookingId: booking.id
      });
    }
  }
}

module.exports = NotificationObserver;
