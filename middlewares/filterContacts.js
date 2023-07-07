const { Contact } = require("../models/contact");

const { ctrlWrapper } = require("../helpers");

async function filterContacts(req, res, next) {
  const { _id: owner } = req.user;
  const { favorite, page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;
  if (favorite === undefined) {
    next();
    return;
  }

  res.json(
    await Contact.find(
      {
        owner,
        favorite,
      },
      "",
      { skip, limit }
    )
  );
}

module.exports = { filterContacts: ctrlWrapper(filterContacts) };
