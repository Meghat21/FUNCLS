const express = require("express")
const router = express.Router()
const { teacherDetails } = require("../controllers/teacherDetails")
// const { upload } = require("../utils/multer")
const multer = require("multer")
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "classMaterials/");
    },
    filename(req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    },


});

const upload = multer({ storage: storage });
// router.post("/", upload.single("photo"), teacherDetails)
router.get("/", async (req, res) => {
    console.log("hello");
})



module.exports = router

