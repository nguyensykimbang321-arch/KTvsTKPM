const userRepository = require('../repositories/user.repository');
const staffScheduleRepository = require('../repositories/staffSchedule.repository');
const serviceRepository = require('../repositories/service.repository');
const { Service } = require('../models');

class StaffService {
  async getStaffByService(serviceId) {
    const { StaffSchedule } = require('../models');
    
    return await userRepository.findAll({
      where: { role: 'staff' },
      include: [{
        model: StaffSchedule,
        as: 'schedules',
        required: !!serviceId,
        where: serviceId ? { serviceId } : {}
      }]
    });
  }

  async getSchedules(staffId) {
    return await staffScheduleRepository.findAll({
      where: { staffId },
      include: [{ model: Service, as: 'service' }],
      order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']]
    });
  }

  async createSchedule(staffId, scheduleData) {
    const staff = await userRepository.findById(staffId);
    if (!staff || staff.role !== 'staff') {
      throw new Error('Nhân viên không hợp lệ');
    }

    return await staffScheduleRepository.create({
      staffId,
      ...scheduleData
    });
  }

  async updateSchedule(staffId, scheduleId, updateData) {
    const schedule = await staffScheduleRepository.findById(scheduleId);
    if (!schedule || schedule.staffId.toString() !== staffId.toString()) {
      throw new Error('Lịch làm việc không tìm thấy');
    }

    return await staffScheduleRepository.update(scheduleId, updateData);
  }

  async deleteSchedule(staffId, scheduleId) {
    const schedule = await staffScheduleRepository.findById(scheduleId);
    if (!schedule || schedule.staffId.toString() !== staffId.toString()) {
      throw new Error('Lịch làm việc không tìm thấy');
    }

    return await staffScheduleRepository.delete(scheduleId);
  }
}

module.exports = new StaffService();
