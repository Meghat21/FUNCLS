const mongoose = require("mongoose")
const Schema = mongoose.Schema

const teacherDetails = new Schema({
    teacherDetails: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    photo: {
        type: String,
        // required: [true, "teacher profile pic is required"]
    }
    ,
    gender: {
        type: String,
        enum: ["Male", "Female"],
        // required: [true, "Teacher gender is required"]
    },
    phone: {
        type: String,
        // required: [true, "Teacher phone number is required"]
    },
    selfIntroduction: {
        type: String,
        // required: [true, "Self-Introduction is required"]
    }
}, { timestamps: true })