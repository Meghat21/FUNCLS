const express = require('express')
const router = express.Router()


const advancedResults = require('../middleware/advancedResults')
const { protect, authorize } = require('../middleware/auth')

router.use(protect)
// router.use()

router.get('/',function(req,res){
    return res.send("Hello");
})


module.exports = router