const express = require("express");

const ctrl = require("../../controllers/auth");

const { validateBody, validateToken, upload } = require("../../middlewares");

const { schemas } = require("../../models/user");


const router = express.Router();

router.post(
  "/register",
  validateBody(schemas.userRegisterSchema),
  ctrl.register
);

router.post("/login", validateBody(schemas.userLoginSchema), ctrl.login);

router.get("/current", validateToken, ctrl.getCurrent);

router.post("/logout", validateToken, ctrl.logout);

router.patch("/subscribe", validateToken, ctrl.updateUserSubscription);

router.patch(
  "/avatars",
  validateToken,
  upload.single("avatar"),
  ctrl.updateAvatar
);

router.get("/verify/:verificationToken", ctrl.verifyUser);

router.post(
  "/verify",
  validateBody(schemas.verifyEmailSchema, "missing required field email"),
  ctrl.resendVerificationEmail
);

module.exports = router;
