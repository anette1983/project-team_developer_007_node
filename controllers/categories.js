const { Category } = require("../models/category");
const { ctrlWrapper } = require("../helpers");

const getCategoriesList = async (_, res) => {
  const list = await Category.find().sort({ name: "asc" });
  res.status(200).json(list);
};

module.exports = {
  getCategoriesList: ctrlWrapper(getCategoriesList),
};
