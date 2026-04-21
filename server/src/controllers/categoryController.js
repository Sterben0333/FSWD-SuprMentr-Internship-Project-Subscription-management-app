const categoryService = require('../services/categoryService');

const list = async (req, res, next) => {
  try {
    const categories = await categoryService.listCategories(req.userId);
    res.json({ success: true, data: { categories } });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.userId, req.body);
    res.status(201).json({ success: true, message: 'Category created', data: { category } });
  } catch (error) {
    next(error);
  }
};

module.exports = { list, create };
