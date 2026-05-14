const Observer = require('./observer');

class LoggingObserver extends Observer {
  async update(event, data) {
    const { booking, customer, staff, refundAmount, refundPercentage, payment } = data;
    
    const eventLogs = {
      'booking_created': {
        timestamp: new Date().toISOString(),
        event: 'BOOKING_CREATED',
        details: `Khách hàng ${customer?.fullName} (ID: ${customer?.id}) đã đặt dịch vụ #${booking.id}`,
        bookingId: booking.id,
        customerId: customer?.id,
        staffId: staff?.id,
        status: 'success'
      },
      'booking_confirmed': {
        timestamp: new Date().toISOString(),
        event: 'BOOKING_CONFIRMED',
        details: `Nhân viên ${staff?.fullName} xác nhận lịch hẹn #${booking.id}`,
        bookingId: booking.id,
        customerId: customer?.id,
        staffId: staff?.id,
        status: 'success'
      },
      'booking_completed': {
        timestamp: new Date().toISOString(),
        event: 'BOOKING_COMPLETED',
        details: `Lịch hẹn #${booking.id} đã hoàn thành với khách ${customer?.fullName}`,
        bookingId: booking.id,
        customerId: customer?.id,
        staffId: staff?.id,
        status: 'success'
      },
      'booking_cancelled': {
        timestamp: new Date().toISOString(),
        event: 'BOOKING_CANCELLED',
        details: `Lịch hẹn #${booking.id} bị hủy. Lý do: ${booking.cancelReason || 'N/A'}`,
        bookingId: booking.id,
        customerId: customer?.id,
        staffId: staff?.id,
        status: 'cancelled'
      },
      'booking_refunded': {
        timestamp: new Date().toISOString(),
        event: 'BOOKING_REFUNDED',
        details: `Hoàn tiền ${refundPercentage}% = ${refundAmount} VNĐ cho booking #${booking.id}`,
        bookingId: booking.id,
        customerId: customer?.id,
        staffId: staff?.id,
        refundAmount,
        refundPercentage,
        status: 'refunded'
      },
      'payment_success': {
        timestamp: new Date().toISOString(),
        event: 'PAYMENT_SUCCESS',
        details: `Thanh toán thành công cho booking #${booking?.id}. Số tiền: ${payment?.amount} VNĐ. Phương thức: ${payment?.method}`,
        bookingId: booking?.id,
        customerId: customer?.id,
        paymentMethod: payment?.method,
        amount: payment?.amount,
        status: 'success'
      }
    };

    const logEntry = eventLogs[event];
    if (logEntry) {
      // In log ra console
      console.log(
        `\n📋 [${logEntry.timestamp}] ${logEntry.event}\n` +
        `   ${logEntry.details}\n` +
        (logEntry.bookingId ? `   Booking ID: ${logEntry.bookingId}\n` : '') +
        (logEntry.customerId ? `   Customer ID: ${logEntry.customerId}\n` : '') +
        (logEntry.staffId ? `   Staff ID: ${logEntry.staffId}\n` : '') +
        (logEntry.refundPercentage ? `   Refund: ${logEntry.refundPercentage}% = ${logEntry.refundAmount} VNĐ\n` : '') +
        '---'
      );

      // TODO: Có thể lưu vào database hoặc logging service khác
      // await loggingService.save(logEntry);
    }
  }
}

module.exports = LoggingObserver;
