const { Recipe } = require("../models/recipe");

const { HttpError, ctrlWrapper } = require("../helpers");

const getCategories = async (req, res) => {};

const getMainPageRecipes = async (req, res) => {};

const getRecipesByCategory = async (req, res) => {};

const getRecipeById = async (req, res) => {};

const getRecipesByTitle = async (req, res) => {};

const getRecipesByIngredient = async (req, res) => {};

const getOwnrecipes = async (req, res) => {};

const addRecipe = async (req, res) => {};

const deleteRecipe = async (req, res) => {};

const getFavorite = async (req, res) => {};

const addToFavorite = async (req, res) => {};

const removeFromFavorite = async (req, res) => {};

const getPopular = async (req, res) => {};

module.exports = {
  getCategories: ctrlWrapper(getCategories),
  getMainPageRecipes: ctrlWrapper(getMainPageRecipes),
  getRecipesByCategory: ctrlWrapper(getRecipesByCategory),
  getRecipeById: ctrlWrapper(getRecipeById),
  getRecipesByTitle: ctrlWrapper(getRecipesByTitle),
  getRecipesByIngredient: ctrlWrapper(getRecipesByIngredient),
  getOwnrecipes: ctrlWrapper(getOwnrecipes),
  addRecipe: ctrlWrapper(addRecipe),
  deleteRecipe: ctrlWrapper(deleteRecipe),
  getFavorite: ctrlWrapper(getFavorite),
  addToFavorite: ctrlWrapper(addToFavorite),
  removeFromFavorite: ctrlWrapper(removeFromFavorite),
  getPopular: ctrlWrapper(getPopular),
};
