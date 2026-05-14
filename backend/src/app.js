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
  } catch (error) {
    console.error('❌ Không thể kết nối Database:', error);
  }
};

startServer();
