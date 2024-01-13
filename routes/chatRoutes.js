const express = require("express");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  removeFromGroup,
  addToGroup,
  renameGroup,
} = require("../controllers/chatControllers");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.route("/").post(protect, accessChat); //create chat
router.route("/").get(protect, fetchChats);
router.route("/group").post(protect, createGroupChat);
router.route("/rename").put(protect, renameGroup);
router.route("/removeFromGroup").put(protect, removeFromGroup);
router.route("/addToGroup").put(protect, addToGroup);

module.exports = router;
