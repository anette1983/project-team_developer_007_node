const express = require("express");

const ctrl = require("../../controllers/recipes");
const { getIngredientsList } = require("../../controllers/ingredients");
const { getCategoriesList } = require("../../controllers/categories");
const { validateToken } = require("../../middlewares");

const router = express.Router();

router.get("/category-list", validateToken, getCategoriesList);

router.get("/main-page", validateToken, ctrl.getMainPageRecipes);

router.get("/", ctrl.getRecipesByQuery);

router.get("/search", validateToken, ctrl.getRecipesByTitle);

router.get("/ingredients", validateToken, ctrl.getRecipesByIngredient);

router.get("/ingredients/list", validateToken, getIngredientsList);

router.get("/own-recipes", validateToken, ctrl.getOwnrecipes);

router.post("/own-recipes", validateToken, ctrl.addRecipe);

router.delete("/own-recipes", validateToken, ctrl.deleteRecipe);

router.get("/favorite", validateToken, ctrl.getFavorite);

router.post("/favorite", validateToken, ctrl.addToFavorite);

router.delete("/favorite", validateToken, ctrl.removeFromFavorite);

router.get("/popular-recipe", validateToken, ctrl.getPopular);

router.get("/shopping-list", validateToken, ctrl.getShoppingList);

router.post("/shopping-list", validateToken, ctrl.addToShoppingList);

router.delete("/shopping-list", validateToken, ctrl.removeFromShoppingList);

module.exports = router;
