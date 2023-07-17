const { Schema, model } = require("mongoose");

const { handleMongooseError } = require("../helpers");

const ingredientSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
    },
    img: {
      type: String,
    },
  },
  { versionKey: false, timestamps: true }
);

ingredientSchema.post("save", handleMongooseError);

const Ingredient = model("ingredient", ingredientSchema);

module.exports = { Ingredient };
