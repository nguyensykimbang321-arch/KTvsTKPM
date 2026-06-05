const categoryRepository = require('../repositories/category.repository');

class CategoryService {
  async getAllCategories() {
    return await categoryRepository.findAll();
  }

  async getCategoryById(id) {
    const category = await categoryRepository.findById(id);
    if (!category) throw new Error('Danh mục không tồn tại');
    return category;
  }

  async getCategoriesWithServices() {
    return await categoryRepository.findWithServices();
  }
}

module.exports = new CategoryService();
