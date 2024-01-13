const express = require("express");
const router = express.Router();
const {
  uploadMaterialAudio,
  fetchMaterialAudio,
  deleteMaterialAudio,
  updateMaterialAudio,
} = require("../controllers/courseMaterial-audio-controller");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "classMaterials/");
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },

  //   fileFilter: function (req, file, cb) {
  //     if (file.mimetype === "application/mp3") {
  //       cb(null, true);
  //     } else {
  //       cb(new Error("Only MP3 files are allowed"));
  //     }
  //   },
});

const upload = multer({ storage: storage });

router.post("/uploadAudio", upload.single("Audio"), uploadMaterialAudio);
router.get("/fetchAudio", fetchMaterialAudio);
router.patch("/deleteAudio/:id", deleteMaterialAudio);
router.put(
  "/updateAudio/:id",
  upload.single("modifiedAudio"),
  updateMaterialAudio
);

module.exports = router;
