const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  bookingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  method: {
    type: DataTypes.ENUM('vnpay', 'cod'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'success', 'failed', 'refunded'),
    defaultValue: 'pending'
  },
  transactionId: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  vnpayResponseCode: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  refundAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  paidAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  refundedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'payments'
});

module.exports = Payment;
