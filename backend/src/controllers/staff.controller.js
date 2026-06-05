const staffService = require('../services/staff.service');

class StaffController {
  async getByService(req, res, next) {
    try {
      const { serviceId } = req.query;
      const staffs = await staffService.getStaffByService(serviceId);
      res.json(staffs);
    } catch (error) {
      next(error);
    }
  }

  async getSchedules(req, res, next) {
    try {
      const { staffId } = req.params;
      const schedules = await staffService.getSchedules(staffId);
      res.json(schedules);
    } catch (error) {
      next(error);
    }
  }

  async createSchedule(req, res, next) {
    try {
      const { staffId } = req.params;
      const { serviceId, dayOfWeek, startTime, endTime, isAvailable = true } = req.body;

      const schedule = await staffService.createSchedule(staffId, {
        serviceId, dayOfWeek, startTime, endTime, isAvailable
      });
      res.status(201).json(schedule);
    } catch (error) {
      next(error);
    }
  }

  async updateSchedule(req, res, next) {
    try {
      const { staffId, scheduleId } = req.params;
      const schedule = await staffService.updateSchedule(staffId, scheduleId, req.body);
      res.json(schedule);
    } catch (error) {
      next(error);
    }
  }

  async deleteSchedule(req, res, next) {
    try {
      const { staffId, scheduleId } = req.params;
      await staffService.deleteSchedule(staffId, scheduleId);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StaffController();
