const { Schema, model } = require("mongoose");
const Joi = require("joi");

const { handleMongooseError } = require("../helpers");
const { emailRegexp } = require("../constants/user");

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    password: {
      type: String,
      required: [true, "Set password for user"],
    },
    email: {
      type: String,
      match: emailRegexp,
      required: [true, "Email is required"],
      unique: true,
    },
    avatarURL: {
      type: String,
    },

    token: {
      type: String,
    },
    verify: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      required: [true, "Verify token is required"],
    },
    shoppingList: {
      _id: false,

      type: [
        {
          ingredientId: {
            type: Schema.Types.ObjectId,
            ref: "ingredient",
          },

          measure: {
            type: [String],
            default: [],
          },
        },
      ],
      default: [],
      required: true,
    },

    subscriptionEmail: {
      type: String,
      default: "",
    },
  },
  { versionKey: false, timestamps: true }
);

userSchema.post("save", handleMongooseError);

const userRegisterSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.base": "The name must be a string.",
    "any.required": "The name field is required.",
    "string.empty": "The name must not be empty",
  }),
  email: Joi.string().pattern(emailRegexp).required().messages({
    "string.base": "The email must be a string.",
    "any.required": "The email field is required.",
    "string.empty": "The email must not be empty",
    "string.pattern.base": "The email must be in format test@gmail.com.",
  }),
  password: Joi.string().min(6).required().messages({
    "string.base": "The email must be a string.",
    "any.required": "The email field is required.",
    "string.empty": "The email must not be empty",
    "string.min": "The password must be not less 6 symbols.",
  }),
});

const userLoginSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required().messages({
    "string.base": "The email must be a string.",
    "any.required": "The email field is required.",
    "string.empty": "The email must not be empty",
    "string.pattern.base": "The email must be in format test@gmail.com.",
  }),
  password: Joi.string().min(6).required().messages({
    "string.base": "The email must be a string.",
    "any.required": "The email field is required.",
    "string.empty": "The email must not be empty",
    "string.min": "The password must be not less 6 symbols.",
  }),
});

const verifyEmailSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required().messages({
    "string.base": "The email must be a string.",
    "any.required": "The email field is required.",
    "string.empty": "The email must not be empty",
    "string.pattern.base": "The email must be in format test@gmail.com.",
  }),
});

const subscribtionEmailSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required().messages({
    "string.base": "The email must be a string.",
    "any.required": "The email field is required.",
    "string.empty": "The email must not be empty",
    "string.pattern.base": "The email must be in format test@gmail.com.",
  }),
});

const schemas = {
  userRegisterSchema,
  userLoginSchema,
  verifyEmailSchema,
  subscribtionEmailSchema,
};

const User = model("user", userSchema);

module.exports = {
  User,
  schemas,
};
