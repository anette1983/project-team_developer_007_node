const { HttpError } = require("../helpers");

const validateBody = (schema, message = "missing fields") => {
  return (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
      throw HttpError(400, message);
    }

    const { error } = schema.validate(req.body);
    if (error) {
      next(
        HttpError(
          400,
          `missing required ${error.details[0].context.label} field`
        )
      );
    }
    next();
  };
};

module.exports = validateBody;
