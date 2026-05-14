const { Op } = require('sequelize');
const BaseRepository = require('./base.repository');
const { Booking, Service, User } = require('../models');

class BookingRepository extends BaseRepository {
  constructor() {
    super(Booking);
  }

  async findByCustomer(customerId) {
    return await this.model.findAll({
      where: { customerId },
      include: [
        { model: Service },
        { model: User, as: 'staff', attributes: ['id', 'fullName', 'phone'] }
      ],
      order: [['bookingDate', 'DESC'], ['startTime', 'DESC']]
    });
  }

  async findByStaff(staffId) {
    return await this.model.findAll({
      where: { staffId },
      include: [
        { model: Service },
        { model: User, as: 'customer', attributes: ['id', 'fullName', 'phone'] }
      ],
      order: [['bookingDate', 'DESC'], ['startTime', 'DESC']]
    });
  }

  async findByStaffAndDate(staffId, date) {
    return await this.model.findAll({
      where: {
        staffId,
        bookingDate: date,
        status: { [Op.ne]: 'cancelled' }
      }
    });
  }

  // ⚡ Logic kiểm tra xung đột slot thời gian
  async findConflictingSlots(staffId, bookingDate, startTime, endTime) {
    return await this.model.findAll({
      where: {
        staffId,
        bookingDate,
        status: { [Op.in]: ['pending', 'confirmed'] },
        [Op.or]: [
          {
            startTime: { [Op.lt]: endTime },
            endTime: { [Op.gt]: startTime }
          }
        ]
      }
    });
  }

  async updateStatus(id, status) {
    return await this.update(id, { status });
  }
}

module.exports = new BookingRepository();
