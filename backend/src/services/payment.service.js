const paymentRepository = require('../repositories/payment.repository');
const bookingRepository = require('../repositories/booking.repository');
const userRepository = require('../repositories/user.repository');
const PaymentContext = require('../patterns/strategy/payment.context');
const VNPayStrategy = require('../patterns/strategy/vnpay.strategy');
const CODStrategy = require('../patterns/strategy/cod.strategy');
const Subject = require('../patterns/observer/subject');
const NotificationObserver = require('../patterns/observer/notification.observer');
const LoggingObserver = require('../patterns/observer/logging.observer');
const BookingContext = require('../patterns/state/booking.context');

class PaymentService extends Subject {
  constructor() {
    super();
    this.strategies = {
      'vnpay': new VNPayStrategy(),
      'cod': new CODStrategy()
    };
    this.context = new PaymentContext();
    
    // Đăng ký cả 2 Observer: Notification + Logging
    this.attach(new NotificationObserver());
    this.attach(new LoggingObserver());
  }

  async initiatePayment(bookingId, method, ipAddress) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) throw new Error('Không tìm thấy lịch hẹn');

    const strategy = this.strategies[method];
    if (!strategy) throw new Error('Phương thức thanh toán không được hỗ trợ');

    this.context.setStrategy(strategy);
    
    console.log('--- DEBUG PAYMENT ---');
    console.log('Booking found:', !!booking);
    console.log('Total Amount:', booking?.totalAmount);

    // Chuẩn bị dữ liệu cho Strategy
    const paymentResult = await this.context.executePayment({
      orderId: booking.id.toString(),
      amount: booking.totalAmount,
      orderInfo: `Thanh toan lich hen #${booking.id}`,
      ipAddress
    });

    // Lưu hoặc cập nhật thông tin thanh toán (trạng thái pending)
    const existingPayment = await paymentRepository.findByBookingId(booking.id.toString());
    if (existingPayment) {
      await existingPayment.update({
        amount: booking.totalAmount,
        method: method,
        status: 'pending'
      });
    } else {
      await paymentRepository.create({
        bookingId: booking.id,
        amount: booking.totalAmount,
        method: method,
        status: 'pending'
      });
    }

    return paymentResult;
  }

  async processVnpayReturn(vnp_Params) {
    const strategy = this.strategies['vnpay'];
    const isValid = await strategy.verifyPayment(vnp_Params);
    
    const bookingId = vnp_Params['vnp_TxnRef'];
    const payment = await paymentRepository.findByBookingId(bookingId);
    if (!payment) throw new Error('Không tìm thấy thông tin thanh toán');

    if (isValid) {
      await this.handlePaymentSuccess(payment, vnp_Params);
    } else {
      await payment.update({ status: 'failed' });
    }

    return { isValid, bookingId };
  }

  async processVnpayIpn(vnp_Params) {
    const strategy = this.strategies['vnpay'];
    const isValid = await strategy.verifyPayment(vnp_Params);
    
    if (!isValid) return { RspCode: '97', Message: 'Invalid signature' };

    const bookingId = vnp_Params['vnp_TxnRef'];
    const payment = await paymentRepository.findByBookingId(bookingId);
    
    if (!payment) return { RspCode: '01', Message: 'Order not found' };
    if (payment.status !== 'pending') return { RspCode: '02', Message: 'Order already confirmed' };

    const vnp_ResponseCode = vnp_Params['vnp_ResponseCode'];
    if (vnp_ResponseCode === '00') {
      await this.handlePaymentSuccess(payment, vnp_Params);
    } else {
      await payment.update({ status: 'failed' });
    }

    return { RspCode: '00', Message: 'Success' };
  }

  async handlePaymentSuccess(payment, vnp_Params) {
    // 1. Cập nhật Payment
    await payment.update({
      status: 'success',
      transactionId: vnp_Params['vnp_TransactionNo'],
      vnpayResponseCode: vnp_Params['vnp_ResponseCode'],
      paidAt: new Date()
    });

    // 2. Cập nhật Booking qua State Pattern
    const booking = await bookingRepository.findById(payment.bookingId);
    if (booking) {
      const context = new BookingContext(booking, bookingRepository);
      await context.confirm(); // Sẽ gọi DraftState.confirm() -> updateStatus('confirmed')
      
      // 3. Gửi thông báo qua Observer (từ PaymentService)
      try {
        const customer = await userRepository.findById(booking.customerId);
        const staff = await userRepository.findById(booking.staffId);
        
        // PaymentService extend Subject, gọi notify() từ đây
        await this.notify('payment_success', { 
          booking, 
          customer, 
          staff, 
          payment 
        });
        console.log(`🔔 Đã gửi thông báo thanh toán thành công cho khách hàng ${customer?.fullName}`);
      } catch (err) {
        console.error('❌ Lỗi gửi thông báo thanh toán:', err);
      }
    }
  }
}

module.exports = new PaymentService();
