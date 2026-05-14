const User = require('./user.model');
const Service = require('./service.model');
const Category = require('./category.model');
const StaffSchedule = require('./staffSchedule.model');
const Booking = require('./booking.model');
const Payment = require('./payment.model');
const Notification = require('./notification.model');

// Category <-> Service
Category.hasMany(Service, { foreignKey: 'categoryId' });
Service.belongsTo(Category, { foreignKey: 'categoryId' });

// User <-> Booking
User.hasMany(Booking, { foreignKey: 'customerId', as: 'customerBookings' });
Booking.belongsTo(User, { foreignKey: 'customerId', as: 'customer' });

User.hasMany(Booking, { foreignKey: 'staffId', as: 'staffBookings' });
Booking.belongsTo(User, { foreignKey: 'staffId', as: 'staff' });

// Service <-> Booking
Service.hasMany(Booking, { foreignKey: 'serviceId' });
Booking.belongsTo(Service, { foreignKey: 'serviceId' });

// User <-> StaffSchedule
User.hasMany(StaffSchedule, { foreignKey: 'staffId', as: 'schedules' });
StaffSchedule.belongsTo(User, { foreignKey: 'staffId', as: 'staff' });

// Service <-> StaffSchedule
Service.hasMany(StaffSchedule, { foreignKey: 'serviceId', as: 'staffSchedules' });
StaffSchedule.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });

// Booking <-> Payment
Booking.hasOne(Payment, { foreignKey: 'bookingId' });
Payment.belongsTo(Booking, { foreignKey: 'bookingId' });

// User <-> Notification
User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

// Booking <-> Notification
Booking.hasMany(Notification, { foreignKey: 'bookingId' });
Notification.belongsTo(Booking, { foreignKey: 'bookingId' });

module.exports = {
  User,
  Service,
  Category,
  StaffSchedule,
  Booking,
  Payment,
  Notification
};
