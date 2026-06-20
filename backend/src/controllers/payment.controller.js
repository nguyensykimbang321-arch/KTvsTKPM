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
        res.send(`
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>Thanh toán thành công</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; text-align: center; padding-top: 80px; background-color: #f8fafc; color: #0f172a; }
                .card { background: white; max-width: 420px; margin: 0 auto; padding: 40px 32px; border-radius: 28px; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.05); border: 1px solid #f1f5f9; }
                .success-icon { font-size: 54px; margin-bottom: 20px; }
                h1 { color: #10b981; font-size: 24px; margin-bottom: 12px; font-weight: 800; }
                p { color: #64748b; font-size: 15px; line-height: 22px; margin-bottom: 8px; }
                .redirect-notice { font-size: 13px; color: #94a3b8; margin-top: 16px; }
                a { display: inline-block; margin-top: 24px; background: #4f46e5; color: white; padding: 12px 28px; border-radius: 14px; text-decoration: none; font-weight: 700; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2); }
              </style>
            </head>
            <body>
              <div class="card">
                <div class="success-icon">🎉</div>
                <h1>Thanh toán thành công!</h1>
                <p>Cảm ơn bạn. Giao dịch đã được xác nhận thành công.</p>
                <p class="redirect-notice">Đang tự động chuyển hướng quay lại ứng dụng...</p>
                <a href="http://192.168.1.163:8081">Quay lại ngay</a>
                <script>
                  setTimeout(function() {
                    window.location.href = "http://192.168.1.163:8081";
                  }, 3000);
                </script>
              </div>
            </body>
          </html>
        `);
      } else {
        res.status(400).send(`
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>Thanh toán thất bại</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; text-align: center; padding-top: 80px; background-color: #f8fafc; color: #0f172a; }
                .card { background: white; max-width: 420px; margin: 0 auto; padding: 40px 32px; border-radius: 28px; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.05); border: 1px solid #f1f5f9; }
                .error-icon { font-size: 54px; margin-bottom: 20px; }
                h1 { color: #ef4444; font-size: 24px; margin-bottom: 12px; font-weight: 800; }
                p { color: #64748b; font-size: 15px; line-height: 22px; margin-bottom: 8px; }
                .redirect-notice { font-size: 13px; color: #94a3b8; margin-top: 16px; }
                a { display: inline-block; margin-top: 24px; background: #64748b; color: white; padding: 12px 28px; border-radius: 14px; text-decoration: none; font-weight: 700; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="card">
                <div class="error-icon">❌</div>
                <h1>Thanh toán thất bại</h1>
                <p>Giao dịch không thành công hoặc đã bị hủy.</p>
                <p class="redirect-notice">Đang tự động quay lại ứng dụng...</p>
                <a href="http://192.168.1.163:8081">Quay lại ngay</a>
                <script>
                  setTimeout(function() {
                    window.location.href = "http://192.168.1.163:8081";
                  }, 3000);
                </script>
              </div>
            </body>
          </html>
        `);
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
