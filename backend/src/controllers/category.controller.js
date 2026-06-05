const categoryService = require('../services/category.service');

class CategoryController {
  async getAll(req, res, next) {
    try {
      const categories = await categoryService.getAllCategories();
      res.json(categories);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CategoryController();
