const express = require("express");

const ctrl = require("../../controllers/auth");

const {
  validateBody,
  validateToken,
  uploadImage,
  // cloudinaryUpload,
} = require("../../middlewares");

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

router.get("/unsubscribe/:userEmail", ctrl.unsubscribe);

router.patch(
  "/userinfoupd",
  validateToken,
  uploadImage("avatar"),
  ctrl.upadateUserInfo
);

router.patch(
  "/subscribe",
  validateToken,
  validateBody(schemas.subscribtionEmailSchema, "missing required field email"),
  ctrl.updateUserSubscription
);

router.get("/verify/:verificationToken", ctrl.verifyUser);

router.post(
  "/verify",
  validateBody(schemas.verifyEmailSchema, "missing required field email"),
  ctrl.resendVerificationEmail
);

router.get("/information", validateToken, ctrl.getInformation);

module.exports = router;
