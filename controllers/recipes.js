/* eslint-disable array-callback-return */
const { Recipe } = require("../models/recipe");
const { User } = require("../models/user");
const { HttpError, ctrlWrapper } = require("../helpers");
const { Ingredient } = require("../models/ingredient");
const { default: mongoose } = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const getMainPageRecipes = async (req, res) => {
  const result = [];
  const data = await Recipe.find({
    $or: [
      { category: "Breakfast" },
      { category: "Miscellaneous" },
      { category: "Chicken" },
      { category: "Dessert" },
    ],
  });

  data.forEach((recipe) => {
    if (!result[recipe.category]) {
      result[recipe.category] = [];
    }
    if (result[recipe.category].length === 4) {
      return;
    }
    result[recipe.category].push(recipe);
  });

  res.json(Object.values(result));
};

const getRecipesByCategory = async (req, res) => {
  const { page = 1, limit = 8 } = req.query;
  const { name } = req.params;
  const skip = (page - 1) * limit;
  console.log(req.params);
  const data = await Recipe.find({ category: name }, [], {
    skip,
    limit,
  });
  if (data.length === 0) {
    throw HttpError(400);
  }
  res.json(data);
};

const getRecipeById = async (req, res) => {
  const { id } = req.params;

  const data = await Recipe.findById(id).populate(
    "ingredients._id",
    "desc img name"
  );
  return res.json(data);
};

const getRecipesByTitle = async (req, res) => {
  const { page = 1, limit = 8, query } = req.query;
  const skip = (page - 1) * limit;

  const [{ data, total }] = await Recipe.aggregate([
    {
      $facet: {
        data: [
          {
            $match: {
              title: {
                $regex: query,
                $options: "i",
              },
            },
          },
          { $skip: Number(skip) },
          { $limit: Number(limit) },
        ],
        total: [
          {
            $match: {
              title: {
                $regex: query,
                $options: "i",
              },
            },
          },
          { $count: "total" },
        ],
      },
    },
  ]);
  if (data.length === 0) {
    throw HttpError(404, "no recipes found");
  }
  const totalCount = Object.values(total[0]);

  res.json({ total: totalCount[0], recipes: [...data] });
};

const getRecipesByIngredient = async (req, res) => {
  const { page = 1, limit = 8, query } = req.query;
  const skip = (page - 1) * limit;
  const ingredients = await Ingredient.aggregate([
    { $match: { name: { $regex: query, $options: "i" } } },
    { $project: { id: 0, name: 0, desc: 0, img: 0 } },
  ]);
  if (ingredients.length === 0) {
    throw HttpError(404, "no recipes found");
  }

  const [{ data, total }] = await Recipe.aggregate([
    {
      $facet: {
        data: [
          {
            $match: {
              ingredients: {
                $elemMatch: {
                  $or: ingredients,
                },
              },
            },
          },
          { $skip: Number(skip) },
          { $limit: Number(limit) },
        ],
        total: [
          {
            $match: {
              ingredients: {
                $elemMatch: {
                  $or: ingredients,
                },
              },
            },
          },
          { $count: "total" },
        ],
      },
    },
  ]);

  if (data.length === 0) {
    throw HttpError(404, "no recipes found");
  }
  const totalCount = Object.values(total[0]);

  res.json({ total: totalCount[0], recipes: [...data] });
};

const getOwnRecipes = async (req, res) => {
  const { page = 1, limit = 4 } = req.query;
  const skip = (page - 1) * limit;
  const id = req.user._id;

  const [{ data, total }] = await Recipe.aggregate([
    {
      $facet: {
        data: [
          { $match: { owner: id } },
          { $skip: Number(skip) },
          { $limit: Number(limit) },
        ],
        total: [{ $match: { owner: id } }, { $count: "total" }],
      },
    },
  ]);

  if (data.length === 0) {
    throw HttpError(404, "no recipes found");
  }

  const totalCount = Object.values(total[0]);

  res.json({ total: totalCount[0], recipes: [...data] });
};

const addRecipe = async (req, res) => {
  const id = req.user._id;
  const body = req.body;
  const data = await Recipe.create({
    ...body,
    owner: id,
    ingredients: JSON.parse(req.body.ingredients),
  });
  console.log(data)
  res.status(201).json(data);
};

const deleteRecipe = async (req, res) => {
  const { recipeId } = req.params;
  const result = await Recipe.deleteOne({ _id: recipeId });
  if (result.deletedCount === 0) {
    throw HttpError(404, "Not found");
  }
  res.status(200).json({ message: "recipe deleted" });
};

const getFavorite = async (req, res) => {
  const { page = 1, limit = 4 } = req.query;
  const skip = (page - 1) * limit;
  const id = req.user._id;

  const [{ data, total }] = await Recipe.aggregate([
    {
      $facet: {
        data: [
          {
            $match: {
              usersWhoLiked: {
                $elemMatch: { userId: id },
              },
            },
          },
          { $skip: Number(skip) },
          { $limit: Number(limit) },
        ],
        total: [
          {
            $match: {
              usersWhoLiked: {
                $elemMatch: { userId: id },
              },
            },
          },
          { $count: "total" },
        ],
      },
    },
  ]);

  if (data.length === 0) {
    throw HttpError(404, "no recipes found");
  }

  const totalCount = Object.values(total[0]);

  res.json({ total: totalCount[0], recipes: [...data] });
};

const addToFavorite = async (req, res) => {
  const id = req.user._id;
  const idToString = req.user._id.toString();
  const { recipeId } = req.body;
  const recipe = await Recipe.findById(recipeId);
  const isRecipeLiked = await recipe.usersWhoLiked
    .map((obj) => obj.userId.toString())
    .includes(idToString);

  if (isRecipeLiked) {
    throw HttpError(409, "recipe already liked");
  }
  await Recipe.findByIdAndUpdate(recipeId, {
    $push: { usersWhoLiked: { userId: id } },
  });
  res.json(201, "recipe added");
};

const removeFromFavorite = async (req, res) => {
  const id = req.user._id;
  const idToString = req.user._id.toString();
  const { recipeId } = req.params;
  const recipe = await Recipe.findById(recipeId);

  const isRecipeLiked = await recipe.usersWhoLiked
    .map((obj) => obj.userId.toString())
    .includes(idToString);

  if (!isRecipeLiked) {
    throw HttpError(409, "recipe is not in your favorite list");
  }
  await Recipe.findByIdAndUpdate(recipeId, {
    $pull: { usersWhoLiked: { userId: id } },
  });
  res.json(201, "recipe deleted");
};

const getPopular = async (req, res) => {
  const { page = 1, limit = 4 } = req.query;
  const skip = (page - 1) * limit;

  const [{ data, total }] = await Recipe.aggregate([
    {
      $facet: {
        data: [
          {
            $set: {
              totalAdded: {
                $size: "$usersWhoLiked",
              },
            },
          },
          {
            $sort: {
              totalAdded: -1,
            },
          },
          { $skip: Number(skip) },
          { $limit: Number(limit) },
          { $project: { totalAdded: 1, title: 1, preview: 1 } },
        ],
        total: [
          {
            $count: "total",
          },
        ],
      },
    },
  ]);

  if (data.length === 0) {
    throw HttpError(404, "no recipes found");
  }
  const totalCount = Object.values(total[0]);

  res.json({ total: totalCount[0], recipes: [...data] });
};

const getShoppingList = async (req, res) => {
  const { page = 1, limit = 8 } = req.query;
  const skip = (page - 1) * limit;
  const id = req.user._id;

  const [{ data, total }] = await User.aggregate([
    {
      $facet: {
        data: [
          {
            $match: { _id: id },
          },
          {
            $lookup: {
              from: "ingredients",
              localField: "shoppingList.ingredientId",
              foreignField: "_id",
              as: "shoppingList",
            },
          },
          { $skip: Number(skip) },
          { $limit: Number(limit) },
          { $project: { shoppingList: 1, _id: 0 } },
        ],
        total: [
          {
            $match: { _id: id },
          },
          { $unwind: "$shoppingList" },
          {
            $count: "shoppingList",
          },
        ],
      },
    },
  ]);

  if (data[0].shoppingList.length === 0) {
    throw HttpError(404, "no ingredients found");
  }
  const totalCount = Object.values(total[0]);
  const shoppingList = data[0].shoppingList;

  res.json({ total: totalCount[0], list: [...shoppingList] });
};
const addToShoppingList = async (req, res) => {
  const id = req.user._id;
  const { ingredientId, measure } = req.body;

  const aggregatedData = await User.aggregate([
    { $match: { _id: id } },
    { $project: { shoppingList: 1 } },
  ]);
  const shoppingList = aggregatedData[0].shoppingList;
  const isAdded = [];

  shoppingList.map((e) => {
    if (e.ingredientId.toString() === ingredientId) {
      isAdded.push(true);
    }
    isAdded.push(false);
  });
  if (isAdded.includes(true)) {
    throw HttpError(409, "you already have this ingredient");
  }

  await User.findOneAndUpdate(
    { _id: id },
    {
      $push: { shoppingList: { ingredientId, measure } },
    },
    { new: true }
  );
  const response = await Ingredient.findById({ _id: ingredientId });
  res.json(response);
};
const removeFromShoppingList = async (req, res) => {
  const id = req.user._id;
  const { ingredientId } = req.params;

  const aggregatedData = await User.aggregate([
    { $match: { _id: id } },
    { $project: { shoppingList: 1 } },
  ]);
  const shoppingList = aggregatedData[0].shoppingList;
  const isAdded = [];
  shoppingList.map((e) => {
    if (e.ingredientId.toString() === ingredientId) {
      isAdded.push(true);
    }
    isAdded.push(false);
  });

  if (!isAdded.includes(true)) {
    throw HttpError(409, "you don´t have this ingredient in shopping list");
  }

  await User.findByIdAndUpdate(
    id,
    {
      $pull: { shoppingList: { ingredientId } },
    },

    { new: true }
  );
  res.status(200).json("Deleted");
};

module.exports = {
  getMainPageRecipes: ctrlWrapper(getMainPageRecipes),
  getRecipeById: ctrlWrapper(getRecipeById),
  getRecipesByCategory: ctrlWrapper(getRecipesByCategory),
  getRecipesByTitle: ctrlWrapper(getRecipesByTitle),
  getRecipesByIngredient: ctrlWrapper(getRecipesByIngredient),
  getOwnRecipes: ctrlWrapper(getOwnRecipes),
  addRecipe: ctrlWrapper(addRecipe),
  deleteRecipe: ctrlWrapper(deleteRecipe),
  getFavorite: ctrlWrapper(getFavorite),
  addToFavorite: ctrlWrapper(addToFavorite),
  removeFromFavorite: ctrlWrapper(removeFromFavorite),
  getPopular: ctrlWrapper(getPopular),
  getShoppingList: ctrlWrapper(getShoppingList),
  addToShoppingList: ctrlWrapper(addToShoppingList),
  removeFromShoppingList: ctrlWrapper(removeFromShoppingList),
};
