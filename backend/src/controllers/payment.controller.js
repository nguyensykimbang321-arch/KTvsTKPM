const paymentService = require('../services/payment.service');

class PaymentController {
  async initiate(req, res, next) {
    try {
      const { bookingId, method } = req.body;
      const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      
      const result = await paymentService.initiatePayment(bookingId, method, ipAddress);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async vnpayReturn(req, res, next) {
    try {
      const result = await paymentService.processVnpayReturn(req.query);
      
      if (result.isValid) {
        res.send('<h1>Thanh toán thành công!</h1><p>Bạn có thể quay lại ứng dụng.</p>');
      } else {
        res.status(400).send('<h1>Thanh toán thất bại</h1><p>Vui lòng thử lại sau.</p>');
      }
    } catch (error) {
      next(error);
    }
  }

  async vnpayIpn(req, res, next) {
    try {
      const result = await paymentService.processVnpayIpn(req.query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PaymentController();
