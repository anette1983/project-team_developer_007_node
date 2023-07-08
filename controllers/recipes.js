const { Recipe } = require("../models/recipe");

const { HttpError, ctrlWrapper } = require("../helpers");
const mongoose = require("mongoose");
const { Ingredient } = require("../models/ingredient");

const getCategories = async (req, res) => {};

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
  console.log(req.params);

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
  const ingredients = await Ingredient.find(
    {
      name: { $regex: query, $options: "i" },
    },
    "id"
  );
  // const newArr = await ingredients.map(({ _id }) => ({ id: _id }));
  const data = await Recipe.find(
    {
      // ingredients: {
      //   $elemMatch: {
      "ingredients.ingredientId": "640c2dd963a319ea671e3111",
      // },
    }

    // ["category", "title", "_id"]
  );
  // const ObjectId = mongoose.Types.ObjectId;

  // const data = await Recipe.find(
  //   {
  //     ingredients: {
  //       $elemMatch: {
  //         id: ObjectId(query),
  //       },
  //     },
  //   },
  //   ["preview", "title"],
  //   {
  //     skip,
  //     limit,
  //   }
  // );
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
  const id = req.body;
  const result = await Recipe.deleteOne({ _id: id });
  if (result.deletedCount === 0) {
    throw HttpError(404, "Not found");
  }
  res.status(200).json({ message: "recipe deleted" });
};

const getFavorite = async (req, res) => {
  const { id } = req.query;
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
  const recipeId = req.body;
  await Recipe.findByIdAndUpdate(recipeId, {
    $push: { usersWhoLiked: { id } },
  });
  res.json(201, "recipe added");
};

const removeFromFavorite = async (req, res) => {
  const id = req.user._id;
  const recipeId = req.body;
  await Recipe.findByIdAndUpdate(recipeId, {
    $pull: { usersWhoLiked: { id } },
  });
  res.json(201, "recipe deleted");
};

const getPopular = async (req, res) => {};

module.exports = {
  getCategories: ctrlWrapper(getCategories),
  getMainPageRecipes: ctrlWrapper(getMainPageRecipes),
  getRecipesByQuery: ctrlWrapper(getRecipesByQuery),
  // getRecipeById: ctrlWrapper(getRecipeById),
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
