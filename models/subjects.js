const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const subjectsSchema = new Schema(
  {
    subjectName: {
        type:String,
        required:[true,"subject name is required"]
    },
    subjectTeachers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "teacher",
      },
    ],
    standard:{
        type:String,
        required:[true,"Standard is required"]
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("subject", subjectsSchema);
