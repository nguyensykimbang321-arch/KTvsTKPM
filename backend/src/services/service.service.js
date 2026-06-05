const serviceRepository = require('../repositories/service.repository');

class ServiceService {
  async getAllActiveServices() {
    const { Category, StaffSchedule, User } = require('../models');
    return await serviceRepository.findAll({
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
  }

  async getServiceById(id) {
    const service = await serviceRepository.findById(id);
    if (!service) throw new Error('Dịch vụ không tồn tại');
    return service;
  }
}

module.exports = new ServiceService();
