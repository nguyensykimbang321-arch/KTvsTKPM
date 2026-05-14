const { User, StaffSchedule, Service } = require('../models');

class StaffController {
  async getByService(req, res, next) {
    try {
      const { serviceId } = req.query;
      const staffs = await User.findAll({
        where: { role: 'staff' },
        include: [{
          model: StaffSchedule,
          as: 'schedules',
          required: !!serviceId,
          where: serviceId ? { serviceId } : {}
        }]
      });
      res.json(staffs);
    } catch (error) {
      next(error);
    }
  }

  async getSchedules(req, res, next) {
    try {
      const { staffId } = req.params;
      const schedules = await StaffSchedule.findAll({
        where: { staffId },
        include: [{ model: Service, as: 'service' }],
        order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']]
      });
      res.json(schedules);
    } catch (error) {
      next(error);
    }
  }

  async createSchedule(req, res, next) {
    try {
      const { staffId } = req.params;
      const { serviceId, dayOfWeek, startTime, endTime, isAvailable = true } = req.body;

      const staff = await User.findByPk(staffId);
      if (!staff || staff.role !== 'staff') {
        return res.status(404).json({ message: 'Nhân viên không hợp lệ' });
      }

      const schedule = await StaffSchedule.create({
        staffId,
        serviceId,
        dayOfWeek,
        startTime,
        endTime,
        isAvailable
      });
      res.status(201).json(schedule);
    } catch (error) {
      next(error);
    }
  }

  async updateSchedule(req, res, next) {
    try {
      const { staffId, scheduleId } = req.params;
      const schedule = await StaffSchedule.findByPk(scheduleId);
      if (!schedule || schedule.staffId.toString() !== staffId.toString()) {
        return res.status(404).json({ message: 'Lịch làm việc không tìm thấy' });
      }

      await schedule.update(req.body);
      res.json(schedule);
    } catch (error) {
      next(error);
    }
  }

  async deleteSchedule(req, res, next) {
    try {
      const { staffId, scheduleId } = req.params;
      const schedule = await StaffSchedule.findByPk(scheduleId);
      if (!schedule || schedule.staffId.toString() !== staffId.toString()) {
        return res.status(404).json({ message: 'Lịch làm việc không tìm thấy' });
      }

      await schedule.destroy();
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StaffController();
