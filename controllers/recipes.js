const { Recipe } = require("../models/recipe");
const { User } = require("../models/user");
const { HttpError, ctrlWrapper } = require("../helpers");
const { Ingredient } = require("../models/ingredient");

// const getCategories = async (req, res) => {};

const getMainPageRecipes = async (req, res) => {
  const data = await Recipe.find(
    {
      $or: [
        { category: "Seafood" },
        { category: "Lamb" },
        { category: "Chicken" },
        { category: "Vegan" },
      ],
    },
    ["category", "title", "_id"]
  );
  res.json(data);
};

const getRecipesByQuery = async (req, res) => {
  const { category, id } = req.query;
  if (category && id) {
    throw HttpError(400);
  }
  const limit = 8;
  if (!category) {
    const data = await Recipe.findById(id);
    return res.json(data);
  }
  const data = await Recipe.find({ category }, ["preview", "title"], {
    limit,
  });
  res.json(data);
};

const getRecipesByTitle = async (req, res) => {
  const { query } = req.query;
  console.log(req.query);

  const data = await Recipe.find(
    {
      title: {
        $regex: query,
        $options: "i",
      },
    },
    ["preview", "title"]
  );
  if (data.length === 0) {
    throw HttpError(404);
  }
  res.json(data);
};

const getRecipesByIngredient = async (req, res) => {
  const { query } = req.query;
  console.log(query);
  const ingredients = await Ingredient.aggregate([
    { $match: { name: { $regex: query, $options: "i" } } },
    { $project: { id: 0, name: 0, desc: 0, img: 0 } },
  ]);
  console.log(ingredients);
  const data = await Recipe.find(
    {
      ingredients: {
        $elemMatch: {
          $or: ingredients,
        },
      },
    },

    ["category", "title", "_id"]
  );
  res.json(data);
};

const getOwnRecipes = async (req, res) => {
  const id = req.user._id;
  const data = await Recipe.find({ owner: id }, [
    "title",
    "category",
    "preview",
  ]);
  console.log(data);
  res.json(data);
};

const addRecipe = async (req, res) => {
  const id = req.user._id;
  const body = req.body;
  const data = await Recipe.create({ ...body, owner: id });
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
  const id = req.user._id;

  const data = await Recipe.find(
    {
      usersWhoLiked: {
        $elemMatch: { userId: id },
      },
    },
    ["title", "description", "preview", "time"]
  );
  if (data === []) {
    throw HttpError(404, "nothing found");
  }
  res.json(data);
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
    throw HttpError(409, "can not remove from favorite");
  }
  await Recipe.findByIdAndUpdate(recipeId, {
    $pull: { usersWhoLiked: { userId: id } },
  });
  res.json(201, "recipe deleted");
};

const getPopular = async (req, res) => {
  const data = await Recipe.aggregate([
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
    { $project: { totalAdded: 1, title: 1, preview: 1 } },
  ]);

  res.json(data);
};

const getShoppingList = async (req, res) => {
  const id = req.user._id;
  const data = await User.findById(id, "shoppingList");
  res.json(data);
};
const addToShoppingList = async (req, res) => {
  const id = req.user._id;
  const { ingredientId, measure } = req.body;
  // const shoppingList = await User.find(id, "shoppingList");

  const data = await User.findByIdAndUpdate(
    id,
    {
      $push: { shoppingList: { ingredientId, measure } },
    },

    { new: true }
  );
  res.json(data.shoppingList);
};
const removeFromShoppingList = async (req, res) => {
  const id = req.user._id;
  const { ingredientId } = req.params;
  // const shoppingList = await User.find(id, "shoppingList");

  const data = await User.findByIdAndUpdate(
    id,
    {
      $pull: { shoppingList: { ingredientId } },
    },

    { new: true }
  );
  res.json(data.shoppingList);
};

module.exports = {
  // getCategories: ctrlWrapper(getCategories),
  getMainPageRecipes: ctrlWrapper(getMainPageRecipes),
  getRecipesByQuery: ctrlWrapper(getRecipesByQuery),
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
