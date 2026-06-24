const Category = require('../models/Category');
const ApiError = require('../utils/ApiError');

/*List categories — global presets + user's custom categories*/
const listCategories = async (userId) => {
  const categories = await Category.find({
    $or: [{ userId: null }, { userId }],
  }).sort({ name: 1 }).lean();

  return categories;
};

/* this is to Create a custom category for a user*/
const createCategory = async (userId, data) => {
  const category = await Category.create({
    ...data,
    userId,
  });
  return category;
};

module.exports = { listCategories, createCategory };
