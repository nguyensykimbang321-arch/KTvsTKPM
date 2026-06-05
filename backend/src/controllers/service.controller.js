const serviceService = require('../services/service.service');

class ServiceController {
  async getAll(req, res, next) {
    try {
      const services = await serviceService.getAllActiveServices();
      res.json(services);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ServiceController();
