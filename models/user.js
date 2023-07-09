const { Schema, model } = require("mongoose");
const Joi = require("joi");

const { handleMongooseError } = require("../helpers");
const { emailRegexp } = require("../constants/user");

// const shoppingListSchema = new Schema({
//   _id: false,
//   type: [
//     {
//       ingredientId: {
//         type: Schema.Types.ObjectId,
//         ref: "ingredient",
//       },

//       measure: {
//         type: [String],
//         default: [],
//       },
//     },
//   ],
//   default: [],
// });

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

    subscription: {
      type: Boolean,
      default: false,
    },
  },
  { versionKey: false, timestamps: true }
);

userSchema.post("save", handleMongooseError);

const userRegisterSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().pattern(emailRegexp).required(),
  password: Joi.string().min(6).required(),
});

const userLoginSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
  password: Joi.string().min(6).required(),
});

const verifyEmailSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
});

const schemas = {
  userRegisterSchema,
  userLoginSchema,
  verifyEmailSchema,
};

const User = model("user", userSchema);

module.exports = {
  User,
  schemas,
};
