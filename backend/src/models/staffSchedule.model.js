const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StaffSchedule = sequelize.define('StaffSchedule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  staffId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  serviceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'services',
      key: 'id'
    }
  },
  dayOfWeek: {
    type: DataTypes.ENUM('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'),
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
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'staff_schedules',
  indexes: [
    {
      unique: true,
      fields: ['staffId', 'serviceId', 'dayOfWeek', 'startTime']
    }
  ]
});

module.exports = StaffSchedule;
