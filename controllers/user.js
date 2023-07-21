/* eslint-disable array-callback-return */

const { User } = require("../models/user");
const { HttpError, ctrlWrapper } = require("../helpers");
const { Ingredient } = require("../models/ingredient");

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
          { $unwind: "$shoppingList" },

          {
            $lookup: {
              from: "ingredients",
              localField: "shoppingList.ingredientId",
              foreignField: "_id",
              as: "shoppingListDescr",
            },
          },
          {
            $project: {
              ingredient: {
                $arrayElemAt: ["$shoppingListDescr", 0],
              },
              measure: "$shoppingList.measure",
            },
          },

          { $skip: Number(skip) },
          { $limit: Number(limit) },
          { $project: { ingredient: 1, measure: 1, _id: 0 } },
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

  if (data.length === 0) {
    res.json({total: 0, list:[]})
  }
  const totalCount = Object.values(total[0]);

  res.json({ total: totalCount[0], list: [...data] });
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

  res.json({ ...response._doc, measure: [measure] });
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
  getShoppingList: ctrlWrapper(getShoppingList),
  addToShoppingList: ctrlWrapper(addToShoppingList),
  removeFromShoppingList: ctrlWrapper(removeFromShoppingList),
};
