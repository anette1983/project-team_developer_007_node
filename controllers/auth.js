const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const { nanoid } = require("nanoid");
const path = require("path");

const { User } = require("../models/user");
const {
  HttpError,
  ctrlWrapper,
  sendEmail,
  createVerificationEmail,
  createSubscriptionEmail,
} = require("../helpers");
const { Recipe } = require("../models/recipe");

const { SECRET, BASE_URL } = process.env;

const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    throw HttpError(409, "Email already in use");
  }

  const HashPassword = await bcrypt.hash(password, 10);

  const verificationTokenId = nanoid();

  const newUser = await User.create({
    ...req.body,
    avatarURL: gravatar.url(email),
    password: HashPassword,
    verificationToken: verificationTokenId,
  });

  const emailHtml = createVerificationEmail({
    BASE_URL,
    email,
    verificationTokenId,
  });

  const verificationEmail = {
    to: email,
    subject: "Verify email",
    html: emailHtml,
  };

  await sendEmail(verificationEmail);

  res.status(201).json({
    userData: {
      message: "User created",
      email,
      id: newUser._id,
    },
    message: "Verification letter was send to your email",
  });
};

const login = async (req, res) => {
  const { password, email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw HttpError(401, "Email or password is wrong");
  }

  const passwordCompare = await bcrypt.compare(password, user.password);

  if (!passwordCompare) {
    throw HttpError(401, "Email or password is wrong");
  }

  if (!user.verify) {
    throw HttpError(401, "Email not verified");
  }

  const payload = { id: user._id };

  const token = jwt.sign(payload, SECRET, { expiresIn: "23h" });
  await User.findByIdAndUpdate(user._id, { token });

  res.status(200).json({
    token,
    user: {
      email: user.email,
      name: user.name,
      avatar: user.avatarURL,
    },
  });
};

const getCurrent = async (req, res) => {
  const { email, name, avatarURL } = req.user;
  res.status(200).json({ email, name, avatar: avatarURL });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });

  res.status(204).json({});
};

const updateUserSubscription = async (req, res) => {
  const { _id, subscriptionEmail } = req.user;
  const { email } = req.body;

  if (subscriptionEmail === email) {
    throw HttpError(409, "You have already subscribed");
  }

  await User.findByIdAndUpdate(
    _id,
    { subscriptionEmail: email },
    { new: true }
  );

  const emailHtml = createSubscriptionEmail({
    BASE_URL,
    email,
  });

  const subscriptionConfirmationEmail = {
    to: email,
    subject: "So Yummy newsletter",
    html: emailHtml,
  };

  await sendEmail(subscriptionConfirmationEmail);

  res
    .status(200)
    .json({ message: "You successfully subscribed to newsletter" });
};

const upadateUserInfo = async (req, res) => {
  const id = req.user._id;
  await User.findOneAndUpdate(id, req.body);
  const updateUserObj = await User.findById(id);
  res
    .status(200)
    .json({ name: updateUserObj.name, avatarURL: updateUserObj.avatarURL });
};

const verifyUser = async (req, res) => {
  const { verificationToken } = req.params;

  const user = await User.findOne({ verificationToken });

  if (!user) {
    throw HttpError(404, "User not found");
  }

  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationToken: null,
  });

  res.sendFile(path.join(__dirname, "../", "/verificationSuccess.html"));
};

const unsubscribe = async (req, res) => {
  const { userEmail } = req.params;
  const user = await User.findOne({ subscriptionEmail: userEmail });
  if (!user) {
    res.sendFile(path.join(__dirname, "../", "/unsubscribeError.html"));
  }

  res.sendFile(path.join(__dirname, "../", "/unsubscribe.html"));
};

const resendVerificationEmail = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw HttpError(404, "User not found");
  }

  if (user.verify) {
    throw HttpError(400, "Verification has already been passed");
  }

  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a target="_blank" href="http://localhost:3000/users/verify/${user.verificationToken}">Click verify email</a>`,
  };

  await sendEmail(verifyEmail);

  res.json({
    message: "Verification email sent",
  });
};

const getInformation = async (req, res) => {
  const user = req.user;

  const ownRecipes = await Recipe.find({ owner: user._id }, [
    "title",
    "category",
    "preview",
  ]);

  const favoriteRecipes = await Recipe.find(
    {
      usersWhoLiked: {
        $elemMatch: { userId: user._id },
      },
    },
    ["title", "description", "preview", "time"]
  );

  const ownRecipesCount = ownRecipes.length;
  const favoriteRecipesCount = favoriteRecipes.length;
  const timeFromRegistration = Date.now() - Date.parse(user.createdAt);
  const daysCount = Math.round(timeFromRegistration / 86400000);

  const newUser = {
    name: user.name,
    email: user.email,
    avatarURL: user.avatarURL,
    verify: true,
    subscription: false,
    shoppingList: [],
    ownRecipesCount,
    favoriteRecipesCount,
    daysCount,
  };
  res.json(newUser);
};

module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  getCurrent: ctrlWrapper(getCurrent),
  logout: ctrlWrapper(logout),
  unsubscribe: ctrlWrapper(unsubscribe),
  updateUserSubscription: ctrlWrapper(updateUserSubscription),
  upadateUserInfo: ctrlWrapper(upadateUserInfo),
  verifyUser: ctrlWrapper(verifyUser),
  resendVerificationEmail: ctrlWrapper(resendVerificationEmail),
  getInformation: ctrlWrapper(getInformation),
};
