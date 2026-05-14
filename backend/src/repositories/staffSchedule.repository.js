const BaseRepository = require('./base.repository');
const { StaffSchedule, User, Service } = require('../models');

class StaffScheduleRepository extends BaseRepository {
  constructor() {
    super(StaffSchedule);
  }

  async findSchedulesByDay(dayOfWeek) {
    return await this.model.findAll({
      where: { dayOfWeek, isAvailable: true },
      include: [
        { model: User, as: 'staff', attributes: ['id', 'fullName'] },
        { model: Service, as: 'service' }
      ]
    });
  }

  async findByStaffAndService(staffId, serviceId) {
    return await this.model.findAll({
      where: { staffId, serviceId, isAvailable: true }
    });
  }
}

module.exports = new StaffScheduleRepository();
