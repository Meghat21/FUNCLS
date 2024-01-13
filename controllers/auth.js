const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const sendEmail = require("../utils/sendEmail");
const otpGenerator = require("../utils/otpGenerator");

//models are imported here
const User = require("../models/User");
const otpModel = require("../models/OtpModel");

//@desc   Get Users
//@route  GET /api/v1/auth/getusers
//@access PUBLIC
// exports.getUsers =asyncHandler(async(req,res,next)=>{
//   const user = await User.find().select("-password");
//   if(!user){
//     next(new ErrorResponse("Nothing Found",404));
//   }
//   res.status(200).json({success:true,user});
// })

//getUser by search query
exports.getUsersByName = async(req,res)=>{
  try {
    const keyword = req.query.search ? {
      $or: [
        {name: {$regex: req.query.search, $options: 'i'}},
        {email: {$regex: req.query.search, $options:'i'}}
      ]
    } : {}
    const users = await User.find(keyword).find({ _id: {$ne: req.user.id}})
    message = {
      success: true,
      data: users,
      message: 'Success',
    };
    return res.send(message);
    res.send(users)
  } catch (error) {
    message = {
      success: false,
      data: null,
      message: error.message,
    };
    return res.send(message);
  }
}
//getAllUsers except loggedIn user
exports.getUsers = async(req,res,next)=>{
  try {
    const users = await User.find({ _id: {$ne: req.user.id}}).select('_id username email pic')
    message = {
      success: true,
      data: users,
      message: "Successfull😊",
    };
    return res.send(message);
  } catch (error) {
    message = {
      success: false,
      data: null,
      message: error.message,
    };
    return res.send(message);
  }
}


// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, username, email, password, role } = req.body;

  let user = await User.findOne({ email });
  if (user) return next(new ErrorResponse("Email already exists", 401));
  user = await User.findOne({ username });
  if (user) return next(new ErrorResponse("Username already exists", 401));

  user = await User.create({
    name,
    username,
    email,
    password,
    role
  })

  sendTokenResponse(user, 200, res)
})

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { auth, password } = req.body;

  if (!auth || !password) {
    return next(
      new ErrorResponse("Please provide an email/username and password", 400)
    );
  }

  const [user] = await User.find({})
    .or([{ username: auth }, { email: auth }])
    .select("+password");

  if (!user) {
    return next(new ErrorResponse("Invalid credentials", 400));
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse("Invalid credentials", 400));
  }

  sendTokenResponse(user, 200, res)
})

// @desc    Log user out / clear cookie
// @route   GET /api/v1/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.clearCookie("token")
  res.status(200).json({ success: true, msg: "logout" })
})

// @desc    Get current logged in user
// @route   POST /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = req.user;

  res.status(200).json({ success: true, data: user });
});

// @desc    Update user details
// @route   POST /api/v1/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fields = {
    username: req.body.username,
    email: req.body.email,
  };
  let user = await User.findOne({ email: fields.email });

  if (user && user.email !== req.user.email)
    return next(new ErrorResponse("Email already exists", 401));

  user = await User.findOne({ username: fields.username });
  if (user && user.username !== req.user.username)
    return next(new ErrorResponse("Username already exists", 401));

  user = await User.findByIdAndUpdate(req.user.id, fields, {
    new: true,
    runValidators: true,
    context: "query",
  });

  res.status(200).json({ success: true, data: user });
});

// @desc    Update password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse("Password is incorrect", 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
// exports.forgotPassword = asyncHandler(async (req, res, next) => {
// const [user] = await User.find({}).or([
//   { username: req.body.auth },
//   { email: req.body.auth }
// ])

// if (!user) {
//   return next(new ErrorResponse('There is no user with that email', 404))
// }

// const resetToken = user.getResetPasswordToken()

// await user.save({ validateBeforeSave: false })

// const resetUrl = `${req.protocol}://${req.get(
//   'host'
// )}/api/v1/auth/resetpassword/${resetToken}`

// const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`

// try {
//   await sendEmail({
//     email: user.email,
//     subject: 'Password reset token',
//     message
//   })
//   res.status(200).json({ success: true, data: 'Email sent' })
// } catch (err) {
//   console.log(err)
//   user.resetPasswordToken = undefined
//   user.resetPasswordExpire = undefined

//   await user.save({ validateBeforeSave: false })

//   return next(new ErrorResponse('Email could not be sent', 500))
// }
// })

// @desc    Forgot password
// @route   POST /api/v1/auth/sendotp
// @access  Public
exports.sendOtp = asyncHandler(async (req, res, next) => {
  try {
    //destructuring the email from the request body
    const email = req.body.email;

    //searching for the user in the database with the same email as in the body of request
    const user = await User.findOne({ email });

    //if user not found sending the 404 response
    if (!user) {
      return next(new ErrorResponse("there is no user with this email", 404));
    }

    //searching whether the token already exists or not
    const doc = await otpModel.findOne({ userID: user._id });

    //if document found, deleting it to store new one so that we can create a new otp
    if (doc) {
      await doc.deleteOne();
    }

    //if no document exists or deleted the token, thus creating a new one and storing in the database
    const otp = otpGenerator();

    const otpDoc = await otpModel.create({
      userID: user._id,
      email,
      otp,
    });

    //deleting the document after 2 mins
    setTimeout(async () => {
      const doc = await otpModel.findOneAndDelete({ userID: user._id });
      console.log("deleted doc", doc);
    }, 1000 * 120);

    //creating options object that needs to be sent to the
    const options = {
      email,
      subject: "Use Below Otp to verify and set new password",
      message: `${otp}`,
    };

    //calling the send mail function with arg. as the options

    await sendEmail(options);
    res.status(200).json({ status: true, msg: "otp sent successfully" });
  } catch (error) {
    console.log(error);
    return next(new ErrorResponse("Email could not be sent", 500));
  }

  // const [user] = await User.find({}).or([
  //   { username: req.body.auth },
  //   { email: req.body.auth }
  // ])

  // if (!user) {
  //   return next(new ErrorResponse('There is no user with that email', 404))
  // }

  // const resetToken = user.getResetPasswordToken()

  // await user.save({ validateBeforeSave: false })

  // const resetUrl = `${req.protocol}://${req.get(
  //   'host'
  // )}/api/v1/auth/resetpassword/${resetToken}`

  // const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`

  // try {
  //   await sendEmail({
  //     email: user.email,
  //     subject: 'Password reset token',
  //     message
  //   })
  //   res.status(200).json({ success: true, data: 'Email sent' })
  // } catch (err) {
  //   console.log(err)
  //   user.resetPasswordToken = undefined
  //   user.resetPasswordExpire = undefined

  //   await user.save({ validateBeforeSave: false })

  //   return next(new ErrorResponse('Email could not be sent', 500))
  // }
});

//@desc Verify otp
//@route POST /api/v1/auth/verifyotp
//@access Private
exports.verifyOtp = asyncHandler(async (req, res, next) => {
  // destructuring the otp from the request body
  const { otp } = req.body;
  console.log(otp);

  //searching for the sent otp in the database
  const doc = await otpModel.findOne({ otp });
  if (!doc) {
    next(new ErrorResponse("Invalid Credentials", 404));
  }
  console.log("this user is verified");
  res.status(200).json({ success: true });
});

// @desc    Reset password
// @route   PATCH /api/v1/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { email, newPassword, confirmNewPassword } = req.body;

  if (newPassword === confirmNewPassword) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    const user = await User.findOneAndUpdate({ email }, { password: hashedPassword }, { new: true });
    if (!user) {
      next(new ErrorResponse("Invalid Credentials", 500));
    };
    console.log("this is after updation", user);
    res.status(200).json({ success: true });
  } else {
    next(new ErrorResponse("Invalid Credentials", 500));
  }
  // // Get hashed token
  // const resetPasswordToken = crypto
  //   .createHash('sha256')
  //   .update(req.params.resettoken)
  //   .digest('hex')
  // console.log(resetPasswordToken)
  // const user = await User.findOne({
  //   resetPasswordToken,
  //   resetPasswordExpire: { $gt: Date.now() }
  // })
  // if (!user) {
  //   return next(new ErrorResponse('Invalid token', 400))
  // }
  // // Set new password
  // user.password = req.body.password
  // user.resetPasswordToken = undefined
  // await user.save()
  // sendTokenResponse(user, 200, res)
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken()


  //cloning and sending the user details
  const obj = JSON.stringify(user);
  const userDetails = JSON.parse(obj);
  delete (userDetails["password"]);

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({ success: true, token,userDetails })
}
