const { Schema, model } = require("mongoose");
const Joi = require("joi");

const { handleMongooseError } = require("../helpers");

const recipeSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Set title for recipe"],
    },
    category: {
      type: String,
      enum: [
        "Beef",
        "Breakfast",
        "Chicken",
        "Dessert",
        "Goat",
        "Lamb",
        "Miscellaneous",
        "Pasta",
        "Pork",
        "Seafood",
        "Side",
        "Starter",
        "Vegan",
        "Vegetarian",
      ],
      required: [true, "Set catgory for recipe"],
    },
    area: {
      type: String,
    },
    instructions: {
      type: String,
      required: [true, "Set instructions for recipe"],
    },
    description: {
      type: String,
      required: [true, "Set description for recipe"],
    },
    thumb: {
      type: String,
    },
    time: {
      type: String,
      required: [true, "Set cooking time for recipe"],
    },
    youtube: {
      type: String,
    },
    preview: {
      type: String,
    },
    tags: [String],
    ingredients: {
      type: [
        {
          _id: {
            type: Schema.Types.ObjectId,
            ref: "ingredient",
          },
          measure: {
            type: String,
            required: [true, "Set measure for ingredient"],
          },
        },
      ],
      required: [true, "Set ingredients for recipe"],
    },
    usersWhoLiked: { type: Array, required: true, default: [] },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { versionKey: false, timestamps: true }
);

const addToFavoriteSchema = Joi.object({ recipeId: Joi.string().required() });

const addToShoppingListSchema = Joi.object({
  ingredientId: Joi.string().required(),
  measure: Joi.string().required().messages({
    "string.base": "The measure must be a string.",
    "any.required": "The measure field is required.",
    "string.empty": "The measure must not be empty",
  }),
});

const addRecipeSchema = Joi.object({
  title: Joi.string().required().messages({
    "string.base": "The title must be a string.",
    "any.required": "The title field is required.",
    "string.empty": "The title must not be empty",
  }),
  category: Joi.string()
    .valid(
      "Seafood",
      "Lamb",
      "Side",
      "Soup",
      "Pasta",
      "Beef",
      "Miscellaneous",
      "Dessert",
      "Starter",
      "Chicken",
      "Pork",
      "Goat",
      "Breakfast",
      "Vegan",
      "Vegetarian"
    )
    .required(),
  instructions: Joi.string().required().messages({
    "string.base": "The instructions must be a string.",
    "any.required": "The instructions field is required.",
    "string.empty": "The instructions must not be empty",
  }),
  description: Joi.string().required().messages({
    "string.base": "The description must be a string.",
    "any.required": "The description field is required.",
    "string.empty": "The description must not be empty",
  }),
  time: Joi.string().required().messages({
    "string.base": "The time must be a string.",
    "any.required": "The time field is required.",
    "string.empty": "The time must not be empty",
  }),
  preview: Joi.string().required().messages({
    "any.required": "The preview field is required.",
    "string.empty": "The preview must not be empty",
  }),
  ingredients: Joi.string().required().messages({
    "array.empty": "The ingredients must not be empty",
  }),
});

const recipeSchemas = {
  addToFavoriteSchema,
  addToShoppingListSchema,
  addRecipeSchema,
};

recipeSchema.post("save", handleMongooseError);

const Recipe = model("recipe", recipeSchema);

module.exports = { Recipe, recipeSchemas };
