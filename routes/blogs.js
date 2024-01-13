const express = require("express");
const router = express.Router();

const{
    getBlogs,
    createBlog,
    updateBlog,
    deleteBlog
} = require("../controllers/blogController");

router.route("/").get(getBlogs);
router.route("/").post(createBlog);
router.route("/:id").put(updateBlog);
router.route("/:id").delete(deleteBlog);

module.exports = router;