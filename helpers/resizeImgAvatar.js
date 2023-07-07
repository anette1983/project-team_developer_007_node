const jimp = require("jimp");

const resizeImgAvatar = async (pathToImg) => {
  const image = await jimp.read(pathToImg);
  await image.resize(250, 250);
  await image.writeAsync(pathToImg);
};

module.exports = resizeImgAvatar;
