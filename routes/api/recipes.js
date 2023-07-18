const express = require("express");

const ctrlRecipes = require("../../controllers/recipes");
const ctrlUser = require("../../controllers/user");

const { getIngredientsList } = require("../../controllers/ingredients");
const { getCategoriesList } = require("../../controllers/categories");
const { recipeSchemas } = require("../../models/recipe");
const {
  validateToken,
  validateBody,
  uploadImage,
} = require("../../middlewares");

const router = express.Router();

router.get("/category-list", validateToken, getCategoriesList);

router.get("/main-page", validateToken, ctrlRecipes.getMainPageRecipes);

router.get("/category/:name", validateToken, ctrlRecipes.getRecipesByCategory);

router.get("/search", validateToken, ctrlRecipes.getRecipesByTitle);

router.get("/ingredients", validateToken, ctrlRecipes.getRecipesByIngredient);

router.get("/ingredients/list", validateToken, getIngredientsList);

router.get("/own-recipes", validateToken, ctrlRecipes.getOwnRecipes);

router.post(
  "/own-recipes",
  validateToken,
  uploadImage("preview"),
  validateBody(recipeSchemas.addRecipeSchema),
  ctrlRecipes.addRecipe
);

router.delete(
  "/own-recipes/:recipeId",
  validateToken,
  ctrlRecipes.deleteRecipe
);

router.get("/favorite", validateToken, ctrlRecipes.getFavorite);

router.post(
  "/favorite",
  validateBody(recipeSchemas.addToFavoriteSchema),
  validateToken,
  ctrlRecipes.addToFavorite
);

router.delete(
  "/favorite/:recipeId",
  validateToken,
  ctrlRecipes.removeFromFavorite
);

router.get("/popular-recipe", validateToken, ctrlRecipes.getPopular);

router.get("/shopping-list", validateToken, ctrlUser.getShoppingList);

router.post(
  "/shopping-list",
  validateBody(recipeSchemas.addToShoppingListSchema),
  validateToken,
  ctrlUser.addToShoppingList
);

router.delete(
  "/shopping-list/:ingredientId",
  validateToken,
  ctrlUser.removeFromShoppingList
);

router.get("/:id", validateToken, ctrlRecipes.getRecipeById);

module.exports = router;
