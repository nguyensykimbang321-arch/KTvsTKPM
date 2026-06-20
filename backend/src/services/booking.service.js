const { Op } = require('sequelize');
const bookingRepository = require('../repositories/booking.repository');
const userRepository = require('../repositories/user.repository');
const serviceRepository = require('../repositories/service.repository');
const paymentRepository = require('../repositories/payment.repository');
const BookingContext = require('../patterns/state/booking.context');
const Subject = require('../patterns/observer/subject');
const NotificationObserver = require('../patterns/observer/notification.observer');
const LoggingObserver = require('../patterns/observer/logging.observer');

class BookingService extends Subject {
  constructor() {
    super();
    // Đăng ký các Observers
    this.attach(new NotificationObserver());
    this.attach(new LoggingObserver());
  }

  async createBooking(bookingData) {
    const { customerId, staffId, serviceId, bookingDate, startTime } = bookingData;

    // 1. Kiểm tra tồn tại các bên
    const staff = await userRepository.findById(staffId);
    const service = await serviceRepository.findById(serviceId);
    if (!staff || staff.role !== 'staff') throw new Error('Nhân viên không hợp lệ');
    if (!service) throw new Error('Dịch vụ không hợp lệ');

    // 2. ⚡ Thuật toán kiểm tra xung đột Slot
    const duration = service.durationMinutes;
    const endTime = this._calculateEndTime(startTime, duration);
    
    const conflicts = await bookingRepository.findConflictingSlots(
      staffId, bookingDate, startTime, endTime
    );
    
    if (conflicts.length > 0) {
      throw new Error('Nhân viên đã có lịch trong khung giờ này. Vui lòng chọn giờ khác.');
    }

    // 3. Tạo bản ghi đặt lịch
    const booking = await bookingRepository.create({
      ...bookingData,
      endTime,
      totalAmount: service.price,
      status: bookingData.status || 'pending'
    });

    const customer = await userRepository.findById(customerId);

    // 4. Observer Pattern: Thông báo cho các bên (bỏ qua nếu là draft)
    if (booking.status !== 'draft') {
      await this.notify('booking_created', { booking, customer, staff });
    }

    return booking;
  }

  async confirmBooking(bookingId, staffId, userRole) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw new Error('Không tìm thấy lịch hẹn');
    
    // Bảo mật: Chỉ nhân viên được phân công hoặc Admin mới được xác nhận
    if (booking.staffId !== parseInt(staffId) && userRole !== 'admin') {
      throw new Error('Bạn không có quyền xác nhận lịch hẹn của nhân viên khác');
    }
    
    // State Pattern: Chuyển trạng thái an toàn
    const context = new BookingContext(booking, bookingRepository);
    await context.confirm();

    const customer = await userRepository.findById(booking.customerId);
    const staff = await userRepository.findById(booking.staffId);

    // Observer Pattern: Thông báo
    await this.notify('booking_confirmed', { booking, customer, staff });

    return booking;
  }

  async cancelBooking(bookingId, userId, userRole, reason) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw new Error('Không tìm thấy lịch hẹn');

    // Bảo mật: Chỉ khách hàng sở hữu lịch hẹn, nhân viên được phân công hoặc Admin mới được hủy
    if (booking.customerId !== parseInt(userId) && booking.staffId !== parseInt(userId) && userRole !== 'admin') {
      throw new Error('Bạn không có quyền hủy lịch hẹn này');
    }

    // State Pattern: Chuyển trạng thái an toàn
    const context = new BookingContext(booking, bookingRepository);
    await context.cancel();

    // Cập nhật lý do hủy
    await bookingRepository.update(bookingId, { 
      cancelReason: reason,
      cancelledAt: new Date()
    });

    const customer = await userRepository.findById(booking.customerId);
    const staff = await userRepository.findById(booking.staffId);

    await this.notify('booking_cancelled', { booking, customer, staff });

    return booking;
  }

  async getBusySlots(staffId, date) {
    const bookings = await bookingRepository.findAll({
      where: {
        staffId,
        bookingDate: date,
        status: { [Op.in]: ['confirmed', 'pending'] }
      },
      attributes: ['startTime', 'endTime']
    });
    // Trả về mảng các khoảng thời gian bận để frontend có thể kiểm tra chồng giờ
    return bookings.map(b => ({
      startTime: b.startTime.substring(0, 5),
      endTime: b.endTime.substring(0, 5)
    }));
  }

  async getMyBookings(userId, role) {
    if (role === 'staff') {
      return await bookingRepository.findByStaff(userId);
    }
    return await bookingRepository.findByCustomer(userId);
  }

  async completeBooking(bookingId, staffId) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw new Error('Không tìm thấy lịch hẹn');
    if (booking.staffId !== parseInt(staffId)) throw new Error('Bạn không có quyền hoàn thành lịch hẹn này');
    
    // State Pattern: Chuyển trạng thái an toàn
    const context = new BookingContext(booking, bookingRepository);
    await context.complete();

    const customer = await userRepository.findById(booking.customerId);
    const staff = await userRepository.findById(booking.staffId);

    // Observer Pattern: Thông báo
    await this.notify('booking_completed', { booking, customer, staff });

    return booking;
  }

  async refundBooking(bookingId, userId, userRole, reason) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw new Error('Không tìm thấy lịch hẹn');
    if (booking.status === 'completed') throw new Error('Không thể hoàn tiền khi lịch đã hoàn thành');
    if (booking.status === 'cancelled') throw new Error('Lịch hẹn đã bị hủy từ trước');

    // Bảo mật: Chỉ khách hàng sở hữu lịch hẹn hoặc Admin mới được hoàn tiền
    if (booking.customerId !== parseInt(userId) && userRole !== 'admin') {
      throw new Error('Bạn không có quyền yêu cầu hoàn tiền cho lịch hẹn này');
    }

    // Tính toán hoàn tiền dựa trên thời gian còn lại đến giờ hẹn
    const refundPercentage = this._calculateRefundPercentage(booking.bookingDate, booking.startTime);
    const refundAmount = (booking.totalAmount * refundPercentage) / 100;

    // State Pattern: Chuyển trạng thái booking → cancelled qua State Machine
    const context = new BookingContext(booking, bookingRepository);
    await context.cancel();

    // Cập nhật lý do hủy qua Repository
    await bookingRepository.update(bookingId, { 
      cancelReason: reason,
      cancelledAt: new Date()
    });

    // Repository Pattern: Cập nhật Payment qua PaymentRepository
    const payment = await paymentRepository.findByBookingId(bookingId);
    if (payment && payment.status === 'success') {
      const paymentUpdate = {
        refundAmount,
        refundedAt: new Date()
      };
      if (refundAmount > 0) {
        paymentUpdate.status = 'refunded';
      }
      await paymentRepository.update(payment.id, paymentUpdate);
    }

    booking.status = 'cancelled';
    booking.cancelReason = reason;
    booking.cancelledAt = new Date();

    const customer = await userRepository.findById(booking.customerId);
    const staff = await userRepository.findById(booking.staffId);

    // Observer Pattern: Thông báo hủy + hoàn tiền
    await this.notify('booking_refunded', { 
      booking, 
      customer, 
      staff, 
      refundAmount,
      refundPercentage
    });

    return {
      booking,
      refundAmount,
      refundPercentage,
      message: refundAmount > 0 
        ? `Hoàn tiền ${refundPercentage}% = ${parseInt(refundAmount).toLocaleString()} VNĐ`
        : 'Đã quá thời hạn hoàn tiền. Không được hoàn tiền.'
    };
  }

  /**
   * Chính sách hoàn tiền:
   *   - Hủy trước >= 1 tiếng so với giờ hẹn → Hoàn 100%
   *   - Hủy trong vòng 1 tiếng trước giờ hẹn → Hoàn 50%
   *   - Hủy sau giờ hẹn (quá giờ) → Không hoàn (0%)
   */
  _calculateRefundPercentage(bookingDate, startTime) {
    const now = new Date();
    
    // Ghép bookingDate + startTime thành DateTime chính xác
    const [hours, minutes] = startTime.split(':').map(Number);
    const bookingDateTime = new Date(bookingDate);
    bookingDateTime.setHours(hours, minutes, 0, 0);

    const minutesUntilBooking = (bookingDateTime - now) / (1000 * 60);

    if (minutesUntilBooking <= 0) {
      return 0;   // Đã quá giờ hẹn → 0%
    } else if (minutesUntilBooking < 60) {
      return 50;  // Trong vòng 1 tiếng → 50%
    } else {
      return 100; // Trước 1 tiếng trở lên → 100%
    }
  }

  _calculateEndTime(startTime, durationMinutes) {
    const [hours, minutes] = startTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes + durationMinutes);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:00`;
  }
}

module.exports = new BookingService();
