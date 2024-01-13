const multer = require("multer");
const path = require("path");

const material = require("../models/courseMaterial");
const { getFullUrl } = require("../utils/others");

const uploadMaterialVideo = async (req, res) => {
  try {
    const file = {
      fileName: req?.file?.filename,
      fileUrl: `${getFullUrl(req)}/${req?.file?.path}`,
    };

    const uploadMaterial = new material({
      lesson: req?.body?.lesson,
      subject: req?.body?.subject,
      courseMaterial: {
        name: file?.fileName,
        url: file?.fileUrl,
      },
    });
    const saveMaterial = await uploadMaterial.save();
    res.status(400).json({
      status: "SUCCESS",
      data: saveMaterial,
    });
  } catch (err) {
    res.status(400).json({
      status: "FAILURE",
      msg: `Internal server error-${err.message}` || "Internal server error",
    });
  }
};

module.exports = { uploadMaterialVideo };
