const express = require("express");

const {
  getAllContacts,
  getContact,
  add,
  deleteContact,
  putContact,
  updateStatusContact,
} = require("../../controllers/contacts");

const {
  validateBody,
  isValidId,
  validateToken,
  filterContacts,
} = require("../../middlewares");
const { schema, updateFavoriteFieldSchema } = require("../../models/contact");

const router = express.Router();

router.get("/", validateToken, filterContacts, getAllContacts);

router.get("/:contactId", validateToken, isValidId, getContact);

router.post("/", validateToken, validateBody(schema), add);

router.delete("/:contactId", validateToken, isValidId, deleteContact);

router.put(
  "/:contactId",
  validateToken,
  isValidId,
  validateBody(schema),
  putContact
);

router.patch(
  "/:contactId/favorite",
  validateToken,
  isValidId,
  validateBody(updateFavoriteFieldSchema, "missing field favorite"),
  updateStatusContact
);

module.exports = router;
