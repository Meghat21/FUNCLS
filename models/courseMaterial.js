const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const courseMaterialSchema = new Schema(
  {
    lesson: {
      type: String,
      required: true,
    },
    teacher: {
      type: String,
      required: true,
    },
    subject: {
      name: String,
      standard: String,
      teacher: String,
    },
    courseMaterial: {
      name: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("courseMaterial", courseMaterialSchema);
