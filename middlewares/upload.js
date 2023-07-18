const multer = require("multer");
const path = require("path");
const cloudinary = require("../utils/cloudinary");
const fs = require("fs");

const temDir = path.join(__dirname, "../", "temp");

const multerConfig = multer.diskStorage({
  destination: temDir,
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: multerConfig });

const uploadImage = (imageFormField) => {
  const hiddenFunc = async (req, res, next) => {
    const multerFunc = upload.single(imageFormField);
    multerFunc(req, res, async () => {
      if (req.file) {
        const { fieldname, path } = req.file;
        const fileName = req.body.title || req.user._id;
        await cloudinary.uploader.upload(
          path,
          {
            upload_preset: fieldname,
            use_filename: true,
            public_id: `${fileName}`,
          },
          function (error, result) {
            if (error) {
              return res.status(505).json({
                message: error.message,
              });
            }
            if (fieldname === "avatar") {
              req.body.avatarURL = result.url;
            }
            if (fieldname === "preview") {
              req.body.preview = result.url;
            }
            fs.rm(req.file.path, { force: true }, () => {});
          }
        );
      }
      next();
    });
  };
  return hiddenFunc;
};

module.exports = uploadImage;
