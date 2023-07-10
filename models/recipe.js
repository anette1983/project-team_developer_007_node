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
      required: [true, "Set area of recipe"],
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
      required: [true, "Set thumb link for recipe"],
    },
    time: {
      type: String,
      required: [true, "Set cooking time for recipe"],
    },
    youtube: {
      type: String,
      required: [true, "Set youtube link for recipe"],
    },
    preview: {
      type: String,
      required: [true, "Set preview link for recipe"],
    },
    tags: [String],
    ingredients: {
      type: [
        {
          id: {
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
    usersWhoLiked: { type: Array },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { versionKey: false, timestamps: true }
);

const schema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  favorite: Joi.boolean(),
});

recipeSchema.post("save", handleMongooseError);

const Recipe = model("recipe", recipeSchema);

module.exports = { Recipe, schema };
