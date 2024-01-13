const mongoose = require('mongoose')

const Schema = mongoose.Schema

const AssignemntSchema = new Schema(
  {
    question: {
      type: String,
      minlength: [3, 'Question must three characters long'],
      required: [true, 'Question is required'],
      unique: true
    },
    answer: {
      type: String,
      required: [true, 'Answer is required']
    },
    type: {
      type: String,
      enum: ['tf', 'string'],
      required: [true, 'Type is required']
    },
    // hellp
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    due_date: {
      type: Date,
      required: [true, 'Date is required']
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Question', QuestionSchema)
