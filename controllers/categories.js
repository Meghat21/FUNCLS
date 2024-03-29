const path = require('path')
const fs = require('fs')
const asyncHandler = require('../middleware/async')
const ErrorResponse = require('../utils/errorResponse')
const Category = require('../models/Category')
const Question = require('../models/Question')

// @desc    Get categories
// @route   GET /api/v1/categories
// @access  Private/Admin
exports.getCategories = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults)
})

// @desc    Get single category
// @route   GET /api/v1/categories/:id
// @access  Private/Admin
exports.getCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id)

  if (!category) {
    return next(
      new ErrorResponse(`No category with that id of ${req.params.id}`)
    )
  }

  const question = await Question.findOne({
    category: category._id
  }).countDocuments()

  category._doc.question = question

  res.status(200).json({ success: true, data: category })
})

// @desc    Create Category
// @route   POST /api/v1/categories/
// @access  Private/Admin
exports.createCategory = asyncHandler(async (req, res, next) => {
  let category = await Category.findOne({ title: req.body.title })

  if (category) {
    return next(new ErrorResponse('Title already exists', 400))
  }

  if (!req.files || !req.files.photo) {
    // return next(new ErrorResponse(`Please upload a photo`, 404))
    category = await Category.create({
      ...req.body,
      user: req.user.id
    })

    return res.status(200).json({ success: true, data: category })
  }

  const photo = req.files.photo

  if (!photo.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image photo`, 404))
  }

  if (photo.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD / 1000 / 1000
        }mb`,
        404
      )
    )
  }

  category = await Category.create({
    ...req.body,
    user: req.user.id
  })

  photo.name = `photo-${category._id}${path.parse(photo.name).ext}`

  photo.mv(`${process.env.FILE_UPLOAD_PATH}/${photo.name}`, async (err) => {
    if (err) {
      console.error(err)
      await Category.findByIdAndDelete(category._id)
      return next(new ErrorResponse(`Problem with photo upload`, 500))
    }

    category = await Category.findByIdAndUpdate(
      category._id,
      { photo: photo.name },
      { new: true }
    )

    return res.status(200).json({ success: true, data: category })
  })
})

// @desc    Update Category
// @route   PUT /api/v1/categories/:id
// @access  Private/Admin
exports.updateCategory = asyncHandler(async (req, res, next) => {
  const question = await Category.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new: true
  })

  if (!question) {
    return next(new ErrorResponse(`No categoryt with id of ${req.params.id}`))
  }

  res.status(200).json({ success: true, data: question })
})

// @desc    Delete Category
// @route   DELETE /api/v1/categories/:id
// @access  Private/Admin
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  // const category = await Category.findByIdAndDelete(req.params.id)
  let category = await Category.findById(req.params.id)

  if (!category) {
    return next(
      new ErrorResponse(`No category with id of ${req.params.id}`, 404)
    )
  }
  await category.remove()
  return res.status(200).json({ success: true, category })
})


// @desc    Upload photo for category
// @route   PUT /api/v1/categories/:id/photo
// @access  Private Admin
exports.categoryPhotoUpload = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id)
  if (!category) {
    return next(
      new ErrorResponse(`Category not found with id of ${req.params.id}`, 404)
    )
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 404))
  }

  const photo = req.files.photo

  if (!photo.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image photo`, 404))
  }

  if (photo.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD / 1000 / 1000
        }mb`,
        404
      )
    )
  }

  photo.name = `photo-${category._id}${path.parse(photo.name).ext}`

  photo.mv(`${process.env.FILE_UPLOAD_PATH}/${photo.name}`, async (err) => {
    if (err) {
      console.error(err)
      return next(new ErrorResponse(`Problem with photo upload`, 500))
    }

    await Category.findByIdAndUpdate(req.params.id, { photo: photo.name })

    res.status(200).json({ success: true, data: photo.name })
  })
})
