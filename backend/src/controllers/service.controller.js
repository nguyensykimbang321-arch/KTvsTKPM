const { Service, Category, StaffSchedule, User } = require('../models');

class ServiceController {
  async getAll(req, res, next) {
    try {
      const services = await Service.findAll({
        where: { isActive: true },
        include: [
          { model: Category },
          { 
            model: StaffSchedule,
            as: 'staffSchedules',
            include: [{ model: User, as: 'staff', attributes: ['id', 'fullName'] }]
          }
        ]
      });
      res.json(services);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ServiceController();
