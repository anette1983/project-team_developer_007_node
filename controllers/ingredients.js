const { Ingredient } = require("../models/ingredient");
const { ctrlWrapper } = require("../helpers");

const getIngredientsList = async (_, res) => {
  const list = await Ingredient.find();
  res.status(200).json(list);
};

module.exports = {
  getIngredientsList: ctrlWrapper(getIngredientsList),
};
