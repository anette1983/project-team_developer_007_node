const cloudinary = require("../utils/cloudinary");
const fs = require("fs");

const cloudinaryUpload = async (req, res, next) => {
  if (req.file){
    const { fieldname, path } = req.file;
    const fileName = req.body.title || req.user._id ;
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
              message: error.message
            });
          }
          if (fieldname === "avatar") {
            req.body.avatarURL = result.url;
          }
          if (fieldname === "img") {
            req.body.preview = result.url;
          }
          fs.rm(req.file.path, { force: true }, () => {});
        }
      );
    }
  next();
};

module.exports = cloudinaryUpload;
