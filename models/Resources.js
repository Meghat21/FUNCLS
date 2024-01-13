const mongoose = require('mongoose')

const Schema = mongoose.Schema

const ResourceSchema = new Schema(
  {
    title: {
      type: String,
      minlength: [3, 'Title must be three characters long'],
      trim: true,
      unique: true,
      required: [true, 'Title is required']
    },
    description: {
      type: String,
      minlength: [3, 'Description must be three characters long'],
      required: [true, 'Description is required']
    },
    photo: {
      type: String,
      default: 'no-photo.jpg'
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true }, timestamps: true }
)


module.exports = mongoose.model('Resource', ResourceSchema)
