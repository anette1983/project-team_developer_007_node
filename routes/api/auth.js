const express = require("express");

const ctrl = require("../../controllers/auth");

const {
  validateBody,
  validateToken,
  upload,
  cloudinaryUpload,
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

router.patch("/subscribe", validateToken, ctrl.updateUserSubscription);

router.patch("/userinfoupd", validateToken,upload.single("avatar"),cloudinaryUpload, ctrl.upadateUserInfo);

router.get("/verify/:verificationToken", ctrl.verifyUser);

router.post(
  "/verify",
  validateBody(schemas.verifyEmailSchema, "missing required field email"),
  ctrl.resendVerificationEmail
);

router.get("/information", validateToken, ctrl.getInformation);

module.exports = router;
