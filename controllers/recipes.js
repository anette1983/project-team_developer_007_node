const { Recipe } = require("../models/recipe");

const { HttpError, ctrlWrapper } = require("../helpers");
const mongoose = require("mongoose");

const getCategories = async (req, res) => {};

const getMainPageRecipes = async (req, res) => {
  const { page = 1, limit = 4 } = req.query;
  const skip = (page - 1) * limit;
  const data = await Recipe.find({}, ["category", "title"], { skip, limit });
  res.json(data);
};

const getRecipesByCategory = async (req, res) => {
  const category = req.params.categoryName;
  const limit = 8;
  const data = await Recipe.find({ category }, ["preview", "title"], {
    limit,
  });
  res.json(data);
};

const getRecipeById = async (req, res) => {
  const id = req.params.recipeId;
  const data = await Recipe.findById(id);
  res.json(data);
};

const getRecipesByTitle = async (req, res) => {
  const query = req.params.title;
  console.log(req.params);
  const { page = 1, limit = 12 } = req.query;
  const skip = (page - 1) * limit;
  const data = await Recipe.find(
    {
      title: {
        $regex: query,
        $options: "i",
      },
    },
    ["preview", "title"],
    { skip, limit }
  );

  res.json(data);
};

const getRecipesByIngredient = async (req, res) => {
  const query = req.params.ingredientName;
  console.log(query);
  const { page = 1, limit = 12 } = req.query;
  const skip = (page - 1) * limit;
  const ingredientId = "640c2dd963a319ea671e365b";

  const ObjectId = mongoose.Types.ObjectId;

  const data = await Recipe.find(
    {
      ingredients: {
        $elemMatch: {
          id: ObjectId(ingredientId),
        },
      },
    },
    ["preview", "title"],
    {
      skip,
      limit,
    }
  );
  res.json(data);
};

const getOwnrecipes = async (req, res) => {
  const id = req.user.id;
  const data = Recipe.find({ owner: id });
  res.json(data);
};

const addRecipe = async (req, res) => {
  const id = req.user._id;
  const body = req.body;
  const data = await Recipe.create({ ...body, owner: id });
  res.status(201).json(data);
};

const deleteRecipe = async (req, res) => {
  const id = req.params.id;
  const result = await Recipe.deleteOne({ _id: id });
  if (result.deletedCount === 0) {
    throw HttpError(404, "Not found");
  }
  res.status(200).json({ message: "recipe deleted" });
};

const getFavorite = async (req, res) => {
  const id = req.user._id;
  const data = await Recipe.find({ usersWhoLiked: id }, [
    "title",
    "description",
    "preview",
    "time",
  ]);
  if (data === []) {
    throw HttpError(404, "nothing found");
  }
  res.json(data);
};

const addToFavorite = async (req, res) => {
  const id = req.user._id;
  const recipeId = req.params;
  await Recipe.findByIdAndUpdate(recipeId, {
    $push: { usersWhoLiked: { id } },
  });
  res.json(201, "recipe added");
};

const removeFromFavorite = async (req, res) => {
  const id = req.user._id;
  const recipeId = req.params;
  await Recipe.findByIdAndUpdate(recipeId, {
    $pull: { usersWhoLiked: { id } },
  });
  res.json(201, "recipe deleted");
};

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
