const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/User");
const Chat = require("../models/chatModel");

let messageInfo = {
  success: false,
  data: null,
  message: "",
};
//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");
      messageInfo = {
        success:true,
        data:messages,
        message:'Successful'
      }
      return res.send(messageInfo);
  } catch (error) {
    messageInfo = {
      success:false,
      data:null,
      message:error.message
    }
    return res.status(400).send(messageInfo);
  }
});

//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    messageInfo = {
      success:false,
      data:null,
      message:'Invalid data passed into request'
    }
    return res.status(400).send(messageInfo);
  }

  var newMessage = {
    sender: req.user.id,
    content: content,
    chat: chatId,
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });
    messageInfo = {
      success:true,
      data:message,
      message:'Successful'
    }
    return res.send(messageInfo);
  } catch (error) {
    messageInfo = {
      success:false,
      data:null,
      message:error.message
    }
    return res.status(400).send(messageInfo);
  }
});

module.exports = { allMessages, sendMessage };
