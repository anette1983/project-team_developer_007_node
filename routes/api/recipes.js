const express = require("express");

const ctrl = require("../../controllers/recipes");
const { getIngredientsList } = require("../../controllers/ingredients");
const { getCategoriesList } = require("../../controllers/categories");
const { recipeSchemas } = require("../../models/recipe");
const {
  validateToken,
  validateBody,
  upload,
  cloudinaryUpload,
} = require("../../middlewares");
// const { schemas } = require("../../models/user");

const router = express.Router();

router.get("/category-list", validateToken, getCategoriesList);

router.get("/main-page", validateToken, ctrl.getMainPageRecipes);

router.get("/recipe/:id", validateToken, ctrl.getRecipeById);

router.get("/category/:name", validateToken, ctrl.getRecipesByCategory);

router.get("/search", validateToken, ctrl.getRecipesByTitle);

router.get("/ingredients", validateToken, ctrl.getRecipesByIngredient);

router.get("/ingredients/list", validateToken, getIngredientsList);

router.get("/own-recipes", validateToken, ctrl.getOwnRecipes);

router.post(
  "/own-recipes",
  validateToken,
  upload.single("preview"),
  cloudinaryUpload,
  validateBody(recipeSchemas.addRecipeSchema),
  ctrl.addRecipe
);

router.delete("/own-recipes/:recipeId", validateToken, ctrl.deleteRecipe);

router.get("/favorite", validateToken, ctrl.getFavorite);

router.post(
  "/favorite",
  validateBody(recipeSchemas.addToFavoriteSchema),
  validateToken,
  ctrl.addToFavorite
);

router.delete("/favorite/:recipeId", validateToken, ctrl.removeFromFavorite);

router.get("/popular-recipe", validateToken, ctrl.getPopular);

router.get("/shopping-list", validateToken, ctrl.getShoppingList);

router.post(
  "/shopping-list",
  validateBody(recipeSchemas.addToShoppingListSchema),
  validateToken,
  ctrl.addToShoppingList
);

router.delete(
  "/shopping-list/:ingredientId",
  validateToken,
  ctrl.removeFromShoppingList
);

module.exports = router;
