const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/User");

let message = {
  success: false,
  data: null,
  message: "",
};
//@description     Create or fetch One to One Chat
//@route           POST /api/chat/
//@access          Protected
const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  console.log(userId);
  if (!userId) {
    console.log("UserId param not sent with request");
    message = {
      success: false,
      data: null,
      message: 'UserId param not sent with request'
    }
    return res.status(400).send(message);
  }

  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user.id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    message = {
      success: true,
      data: isChat[0],
      message: 'Successful'
    }
    return res.send(message);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user.id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      message = {
        success: true,
        data: FullChat,
        message: 'Successful'
      }
      return res.status(200).send(message);

    } catch (error) {
      message = {
        success: false,
        data: null,
        message: error.message
      }
      return res.status(400).send(message);
    }
  }
});

//@description     Fetch all chats for a user
//@route           GET /api/chat/
//@access          Protected
const fetchChats = asyncHandler(async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user.id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email",
        });
        message = {
          success: true,
          data: results,
          message: 'Successful'
        }
        return res.status(200).send(message);
      });
  } catch (error) {
    message = {
      success: false,
      data: null,
      message: error.message
    }
    return res.status(400).send(message);
  }
});

//@description     Create New Group Chat
//@route           POST /api/chat/group
//@access          Protected
const createGroupChat = asyncHandler(async (req, res) => {
  // if (!req.body.users || !req.body.username) {
  //   return res.status(400).send({ message: "Please Fill all the feilds" });
  // }


  if (!req.body.users || !req.body.name) {
    message = {
      success: false,
      data: null,
      message: "Please fill all the fields",
    };
    return res.status(400).send(message)

  }
  const { users } = req.body

  if (users.length < 2) {
    message = {
      success: false,
      data: null,
      message: 'More than 2 users are required to form a group chat'
    }
    return res.status(400).send(message);
  }

  // users.push(req.user._id);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    message = {
      success: true,
      data: fullGroupChat,
      message: 'Successful'
    }
    return res.status(400).send(message);
  } catch (error) {
    message = {
      success: false,
      data: null,
      message: error.message
    }
    return res.status(400).send(message);
  }
});

// @desc    Rename Group
// @route   PUT /api/chat/rename
// @access  Protected
const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName: chatName,
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    message = {
      success: false,
      data: null,
      message: 'Chat Not Found'
    }
    return res.status(404).send(message);
  } else {
    message = {
      success: true,
      data: updatedChat,
      message: 'Successful'
    }
    return res.status(200).send(message);
  }
});

// @desc    Remove user from Group
// @route   PUT /api/chat/groupremove
// @access  Protected
const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    message = {
      success: false,
      data: null,
      message: 'Chat Not Found'
    }
    return res.status(404).send(message);
  } else {
    message = {
      success: true,
      data: removed,
      message: 'Successful'
    }
    return res.status(200).send(message);
  }
});

// @desc    Add user to Group / Leave
// @route   PUT /api/chat/groupadd
// @access  Protected
const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin

  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    message = {
      success: true,
      data: null,
      message: 'Chat Not Found'
    }
    return res.status(404).send(message);
  } else {
    message = {
      success: true,
      data: added,
      message: 'Successful'
    }
    return res.status(200).send(message);
  }
});

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
};
