const BaseRepository = require('./base.repository');
const { Category } = require('../models');

class CategoryRepository extends BaseRepository {
  constructor() {
    super(Category);
  }

  async findWithServices() {
    const { Service } = require('../models');
    return await this.model.findAll({
      include: [{ model: Service }]
    });
  }
}

module.exports = new CategoryRepository();
