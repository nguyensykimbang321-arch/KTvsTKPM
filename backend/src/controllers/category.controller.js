const { Category } = require('../models');

class CategoryController {
  async getAll(req, res, next) {
    try {
      const categories = await Category.findAll();
      res.json(categories);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CategoryController();
