const { Schema, model } = require("mongoose");
const Joi = require("joi");

const { handleMongooseError } = require("../helpers");

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  { versionKey: false, timestamps: true }
);

categorySchema.post("save", handleMongooseError);

const Category = model("category", categorySchema);

module.exports = { Category };
