const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  staffId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  serviceId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  bookingDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('draft', 'pending', 'confirmed', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  cancelledAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  cancelReason: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'bookings',
  indexes: [
    { fields: ['customerId', 'status'] },
    { fields: ['staffId', 'bookingDate', 'startTime'] },
    { fields: ['status'] }
  ]
});

module.exports = Booking;
