const jwt = require('jsonwebtoken')
const asyncHandler = require('./async')
const ErrorResponse = require('../utils/errorResponse')
const User = require('../models/User')

exports.protect = asyncHandler(async (req, res, next) => {
  let token

  console.log(req.cookies.token)
  // for Headers(authorization)

  // if (
  //   req.headers.authorization &&
  //   req.headers.authorization.startsWith('Bearer')
  // ) {
  //   token = req.headers.authorization.split(' ')[1]
  // }
  // Set token from cookie



  if (req.cookies.token) {
    token = req.cookies.token

  }

  if (!token) {
    return next(new ErrorResponse('Not authorized to access this routea', 401))
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    console.log(decoded, "kjkj")
    req.user = await User.findById(decoded.id)
    
    next()
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this routeb', 401))
  }
})

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this routec`,
          403
        )
      )
    }
    next()
  }
}
