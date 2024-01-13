const express = require('express')
const router = express.Router()

const {
  getUsers,
  register,
  login,
  logout,
  getMe,
  sendOtp,
  verifyOtp,
  resetPassword,
  updateDetails,
  updatePassword,
  getUsersByName
} = require('../controllers/auth')

const { protect } = require('../middleware/auth');

router.get("/",protect,getUsers)

router.get("/find?",protect,getUsersByName)

router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)
router.post('/me', protect, getMe)
router.put('/updatedetails', protect, updateDetails)
router.put('/updatepassword', protect, updatePassword)
//changed forgotpassword route to sendotp and the controller name to sendotp
router.post('/sendotp', sendOtp);
router.post("/verifyotp",verifyOtp);
// router.post('/forgotpassword', forgotPassword)
// router.put('/resetpassword/:resettoken', resetPassword)
router.patch('/resetpassword', resetPassword)


module.exports = router
