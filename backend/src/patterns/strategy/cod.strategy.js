const PaymentStrategy = require('./payment.strategy');

class CODStrategy extends PaymentStrategy {
  async processPayment(orderData) {
    // Với COD, chỉ cần trả về trạng thái không cần Redirect URL
    return { 
      method: 'cod', 
      status: 'pending',
      message: 'Đặt lịch thành công. Vui lòng thanh toán tại quầy.' 
    };
  }

  async verifyPayment(params) {
    return true; // COD thường được xác nhận thủ công bởi nhân viên
  }
}

module.exports = CODStrategy;
