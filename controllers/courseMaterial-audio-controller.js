const multer = require("multer");
const path = require("path");

const material = require("../models/courseMaterial")
const { getFullUrl } = require("../utils/others");






// ===============================================================upload==========================================================


const uploadMaterialAudio = async (req, res) => {
  try {
    const file = {
      fileName: req?.file?.filename,
      fileUrl: `${getFullUrl(req)}/${req?.file?.path}`,
    };
console.log(file)
    const uploadMaterial = new material({
      lesson: req?.body?.lesson,
      subject: req?.body?.subject,
      teacher: req?.body?.teacher,
      courseMaterialAudio: {
        name: file?.fileName,
        url: file?.fileUrl,
      },
    });
    const saveMaterial = await uploadMaterial.save();
    res.status(200).json({
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

// ===================================================fetch======================================================================
const fetchMaterialAudio = async (req, res) => {
  try {
    const audioData = await material.find();
    res.status(200).json({ status: "SUCCESS", data: audioData });
  } catch (err) {
    res.status(400).json({
      status: "FAILURE",
      msg: `Internal server error-${err.message}` || " Internal server error",
    });
  }
};




// ====================================================delete===================================================================
const deleteMaterialAudio = async (req, res) => {
  try {
    const { id } = req.params;
    const audioData = await material.findById(id);
    console.log(audioData);
    if (!audioData) {
      return res
        .status(400)
        .json({ status: "FAILURE", msg: "Audio file already deleted!!!!" });
    }
    material
      .findByIdAndDelete(id)
      .then((data) => {
        res
          .status(200)
          .json({ status: "SUCCESS", msg: "Audio file deleted successfully" });
      })
      .catch((err) => {
        res.status(400).json({
          status: "FAILURE",
          msg:
            `Internal server error-${err.message}` || "Internal server error",
        });
      });
  } catch (err) {
    res.status(400).json({ status: "FAILURE", msg: "Internal server error" });
  }
};



// ======================================================update==================================================================

const updateMaterialAudio = async (req, res) => {
  try {
    const file = {
      fileName: req?.file?.filename,
      fileUrl: `${getFullUrl(req)}/${req?.file?.path}`,
    };
    console.log(req.body.lesson);
    const updatedAudio = await material.findByIdAndUpdate(req.params.id, {
      lesson: req?.body?.lesson,
      subject: req.body.subject,
      subject: req?.body?.subject,

      courseMaterialAudio: {
        name: file?.fileName,
        url: file?.fileUrl,
      },
    });

    res.status(200).json({ status: "SUCCESS", msg: updatedAudio });
  } catch (err) {
    res.status(400).json({
      status: "SUCCESS",
      msg: `Internal server error-${err?.message}` || "Internal server error",
    });
  }
};
module.exports = {
  uploadMaterialAudio,
  fetchMaterialAudio,
  deleteMaterialAudio,
  updateMaterialAudio,
};
