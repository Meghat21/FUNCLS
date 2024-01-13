const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const courseMaterialSchemaVideo = new Schema(
  {
    lesson: {
      type: String,
      required: true,
    },

    subject: {
      name: String,
      standard: String,
      teacher: String,
    },
    courseMaterialVideo: {
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
module.exports = mongoose.model(
  "courseMaterialVideo",
  courseMaterialSchemaVideo
);
