const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/database');
const apiRoutes = require('./routes/api.routes');
const { errorHandler } = require('./middlewares');
const { initReminderCron, initAutoCancelCron } = require('./services/reminder.service');

const app = express();

// Middlewares toàn cục
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Đăng ký API Routes
app.use('/api/v1', apiRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to BookingPro API' });
});

// Xử lý lỗi tập trung
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Kết nối DB và chạy server
const startServer = async () => {
  const maxRetries = 5;
  let retries = 0;
  while (retries < maxRetries) {
    try {
      // sync({ alter: true }) giúp tự động cập nhật schema DB trong lúc dev
      await sequelize.authenticate();
      console.log('✅ Kết nối Database thành công.');
      
      // Chỉ sử dụng sync trong môi trường development để khớp schema
      if (process.env.NODE_ENV === 'development') {
        await sequelize.sync({ alter: true });
        initReminderCron();
        initAutoCancelCron();
      }

      app.listen(PORT, () => {
        console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
      });
      break;
    } catch (error) {
      retries += 1;
      console.error(`❌ Không thể kết nối Database (Lần thử ${retries}/${maxRetries}):`, error.message);
      if (retries >= maxRetries) {
        console.error('❌ Đã quá số lần thử kết nối. Dừng server.');
        process.exit(1);
      }
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
};

startServer();
