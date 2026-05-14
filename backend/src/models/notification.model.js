const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  bookingId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM(
      'booking_created',
      'booking_confirmed',
      'booking_completed',
      'booking_cancelled',
      'payment_success',
      'payment_refund',
      'reminder'
    ),
    allowNull: false
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'notifications',
  indexes: [
    { fields: ['userId', 'isRead'] }
  ]
});

module.exports = Notification;
