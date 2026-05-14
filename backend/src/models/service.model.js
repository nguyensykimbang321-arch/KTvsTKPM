const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Service = sequelize.define('Service', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  durationMinutes: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  imageUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('imageUrl');
      if (!rawValue) return [];
      try {
        return JSON.parse(rawValue);
      } catch (e) {
        // Fallback cho dữ liệu cũ là chuỗi đơn
        return [rawValue];
      }
    },
    set(value) {
      this.setDataValue('imageUrl', JSON.stringify(value));
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'services'
});

module.exports = Service;
