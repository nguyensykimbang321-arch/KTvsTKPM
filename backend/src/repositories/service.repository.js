const BaseRepository = require('./base.repository');
const { Service } = require('../models');

class ServiceRepository extends BaseRepository {
  constructor() {
    super(Service);
  }

  async findActiveServices() {
    return await this.model.findAll({ where: { isActive: true } });
  }
}

module.exports = new ServiceRepository();
