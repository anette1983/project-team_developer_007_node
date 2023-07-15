const cloudinary = require("../utils/cloudinary");
const fs = require('fs')

const cloudinaryUpload = async (req, res, next) => {
    const {fildname, path}= req.file
    const {title} = req.body
    await cloudinary.uploader.upload(
      path,
      { upload_preset: fildname, use_filename: true, public_id: `${title}` },
      function (error, result) {
        if (error) {
          return res.status(500).json({
            message: error.message,
          });
        }
        fs.rm(req.file.path, { force: true }, () => {});
        req.body.thumb = result.url;
      }
    );
    // console.log(uploadData);
      next()
}

module.exports = cloudinaryUpload;