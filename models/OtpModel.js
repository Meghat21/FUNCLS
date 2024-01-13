const mongoose = require("mongoose");
const { Schema } = require("mongoose");


const OtpSchema = new Schema({
    userID:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
    otp:{
        type:String,
        required:true,
    }
});
module.exports = mongoose.model("OtpModel",OtpSchema);